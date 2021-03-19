const form = document.querySelector('#form');
const url = document.querySelector('#url');
const alertBox = document.querySelector('.alertBox');
const alertText = document.querySelector('.alertBox p');
const sizeText = document.querySelector('#sizeText');
const mesureDiv = document.querySelector('#right-measure');

function setHeightText() {
	var height = mesureDiv.offsetHeight;
	sizeText.innerHTML = (height * 0.0264583).toFixed(2) + ' cm';
}

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
