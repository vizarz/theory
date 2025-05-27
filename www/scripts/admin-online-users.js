function getInitials(name) {
	if (!name || name === 'Не указано' || name === 'Загрузка...') {
		return 'U'
	}

	const words = name.split(' ').filter(word => word.length > 0)

	if (words.length === 0) {
		return 'U'
	} else if (words.length === 1) {
		return words[0].charAt(0).toUpperCase()
	} else {
		return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
	}
}

function formatLastActivity(timestamp) {
	const now = new Date()
	const activityTime = new Date(timestamp)
	const diffMs = now - activityTime
	const diffMinutes = Math.floor(diffMs / (1000 * 60))

	if (diffMinutes < 1) {
		return 'сейчас онлайн'
	} else if (diffMinutes < 2) {
		return '1 мин. назад'
	} else if (diffMinutes < 60) {
		return `${diffMinutes} мин. назад`
	} else {
		const diffHours = Math.floor(diffMinutes / 60)
		return `${diffHours} ч. назад`
	}
}

// Функция загрузки онлайн пользователей
async function loadOnlineUsers() {
	const token = localStorage.getItem('token')
	const container = document.getElementById('onlineUsersContainer')
	const countElement = document.getElementById('onlineUsersCount')

	try {
		container.innerHTML =
			'<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Загрузка...</div>'

		const response = await fetch(getApiUrl('admin/online-users'), {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error('Ошибка загрузки данных')
		}

		const data = await response.json()

		// Обновляем счетчик
		countElement.textContent = data.count

		// Очищаем контейнер
		container.innerHTML = ''

		if (data.users.length === 0) {
			container.innerHTML = `
                <div class="empty-online-state">
                    <i class="fas fa-user-clock"></i>
                    <h3>Никого нет онлайн</h3>
                    <p>В данный момент все пользователи неактивны</p>
                </div>
            `
			return
		}

		// Создаем карточки пользователей
		data.users.forEach(user => {
			const initials = getInitials(user.name)
			const lastActivity = formatLastActivity(user.last_activity)

			// Определяем цвет статуса на основе времени последней активности
			const now = new Date()
			const activityTime = new Date(user.last_activity)
			const diffMinutes = Math.floor((now - activityTime) / (1000 * 60))

			let statusColor = '#4CAF50' // зеленый - онлайн
			if (diffMinutes > 1) {
				statusColor = '#ff9800' // оранжевый - недавно был
			}

			let roleDisplay = user.role
			if (user.role === 'student') {
				roleDisplay = 'Студент'
			} else if (user.role === 'admin') {
				roleDisplay = 'Администратор'
			} else if (user.role === 'teacher') {
				roleDisplay = 'Преподаватель'
			}

			const userCard = document.createElement('div')
			userCard.className = 'online-user-card'
			userCard.innerHTML = `
        <div class="online-user-avatar" style="border: 2px solid ${statusColor}">${initials}</div>
        <div class="online-user-info">
            <div class="online-user-name">${user.name || 'Не указано'}</div>
            <div class="online-user-username">@${
							user.username
						} • ${roleDisplay}</div>
            <div class="online-user-activity">
                <i class="fas fa-circle" style="color: ${statusColor}"></i>
                ${lastActivity}
            </div>
        </div>
    `

			container.appendChild(userCard)
		})
	} catch (error) {
		console.error('Ошибка загрузки онлайн пользователей:', error)
		container.innerHTML = `
            <div class="empty-online-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить список онлайн пользователей</p>
            </div>
        `
		countElement.textContent = '0'
	}
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
	const loadBtn = document.getElementById('loadOnlineUsersBtn')

	if (loadBtn) {
		loadBtn.addEventListener('click', loadOnlineUsers)

		// Автоматическая загрузка при первом открытии
		loadOnlineUsers()

		// Автообновление каждые 30 секунд
		setInterval(loadOnlineUsers, 30000)
	}
})
