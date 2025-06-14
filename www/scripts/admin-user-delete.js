// Функции для работы с удалением пользователей

// Показать модальное окно подтверждения удаления
function showDeleteConfirmation(usernames) {
	if (!usernames || usernames.length === 0) return

	const modal = document.getElementById('deleteConfirmModal')
	const message = document.getElementById('deleteConfirmMessage')
	const usersList = document.getElementById('selectedUsersList')
	const confirmBtn = document.getElementById('confirmDeleteBtn')

	// Устанавливаем сообщение в зависимости от количества пользователей
	if (usernames.length === 1) {
		message.textContent = `Вы действительно хотите удалить пользователя @${usernames[0]}?`
		usersList.style.display = 'none'
	} else {
		message.textContent = `Вы действительно хотите удалить следующих пользователей (${usernames.length})?`

		// Заполняем список пользователей
		usersList.innerHTML = ''
		usersList.style.display = 'block'

		usernames.forEach(username => {
			const userItem = document.createElement('div')
			userItem.className = 'selected-user-item'
			userItem.innerHTML = `<i class="fas fa-user"></i> @${username}`
			usersList.appendChild(userItem)
		})
	}

	// Устанавливаем данные для кнопки подтверждения
	confirmBtn.dataset.usernames = JSON.stringify(usernames)

	// Показываем модальное окно
	modal.style.display = 'flex'
}

// Функция удаления пользователей
async function deleteUsers(usernames) {
	try {
		showToast('Удаление пользователей...', 'info')

		const response = await fetch(getApiUrl('admin/delete-users'), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ usernames }),
		})

		const data = await response.json()

		if (!response.ok) {
			throw new Error(data.message || 'Ошибка удаления пользователей')
		}

		showToast(`Успешно удалено: ${data.count} пользователей`, 'success')

		// Обновляем список пользователей
		loadOnlineUsers()
	} catch (error) {
		console.error('Ошибка при удалении пользователей:', error)
		showToast(error.message || 'Ошибка удаления пользователей', 'error')
	}
}

// Инициализация обработчиков событий
document.addEventListener('DOMContentLoaded', function () {
	const cancelBtn = document.getElementById('cancelDeleteBtn')
	const confirmBtn = document.getElementById('confirmDeleteBtn')
	const modal = document.getElementById('deleteConfirmModal')

	// Кнопка отмены удаления
	if (cancelBtn) {
		cancelBtn.addEventListener('click', function () {
			modal.style.display = 'none'
		})
	}

	// Кнопка подтверждения удаления
	if (confirmBtn) {
		confirmBtn.addEventListener('click', function () {
			const usernames = JSON.parse(this.dataset.usernames || '[]')
			if (usernames.length > 0) {
				deleteUsers(usernames)
				modal.style.display = 'none'
			}
		})
	}

	// Закрытие модального окна при клике вне его
	window.addEventListener('click', function (event) {
		if (event.target === modal) {
			modal.style.display = 'none'
		}
	})
})
