/**
 * Базовая конфигурация приложения
 * Содержит настройки подключения к серверу
 */

// Базовый URL для API
const SERVER_URL = 'http://localhost:3000'

// URL для API запросов
const API_URL = `${SERVER_URL}/api`

/**
 * Возвращает полный URL для API запроса
 * @param {string} endpoint - путь API без начального слеша
 * @returns {string} полный URL запроса
 */
function getApiUrl(endpoint) {
	if (endpoint.startsWith('/')) {
		endpoint = endpoint.substring(1)
	}

	return `${API_URL}/${endpoint}`
}
