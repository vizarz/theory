// Улучшенная навигация по странице
class PageNavigation {
	constructor() {
		this.links = []
		this.sections = []
		this.isScrolling = false
		this.scrollTimeout = null

		this.init()
	}

	init() {
		// Инициализация с небольшой задержкой для загрузки DOM
		setTimeout(() => {
			this.updateElements()
			this.bindEvents()
			this.updateActiveLink()
		}, 100)
	}

	updateElements() {
		// Находим все навигационные ссылки
		this.links = Array.from(document.querySelectorAll('.nav-link'))

		// Находим все секции с ID
		this.sections = Array.from(
			document.querySelectorAll('div[id], section[id]')
		)

		// Фильтруем секции, которые действительно имеют соответствующие ссылки
		this.sections = this.sections.filter(section => {
			return this.links.some(link => {
				const href = link.getAttribute('href')
				return href && href === `#${section.id}`
			})
		})

		console.log(
			`📍 Найдено ${this.links.length} ссылок и ${this.sections.length} секций`
		)
	}

	bindEvents() {
		// Обработчик клика по ссылкам
		this.links.forEach(link => {
			link.addEventListener('click', event => {
				event.preventDefault()
				this.handleLinkClick(link)
			})
		})

		// Обработчик скролла с троттлингом
		window.addEventListener(
			'scroll',
			() => {
				this.handleScroll()
			},
			{ passive: true }
		)

		// Обработчик изменения размера окна
		window.addEventListener(
			'resize',
			() => {
				clearTimeout(this.scrollTimeout)
				this.scrollTimeout = setTimeout(() => {
					this.updateActiveLink()
				}, 250)
			},
			{ passive: true }
		)

		// Обработчик загрузки изображений (может изменить высоту страницы)
		window.addEventListener('load', () => {
			setTimeout(() => {
				this.updateActiveLink()
			}, 500)
		})
	}

	handleLinkClick(link) {
		const href = link.getAttribute('href')
		if (!href || !href.startsWith('#')) {
			console.warn('Неверная ссылка:', href)
			return
		}

		const targetId = href.substring(1)
		const target = document.getElementById(targetId)

		if (!target) {
			console.warn('Секция не найдена:', targetId)
			return
		}

		// Помечаем, что идет программный скролл
		this.isScrolling = true

		// Устанавливаем активную ссылку сразу
		this.setActiveLink(link)

		// Вычисляем позицию с учетом фиксированного хедера
		const headerHeight = this.getHeaderHeight()
		const targetPosition = target.offsetTop - headerHeight - 20

		// Плавный скролл
		window.scrollTo({
			top: Math.max(0, targetPosition),
			behavior: 'smooth',
		})

		// Сбрасываем флаг через некоторое время
		clearTimeout(this.scrollTimeout)
		this.scrollTimeout = setTimeout(() => {
			this.isScrolling = false
			this.updateActiveLink()
		}, 1000)
	}

	handleScroll() {
		// Игнорируем скролл во время программной прокрутки
		if (this.isScrolling) return

		// Дебаунс для производительности
		clearTimeout(this.scrollTimeout)
		this.scrollTimeout = setTimeout(() => {
			this.updateActiveLink()
		}, 50)
	}

	updateActiveLink() {
		if (this.sections.length === 0 || this.links.length === 0) {
			return
		}

		const scrollPosition = window.scrollY
		const windowHeight = window.innerHeight
		const documentHeight = document.documentElement.scrollHeight
		const headerHeight = this.getHeaderHeight()

		// Если скроллили до самого низа, активируем последнюю секцию
		if (scrollPosition + windowHeight >= documentHeight - 10) {
			const lastLink = this.getLastValidLink()
			if (lastLink) {
				this.setActiveLink(lastLink)
				return
			}
		}

		// Если в самом верху страницы, активируем первую секцию
		if (scrollPosition <= 50) {
			const firstLink = this.getFirstValidLink()
			if (firstLink) {
				this.setActiveLink(firstLink)
				return
			}
		}

		// Находим текущую видимую секцию
		let activeSection = null
		let closestDistance = Infinity

		this.sections.forEach(section => {
			const rect = section.getBoundingClientRect()
			const sectionTop = rect.top + scrollPosition
			const sectionBottom = sectionTop + rect.height

			// Проверяем, видна ли секция
			const viewportTop = scrollPosition + headerHeight + 100
			const viewportBottom = scrollPosition + windowHeight - 100

			const isVisible =
				sectionTop < viewportBottom && sectionBottom > viewportTop

			if (isVisible) {
				// Вычисляем расстояние от центра viewport до секции
				const viewportCenter = (viewportTop + viewportBottom) / 2
				const sectionCenter = (sectionTop + sectionBottom) / 2
				const distance = Math.abs(viewportCenter - sectionCenter)

				if (distance < closestDistance) {
					closestDistance = distance
					activeSection = section
				}
			}
		})

		if (activeSection) {
			const activeLink = this.findLinkForSection(activeSection)
			if (activeLink) {
				this.setActiveLink(activeLink)
			}
		}
	}

	setActiveLink(activeLink) {
		// Убираем активный класс со всех ссылок
		this.links.forEach(link => {
			link.classList.remove('active')
		})

		// Добавляем активный класс к выбранной ссылке
		if (activeLink) {
			activeLink.classList.add('active')

			// Опционально: прокручиваем навигацию к активной ссылке
			this.scrollNavToActiveLink(activeLink)
		}
	}

	findLinkForSection(section) {
		return this.links.find(link => {
			const href = link.getAttribute('href')
			return href === `#${section.id}`
		})
	}

	getFirstValidLink() {
		return this.links.find(link => {
			const href = link.getAttribute('href')
			return href && href.startsWith('#') && document.querySelector(href)
		})
	}

	getLastValidLink() {
		const validLinks = this.links.filter(link => {
			const href = link.getAttribute('href')
			return href && href.startsWith('#') && document.querySelector(href)
		})
		return validLinks[validLinks.length - 1]
	}

	getHeaderHeight() {
		const header = document.querySelector('header, .header, .navbar')
		return header ? header.offsetHeight : 0
	}

	scrollNavToActiveLink(activeLink) {
		// Если навигация находится в скроллируемом контейнере
		const navContainer = activeLink.closest('.scrollable-nav, .sidebar')
		if (navContainer) {
			const linkRect = activeLink.getBoundingClientRect()
			const containerRect = navContainer.getBoundingClientRect()

			if (
				linkRect.top < containerRect.top ||
				linkRect.bottom > containerRect.bottom
			) {
				activeLink.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
			}
		}
	}

	// Публичные методы для внешнего использования
	refresh() {
		this.updateElements()
		this.updateActiveLink()
	}

	goToSection(sectionId) {
		const link = this.links.find(
			link => link.getAttribute('href') === `#${sectionId}`
		)
		if (link) {
			this.handleLinkClick(link)
		} else {
			console.warn('Ссылка не найдена для секции:', sectionId)
		}
	}

	getCurrentSection() {
		const activeLink = this.links.find(link =>
			link.classList.contains('active')
		)
		if (activeLink) {
			const href = activeLink.getAttribute('href')
			return href ? href.substring(1) : null
		}
		return null
	}
}

// Создаем глобальный экземпляр навигации
let pageNavigation = null

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function () {
	pageNavigation = new PageNavigation()

	// Делаем доступным глобально для отладки и внешнего использования
	window.pageNavigation = pageNavigation
})

// Дополнительная инициализация после полной загрузки страницы
window.addEventListener('load', function () {
	if (pageNavigation) {
		// Обновляем навигацию после загрузки всех ресурсов
		setTimeout(() => {
			pageNavigation.refresh()
		}, 500)
	}
})

// Экспорт для модульных систем (если используется)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = PageNavigation
}
