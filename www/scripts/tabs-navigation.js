document.addEventListener('DOMContentLoaded', function () {
	const sections = document.querySelectorAll('.section')
	const navLinks = document.querySelectorAll('.tabs__menu-button')
	const tabsMenu = document.querySelector('.tabs__menu')

	// Добавляем sticky-эффект для меню вкладок
	const tabsMenuOffset = tabsMenu.offsetTop

	// Функция определения текущей активной секции
	function updateActiveSection() {
		// Получаем текущую позицию прокрутки плюс небольшой отступ для лучшего UX
		const currentPos = window.scrollY + 200 // 200px - примерно высота меню и небольшой отступ

		// Находим секцию, которая сейчас в области просмотра
		let activeIndex = 0

		sections.forEach((section, i) => {
			// Вычисляем верхнюю и нижнюю границы секции
			const sectionTop = section.offsetTop
			const sectionBottom = sectionTop + section.offsetHeight

			// Если текущая позиция находится в пределах секции, или прошла её начало,
			// и это последняя секция, то это активная секция
			if (
				currentPos >= sectionTop &&
				(currentPos < sectionBottom || i === sections.length - 1)
			) {
				activeIndex = i
			}
		})

		// Обновляем активную вкладку
		navLinks.forEach((link, i) => {
			if (i === activeIndex) {
				link.classList.add('active')
			} else {
				link.classList.remove('active')
			}
		})

		// Обновляем sticky состояние меню
		if (window.scrollY > tabsMenuOffset) {
			tabsMenu.classList.add('is-sticky')
		} else {
			tabsMenu.classList.remove('is-sticky')
		}
	}

	// Обработка клика по вкладке
	navLinks.forEach(link => {
		link.addEventListener('click', function (e) {
			// Предотвращаем стандартное поведение ссылки
			e.preventDefault()

			// Удаляем класс active у всех вкладок
			navLinks.forEach(l => l.classList.remove('active'))

			// Добавляем класс active текущей вкладке
			this.classList.add('active')

			// Плавно прокручиваем к выбранной секции
			const targetId = this.getAttribute('href')
			const targetSection = document.querySelector(targetId)

			if (targetSection) {
				// Прокручиваем с учетом высоты sticky-меню
				const offset = tabsMenu.offsetHeight + 20 // Добавляем небольшой отступ
				const targetPosition = targetSection.offsetTop - offset

				window.scrollTo({
					top: targetPosition,
					behavior: 'smooth',
				})
			}
		})
	})

	// Вызываем функцию при загрузке и прокрутке
	window.addEventListener('scroll', updateActiveSection)

	// Инициализация активной вкладки при загрузке
	updateActiveSection()

	// Добавляем стили для sticky-меню
	document.addEventListener('DOMContentLoaded', function () {
		const tabsMenu = document.querySelector('.tabs__menu')
		const tabsMenuOffset = tabsMenu.offsetTop

		window.addEventListener('scroll', function () {
			if (window.pageYOffset > tabsMenuOffset) {
				tabsMenu.classList.add('is-sticky')
			} else {
				tabsMenu.classList.remove('is-sticky')
			}
		})
	})
	document.head.appendChild(styleElement)
})
