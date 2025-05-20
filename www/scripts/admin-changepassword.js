document.addEventListener('DOMContentLoaded', function () {
	const chooseUserBtn = document.getElementById('chooseUserBtnExternalCP')
	if (chooseUserBtn) {
		chooseUserBtn.addEventListener('click', () => {
			console.log('Кнопка chooseUserBtnExternalCP нажата')
			openUserModal(function (selectedUsername) {
				console.log('openUserModal callback вызвана с:', selectedUsername)
				document.getElementById('userSelect').value = selectedUsername
				let option = document.querySelector(
					"#userList option[value='" + selectedUsername + "']"
				)
				let displayText = option ? option.textContent : selectedUsername
				document.getElementById('selectedUserLabelCP').textContent =
					'Выбран пользователь: ' + displayText
				showToast(`Выбран пользователь: ${displayText}`, 'success')
			})
		})
	} else {
		console.log('Элемент chooseUserBtnExternalCP не найден')
	}

	document
		.getElementById('submitChangePasswordBtn')
		.addEventListener('click', async function (e) {
			e.preventDefault()
			const targetUsername = document.getElementById('userSelect').value
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
				const response = await fetch(getApiUrl('admin/change-password'), {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(data),
				})

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
})
