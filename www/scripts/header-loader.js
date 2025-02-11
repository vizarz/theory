fetch('header.html')
	.then(response => response.text())
	.then(data => {
		document.getElementById('header').innerHTML = data
	})
	.catch(error => console.error('Ошибка загрузки header:', error))
