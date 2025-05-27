class Action {
    constructor(db) {
        this.db = db;
    }

    async recordAction(userId, actionType, details) {
        const query = 'INSERT INTO actions (user_id, action_type, details, created_at) VALUES (?, ?, ?, NOW())';
        const values = [userId, actionType, details];
        return new Promise((resolve, reject) => {
            this.db.query(query, values, (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    }

    async getUserActions(userId) {
        const query = 'SELECT * FROM actions WHERE user_id = ? ORDER BY created_at DESC';
        return new Promise((resolve, reject) => {
            this.db.query(query, [userId], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    }
}

module.exports = Action;