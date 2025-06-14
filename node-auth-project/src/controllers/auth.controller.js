const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

console.log('User model:', User)

exports.register = async (req, res) => {
	try {
		const { name, username, password, role } = req.body
		const db = require('../utils/db')

		const existingUser = await User.findUserByUsername(db, username)
		if (existingUser) {
			return res
				.status(400)
				.json({ message: 'Пользователь с таким логином уже существует' })
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const newUser = await User.createUser(
			db,
			name,
			username,
			hashedPassword,
			role
		)
		res
			.status(201)
			.json({ message: 'Пользователь зарегистрирован', user: newUser })
	} catch (error) {
		console.error('Ошибка при регистрации пользователя:', error)
		res
			.status(500)
			.json({ message: 'Error registering user', error: error.message })
	}
}

exports.login = async (req, res) => {
	try {
		const { username, password } = req.body
		const db = require('../utils/db')

		const user = await User.findUserByUsername(db, username)
		if (!user) {
			return res.status(400).json({ message: 'Неверный логин или пароль' })
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(400).json({ message: 'Неверный логин или пароль' })
		}

		// Генерируем JWT-токен с данными пользователя
		const token = jwt.sign(
			{
				id: user.id,
				name: user.name,
				username: user.username,
				role: user.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		)

		res.status(200).json({ message: 'Успешный вход', token })
	} catch (error) {
		console.error('Ошибка при входе:', error)
		res.status(500).json({ message: 'Ошибка сервера', error: error.message })
	}
}
