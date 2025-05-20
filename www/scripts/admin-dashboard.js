document.addEventListener('DOMContentLoaded', function () {
	// Проверка роли пользователя
	const token = localStorage.getItem('token')
	if (!token) {
		window.location.href = 'login.html'
		return
	}

	// Загружаем статистику при загрузке страницы
	loadDashboardStats()

	// Обновление статистики каждые 2 минуты
	setInterval(loadDashboardStats, 2 * 60 * 1000)
})

function loadDashboardStats() {
	fetch(getApiUrl('admin/dashboard-stats'), {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('token')}`,
		},
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Ошибка загрузки статистики')
			}
			return response.json()
		})
		.then(stats => {
			displayStats(stats)
		})
		.catch(error => {
			console.error('Ошибка:', error)
			showToast('Ошибка при загрузке статистики', 'error')
		})
}

function displayStats(stats) {
	// Обновляем данные о пользователях
	document.getElementById('totalUsers').textContent = formatNumber(
		stats.users.total
	)

	const usersChangeText =
		stats.users.change > 0
			? `+${stats.users.change} за последнюю неделю`
			: `${stats.users.change} за последнюю неделю`
	document.getElementById('usersChange').textContent = usersChangeText

	// Обновляем данные о прочитанных страницах
	document.getElementById('totalPages').textContent = formatNumber(
		stats.pages.total
	)
	document.getElementById(
		'pagesAverage'
	).textContent = `В среднем ${stats.pages.average} страниц на пользователя`

	// Обновляем данные о выполненных шагах
	document.getElementById('totalSteps').textContent = formatNumber(
		stats.steps.total
	)
	document.getElementById(
		'stepsCompletion'
	).textContent = `Завершено ${stats.steps.completion}% всех начатых проектов`
}

// Вспомогательная функция для форматирования чисел
function formatNumber(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
