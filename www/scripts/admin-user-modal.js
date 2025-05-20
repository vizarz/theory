document.addEventListener('DOMContentLoaded', function () {
	const modal = document.getElementById('userSelectionModal')
	const userSearchInput = document.getElementById('userSearchInput')
	const searchUserBtn = document.getElementById('searchUserBtn')
	const userList = document.getElementById('userList')
	const applyUserBtn = document.getElementById('applyUserBtn')
	const closeUserModal = document.getElementById('closeUserModal')

	let allUsers = []
	let callback = null

	// Загружаем список пользователей с сервера
	function loadUsers() {
		fetch(getApiUrl('admin/users'), {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		})
			.then(response => response.json())
			.then(users => {
				allUsers = users
				displayUsers(users)
			})
			.catch(error => {
				showToast('Ошибка загрузки пользователей: ' + error.message, 'error')
			})
	}

	// Отображение пользователей в select
	function displayUsers(users) {
		userList.innerHTML = ''
		if (users.length === 0) {
			const option = document.createElement('option')
			option.textContent = 'Пользователи не найдены'
			userList.appendChild(option)
			return
		}
		users.forEach(user => {
			const option = document.createElement('option')
			option.value = user.username
			option.textContent = `${user.username} — ${user.name}`
			userList.appendChild(option)
		})
	}

	// Обработчик кнопки поиска
	searchUserBtn.addEventListener('click', function () {
		const query = userSearchInput.value.toLowerCase()
		const filteredUsers = allUsers.filter(
			user =>
				user.username.toLowerCase().includes(query) ||
				(user.name && user.name.toLowerCase().includes(query))
		)
		displayUsers(filteredUsers)
	})

	// Кнопка "Применить" возвращает выбранного пользователя через callback
	applyUserBtn.addEventListener('click', function () {
		const selectedUsername = userList.value
		if (!selectedUsername) {
			showToast('Выберите пользователя', 'error')
			return
		}
		if (callback) callback(selectedUsername)
		modal.style.display = 'none'
	})

	// Закрытие модального окна
	closeUserModal.addEventListener('click', function () {
		modal.style.display = 'none'
	})

	// Глобальная функция для открытия модального окна с callback
	window.openUserModal = function (cb) {
		callback = cb
		userSearchInput.value = ''
		loadUsers()
		modal.style.display = 'block'
	}
})
