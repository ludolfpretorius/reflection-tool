
const handleRegister = (req, res, db, bcrypt) => {
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
};

module.exports = {
	handleRegister: handleRegister
}