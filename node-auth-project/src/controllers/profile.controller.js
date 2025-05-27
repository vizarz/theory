// filepath: /node-auth-project/node-auth-project/src/controllers/profile.controller.js
const User = require('../models/user.model')
const Action = require('../models/action.model')

// Получение профиля пользователя
exports.getUserProfile = async (req, res) => {
	try {
		const userId = req.user.id // Получаем ID пользователя из токена
		const user = await User.findById(userId)

		if (!user) {
			return res.status(404).json({ message: 'Пользователь не найден' })
		}

		res.status(200).json({
			id: user.id,
			name: user.name,
			role: user.role,
			// Добавьте другие поля, которые хотите вернуть
		})
	} catch (error) {
		res.status(500).json({ message: 'Ошибка сервера', error })
	}
}

// Запись действия пользователя
exports.recordAction = async (req, res) => {
	try {
		const userId = req.user.id // Получаем ID пользователя из токена
		const { actionType, description } = req.body

		const action = new Action({
			userId,
			actionType,
			description,
			timestamp: new Date(),
		})

		await action.save()
		res.status(201).json({ message: 'Действие записано', action })
	} catch (error) {
		res.status(500).json({ message: 'Ошибка сервера', error })
	}
}
exports.getProfile = (req, res) => {
	res.send('Профиль пользователя')
}
