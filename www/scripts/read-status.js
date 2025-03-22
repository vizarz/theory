document.addEventListener('DOMContentLoaded', function () {
	const token = localStorage.getItem('token')
	const page = window.location.pathname.split('/').pop().replace('.html', '')
	const readButton = document.getElementById('readButton')

	// Проверяем статус прочтения из базы
	fetch(`http://localhost:3000/api/mark-read?page=${page}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
		.then(response => response.json())
		.then(result => {
			if (result.read) {
				// Если страница уже прочитана, делаем кнопку неактивной
				readButton.disabled = true
				readButton.innerText = 'Уже прочитано'
			} else {
				// Если страница ещё не прочитана, добавляем обработчик клика
				readButton.addEventListener('click', function () {
					const rusTitle = document.title.trim() || 'Без заголовка'
					const now = new Date()
					const timestamp = now.toISOString().substring(0, 19).replace('T', ' ')
					const data = { page, rusTitle, timestamp }

					fetch('http://localhost:3000/api/mark-read', {
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
							return response.json()
						})
						.then(result => {
							// Если страница отмечена как прочитанная или уже прочитана
							if (result.read) {
								readButton.disabled = true
								readButton.innerText = 'Уже прочитано'
							} else {
								showToast(
									'Не удалось отметить страницу как прочитанную',
									'error'
								)
							}
						})
						.catch(error => {
							let msg = error.message
							if (msg.includes('Unauthorized')) {
								msg = 'Вы должны быть авторизованы'
							} else if (msg.includes('Страница уже прочитана')) {
								// Если сервер возвращает ошибку, но запись уже есть, просто меняем кнопку
								readButton.disabled = true
								readButton.innerText = 'Уже прочитано'
								return
							}
							showToast(msg, 'error')
						})
				})
			}
		})
		.catch(error => {
			let msg = error.message
			if (msg.includes('Unauthorized')) {
				msg = 'Вы должны быть авторизованы'
			} else if (msg.includes('Страница уже прочитана')) {
				msg = 'Страница уже прочитана'
			}
			showToast(msg, 'error')
		})
})
