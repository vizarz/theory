function b64DecodeUnicode(str) {
	// Преобразуем Base64Url в стандартный Base64
	str = str.replace(/-/g, '+').replace(/_/g, '/')
	// Дополняем '=' если необходимо
	while (str.length % 4) str += '='
	return decodeURIComponent(
		Array.prototype.map
			.call(atob(str), function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
			})
			.join('')
	)
}

document.addEventListener('DOMContentLoaded', function () {
	const profileContainer = document.getElementById('profile-info')
	const token = localStorage.getItem('token')

	if (!token) {
		profileContainer.innerHTML =
			'<p>Вы не авторизованы. Пожалуйста, войдите в профиль.</p>'
		return
	}

	let payload = null
	try {
		const payloadBase64 = token.split('.')[1]
		// Используем функцию для корректного декодирования UTF-8
		payload = JSON.parse(b64DecodeUnicode(payloadBase64))
	} catch (e) {
		console.error('Ошибка декодирования токена:', e)
		profileContainer.innerHTML =
			'<p>Ошибка при загрузке информации о профиле.</p>'
		return
	}

	// Получаем необходимые поля: name, username и role
	const name = payload.name || 'Не указано'
	const username = payload.username || 'Не указан'
	let role = payload.role || 'Не указана'

	// Преобразуем роль: 'student' -> 'Студент', 'admin' -> 'Администратор'
	if (role === 'student') {
		role = 'Студент'
	} else if (role === 'admin') {
		role = 'Администратор'
	}

	// Формируем HTML с информацией о профиле и кнопкой смены пароля
	profileContainer.innerHTML = `
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Роль:</strong> ${role}</p>
        <button id="changePasswordBtn" class="btn-read">Изменить пароль</button>
        <div id="changePasswordForm" class="slide-form">
            <input type="password" id="oldPassword" placeholder="Старый пароль" /><br/>
            <input type="password" id="newPassword" placeholder="Новый пароль" /><br/>
            <input type="password" id="confirmNewPassword" placeholder="Повторите новый пароль" /><br/>
            <button id="confirmChangeBtn" class="btn-read">Подтвердить</button>
            <button id="cancelChangeBtn" class="btn-read">Отменить</button>
        </div>
    `

	// Обработчик показа формы с плавным слайдом (добавляем класс "active")
	document
		.getElementById('changePasswordBtn')
		.addEventListener('click', function () {
			document.getElementById('changePasswordForm').classList.add('active')
		})

	// Обработчик скрытия формы (удаляем класс "active")
	document
		.getElementById('cancelChangeBtn')
		.addEventListener('click', function () {
			document.getElementById('changePasswordForm').classList.remove('active')
		})

	// Обработчик подтверждения смены пароля
	document
		.getElementById('confirmChangeBtn')
		.addEventListener('click', function () {
			const oldPassword = document.getElementById('oldPassword').value.trim()
			const newPassword = document.getElementById('newPassword').value.trim()
			const confirmNewPassword = document
				.getElementById('confirmNewPassword')
				.value.trim()

			if (!oldPassword || !newPassword || !confirmNewPassword) {
				showToast('Заполните все поля', 'error')
				return
			}
			if (newPassword !== confirmNewPassword) {
				showToast('Новые пароли не совпадают', 'error')
				return
			}

			const data = {
				oldPassword: oldPassword,
				newPassword: newPassword,
			}

			fetch('http://localhost:3000/api/change-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			})
				.then(response => {
					if (!response.ok) {
						return response.text().then(text => {
							throw new Error(text || response.statusText)
						})
					}
					return response.text()
				})
				.then(result => {
					if (result === 'OK') {
						showToast('Пароль успешно изменен', 'success')
						setTimeout(() => window.location.reload(), 1500)
					} else {
						showToast(result, 'error')
					}
				})
				.catch(error => {
					showToast('Ошибка: ' + error.message, 'error')
				})
		})
})
