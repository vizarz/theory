// Показываем форму смены пароля с анимацией
const toggleBtn = document.getElementById('toggleChangePasswordBtn')
const changeForm = document.getElementById('adminChangePasswordForm')
toggleBtn.addEventListener('click', () => {
	changeForm.classList.toggle('active')
	// При раскрытии формы заполняем выпадающий список пользователей
	if (changeForm.classList.contains('active')) {
		fetch('http://localhost:3000/api/admin/users', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		})
			.then(response => {
				if (!response.ok) {
					return response.text().then(text => {
						throw new Error(text || response.statusText)
					})
				}
				return response.json()
			})
			.then(users => {
				const userSelect = document.getElementById('userSelect')
				userSelect.innerHTML = '<option value="">Выберите пользователя</option>'
				users.forEach(user => {
					// Формат: username — name
					const option = document.createElement('option')
					option.value = user.username
					option.textContent = `${user.username} — ${user.name}`
					userSelect.appendChild(option)
				})
			})
			.catch(error => {
				showToast('Ошибка загрузки пользователей: ' + error.message, 'error')
			})
	}
})

// Обработчик отправки формы смены пароля
document
	.getElementById('submitChangePasswordBtn')
	.addEventListener('click', async function (e) {
		e.preventDefault()
		const userSelect = document.getElementById('userSelect')
		const targetUsername = userSelect.value
		const newPassword = document.getElementById('newPassword').value.trim()
		const confirmNewPassword = document
			.getElementById('confirmNewPassword')
			.value.trim()

		if (!targetUsername || !newPassword || !confirmNewPassword) {
			showToast('Заполните все поля', 'error')
			return
		}
		if (newPassword !== confirmNewPassword) {
			showToast('Новые пароли не совпадают', 'error')
			return
		}

		const token = localStorage.getItem('token')
		const data = { username: targetUsername, newPassword: newPassword }

		try {
			const response = await fetch(
				'http://localhost:3000/api/admin/change-password',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(data),
				}
			)

			if (!response.ok) {
				const errorText = await response.text()
				showToast(`Ошибка: ${errorText}`, 'error')
				return
			}
			showToast('Пароль изменён', 'success')
		} catch (error) {
			showToast('Ошибка при смене пароля', 'error')
		}
	})
