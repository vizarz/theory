// Система отслеживания активности пользователя
class UserHeartbeat {
	constructor() {
		this.heartbeatInterval = null
		this.isActive = true
		this.lastActivity = Date.now()

		// Запускаем heartbeat только если пользователь авторизован
		if (localStorage.getItem('token')) {
			this.startHeartbeat()
			this.setupActivityListeners()
		}
	}

	// Отправка heartbeat на сервер
	async sendHeartbeat() {
		const token = localStorage.getItem('token')
		if (!token) {
			this.stopHeartbeat()
			return
		}

		try {
			const response = await fetch(getApiUrl('auth/heartbeat'), {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				console.warn('Heartbeat failed:', response.status)
				// Если токен невалидный, останавливаем heartbeat
				if (response.status === 401) {
					this.stopHeartbeat()
					localStorage.removeItem('token')
				}
			}
		} catch (error) {
			console.warn('Heartbeat error:', error)
		}
	}

	// Запуск heartbeat
	startHeartbeat() {
		// Отправляем первый heartbeat сразу
		this.sendHeartbeat()

		// Устанавливаем интервал отправки каждые 60 секунд
		this.heartbeatInterval = setInterval(() => {
			this.sendHeartbeat()
		}, 60000) // 60 секунд

		console.log('👤 Heartbeat система запущена')
	}

	// Остановка heartbeat
	stopHeartbeat() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval)
			this.heartbeatInterval = null
			console.log('👤 Heartbeat система остановлена')
		}
	}

	// Установка пользователя как оффлайн при выходе
	async setOffline() {
		const token = localStorage.getItem('token')
		if (!token) return

		try {
			await fetch(getApiUrl('auth/logout-status'), {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			})
		} catch (error) {
			console.warn('Error setting offline status:', error)
		}
	}

	// Настройка слушателей активности пользователя
	setupActivityListeners() {
		// Отслеживаем активность пользователя
		const activityEvents = [
			'mousedown',
			'mousemove',
			'keypress',
			'scroll',
			'touchstart',
			'click',
		]

		const updateActivity = () => {
			this.lastActivity = Date.now()
			this.isActive = true
		}

		activityEvents.forEach(event => {
			document.addEventListener(event, updateActivity, { passive: true })
		})

		// Обработка закрытия страницы/вкладки
		window.addEventListener('beforeunload', () => {
			this.setOffline()
		})

		// Обработка изменения видимости страницы
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				// Страница скрыта - можно уменьшить частоту heartbeat
				console.log('👤 Страница скрыта')
			} else {
				// Страница снова видима - возобновляем нормальный heartbeat
				console.log('👤 Страница активна')
				this.sendHeartbeat()
			}
		})

		// Обработка потери фокуса окна
		window.addEventListener('blur', () => {
			console.log('👤 Окно потеряло фокус')
		})

		window.addEventListener('focus', () => {
			console.log('👤 Окно получило фокус')
			this.sendHeartbeat()
		})
	}

	// Обновление при входе пользователя в систему
	onUserLogin() {
		if (!this.heartbeatInterval) {
			this.startHeartbeat()
			this.setupActivityListeners()
		}
	}

	// Очистка при выходе пользователя
	onUserLogout() {
		this.setOffline()
		this.stopHeartbeat()
	}
}

// Создаем глобальный экземпляр heartbeat системы
let userHeartbeat = null

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
	userHeartbeat = new UserHeartbeat()
})

// Экспортируем для использования в других скриптах
window.userHeartbeat = userHeartbeat
