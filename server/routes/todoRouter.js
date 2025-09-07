import { pool } from '../helper/db.js'
import { auth } from '../helper/auth.js'
import { Router } from 'express'
import { getTasks, postTask, deleteTask } from '../controllers/TaskController.js'

const router = Router()

const insertTask = async (description) => {
    return await pool.query('insert into task (description) values ($1) returning *', [description])
}

const removeTask = async (id) => {
    return await pool.query(
        'DELETE FROM task WHERE id = $1 returning *',
        [id]
    )
}

router.get("/", getTasks)
router.post('/create', auth, postTask)
router.delete('/delete/:id', auth, deleteTask)

export { insertTask, removeTask }
export default router
