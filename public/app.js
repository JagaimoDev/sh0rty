document.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelector('#form');
	const url = document.querySelector('#url');
	const alertBox = document.querySelector('.alertBox');
	const alertText = document.querySelector('.alertBox p');
	const sizeText = document.querySelector('#sizeText');
	const measureDiv = document.querySelector('#right-measure');
	const trigger = document.querySelector('.trigger');
	const themesList = document.querySelector('.themesList');
	const theme = document.querySelector('#theme');
	const pointer = document.querySelector('#pointer');
	let translatePointer;

	checkCookie();
	setThemesListHeight();
	setHeightText();

	window.onresize = () => {
		setHeightText();
		transformPointer();
	};

	document.querySelectorAll('input[name=themes]').forEach((c) => {
		c.addEventListener('change', async (e) => {
			const themesJSON = await getData('./themes.json');
			const selected = e.target.value;
			setCookie('theme', selected);
			theme.href = themesJSON[selected];
			translatePointer = e.target.dataset.movePointerTo;
			transformPointer();
		});
	});

	measureDiv.addEventListener('animationstart', () => {
		setHeightText();
	});

	trigger.addEventListener('click', (e) => {
		themesList.classList.toggle('themesListActive');
		trigger.classList.toggle('triggerActive');
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

	async function getData(url) {
		const res = await fetch(url);
		return res.json();
	}

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

	async function checkCookie() {
		const themeCookie = getCookie('theme');
		const themesJSON = await getData('./themes.json');
		const selectedThemeInput = document.querySelector(`input[value=${themeCookie ? themeCookie : Object.keys(themesJSON)[0]}]`);
		selectedThemeInput.checked = true;
		translatePointer = selectedThemeInput.dataset.movePointerTo;
		transformPointer();
	}

	function setHeightText() {
		const height = measureDiv.offsetHeight;
		sizeText.innerHTML = (height * 0.0264583).toFixed(2) + ' cm';
	}

	function setThemesListHeight() {
		const themesListHeight = document.querySelector('data');
		themesList.style.height = themesListHeight.dataset.themesListHeight;
	}

	function transformPointer() {
		pointer.style.transform = `translateY(${translatePointer}) rotate(${window.innerWidth < 800 ? -180 : 0}deg)`;
	}
});
