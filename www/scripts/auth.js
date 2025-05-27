// Обработчик регистрации
const registerForm = document.getElementById('register-form')
if (registerForm) {
	registerForm.addEventListener('submit', async e => {
		e.preventDefault()

		// Проверка совпадения паролей перед отправкой
		const password = e.target.password.value
		const confirmPassword = e.target.confirmPassword.value

		// Если пароли не совпадают - прервать отправку
		if (password !== confirmPassword) {
			showToast('Пароли не совпадают', 'error')
			return // Останавливаем выполнение функции
		}

		const studentName = e.target.studentName.value
		const username = e.target.username.value
		// Роль по умолчанию для регистрации — студент.
		const role = 'student'

		try {
			const response = await fetch(getApiUrl('auth/register'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: studentName,
					username,
					password,
					role,
				}),
			})

			if (response.ok) {
				const data = await response.json()
				showToast('Вы успешно зарегистрировались', 'success')
				setTimeout(() => {
					window.location.href = 'login.html'
				}, 1500)
			} else {
				const errorData = await response.json()
				showToast(`Ошибка регистрации: ${errorData.message}`, 'error')
			}
		} catch (error) {
			console.error('Ошибка:', error)
			showToast('Произошла ошибка при регистрации', 'error')
		}
	})
}

// Обработчик входа (login)
const loginForm = document.getElementById('login-form')
if (loginForm) {
	loginForm.addEventListener('submit', async e => {
		e.preventDefault()
		console.log('Форма входа отправлена')

		const username = e.target.username.value
		const password = e.target.password.value

		try {
			const response = await fetch(getApiUrl('auth/login'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			})
			console.log('Получен ответ от сервера', response)

			if (response.ok) {
				const data = await response.json()
				console.log('Данные входа', data)
				localStorage.setItem('token', data.token)

				// Запускаем heartbeat систему при успешном входе
				if (window.userHeartbeat) {
					window.userHeartbeat.onUserLogin()
				}

				showToast('Вы вошли в аккаунт', 'success')
				setTimeout(() => {
					window.location.href = 'index.html'
				}, 1500)
			} else {
				const errorData = await response.json()
				console.error('Ошибка входа', errorData)
				showToast(`Ошибка входа: ${errorData.message}`, 'error')
			}
		} catch (error) {
			console.error('Ошибка при выполнении запроса входа:', error)
			showToast('Ошибка при входе', 'error')
		}
	})
}

// Функция выхода из системы
function logout() {
	// Останавливаем heartbeat при выходе
	if (window.userHeartbeat) {
		window.userHeartbeat.onUserLogout()
	}

	// Удаляем токен и перенаправляем на страницу входа
	localStorage.removeItem('token')
	showToast('Вы вышли из аккаунта', 'success')
	setTimeout(() => {
		window.location.href = 'login.html'
	}, 1000)
}

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
	// Если пользователь на странице входа или регистрации и уже авторизован
	const currentPage = window.location.pathname.split('/').pop()
	const token = localStorage.getItem('token')

	if (
		token &&
		(currentPage === 'login.html' || currentPage === 'register.html')
	) {
		// Перенаправляем на главную страницу
		window.location.href = 'index.html'
	}

	// Если пользователь авторизован и heartbeat система доступна
	if (
		token &&
		window.userHeartbeat &&
		currentPage !== 'login.html' &&
		currentPage !== 'register.html'
	) {
		// Убеждаемся, что heartbeat запущен
		window.userHeartbeat.onUserLogin()
	}
})
