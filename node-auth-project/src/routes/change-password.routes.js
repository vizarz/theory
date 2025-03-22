const express = require('express')
const router = express.Router()
const pool = require('../utils/db')
const { checkAuth } = require('../middlewares/auth.middleware')
const bcrypt = require('bcrypt')

router.post('/', checkAuth, async (req, res) => {
	// Обрезаем лишние пробельные символы из введённых значений
	const userId = req.user.id
	const oldPassword = req.body.oldPassword?.trim()
	const newPassword = req.body.newPassword?.trim()

	if (!oldPassword || !newPassword) {
		return res.status(400).send('Заполните обязательные поля')
	}

	try {
		// Получаем данные пользователя из базы
		const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [
			userId,
		])
		if (!users.length) {
			return res.status(404).send('Ошибка')
		}
		const user = users[0]

		// Обрезаем лишние пробельные символы из сохранённого пароля
		const storedHash = user.password.trim()

		// Проверяем формат сохранённого пароля (ожидается bcrypt-хэш)
		if (
			!(
				storedHash.startsWith('$2a$') ||
				storedHash.startsWith('$2b$') ||
				storedHash.startsWith('$2y$')
			)
		) {
			return res.status(400).send('Неверный старый пароль')
		}

		// Сравниваем старый пароль с сохранённым хэшем
		let isMatch
		try {
			isMatch = await bcrypt.compare(oldPassword, storedHash)
		} catch (err) {
			console.error('Ошибка сравнения пароля:', err.message)
			return res.status(400).send('Неверный старый пароль')
		}

		if (!isMatch) {
			return res.status(400).send('Неверный старый пароль')
		}

		// Хешируем новый пароль
		const saltRounds = 10
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

		// Обновляем пароль в базе данных
		await pool.query('UPDATE users SET password = ? WHERE id = ?', [
			hashedPassword,
			userId,
		])

		// Возвращаем простой ответ, без уведомлений об ошибке
		res.send('OK')
	} catch (error) {
		console.error('Ошибка изменения пароля:', error)
		res.status(500).send('Ошибка')
	}
})

module.exports = router
