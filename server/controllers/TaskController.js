import { selectAllTasks } from '../models/Task.js'
import { insertTask, removeTask } from '../routes/todoRouter.js'

const getTasks = async (req, res, next) => {
    try {
        const result = await selectAllTasks()
        return res.status(200).json(result.rows || [])
    } catch (error) {
        return next(error)
    }
}

const postTask = async (req, res, next) => {
    const { task } = req.body
    console.log("Task to create:", task)
    try {
        if (!task || !task.description || task.description.trim().length === 0) {
            return next(new ApiError('Task description is required', 400))
        }
        const result = await insertTask(task.description)
        return res.status(201).json({ id: result.rows[0].id, description: result.rows[0].description })
    } catch (error) {
        return next(error)
    }
}

const deleteTask = async (req, res, next) => {
    const { id } = req.params

    try {
        if (!id ) {
            return next(new ApiError('Id is required', 400))
        }
        const result = await removeTask(id)
        return res.status(200).json({ id: id})
    } catch (error) {
        return next(error)
    }

}

export { getTasks, postTask, deleteTask }
