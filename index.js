const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const { nanoid } = require('nanoid');
const admin = require('firebase-admin');
const rateLimit = require('express-rate-limit');
const enforce = require('express-sslify');
const { serviceAccount } = require('./config');

const app = express();
app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(express.json());
app.use(express.static('./public'));
app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.set('trust proxy', 1);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const limiter = rateLimit({
	windowMs: 30 * 1000,
	max: 10,
	message: JSON.stringify({
		message: 'Too many requests. Try again in 30 seconds.',
	}),
});
app.use('/url', limiter);

const schema = yup.object().shape({
	url: yup.string().trim().url("Provided text isn't a valid URL.").required('URL is a required field.'),
});

app.get('/:alias', async (req, res) => {
	const { alias } = req.params;
	const doc = await db.collection('urls').doc(alias).get();
	if (!doc.exists) {
		res.redirect('/');
	} else {
		res.redirect(doc.data().url);
	}
});

app.post('/url', async (req, res, next) => {
	const { url } = req.body;
	try {
		await schema.validate({
			url,
		});

		const urlSnapshot = await db.collection('urls').where('url', '==', url).get();
		if (urlSnapshot.empty) {
			let alias;
			do {
				alias = nanoid(5).toLowerCase();
			} while (!(await db.collection('urls').where('alias', '==', alias).get()).empty);

			await db
				.collection('urls')
				.doc(alias)
				.set({
					alias: alias,
					url: url,
				})
				.catch((e) => {
					next(e);
				});

			res.json({
				alias,
				url,
			});
		} else {
			urlSnapshot.forEach((doc) => {
				res.json({
					alias: doc.data().alias,
					url,
				});
			});
		}
	} catch (e) {
		next(e);
	}
});

app.get('/url/:alias', async (req, res) => {
	const { alias } = req.params;
	const doc = await db.collection('urls').doc(alias).get();
	if (!doc.exists) {
		res.json({
			message: "This alias isn't related to any url.",
		});
	} else {
		res.json({
			alias,
			url: doc.data().url,
		});
	}
});

app.use((e, req, res, next) => {
	if (e.status) {
		res.status(e.status);
	} else {
		res.status(500);
	}
	res.json({
		message: e.message,
		// stack: e.stack,
	});
});

const port = process.env.PORT || 80;
app.listen(port, () => {
	console.log('sh0rty by PotatoDev33');
	console.log(`Listening at port ${port}`);
});
