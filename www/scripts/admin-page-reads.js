document.addEventListener('DOMContentLoaded', function () {
	const chooseUserBtn = document.getElementById('chooseUserBtnExternalPR')
	if (chooseUserBtn) {
		chooseUserBtn.addEventListener('click', () => {
			console.log('Кнопка chooseUserBtnExternalPR нажата')
			openUserModal(function (selectedUsername) {
				console.log('openUserModal callback вызвана с:', selectedUsername)
				document.getElementById('userSelectReads').value = selectedUsername
				let option = document.querySelector(
					"#userList option[value='" + selectedUsername + "']"
				)
				let displayText = option ? option.textContent : selectedUsername
				document.getElementById('selectedUserLabelPR').textContent =
					'Выбран пользователь: ' + displayText
				showToast(`Выбран пользователь: ${displayText}`, 'success')
			})
		})
	} else {
		console.log('Элемент chooseUserBtnExternalPR не найден')
	}
	document
		.getElementById('loadPageReadsBtn')
		.addEventListener('click', function (e) {
			e.preventDefault()
			const username = document.getElementById('userSelectReads').value
			if (!username) {
				showToast('Выберите пользователя', 'error')
				return
			}
			fetch(
				`http://localhost:3000/api/admin/page-reads?username=${encodeURIComponent(
					username
				)}`,
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			)
				.then(response => response.json())
				.then(pageReads => {
					const tableContainer = document.getElementById(
						'pageReadsTableContainer'
					)
					let tableHtml =
						'<table class="admin-table"><thead><tr><th>Страница</th><th>Время</th></tr></thead><tbody>'
					pageReads.forEach(item => {
						const dt = new Date(item.timestamp)
						dt.setHours(dt.getHours() + 3)
						const dateStr = dt.toLocaleDateString('ru-RU', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
						})
						const timeStr = dt.toLocaleTimeString('ru-RU', {
							hour: '2-digit',
							minute: '2-digit',
							hour12: false,
						})
						const displayTitle =
							item.rus_title && item.rus_title.trim() !== ''
								? item.rus_title
								: item.page
						tableHtml += `<tr><td>${displayTitle}</td><td>${dateStr} в ${timeStr}</td></tr>`
					})
					tableHtml += '</tbody></table>'
					tableContainer.innerHTML = tableHtml
				})
				.catch(error => {
					showToast('Ошибка загрузки логов: ' + error.message, 'error')
				})
		})
})
