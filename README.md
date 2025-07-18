# Электронное учебное пособие по MIT App Inventor

## Установка и запуск проекта локально (для разработчиков)

### Системные требования

- **Node.js** (версия 14.x или выше)
- **MySQL** (версия 5.7 или выше)
- **Браузер** (Chrome, Firefox, Edge)

### Шаг 1: Распаковка архива

Откройте архив `mit_theory.zip` и распакуйте его в любую удобную папку на вашем компьютере.

Откройте командную строку(cmd) и перейдите в распакованную папку:

```bash
cd путь/до/распакованной_папки
```

### Шаг 2: Установка зависимостей

```bash
npm install
```

### Шаг 3: Настройка базы данных

1. **Создайте базу данных MySQL:**
   ```sql
   CREATE DATABASE mit_app_inventor;
   ```
2. **Импортируйте структуру базы данных:**
   ```bash
   mysql -u root -p mit_app_inventor < database/database.sql
   ```
3. **Откройте файл конфигурации `.env` в корневой директории проекта(node-auth-project/.env):**
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=ваш_пароль
   DB_NAME=mit_app_inventor
   PORT=3000
   SESSION_SECRET=ваш_секретный_ключ
   ```

### Шаг 4: Запуск сервера

```bash
node src/app.js
```

### Шаг 5: Доступ к сайту

После запуска сервера откройте браузер и перейдите по адресу:

```
http://localhost:3000
```

---

## Руководство пользователя

### Как начать работу с учебным пособием

#### Доступ к сайту

1. Откройте браузер (рекомендуется Chrome, Firefox или Edge)
2. Перейдите по адресу `http://learninventor.me/theory/www/index.html` или `http://localhost:3000` при локальном запуске
3. Зарегистрируйтесь или войдите в систему, используя предоставленные данные для входа

#### Структура учебного пособия

- **Введение**: начните с раздела введения, чтобы ознакомиться с MIT App Inventor
- **Режим "Дизайнер"**: изучите создание визуального интерфейса приложения
- **Режим "Блоки"**: узнайте о программировании логики приложения
- **Компоненты**: подробная документация по всем компонентам MIT App Inventor
- **Проекты**: пошаговые руководства по созданию различных приложений

#### Отслеживание прогресса

- После прочтения страницы нажмите кнопку "Прочитать" для сохранения прогресса
- В проектах отмечайте выполненные шаги кнопкой "Пометить как выполнено"
- Ваш прогресс сохраняется автоматически и будет доступен при следующем входе

#### Практические проекты

- Выберите проект из списка доступных (начните с простых, например "Привет, мир!")
- Следуйте пошаговым инструкциям для создания приложения
- Скачивайте необходимые ресурсы из центра загрузок
- Используйте подсказки и советы, если столкнетесь с трудностями

#### Устранение неполадок

- Если у вас возникли проблемы с MIT App Inventor, обратитесь к разделу "Устранение неполадок"
- Для проблем с самим учебным пособием обратитесь к администратору

---

## Полезные ссылки

- [Официальный сайт MIT App Inventor](https://appinventor.mit.edu/)
- [Центр загрузок — ресурсы и материалы для проектов](http://learninventor.me/theory/www/mit_downloads.html)
- [Форум сообщества MIT App Inventor](https://community.appinventor.mit.edu/)

---

© 2025 Электронное учебное пособие по MIT App Inventor. Все права защищены.
