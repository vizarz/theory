const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const pool = require('./utils/db') // импорт пула
const authRoutes = require('./routes/auth.routes')
const markReadRoutes = require('./routes/mark-read.routes')
const profileRoutes = require('./routes/profile.routes')
const adminRoutes = require('./routes/admin.routes')
const changePasswordRoutes = require('./routes/change-password.routes') // новый роут для изменения пароля
const path = require('path')
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/mark-read', markReadRoutes)
app.use('/api/change-password', changePasswordRoutes) // подключение эндпоинта изменения пароля

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
