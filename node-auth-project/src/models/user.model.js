class User {
	constructor(id, name, username, password, role) {
		this.id = id
		this.name = name
		this.username = username
		this.password = password
		this.role = role
	}

	static async createUser(db, name, username, password, role) {
		const [result] = await db.query(
			'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
			[name, username, password, role]
		)
		return new User(result.insertId, name, username, password, role)
	}

	static async findUserByUsername(db, username) {
		const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [
			username,
		])
		if (rows.length > 0) {
			const { id, name, username, password, role } = rows[0]
			return new User(id, name, username, password, role)
		}
		return null
	}

	// Новый метод для поиска пользователя по id
	static async findById(db, id) {
		const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id])
		if (rows.length > 0) {
			const { id, name, username, password, role } = rows[0]
			return new User(id, name, username, password, role)
		}
		return null
	}
}

module.exports = User
