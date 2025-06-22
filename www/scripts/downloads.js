// Функции для центра загрузок

// Данные о файлах для загрузки
const downloadFiles = {
	'hello-world': {
		name: 'HelloWorld.aia',
		url: 'downloads/projects/HelloWorld.aia',
		size: '2 KB',
	},
	'speaking-app': {
		name: 'SpeakingApp.aia',
		url: 'downloads/projects/SpeakingApp.aia',
		size: '2 KB',
	},
	'bouncing-ball': {
		name: 'BouncingBall.aia',
		url: 'downloads/projects/BouncingBall.aia',
		size: '2 KB',
	},
	'music-player': {
		name: 'MusicPlayer.aia',
		url: 'downloads/projects/MusicPlayer.aia',
		size: '2 KB',
	},
	'digital-artist': {
		name: 'DigitalArtist.aia',
		url: 'downloads/projects/DigitalArtist.aia',
		size: '2 KB',
	},
	'magic-ball': {
		name: 'MagicBall.aia',
		url: 'downloads/projects/MagicBall.aia',
		size: '2 KB',
	},

	'icons-pack': {
		name: 'icons-pack.zip',
		url: 'downloads/resources/icons-pack.zip',
		size: '5.8 MB',
	},
	'sounds-pack': {
		name: 'sounds-pack.zip',
		url: 'downloads/projects/sounds-pack.zip',
		size: '1.5 MB',
	},
	'maze-resources': {
		name: 'maze-resources.zip',
		url: 'downloads/projects/maze-resources.zip',
		size: '1.5 MB',
	},
	'maze-adventure': {
		name: 'maze-adventure.zip',
		url: 'downloads/projects/maze-adventure.aia',
		size: '1.5 MB',
	},
	'kitten-resources': {
		name: 'kitten-resources.zip',
		url: 'downloads/projects/kitten-resources.zip',
		size: '1.5 MB',
	},
	'blocks-cheatsheet': {
		name: 'MIT-App-Inventor-Blocks-Cheatsheet.pdf',
		url: 'downloads/resources/MIT-App-Inventor-Blocks-Cheatsheet.pdf',
		size: '2.1 MB',
	},
}

// Информация о файлах для модального окна
const fileInfo = {
	'windows-info': {
		title: 'MIT App Inventor для Windows',
		content: `
            <div class="info-content">
                <h4>Системные требования:</h4>
                <ul>
                    <li>Windows 10 или новее</li>
                    <li>4 GB оперативной памяти</li>
                    <li>1 GB свободного места</li>
                    <li>Подключение к интернету для синхронизации</li>
                </ul>
                <h4>Особенности:</h4>
                <ul>
                    <li>Автономная работа без браузера</li>
                    <li>Быстрая загрузка проектов</li>
                    <li>Поддержка всех компонентов</li>
                    <li>Автоматические обновления</li>
                </ul>
            </div>
        `,
	},
	'mac-info': {
		title: 'MIT App Inventor для macOS',
		content: `
            <div class="info-content">
                <h4>Системные требования:</h4>
                <ul>
                    <li>macOS 10.10 или новее</li>
                    <li>4 GB оперативной памяти</li>
                    <li>1 GB свободного места</li>
                    <li>Подключение к интернету для синхронизации</li>
                </ul>
                <h4>Особенности:</h4>
                <ul>
                    <li>Нативное приложение для macOS</li>
                    <li>Оптимизировано для Apple Silicon</li>
                    <li>Поддержка Touch Bar</li>
                    <li>Интеграция с системой</li>
                </ul>
            </div>
        `,
	},
	'icons-info': {
		title: 'Набор иконок для приложений',
		content: `
            <div class="info-content">
                <h4>Содержимое пакета:</h4>
                <ul>
                    <li>250+ векторных иконок</li>
                    <li>Форматы: PNG, SVG, ICO</li>
                    <li>Размеры: 16x16, 32x32, 64x64, 128x128</li>
                    <li>Категории: UI, навигация, медиа, социальные сети</li>
                </ul>
                <div class="preview-grid">
                    <div class="icon-preview">📱</div>
                    <div class="icon-preview">🏠</div>
                    <div class="icon-preview">⚙️</div>
                    <div class="icon-preview">🔍</div>
                </div>
            </div>
        `,
	},
}

// Функция загрузки проекта
function downloadProject(projectId) {
	const file = downloadFiles[projectId]
	if (!file) {
		showToast('Файл не найден', 'error')
		return
	}

	// Создаем ссылку для загрузки
	const link = document.createElement('a')
	link.href = file.url
	link.download = file.name
	link.style.display = 'none'

	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)

	// Показываем уведомление
	showToast(`Загрузка ${file.name} начата`, 'success')
}

// Функция загрузки ресурса
function downloadResource(resourceId) {
	const file = downloadFiles[resourceId]
	if (!file) {
		showToast('Файл не найден', 'error')
		return
	}

	// Создаем ссылку для загрузки
	const link = document.createElement('a')
	link.href = file.url
	link.download = file.name
	link.style.display = 'none'

	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)

	showToast(`Загрузка ${file.name} начата`, 'success')
}

// Функция показа информации в модальном окне
function showInfo(infoId) {
	const info = fileInfo[infoId]
	if (!info) {
		showToast('Информация не найдена', 'error')
		return
	}

	document.getElementById('modalTitle').textContent = info.title
	document.getElementById('modalContent').innerHTML = info.content
	document.getElementById('infoModal').style.display = 'block'
}

// Функция закрытия модального окна
function closeModal() {
	document.getElementById('infoModal').style.display = 'none'
}

// Функция предварительного просмотра PDF
function previewPDF(resourceId) {
	const file = downloadFiles[resourceId]
	if (!file) {
		showToast('Файл не найден', 'error')
		return
	}

	// Открываем PDF в новой вкладке
	window.open(file.url, '_blank')
}

// Обработчик клика вне модального окна
window.onclick = function (event) {
	const modal = document.getElementById('infoModal')
	if (event.target === modal) {
		closeModal()
	}
}

// Убираем анимацию счетчиков - она больше не нужна
document.addEventListener('DOMContentLoaded', function () {
	console.log('Страница центра загрузок загружена')
})
