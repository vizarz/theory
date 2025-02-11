const links = document.querySelectorAll('.nav-link')
const sections = document.querySelectorAll('div[id]')

function updateActiveLink() {
	let index = sections.length

	while (--index && window.scrollY + 100 < sections[index].offsetTop) {}

	links.forEach(link => link.classList.remove('active'))
	links[index]?.classList.add('active')
}

links.forEach(link => {
	link.addEventListener('click', event => {
		event.preventDefault()
		const target = document.querySelector(link.getAttribute('href'))
		window.scrollTo({ top: target.offsetTop - 20, behavior: 'smooth' })
	})
})

window.addEventListener('scroll', updateActiveLink)
