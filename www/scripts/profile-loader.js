function b64DecodeUnicode(str) {
	str = str.replace(/-/g, '+').replace(/_/g, '/')
	while (str.length % 4) str += '='
	return decodeURIComponent(
		Array.prototype.map
			.call(atob(str), function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
			})
			.join('')
	)
}

function getInitials(name) {
	if (!name || name === 'Не указано' || name === 'Загрузка...') {
		return 'U'
	}

	const words = name.split(' ').filter(word => word.length > 0)

	if (words.length === 0) {
		return 'U'
	} else if (words.length === 1) {
		return words[0].charAt(0).toUpperCase()
	} else {
		return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
	}
}

async function loadUserStats() {
	const token = localStorage.getItem('token')

	try {
		const response = await fetch(getApiUrl('profile/stats'), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			throw new Error('Не удалось загрузить статистику')
		}

		const stats = await response.json()

		document.getElementById('date-registered').textContent =
			stats.dateRegistered
		document.getElementById('days-in-system').textContent =
			stats.daysInSystem + ' дней'
		document.getElementById('pages-read').textContent = stats.pagesRead
		document.getElementById('last-activity').textContent = stats.lastActivity
		document.getElementById('favorite-section').textContent =
			stats.favoriteSection
		document.getElementById('avg-activity').textContent = stats.avgActivity
	} catch (error) {
		console.error('Ошибка при загрузке статистики:', error)
		const statFields = [
			'date-registered',
			'days-in-system',
			'pages-read',
			'last-activity',
			'favorite-section',
			'avg-activity',
		]
		statFields.forEach(field => {
			document.getElementById(field).textContent = 'Нет данных'
		})
	}
}

document.addEventListener('DOMContentLoaded', function () {
	const token = localStorage.getItem('token')

	if (!token) {
		window.location.href = 'login.html'
		return
	}

	let payload = null
	try {
		const payloadBase64 = token.split('.')[1]
		payload = JSON.parse(b64DecodeUnicode(payloadBase64))
	} catch (e) {
		console.error('Ошибка декодирования токена:', e)
		showToast('Ошибка при загрузке профиля', 'error')
		return
	}

	const name = payload.name || 'Не указано'
	const username = payload.username || 'Не указан'
	let role = payload.role || 'Не указана'

	let roleDisplay = role
	if (role === 'student') {
		roleDisplay = 'Студент'
	} else if (role === 'admin') {
		roleDisplay = 'Администратор'
	}
	const initials = getInitials(name)
	document.getElementById('profile-avatar').textContent = initials
	document.getElementById('profile-name').textContent = name
	document.getElementById('profile-role').textContent = roleDisplay
	document.getElementById('profile-role').classList.add(role)

	document.getElementById('info-name').textContent = name
	document.getElementById('info-username').textContent = username
	document.getElementById('info-role').textContent = roleDisplay

	const changePasswordBtn = document.getElementById('changePasswordBtn')
	if (changePasswordBtn) {
		changePasswordBtn.addEventListener('click', function () {
			document.getElementById('changePasswordForm').classList.add('active')
			this.style.display = 'none'
		})
	}
	const cancelChangeBtn = document.getElementById('cancelChangeBtn')
	if (cancelChangeBtn) {
		cancelChangeBtn.addEventListener('click', function () {
			document.getElementById('changePasswordForm').classList.remove('active')
			document.getElementById('changePasswordBtn').style.display =
				'inline-block'
		})
	}
	const confirmChangeBtn = document.getElementById('confirmChangeBtn')
	if (confirmChangeBtn) {
		confirmChangeBtn.addEventListener('click', function () {
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

			fetch(getApiUrl('change-password'), {
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
	}
	loadUserStats()
})
