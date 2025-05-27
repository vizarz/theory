const express = require('express')
const router = express.Router()
const { checkAuth } = require('../middlewares/auth.middleware')
const { getProfile } = require('../controllers/profile.controller')
const pool = require('../utils/db')

router.get('/', getProfile)
// Получение статистики пользователя
router.get('/stats', checkAuth, async (req, res) => {
	try {
		const userId = req.user.id

		// Получаем основные данные о пользователе
		const [userInfo] = await pool.query(
			'SELECT name, username, role, created_at FROM users WHERE id = ?',
			[userId]
		)

		if (userInfo.length === 0) {
			return res.status(404).send('Пользователь не найден')
		}

		const user = userInfo[0]

		// Получаем количество прочитанных страниц
		const [pageCountResult] = await pool.query(
			'SELECT COUNT(*) as pageCount FROM page_reads WHERE userId = ?',
			[userId]
		)
		const pageCount = pageCountResult[0].pageCount

		// Получаем дату последней активности
		const [lastActivityResult] = await pool.query(
			'SELECT timestamp FROM page_reads WHERE userId = ? ORDER BY timestamp DESC LIMIT 1',
			[userId]
		)

		const lastActivity =
			lastActivityResult.length > 0 ? lastActivityResult[0].timestamp : null

		// Получаем любимый раздел (самый часто просматриваемый)
		const [favoriteSectionResult] = await pool.query(
			`
            SELECT 
                SUBSTRING_INDEX(page, '_', 2) as section,
                COUNT(*) as count
            FROM page_reads
            WHERE userId = ?
            GROUP BY section
            ORDER BY count DESC
            LIMIT 1
        `,
			[userId]
		)

		const favoriteSection =
			favoriteSectionResult.length > 0
				? getSectionName(favoriteSectionResult[0].section)
				: null

		// Рассчитываем количество дней в системе
		const createdAt = new Date(user.created_at)
		const now = new Date()
		const daysInSystem = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))

		// Рассчитываем среднее количество страниц в день
		const avgPagesPerDay =
			daysInSystem > 0 ? (pageCount / daysInSystem).toFixed(1) : pageCount

		res.json({
			dateRegistered: formatDate(createdAt),
			daysInSystem,
			pagesRead: pageCount,
			lastActivity: lastActivity
				? formatDate(new Date(lastActivity))
				: 'Нет данных',
			favoriteSection: favoriteSection || 'Нет данных',
			avgActivity: avgPagesPerDay,
		})
	} catch (error) {
		console.error('Ошибка при получении статистики:', error)
		res.status(500).send('Ошибка при получении статистики')
	}
})

// Вспомогательная функция для форматирования даты
function formatDate(date) {
	const day = date.getDate().toString().padStart(2, '0')
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const year = date.getFullYear()
	return `${day}.${month}.${year}`
}

// Функция для получения удобочитаемого названия раздела
function getSectionName(section) {
	const sectionMap = {
		mit_introduction: 'Введение',
		mit_designer: 'Дизайнер',
		mit_blocks: 'Блоки',
		mit_project: 'Проекты',
		mit_components: 'Компоненты',
	}

	return sectionMap[section] || section.replace('mit_', '').replace('_', ' ')
}
module.exports = router
