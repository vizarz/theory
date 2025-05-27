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

// Эндпоинт для получения списка пользователей (username и name)
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

// Эндпоинт для получения логов прочтения страниц пользователя
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
// Эндпоинт для получения статистики для дашборда
router.get('/dashboard-stats', checkAuth, async (req, res) => {
	if (req.user.role !== 'admin') {
		return res.status(403).send('Отказано в доступе')
	}

	try {
		// Получаем общее количество пользователей
		const [usersTotal] = await pool.query('SELECT COUNT(*) as count FROM users')

		// Получаем количество новых пользователей за последнюю неделю
		const [usersWeek] = await pool.query(`
            SELECT COUNT(*) as count FROM users 
            WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        `)

		// Получаем общее количество прочитанных страниц
		const [pagesTotal] = await pool.query(
			'SELECT COUNT(*) as count FROM page_reads'
		)

		// Получаем среднее количество прочитанных страниц на пользователя
		const [pagesAvg] = await pool.query(`
            SELECT ROUND(AVG(page_count), 1) as average FROM (
                SELECT userid, COUNT(*) as page_count FROM page_reads 
                GROUP BY userid
            ) as user_pages
        `)

		// Получаем общее количество выполненных шагов (строки, где rus_title содержит "- step")
		const [stepsTotal] = await pool.query(`
            SELECT COUNT(*) as count FROM page_reads 
            WHERE rus_title LIKE '% - step%'
        `)

		// Вычисляем процент завершения проектов
		// (упрощенная версия - % шагов от общего количества шагов во всех проектах)
		const [stepsCompletion] = await pool.query(`
            SELECT ROUND(
                COUNT(*) * 100 / 
                (SELECT COUNT(DISTINCT userid) FROM page_reads) / 
                (SELECT COUNT(*) FROM page_reads WHERE page LIKE '%project%' AND page NOT LIKE '%project_list%')
            ) as completion FROM page_reads 
            WHERE rus_title LIKE '% - step%'
        `)

		res.json({
			users: {
				total: usersTotal[0].count,
				change: usersWeek[0].count || 0,
			},
			pages: {
				total: pagesTotal[0].count,
				average: pagesAvg[0].average || 0,
			},
			steps: {
				total: stepsTotal[0].count,
				completion: stepsCompletion[0].completion || 0,
			},
		})
	} catch (error) {
		console.error('Ошибка получения статистики:', error)
		res.status(500).send('Ошибка при получении статистики')
	}
})

router.get('/online-users', checkAuth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Отказано в доступе')
    }

    try {
        // Сначала обновляем статусы - помечаем как оффлайн тех, кто не отправлял heartbeat больше 2 минут
        await pool.query(`
            UPDATE users 
            SET is_online = FALSE 
            WHERE last_heartbeat < DATE_SUB(NOW(), INTERVAL 2 MINUTE) 
            AND is_online = TRUE
        `);

        // Получаем список онлайн пользователей
        const [onlineUsers] = await pool.query(`
            SELECT username, name, role, last_activity, last_heartbeat, is_online
            FROM users 
            WHERE is_online = TRUE
            ORDER BY last_activity DESC
        `);

        res.json({
            count: onlineUsers.length,
            users: onlineUsers
        });
    } catch (error) {
        console.error('Ошибка получения онлайн пользователей:', error);
        res.status(500).send('Ошибка при получении списка онлайн пользователей');
    }
});
module.exports = router
