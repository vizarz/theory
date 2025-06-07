document.addEventListener('DOMContentLoaded', function () {
	const toggleChangePasswordBtn = document.getElementById(
		'toggleChangePasswordBtn'
	)
	const togglePageReadsBtn = document.getElementById('togglePageReadsBtn')
	const changePasswordForm = document.getElementById('adminChangePasswordForm')
	const pageReadsForm = document.getElementById('adminPageReadsForm')
	const toggleOnlineUsersBtn = document.getElementById('toggleOnlineUsersBtn')
	const onlineUsersForm = document.getElementById('adminOnlineUsersForm')

	toggleOnlineUsersBtn.addEventListener('click', function () {
		onlineUsersForm.classList.toggle('active')
		this.classList.toggle('active')

		if (this.classList.contains('active')) {
			this.innerHTML = 'Скрыть онлайн <i class="fas fa-chevron-up"></i>'

			loadOnlineUsers()
		} else {
			this.innerHTML = 'Показать онлайн <i class="fas fa-chevron-down"></i>'
		}
	})
	toggleChangePasswordBtn.addEventListener('click', function () {
		changePasswordForm.classList.toggle('active')
		this.classList.toggle('active')

		if (this.classList.contains('active')) {
			this.innerHTML = 'Скрыть форму <i class="fas fa-chevron-down"></i>'
		} else {
			this.innerHTML = 'Сменить пароль <i class="fas fa-chevron-down"></i>'
		}
	})

	togglePageReadsBtn.addEventListener('click', function () {
		pageReadsForm.classList.toggle('active')
		this.classList.toggle('active')

		if (this.classList.contains('active')) {
			this.innerHTML = 'Скрыть логи <i class="fas fa-chevron-down"></i>'
		} else {
			this.innerHTML = 'Просмотр логов <i class="fas fa-chevron-down"></i>'
		}
	})

	const userSelect = document.getElementById('userSelect')
	const userSelectReads = document.getElementById('userSelectReads')
	const submitChangePasswordBtn = document.getElementById(
		'submitChangePasswordBtn'
	)
	const loadPageReadsBtn = document.getElementById('loadPageReadsBtn')

	const observeUserField = function (field, button) {
		const observer = new MutationObserver(function (mutations) {
			button.disabled = !field.value
		})

		observer.observe(field, { attributes: true })
	}

	observeUserField(userSelect, submitChangePasswordBtn)
	observeUserField(userSelectReads, loadPageReadsBtn)

	const welcomeMessage = document.getElementById('welcomeMessage')
	if (welcomeMessage) {
		const token = localStorage.getItem('token')
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split('.')[1]))
				const name = payload.name || 'Администратор'
				welcomeMessage.innerHTML = `<i class="fas fa-user-circle"></i> Добро пожаловать, <strong>${name}</strong>!`
			} catch (e) {
				console.error('Ошибка при декодировании токена:', e)
			}
		}
	}
})
