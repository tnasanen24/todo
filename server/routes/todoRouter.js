import { pool } from '../helper/db.js'
import { auth } from '../helper/auth.js'
import { Router } from 'express'

const router = Router()

router.get('/', (req, res, next) => {
    pool.query('SELECT * FROM task', (err, result) => {
        if (err) {
            return next (err)
        }
        res.status(200).json(result.rows || [])
    })
})

router.post('/create', auth, (req, res, next) => {
    const { task } = req.body

    if (!task?.description) {
        const err = new Error('Task description is missing.')
        err.status = 400
        return next(err)
    }

    pool.query('INSERT INTO task (description) VALUES ($1) RETURNING *',
        [task.description], 
        (err, result) => {
        if (err) {
            return next(err)
        }
        res.status(201).json({id: result.rows[0].id, description: task.description})
    })
})

router.delete('/delete/:id', auth, (req, res, next) => {
    const { id } = req.params
    console.log(`Deleting task with id: ${id}`)
    pool.query('DELETE FROM task WHERE id = $1',
        [id],
        (err, result) => {
        if (err) {
            return next(err)
        }
        if (result.rowCount === 0) {
            const err = new Error('Task not found')
            err.status = 404
            return next(err)
        }
    return res.status(200).json({id:id})
    })
})

export default router
