const express = require('express')
const router = express.Router()
const pool = require('../utils/db')
const { checkAuth } = require('../middlewares/auth.middleware')

// GET запрос для проверки статуса прочтения
router.get('/', checkAuth, async (req, res) => {
	const { page } = req.query
	const userID = req.user.id
	try {
		const [rows] = await pool.query(
			'SELECT * FROM page_reads WHERE page = ? AND userID = ?',
			[page, userID]
		)
		if (rows.length) {
			res.json({ read: true })
		} else {
			res.json({ read: false })
		}
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
})

// POST запрос для отметки страницы как прочитанной
router.post('/', checkAuth, async (req, res) => {
	const { page, rusTitle, timestamp } = req.body
	const userID = req.user.id
	try {
		// Проверяем, есть ли уже запись для данной страницы и пользователя
		const [rows] = await pool.query(
			'SELECT * FROM page_reads WHERE page = ? AND userID = ?',
			[page, userID]
		)
		if (rows.length) {
			// Если страница уже прочитана, возвращаем статус, без выбрасывания ошибки
			return res.json({
				message: 'Страница уже прочитана',
				read: true,
			})
		}
		// Если записи нет, вставляем новую запись в таблицу
		await pool.query(
			'INSERT INTO page_reads (page, rus_title, timestamp, userID) VALUES (?,?,?,?)',
			[page, rusTitle, timestamp, userID]
		)
		res.json({
			message: 'Страница отмечена как прочитанная',
			read: true,
		})
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
})

module.exports = router
