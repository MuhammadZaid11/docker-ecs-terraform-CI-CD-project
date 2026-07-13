import express from 'express';
import { createTask, getTasks, updateTaskStatus, updateTask, addComment, uploadAttachment } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, createTask);
router.get('/project/:projectId', protect, getTasks);
router.patch('/:id/status', protect, updateTaskStatus);
router.put('/:id', protect, updateTask);
router.post('/:id/comments', protect, addComment);
router.post('/:id/upload', protect, upload.single('file'), uploadAttachment);

export default router;
