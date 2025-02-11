const sections = document.querySelectorAll('.section')
const navLinks = document.querySelectorAll('.tabs__menu-button')
function updateActiveLink() {
	let index = sections.length

	while (--index && window.scrollY - 500 < sections[index].offsetTop) {}

	navLinks.forEach(link => link.classList.remove('active'))
	navLinks[index].classList.add('active')
}
window.addEventListener('scroll', updateActiveLink)
tabs.forEach(tab => {
	tab.addEventListener('click', function () {
		tabs.forEach(t => t.classList.remove('active'))
		this.classList.add('active')
	})
})
