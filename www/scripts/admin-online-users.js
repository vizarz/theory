// Функция для получения инициалов (без изменений)
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

// Обновленная функция форматирования времени активности
function formatLastActivity(user) {
	if (user.is_online) {
		return {
			text: 'сейчас онлайн',
			color: '#4CAF50',
			icon: 'fas fa-circle',
		}
	}

	if (!user.last_activity || user.status_category === 'never_active') {
		return {
			text: 'никогда не был активен',
			color: '#999',
			icon: 'fas fa-question-circle',
		}
	}

	const minutes = user.minutes_since_last_activity

	if (minutes < 1) {
		return {
			text: 'только что был онлайн',
			color: '#ff9800',
			icon: 'fas fa-circle',
		}
	} else if (minutes < 60) {
		return {
			text: `${minutes} мин. назад`,
			color: '#ff9800',
			icon: 'fas fa-clock',
		}
	} else if (minutes < 1440) {
		// меньше суток
		const hours = Math.floor(minutes / 60)
		return {
			text: `${hours} ч. назад`,
			color: '#ff5722',
			icon: 'fas fa-clock',
		}
	} else if (minutes < 10080) {
		// меньше недели
		const days = Math.floor(minutes / 1440)
		return {
			text: `${days} дн. назад`,
			color: '#f44336',
			icon: 'fas fa-calendar',
		}
	} else {
		const weeks = Math.floor(minutes / 10080)
		return {
			text: `${weeks} нед. назад`,
			color: '#9e9e9e',
			icon: 'fas fa-calendar',
		}
	}
}

// Функция определения цвета аватара на основе статуса
function getAvatarBorderColor(user) {
	if (user.is_online) {
		return '#4CAF50' // зеленый - онлайн
	} else if (user.status_category === 'never_active') {
		return '#999' // серый - никогда не был активен
	} else if (user.minutes_since_last_activity < 60) {
		return '#ff9800' // оранжевый - недавно был
	} else if (user.minutes_since_last_activity < 1440) {
		return '#ff5722' // красно-оранжевый - несколько часов назад
	} else {
		return '#f44336' // красный - давно не был
	}
}

// Обновленная функция загрузки пользователей
async function loadOnlineUsers() {
	const container = document.getElementById('onlineUsersContainer')
	const countElement = document.getElementById('onlineUsersCount')

	try {
		container.innerHTML =
			'<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Загрузка...</div>'

		const response = await fetch(getApiUrl('admin/online-users'), {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error('Ошибка загрузки данных')
		}

		const data = await response.json()

		// Обновляем счетчик с информацией об онлайн и офлайн пользователях
		countElement.innerHTML = `
            <span style="color: #4CAF50;">${data.online_count} онлайн</span> / 
            <span style="color: #f44336;">${data.offline_count} офлайн</span> 
            (всего: ${data.total})
        `

		// Очищаем контейнер
		container.innerHTML = ''

		if (data.users.length === 0) {
			container.innerHTML = `
                <div class="empty-online-state">
                    <i class="fas fa-users-slash"></i>
                    <h3>Нет зарегистрированных пользователей</h3>
                    <p>В системе пока нет пользователей</p>
                </div>
            `
			return
		}

		// Группируем пользователей по статусу
		const onlineUsers = data.users.filter(user => user.is_online)
		const offlineUsers = data.users.filter(user => !user.is_online)

		// Создаем секцию онлайн пользователей
		if (onlineUsers.length > 0) {
			const onlineSection = document.createElement('div')
			onlineSection.className = 'users-section'
			onlineSection.innerHTML = `
                <div class="users-section-header">
                    <h3><i class="fas fa-circle" style="color: #4CAF50;"></i> Онлайн (${onlineUsers.length})</h3>
                </div>
                <div class="users-grid" id="onlineUsersGrid"></div>
            `
			container.appendChild(onlineSection)

			const onlineGrid = document.getElementById('onlineUsersGrid')
			onlineUsers.forEach(user => {
				onlineGrid.appendChild(createUserCard(user))
			})
		}

		// Создаем секцию офлайн пользователей
		if (offlineUsers.length > 0) {
			const offlineSection = document.createElement('div')
			offlineSection.className = 'users-section'
			offlineSection.innerHTML = `
                <div class="users-section-header">
                    <h3><i class="fas fa-circle" style="color: #f44336;"></i> Офлайн (${offlineUsers.length})</h3>
                </div>
                <div class="users-grid" id="offlineUsersGrid"></div>
            `
			container.appendChild(offlineSection)

			const offlineGrid = document.getElementById('offlineUsersGrid')
			offlineUsers.forEach(user => {
				offlineGrid.appendChild(createUserCard(user))
			})
		}
	} catch (error) {
		console.error('Ошибка загрузки пользователей:', error)
		container.innerHTML = `
            <div class="empty-online-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить список пользователей</p>
            </div>
        `
		countElement.textContent = '0 онлайн / 0 офлайн (всего: 0)'
	}
}

// Функция создания карточки пользователя
function createUserCard(user) {
	const initials = getInitials(user.name)
	const activity = formatLastActivity(user)
	const avatarBorderColor = getAvatarBorderColor(user)

	let roleDisplay = user.role
	if (user.role === 'student') {
		roleDisplay = 'Студент'
	} else if (user.role === 'admin') {
		roleDisplay = 'Администратор'
	} else if (user.role === 'teacher') {
		roleDisplay = 'Преподаватель'
	}

	const userCard = document.createElement('div')
	userCard.className = `user-card ${user.is_online ? 'online' : 'offline'}`
	userCard.innerHTML = `
        <div class="user-avatar" style="border: 3px solid ${avatarBorderColor}">
            ${initials}
            ${user.is_online ? '<div class="online-indicator"></div>' : ''}
        </div>
        <div class="user-info">
            <div class="user-name">${user.name || 'Не указано'}</div>
            <div class="user-username">@${user.username} • ${roleDisplay}</div>
            <div class="user-activity">
                <i class="${activity.icon}" style="color: ${
		activity.color
	}"></i>
                ${activity.text}
            </div>
        </div>
    `

	return userCard
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
