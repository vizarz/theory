const express = require('express')
const router = express.Router()
const pool = require('../utils/db')
const { checkAuth } = require('../middlewares/auth.middleware')
const bcrypt = require('bcrypt')

// Эндпоинт для смены пароля пользователя
router.post('/change-password', checkAuth, async (req, res) => {
	if (req.user.role !== 'admin') {
		return res.status(403).send('Отказано в доступе')
	}

	const { username, newPassword } = req.body
	if (!username || !newPassword) {
		return res.status(400).send('Заполните обязательные поля')
	}

	try {
		const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [
			username,
		])
		if (!users.length) {
			return res.status(404).send('Пользователь не найден')
		}

		const saltRounds = 10
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
		await pool.query('UPDATE users SET password = ? WHERE username = ?', [
			hashedPassword,
			username,
		])
		res.send('OK')
	} catch (error) {
		res.status(500).send('Ошибка')
	}
})

// Эндпоинт GET /api/admin/users для получения списка пользователей (username и name)
router.get('/users', checkAuth, async (req, res) => {
	if (req.user.role !== 'admin') {
		return res.status(403).send('Отказано в доступе')
	}

	try {
		const [rows] = await pool.query('SELECT username, name FROM users')
		res.json(rows)
	} catch (error) {
		res.status(500).send('Ошибка')
	}
})

// Эндпоинт GET /api/admin/page-reads для получения логов прочтения страниц пользователя
router.get('/page-reads', checkAuth, async (req, res) => {
	if (req.user.role !== 'admin') {
		return res.status(403).send('Отказано в доступе')
	}
	const username = req.query.username
	if (!username) {
		return res.status(400).send('Не указан пользователь')
	}
	try {
		const [users] = await pool.query(
			'SELECT id FROM users WHERE username = ?',
			[username]
		)
		if (!users.length) {
			return res.status(404).send('Пользователь не найден')
		}
		const userId = users[0].id
		const [logs] = await pool.query(
			'SELECT id, userid, page, timestamp, rus_title FROM page_reads WHERE userid = ?',
			[userId]
		)
		res.json(logs)
	} catch (error) {
		res.status(500).send('Ошибка')
	}
})

module.exports = router
