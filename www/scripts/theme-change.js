// Получаем сохраненный режим темы
let darkMode = localStorage.getItem('darkMode')
const themeToggleBtn = document.querySelector('#theme-toggle-btn')

// Функция включения темной темы
const enableDarkMode = () => {
	document.documentElement.classList.add('dark-mode')
	document.body.classList.add('dark-mode')
	localStorage.setItem('darkMode', 'true')
	if (typeof updateThemeButton === 'function') {
		updateThemeButton()
	}
}

// Функция выключения темной темы
const disableDarkMode = () => {
	document.documentElement.classList.remove('dark-mode')
	document.body.classList.remove('dark-mode')
	localStorage.setItem('darkMode', 'false')
	if (typeof updateThemeButton === 'function') {
		updateThemeButton()
	}
}

// Применяем тему сразу при загрузке страницы
if (darkMode === 'true') {
	enableDarkMode()
}

// Обработчик клика по кнопке переключения темы
// Добавляем его после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
	const themeToggleBtn = document.querySelector('#theme-toggle-btn')
	if (themeToggleBtn) {
		themeToggleBtn.addEventListener('click', () => {
			darkMode = localStorage.getItem('darkMode')
			if (darkMode !== 'true') {
				enableDarkMode()
			} else {
				disableDarkMode()
			}
		})
	}
})
