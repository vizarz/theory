function b64DecodeUnicode(str) {
	str = str.replace(/-/g, '+').replace(/_/g, '/')
	while (str.length % 4) {
		str += '='
	}
	return decodeURIComponent(
		Array.prototype.map
			.call(atob(str), function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
			})
			.join('')
	)
}

const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16">
    <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
</svg>`

const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sun-fill" viewBox="0 0 16 16">
    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
</svg>`

function updateThemeButton() {
	const themeToggleBtn = document.getElementById('theme-toggle-btn')
	if (document.body.classList.contains('dark-mode')) {
		themeToggleBtn.innerHTML = sunIcon
	} else {
		themeToggleBtn.innerHTML = moonIcon
	}
}

fetch('header.html')
	.then(response => response.text())
	.then(data => {
		const headerElem = document.getElementById('header')
		headerElem.innerHTML = data

		updateThemeButton()

		const themeToggleBtn = document.getElementById('theme-toggle-btn')
		if (themeToggleBtn) {
			themeToggleBtn.addEventListener('click', () => {
				document.body.classList.toggle('dark-mode')
				const darkModeEnabled = document.body.classList.contains('dark-mode')
				localStorage.setItem('darkMode', darkModeEnabled)
				updateThemeButton()
			})
		}

		// Обработка профиля, если пользователь авторизован
		const token = localStorage.getItem('token')
		if (token) {
			const dropdown = headerElem.querySelector(
				'.profile-dropdown .dropdown-content'
			)
			if (dropdown) {
				dropdown.innerHTML = ''

				let payload = null
				try {
					const payloadBase64 = token.split('.')[1]
					payload = JSON.parse(b64DecodeUnicode(payloadBase64))
				} catch (e) {
					console.error('Ошибка декодирования токена', e)
				}
				if (payload && payload.name) {
					const nameElem = document.createElement('div')
					nameElem.textContent = payload.name
					nameElem.classList.add('profile-name-header')
					dropdown.appendChild(nameElem)
				}

				const profileLink = document.createElement('a')
				profileLink.href = 'profile.html'
				profileLink.textContent = 'Профиль'
				dropdown.appendChild(profileLink)

				const logoutLink = document.createElement('a')
				logoutLink.href = '#'
				logoutLink.textContent = 'Выйти'
				logoutLink.addEventListener('click', e => {
					e.preventDefault()
					localStorage.removeItem('token')
					window.location.href = 'index.html'
				})
				dropdown.appendChild(logoutLink)
			}

			try {
				const payloadBase64 = token.split('.')[1]
				const payload = JSON.parse(b64DecodeUnicode(payloadBase64))
				if (payload && payload.role === 'admin') {
					const dropdown = headerElem.querySelector(
						'.profile-dropdown .dropdown-content'
					)
					if (dropdown) {
						const adminLink = document.createElement('a')
						adminLink.href = 'admin.html'
						adminLink.textContent = 'Админ-панель'
						dropdown.appendChild(adminLink)
					}
				}
			} catch (e) {
				console.error('Ошибка декодирования токена', e)
			}
		}
	})
	.catch(error => console.error('Ошибка загрузки header:', error))
