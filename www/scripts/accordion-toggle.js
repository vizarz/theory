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
