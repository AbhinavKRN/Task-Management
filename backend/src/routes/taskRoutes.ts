import express from 'express';
import { protect } from '../middleware/auth';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} from '../controllers/taskController';

const router = express.Router();

router.use(protect);

router.post('/', (req, res) => createTask(req, res));
router.get('/', (req, res) => getTasks(req, res));
router.put('/:id', (req, res) => updateTask(req, res));
router.delete('/:id', (req, res) => deleteTask(req, res));

export default router;