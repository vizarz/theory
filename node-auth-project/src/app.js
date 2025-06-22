const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const https = require('https')
const http = require('http')
const path = require('path')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('./utils/db')
const authRoutes = require('./routes/auth.routes')
const markReadRoutes = require('./routes/mark-read.routes')
const profileRoutes = require('./routes/profile.routes')
const adminRoutes = require('./routes/admin.routes')
const changePasswordRoutes = require('./routes/change-password.routes')
const app = express()
const PORT = process.env.PORT || 5000

// Настройка путей к SSL-сертификатам (относительный путь)
const sslPath = path.join(__dirname, 'ssl');
const sslOptions = {
  key: fs.readFileSync(path.join(sslPath, 'privatekey.pem')),
  cert: fs.readFileSync(path.join(sslPath, 'learninventor_me.crt')),
  ca: fs.readFileSync(path.join(sslPath, 'learninventor_me.ca-bundle'))
};

// Middleware
app.use(cors({
  origin: ['https://learninventor.me', 'http://learninventor.me', 'https://www.learninventor.me', 'http://localhost:3000'],
  credentials: true
}));
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

// Создаем HTTPS сервер
const httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(3001, '0.0.0.0', () => {
  console.log('HTTPS Server running on port 3001');
});

// Также запускаем HTTP сервер для обратной совместимости
// Закомментируйте, если не нужно
/*
http.createServer(app).listen(3000, '0.0.0.0', () => {
  console.log('HTTP Server running on port 3000');
});
*/