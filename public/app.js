const form = document.querySelector('#form');
const url = document.querySelector('#url');
const alertBox = document.querySelector('.alertBox');
const alertText = document.querySelector('.alertBox p');
const sizeText = document.querySelector('#sizeText');
const mesureDiv = document.querySelector('#right-measure');
const trigger = document.querySelector('.trigger');
const themesList = document.querySelector('.themesList');
const theme = document.querySelector('#theme');

function setHeightText() {
	var height = mesureDiv.offsetHeight;
	sizeText.innerHTML = (height * 0.0264583).toFixed(2) + ' cm';
}

document.querySelectorAll('input[name=themes]').forEach((c) => {
	c.addEventListener('change', async (e) => {
		e.preventDefault();
		const selected = e.target.value;
		switch(selected) {
			case 'modern':
				theme.href = 'modern.css?ver=1.0.0';
				break;
			case 'classic':
				theme.href = 'classic.css?ver=1.0.0';
				break;
		}
	});
});

trigger.addEventListener('click', async (e) => {
	e.preventDefault();
	if(trigger.classList.contains('triggerActive')) {
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
