/**
 * Базовая конфигурация приложения
 * Содержит настройки подключения к серверу
 */

// Базовый URL для API
const SERVER_URL = 'https://api.learninventor.me'

// URL для API запросов
const API_URL = `${SERVER_URL}/api`

/**
 * Возвращает полный URL для API запроса
 * @param {string} endpoint - путь API без начального слэша
 * @returns {string} полный URL запроса
 */
function getApiUrl(endpoint) {
	if (endpoint.startsWith('/')) {
		endpoint = endpoint.substring(1)
	}

	return `${API_URL}/${endpoint}`
}
