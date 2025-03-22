const jwt = require('jsonwebtoken')
const db = require('../utils/db') // Добавляем импорт базы данных
const User = require('../models/user.model')

const checkAuth = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(' ')[1]
		if (!token) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findById(db, decoded.id) // Используем новый метод
		if (!user) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		req.user = user
		next()
	} catch (error) {
		return res.status(401).json({ message: 'Unauthorized' })
	}
}

module.exports = {
	checkAuth,
}
