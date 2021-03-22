require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const { nanoid } = require('nanoid');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { db } = require('./config');

const app = express();
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.set('views', './public'); 
app.use(express.static('./public'));
app.use(cors());
app.use(morgan('tiny'));
if (process.env.DEBUG!=1) app.use(helmet());
app.use(cookieParser());
app.set('trust proxy', 1);

const limiter = rateLimit({
	windowMs: 30 * 1000,
	max: 10,
	message: JSON.stringify({
		message: 'Too many requests. Try again in 30 seconds.',
	}),
});

app.get('/', (req, res) => {
	res.render('index.ejs', { theme: `${req.cookies.theme ? req.cookies.theme : 'modern'}.css` });
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

			const date = new Date().toLocaleString('ET');
			await db
				.collection('urls')
				.doc(alias)
				.set({
					alias: alias,
					creationDate: date,
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
			creationDate: doc.data().creationDate,
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
