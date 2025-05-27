const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('./utils/db')
const authRoutes = require('./routes/auth.routes')
const markReadRoutes = require('./routes/mark-read.routes')
const profileRoutes = require('./routes/profile.routes')
const adminRoutes = require('./routes/admin.routes')
const changePasswordRoutes = require('./routes/change-password.routes')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 5000

// Middleware

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running correctly',
    timestamp: new Date().toISOString()
  });
});
// Routes
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/mark-read', markReadRoutes)
app.use('/api/change-password', changePasswordRoutes)
app.use(express.static(path.join(__dirname, '../../www')))
app.use((req, res) => {
	if (req.path.startsWith('/api/')) {
		return res.status(404).json({ message: 'API endpoint not found' })
	}
	res.status(404).sendFile(path.join(__dirname, '../../404.html'))
})
// Задача очистки неактивных пользователей (запускается каждые 5 минут)
setInterval(async () => {
    try {
        const result = await pool.query(`
            UPDATE users 
            SET is_online = FALSE 
            WHERE last_heartbeat < DATE_SUB(NOW(), INTERVAL 2 MINUTE) 
            AND is_online = TRUE
        `);
        
        if (result[0].affectedRows > 0) {
            console.log(`🔄 Помечено как оффлайн: ${result[0].affectedRows} пользователей`);
        }
    } catch (error) {
        console.error('Ошибка очистки неактивных пользователей:', error);
    }
}, 5 * 60 * 1000); // каждые 5 минут
app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on port 3001');
});
