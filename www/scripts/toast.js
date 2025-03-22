function showToast(message, type = 'success') {
	const toast = document.createElement('div')
	toast.className = `toast ${type}`
	toast.textContent = message
	document.body.appendChild(toast)

	// Позволяем времени пройти, чтобы CSS-анимация сработала
	setTimeout(() => {
		toast.classList.add('show')
	}, 100)

	// Убираем уведомление через 3 секунды
	setTimeout(() => {
		toast.classList.remove('show')
		// Удаляем элемент после завершения анимации
		setTimeout(() => {
			document.body.removeChild(toast)
		}, 500)
	}, 3000)
}
