import { pool } from '../helper/db.js'

const selectAllTasks = async () => {
    return await pool.query('SELECT * FROM task')
}
export { selectAllTasks }
