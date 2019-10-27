const register = document.querySelector('.register');
const login = document.querySelector('.login');
const regBtn = document.querySelector('.reg-btn');
const loginBtn = document.querySelector('.login-btn');
const username = document.querySelector('.username').value;
const password = document.querySelector('.password').value;
const email = document.querySelector('.email').value;
const loginSubmit = document.querySelector('#loginSubmit');
const registerSubmit = document.querySelector('#registerSubmit');



loginBtn.addEventListener('click', () => {
	register.style.display = 'none';
	login.style.display = 'block';
	window.location = '/login';
});

regBtn.addEventListener('click', () => {
	login.style.display = 'none';
	register.style.display = 'block';
	window.location = '/register';
});

loginSubmit.addEventListener('submit', (e) => {
	fetch('http://localhost:3000/login', {
		method: 'post',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			username: username,
			password: password
		})
	})
	.then(res => res.json())
	.then(user => console.log(user));
});

registerSubmit.addEventListener('submit', (e) => {
	fetch('http://localhost:3000/register', {
		method: 'post',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			username: username,
			email: email,
			password: password
		})
	})
	.then(res => res.json())
	.then(user => console.log(user))
});
