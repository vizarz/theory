const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/auth.controller')
const { checkAuth } = require('../middlewares/auth.middleware') 

router.post('/register', register)
router.post('/login', login)

// Эндпоинт для обновления статуса активности (heartbeat)
router.post('/heartbeat', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = require('../utils/db');
    
    // Обновляем время последней активности и устанавливаем онлайн статус
    await pool.query(
      'UPDATE users SET is_online = TRUE, last_activity = NOW(), last_heartbeat = NOW() WHERE id = ?',
      [userId]
    );
    
    res.json({ status: 'success', message: 'Heartbeat updated' });
  } catch (error) {
    console.error('Ошибка обновления heartbeat:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт для установки пользователя как оффлайн
router.post('/logout-status', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = require('../utils/db');
    
    await pool.query(
      'UPDATE users SET is_online = FALSE WHERE id = ?',
      [userId]
    );
    
    res.json({ status: 'success', message: 'User set offline' });
  } catch (error) {
    console.error('Ошибка установки оффлайн статуса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router