// Аккордеонное поведение
document.querySelectorAll('.accordion-header').forEach(button => {
	button.addEventListener('click', () => {
		const content = button.nextElementSibling
		content.classList.toggle('open')
		content.style.maxHeight = content.classList.contains('open')
			? content.scrollHeight + 'px'
			: null
	})
})
// Кнопка "Пометить как выполнено" закрывает соответствующий аккордеон
function markCompleted(stepId) {
	var stepElem = document.getElementById(stepId)
	if (stepElem) {
		stepElem.classList.add('completed')
		var content = stepElem.querySelector('.accordion-header')
		if (content) content.classList.remove('open')
	}
}
