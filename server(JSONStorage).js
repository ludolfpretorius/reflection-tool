const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const db = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '',
    database : 'notebook'
  }
});

 
const app = express();

const file = fs.readFileSync(__dirname + '/dist/db.json').toString('utf8');
let db;
db = JSON.parse(file);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static("dist"));


app.get('/', (req, res) => {
	res.redirect('/login');
});

app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/dist/login.html');
});

app.get('/register', (req, res) => {
	res.sendFile(__dirname + '/dist/register.html');
});

let user;
app.post('/login', (req, res) => {
	const { username, password } = req.body;
	let found = false;
	db.users.forEach((i) => {
		if (username === i.name && password === i.password) {
			found = true;
			user = i;
			return res.redirect('/app');
		};
	});
	if (!found) {
		res.status(400).json('Your username and password combination doesn\'t match!');
	}
	console.log(req.body)
	console.log(user.entries)
});

app.post('/register', (req, res) => {
	const { username, email, password } = req.body;
	const newUser = {
		id: '3',
		name: username,
		email: email,
		password: password,
		entries: [],
		joined: new Date()
	}
	db.users.push(newUser);
	fs.writeFileSync(__dirname + '/dist/db.json', JSON.stringify(db), 'utf8', err => {
		console.log(db)
	})
	user = newUser;
	return res.redirect('/app');
});

app.get('/app', (req, res) => {
	res.sendFile(__dirname + '/dist/app.html');
});

app.post('/loadEntries', (req, res) => {
	res.json(user.entries)
});

app.post('/saveEntries', (req, res) => {
	const entries = req.body.entries 
	user.entries = entries;
	
	db.users.forEach(i => {
		if (i.name === user.name) {
			i.entries = user.entries
		}
	});
	fs.writeFile(__dirname + '/dist/db.json', JSON.stringify(db), 'utf8', err => {
		console.log(user.entries)
	})
	
});

app.listen(3000, () => {
	console.log('app running on port 3000')
})