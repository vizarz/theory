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
				// Если токен невалидный или истек, обрабатываем это
				if (response.status === 401) {
					this.handleTokenExpired()
				}
			} else {
				// Heartbeat успешен - токен валидный
				console.log('👤 Heartbeat успешен')
			}
		} catch (error) {
			console.warn('Heartbeat error:', error)
		}
	}

	// Обработка истекшего токена
	handleTokenExpired() {
		console.log('🚫 Токен истек или невалидный')

		// Останавливаем heartbeat
		this.stopHeartbeat()

		// Удаляем токен из localStorage
		localStorage.removeItem('token')

		// Показываем уведомление пользователю
		if (typeof showToast === 'function') {
			showToast('Сессия истекла. Перенаправление на страницу входа...', 'error')
		} else {
			alert('Сессия истекла. Необходимо войти заново.')
		}

		// Перенаправляем на страницу входа через 2 секунды
		setTimeout(() => {
			this.redirectToLogin()
		}, 2000)
	}

	// Перенаправление на страницу входа
	redirectToLogin() {
		const currentPage = window.location.pathname.split('/').pop()

		// Проверяем, что мы не на странице входа или регистрации
		if (currentPage !== 'login.html' && currentPage !== 'register.html') {
			console.log('🔄 Перенаправление на страницу входа')
			window.location.href = 'login.html'
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

	// Проверка валидности токена (дополнительная проверка)
	async checkTokenValidity() {
		const token = localStorage.getItem('token')
		if (!token) {
			this.redirectToLogin()
			return false
		}

		try {
			const response = await fetch(getApiUrl('auth/verify-token'), {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			})

			if (response.ok) {
				return true
			} else if (response.status === 401) {
				this.handleTokenExpired()
				return false
			}
		} catch (error) {
			console.warn('Ошибка проверки токена:', error)
			// Не перенаправляем при сетевых ошибках
			return true
		}

		return false
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
			// Проверяем токен при возвращении фокуса
			this.checkTokenValidity()
		})

		// Дополнительная проверка токена каждые 5 минут
		setInterval(() => {
			this.checkTokenValidity()
		}, 5 * 60 * 1000) // 5 минут
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
