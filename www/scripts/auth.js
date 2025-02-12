document.addEventListener('DOMContentLoaded', () => {
	const registerForm = document.getElementById('register-form')
	const loginForm = document.getElementById('login-form')

	// Получаем список пользователей из localStorage или создаем пустой объект
	let users = JSON.parse(localStorage.getItem('users')) || {}

	registerForm.addEventListener('submit', e => {
		e.preventDefault()
		const username = registerForm.username.value.trim()
		const password = registerForm.password.value.trim()

		if (users[username]) {
			alert('Пользователь с таким логином уже существует!')
			return
		}

		// Для демонстрации пароли сохраняются как есть (небезопасно)
		users[username] = password
		localStorage.setItem('users', JSON.stringify(users))
		alert('Регистрация успешна!')
		registerForm.reset()
	})

	loginForm.addEventListener('submit', e => {
		e.preventDefault()
		const username = loginForm.username.value.trim()
		const password = loginForm.password.value.trim()

		if (users[username] && users[username] === password) {
			alert('Вход выполнен успешно!')
			// Здесь можно добавить дальнейшую логику (например, переход на другую страницу)
		} else {
			alert('Неверный логин или пароль!')
		}
		loginForm.reset()
	})
})
