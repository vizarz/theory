document.addEventListener('DOMContentLoaded', function () {
	const token = localStorage.getItem('token')
	const page = window.location.pathname.split('/').pop().replace('.html', '')
	const project = document.querySelector('h1').innerText.trim()

	document.querySelectorAll('.accordion-item').forEach(item => {
		const stepId = item.id
		const stepTitle = item.querySelector('.accordion-header').innerText.trim()
		const btn = document.getElementById('btn-' + stepId)

		// Проверяем статус шага, используя getApiUrl вместо хардкод URL
		fetch(
			`${getApiUrl(
				'mark-read/step-status'
			)}?page=${page}&step=${stepId}&stepTitle=${encodeURIComponent(
				stepTitle
			)}&project=${encodeURIComponent(project)}`,
			{ headers: { Authorization: `Bearer ${token}` } }
		)
			.then(res => res.json())
			.then(data => {
				if (data.completed) {
					item.classList.add('completed')
					if (btn) {
						btn.disabled = true
						btn.innerText = 'Уже выполнено'
					}
				} else if (btn) {
					btn.disabled = false
					btn.innerText = 'Пометить как выполнено'
					btn.onclick = function () {
						btn.disabled = true
						markCompleted(stepId, stepTitle, btn, item)
					}
				}
			})
	})
})

function markCompleted(stepId, stepTitle, btn, item) {
	const token = localStorage.getItem('token')
	const project = document.querySelector('h1').innerText.trim()
	const page = window.location.pathname.split('/').pop().replace('.html', '')
	const now = new Date()
	const timestamp = now.toISOString().substring(0, 19).replace('T', ' ')

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
		.then(response => response.json())
		.then(result => {
			if (result.read) {
				if (btn) {
					btn.disabled = true
					btn.innerText = 'Уже выполнено'
				}
				if (item) {
					item.classList.add('completed')
					const content = item.querySelector('.accordion-content')
					if (content) {
						content.classList.remove('open')
						content.style.maxHeight = null
					}
				}
			}
		})
}
