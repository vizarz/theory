let currentStep = 1
const completedSteps = {}
const stepsData = {} // Новый объект для хранения данных о шагах

// Показать выбранный шаг
function showStep(stepNumber) {
	// Скрываем все шаги
	document.querySelectorAll('.step-content').forEach(content => {
		content.classList.remove('active')
	})

	// Показываем выбранный шаг
	document.getElementById(`step-content-${stepNumber}`).classList.add('active')

	// Обновляем активный кружок
	document.querySelectorAll('.step-item').forEach(item => {
		item.classList.remove('active')
	})
	document
		.querySelector(`.step-item[data-step="${stepNumber}"]`)
		.classList.add('active')

	// Запоминаем текущий шаг
	currentStep = stepNumber

	// Прокрутка к заголовку шага с небольшой задержкой
	setTimeout(() => {
		const header = document.querySelector(`#step-content-${stepNumber} h2`)
		if (header) {
			const offsetPosition =
				header.getBoundingClientRect().top + window.pageYOffset - 80
			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth',
			})
		}
	}, 100)
}

// Получить общее количество шагов на странице
function getTotalSteps() {
	return document.querySelectorAll('.step-item').length
}

// Получение полного названия шага из заголовка h2
function getFullStepTitle(stepNumber) {
	const stepContent = document.getElementById(`step-content-${stepNumber}`)
	if (stepContent) {
		const header = stepContent.querySelector('h2')
		if (header) {
			// Берем полный текст заголовка
			return header.textContent.trim()
		}
	}
	return `Шаг ${stepNumber}`
}

// Инициализация данных о шагах при загрузке страницы
function initStepsData() {
	const totalSteps = getTotalSteps()

	for (let i = 1; i <= totalSteps; i++) {
		// Получаем полное название шага из заголовка
		const fullTitle = getFullStepTitle(i)

		// Сохраняем в объект stepsData
		stepsData[i] = {
			fullTitle: fullTitle,
			// Извлекаем часть после "Шаг N: " если есть
			title: fullTitle.replace(/^Шаг \d+: /, ''),
		}

		console.log(
			`Шаг ${i}: "${stepsData[i].title}" (полный: "${stepsData[i].fullTitle}")`
		)
	}
}

// Отметить шаг как выполненный
function markRead(stepId, providedStepTitle) {
	const token = localStorage.getItem('token')

	// Проверка на вход в аккаунт
	if (!token) {
		showToast('Для отметки прогресса необходимо войти в аккаунт', 'error')
		setTimeout(() => {
			window.location.href = 'login.html'
		}, 2000)
		return
	}

	const project = document.querySelector('h1').innerText.trim()
	const page = window.location.pathname.split('/').pop().replace('.html', '')
	const now = new Date()
	const timestamp = now.toISOString().substring(0, 19).replace('T', ' ')

	// Получаем номер шага из ID
	const stepNumber = parseInt(stepId.replace('step', ''))

	// Используем название шага из stepsData для согласованности
	const stepTitle = stepsData[stepNumber]
		? stepsData[stepNumber].title
		: providedStepTitle

	// Проверка на выполнение предыдущего шага (кроме шага 1)
	if (stepNumber > 1) {
		const prevStepNumber = stepNumber - 1
		if (!completedSteps[prevStepNumber]) {
			// Показываем toast, если предыдущий шаг не выполнен
			showToast('Пожалуйста, сначала выполните предыдущий шаг', 'error')
			return
		}
	}

	// Деактивируем кнопку на время запроса
	const btn = document.getElementById(`btn-${stepId}`)
	if (btn) {
		btn.disabled = true
		btn.innerText = 'Отправка...'
	}

	console.log(
		`Отправка на сервер: проект="${project}", шаг="${stepId}", название="${stepTitle}"`
	)

	fetch(getApiUrl('mark-read/step'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			project,
			step: stepId,
			stepTitle,
			timestamp,
			page,
		}),
	})
		.then(response => {
			// Проверка истечения срока действия токена
			if (response.status === 401) {
				// Токен недействителен или истек
				localStorage.removeItem('token')
				showToast('Сессия истекла. Пожалуйста, войдите снова', 'error')

				setTimeout(() => {
					window.location.href = 'login.html'
				}, 2000)

				throw new Error('Unauthorized')
			}
			return response.json()
		})
		.then(result => {
			if (result.read) {
				// Отметить шаг как выполненный в UI
				const stepItem = document.querySelector(
					`.step-item[data-step="${stepNumber}"]`
				)
				stepItem.classList.add('completed')
				completedSteps[stepNumber] = true

				// Обновляем кнопку
				if (btn) {
					btn.disabled = true
					btn.innerText = 'Выполнено ✓'
				}

				// Обновляем линию прогресса
				updateProgressLine()

				// Показываем toast об успешном выполнении
				showToast('Шаг отмечен как выполненный!', 'success')
			}
		})
		.catch(error => {
			console.error('Ошибка при отметке шага:', error)
			if (btn) {
				btn.disabled = false
				btn.innerText = 'Пометить как выполнено'
			}

			// Показываем toast с ошибкой только если это не ошибка авторизации
			if (error.message !== 'Unauthorized') {
				showToast('Ошибка при отметке шага', 'error')
			}
		})
}

// Проверить, выполнен ли шаг
function checkStepStatus(stepNumber) {
	const token = localStorage.getItem('token')
	if (!token) return

	const project = document.querySelector('h1').innerText.trim()
	const page = window.location.pathname.split('/').pop().replace('.html', '')

	// Используем название шага из stepsData для согласованности
	const stepTitle = stepsData[stepNumber]
		? stepsData[stepNumber].title
		: `Шаг ${stepNumber}`

	console.log(
		`Проверка статуса: проект="${project}", шаг="step${stepNumber}", название="${stepTitle}"`
	)

	fetch(
		`${getApiUrl(
			'mark-read/step-status'
		)}?page=${page}&step=step${stepNumber}&stepTitle=${encodeURIComponent(
			stepTitle
		)}&project=${encodeURIComponent(project)}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	)
		.then(res => res.json())
		.then(data => {
			if (data.completed) {
				// Отмечаем шаг как выполненный в UI
				const stepItem = document.querySelector(
					`.step-item[data-step="${stepNumber}"]`
				)
				stepItem.classList.add('completed')
				completedSteps[stepNumber] = true

				// Обновляем кнопку
				const button = document.getElementById(`btn-step${stepNumber}`)
				if (button) {
					button.disabled = true
					button.innerText = 'Выполнено ✓'
				}

				// Обновляем линию прогресса
				updateProgressLine()
			}
		})
		.catch(error => {
			console.error('Ошибка при проверке статуса шага:', error)
		})
}

// Обновить линию прогресса
function updateProgressLine() {
	const totalSteps = getTotalSteps()
	const completedCount = Object.keys(completedSteps).length
	const progressPercentage = (completedCount / totalSteps) * 100
	document.getElementById(
		'progress-line'
	).style.width = `${progressPercentage}%`
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
	// Инициализация данных о шагах
	initStepsData()

	// Показываем первый шаг
	showStep(currentStep)

	// Определяем общее количество шагов
	const totalSteps = getTotalSteps()

	// Проверяем статус каждого шага
	for (let i = 1; i <= totalSteps; i++) {
		checkStepStatus(i)
	}
})
