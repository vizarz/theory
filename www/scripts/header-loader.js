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

// Функция для преобразования бокового меню в табы на мобильных устройствах
function setupMobileNavigation() {
	// Проверяем, есть ли на странице боковое меню
	const sidebar = document.querySelector('.sidebar')
	if (!sidebar) return

	const menuLinks = sidebar.querySelectorAll('.nav-link')
	if (menuLinks.length === 0) return
	function handleScroll() {
		if (window.innerWidth <= 800) {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop
			if (scrollTop > 70) {
				// Немного больше высоты шапки
				sidebar.classList.add('scrolled')
			} else {
				sidebar.classList.remove('scrolled')
			}
		}
	}
	window.addEventListener('scroll', handleScroll)
	handleScroll()

	// Создаем карту разделов и соответствующих им ссылок в меню
	const sectionMap = {}
	menuLinks.forEach(link => {
		const targetId = link.getAttribute('href').replace('#', '')
		const targetSection = document.getElementById(targetId)
		if (targetSection) {
			sectionMap[targetId] = {
				section: targetSection,
				link: link,
			}
		}
	})

	// Функция для определения текущего видимого раздела
	function determineActiveSection() {
		// Высота прилипающего меню + шапки + небольшой отступ
		const offset = 120

		// Находим раздел, который сейчас видим в окне просмотра
		let currentSectionId = null
		let maxVisibleHeight = 0

		for (const id in sectionMap) {
			const section = sectionMap[id].section
			const rect = section.getBoundingClientRect()

			// Проверяем, виден ли раздел в окне просмотра
			// Учитываем отступ для прилипающего меню
			if (rect.top <= offset && rect.bottom > offset) {
				const visibleHeight =
					Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, offset)

				// Выбираем раздел с наибольшей видимой областью
				if (visibleHeight > maxVisibleHeight) {
					maxVisibleHeight = visibleHeight
					currentSectionId = id
				}
			}
		}

		return currentSectionId
	}

	// Функция для центрирования активного пункта меню
	function centerActiveMenuItem(activeLink) {
		if (!activeLink || window.innerWidth > 800) return

		const navContainer = activeLink.closest('.menu-list')
		if (!navContainer) return

		const linkPosition = activeLink.offsetLeft
		const linkWidth = activeLink.offsetWidth
		const containerWidth = navContainer.offsetWidth

		// Рассчитываем позицию скролла, чтобы активный пункт был в центре
		const scrollPosition = linkPosition - containerWidth / 2 + linkWidth / 2

		// Плавно прокручиваем меню
		navContainer.scrollTo({
			left: scrollPosition,
			behavior: 'smooth',
		})
	}

	// Функция для обновления активного пункта меню
	function updateActiveMenuItem() {
		const activeSectionId = determineActiveSection()

		if (activeSectionId) {
			// Удаляем класс active со всех ссылок
			menuLinks.forEach(link => link.classList.remove('active'))

			// Добавляем класс active к активной ссылке
			const activeLink = sectionMap[activeSectionId].link
			activeLink.classList.add('active')

			// Центрируем активный пункт меню
			centerActiveMenuItem(activeLink)

			// Обновляем URL без перезагрузки страницы, если активный раздел изменился
			if (window.location.hash !== '#' + activeSectionId) {
				history.replaceState(null, null, '#' + activeSectionId)
			}
		}
	}

	// Обработчик события прокрутки
	let scrollTimer
	window.addEventListener('scroll', function () {
		// Используем debounce для оптимизации производительности
		clearTimeout(scrollTimer)
		scrollTimer = setTimeout(updateActiveMenuItem, 100)
	})

	// Запускаем при инициализации
	updateActiveMenuItem()
	// Функция для проверки, активна ли ссылка (соответствует ли текущему якорю)
	function updateActiveLink() {
		const currentHash =
			window.location.hash || menuLinks[0].getAttribute('href')

		menuLinks.forEach(link => {
			if (link.getAttribute('href') === currentHash) {
				link.classList.add('active')
			} else {
				link.classList.remove('active')
			}
		})
	}

	// Добавляем обработчики событий для переключения активного состояния
	menuLinks.forEach(link => {
		link.addEventListener('click', function () {
			menuLinks.forEach(l => l.classList.remove('active'))
			this.classList.add('active')

			// Прокручиваем до выбранного элемента в горизонтальном меню (для мобильных)
			if (window.innerWidth <= 800) {
				const navContainer = link.closest('.menu-list')
				const linkPosition = link.offsetLeft
				const containerWidth = navContainer.offsetWidth
				const scrollPosition =
					linkPosition - containerWidth / 2 + link.offsetWidth / 2

				navContainer.scrollTo({
					left: scrollPosition,
					behavior: 'smooth',
				})
			}
		})
	})

	// Устанавливаем начальное активное состояние
	updateActiveLink()

	// Обновляем активное состояние при изменении хэша
	window.addEventListener('hashchange', updateActiveLink)
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
		// Обработка профиля на мобильных устройствах
		const profileDropdown = document.getElementById('profile-dropdown')
		const dropdownContent = profileDropdown
			? profileDropdown.querySelector('.dropdown-content')
			: null

		if (profileDropdown) {
			// Добавляем обработчик клика для иконки профиля
			profileDropdown
				.querySelector('.profile-icon-container')
				.addEventListener('click', function (e) {
					// Проверяем, на мобильном ли устройстве
					if (window.innerWidth <= 800) {
						e.stopPropagation() // Предотвращаем "всплытие" события
						profileDropdown.classList.toggle('active')
					}
				})

			// Закрываем меню при клике в любом месте страницы
			document.addEventListener('click', function (e) {
				if (
					window.innerWidth <= 800 &&
					profileDropdown.classList.contains('active')
				) {
					if (!profileDropdown.contains(e.target)) {
						profileDropdown.classList.remove('active')
					}
				}
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

		// Инициализация мобильного меню ПОСЛЕ загрузки header.html
		const mobileMenuButton = document.querySelector('.mobile-menu-button')
		const mobileMenu = document.querySelector('.mobile-menu')
		const mobileMenuClose = document.querySelector('.mobile-menu-close')

		if (mobileMenuButton && mobileMenu && mobileMenuClose) {
			// Открытие меню
			mobileMenuButton.addEventListener('click', function () {
				mobileMenu.classList.add('active')
				document.body.style.overflow = 'hidden' // Предотвращаем прокрутку страницы
			})

			// Закрытие меню
			mobileMenuClose.addEventListener('click', function () {
				mobileMenu.classList.remove('active')
				document.body.style.overflow = '' // Возвращаем прокрутку
			})
		}

		// Вызываем функцию настройки мобильной навигации
		setupMobileNavigation()
	})
	.catch(error => console.error('Ошибка загрузки header:', error))

// Также инициализируем мобильную навигацию при полной загрузке страницы,
// чтобы учесть возможное изменение хэша или других условий
document.addEventListener('DOMContentLoaded', function () {
	setupMobileNavigation()
})
