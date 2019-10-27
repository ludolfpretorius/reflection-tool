const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '1234',
    database : 'notebook'
  }
});

const app = express();

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

app.get('/register', (req, res) => {
	res.sendFile(__dirname + '/dist/register.html');
});
app.post('/register', (req, res) => {
	const { username, email, password } = req.body;
	const hash = bcrypt.hashSync(password);
	console.log(hash)
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
			.returning('*')
			.insert({
				email: loginEmail[0],
				name: username,
				joined: new Date()
			})
		})
		.then(() => {
			return trx('entries')
			.returning('*')
			.insert({
				entries: 'No entries yet'
			})
			.then(user => {
				res.json(user[0]);
				res.redirect('/app')
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => res.status(400).json('You email address is invalid'))
	});
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*').from('users').where({ id })
	.then(user => {
		if (user.length) {
			res.json(user[0])
		} else {
			res.status(400).json('Not found')
		}
	})
	.catch(err => {
		res.status(400).json('Error getting profile')
	})
});

app.put('/entries', (req, res) => {
	const { id, entries } = req.body;
	db('entries').where('id', '=', id)
	.update({
		entries: entries
	})
	// .returning('entries')
	// .then(entries => {
	// 	res.json(entries)		
	// })
});

app.get('/app', (req, res) => {
	res.sendFile(__dirname + '/dist/app.html');
});

app.post('/load-entries', (req, res) => {
	const { id, entries } = req.body;
	
	db('entries').where('id', '=', id)
	.then(data => {
		res.json(data[0].entries)
		console.log()
	})
});

app.post('/saveEntries', (req, res) => {
	
});

app.listen(3000, () => {
	console.log('app running on port 3000')
})