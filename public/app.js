const form = document.querySelector('#form');
const url = document.querySelector('#url');
const alertBox = document.querySelector('.alertBox');
const alertText = document.querySelector('.alertBox p');
const sizeText = document.querySelector('#sizeText');
const measureDiv = document.querySelector('#right-measure');
const trigger = document.querySelector('.trigger');
const themesList = document.querySelector('.themesList');
const theme = document.querySelector('#theme');
const pointer = document.querySelector('.pointer');

async function getData(url) {
	const res = await fetch(url);
	return res.json();
}
const themesJSON = await getData('./themes.json');

function setCookie(cname, cvalue) {
	document.cookie = cname + '=' + cvalue + ';path=/';
}

function getCookie(cname) {
	const name = cname + '=';
	const decodedCookie = decodeURIComponent(document.cookie);
	const cookies = decodedCookie.split(';');
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i];
		while (cookie.charAt(0) == ' ') {
			cookie = cookie.substring(1);
		}
		if (cookie.indexOf(name) == 0) {
			return cookie.substring(name.length, cookie.length);
		}
	}
	return '';
}

function checkCookie() {
	const themeCookie = getCookie('theme');
	if (!themeCookie) {
		document.querySelector('input[value=blueprint]').checked = true;
	} else {
		document.querySelector(`input[value=${themeCookie}]`).checked = true;
	}
}

window.onload = () => {
	checkCookie();
	setHeightText();
};

window.onresize = () => {
	setHeightText();
};

document.querySelectorAll('input[name=themes]').forEach((c) => {
	c.addEventListener('change', (e) => {
		e.preventDefault();
		const selected = e.target.value;
		setCookie('theme', selected);
		theme.href = [selected].map((c) => themesJSON[c]).join``;
	});
});

function setHeightText() {
	const height = measureDiv.offsetHeight;
	sizeText.innerHTML = (height * 0.0264583).toFixed(2) + ' cm';
}

measureDiv.addEventListener('animationend', () => {
	setHeightText();
});

trigger.addEventListener('click', (e) => {
	e.preventDefault();
	if (trigger.classList.contains('triggerActive')) {
		themesList.classList.remove('themesListActive');
		trigger.classList.remove('triggerActive');
	} else {
		themesList.classList.add('themesListActive');
		trigger.classList.add('triggerActive');
	}
});

form.addEventListener('submit', async (e) => {
	e.preventDefault();
	let status, res;
	let link = url.value;
	if (link.includes('sh0rty.me') || link.includes('sh0rty.herokuapp.com')) {
		alertBox.classList.remove('success');
		alertBox.classList.add('error');
		alertText.innerHTML = "You can't create sh0rty from sh0rty.";
		return;
	}
	await fetch('/url', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			url: link,
		}),
	})
		.then((response) => {
			status = response.status;
			return response.json();
		})
		.then((result) => {
			res = result;
		});

	if (status == 500 || status == 429) {
		alertBox.classList.remove('success');
		alertBox.classList.add('error');
		console.log(alertBox.classList);
		alertText.innerHTML = res.message;
	}

	if (status == 200) {
		url.value = `https://sh0rty.me/${res.alias}`;
		url.select();
		url.setSelectionRange(0, 99999);
		document.execCommand('copy');
		alertBox.classList.remove('error');
		alertBox.classList.add('success');
		alertText.innerHTML = 'Sh0rty was created and copied successfully.';
	}
});
