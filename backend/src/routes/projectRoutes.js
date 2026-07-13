import express from 'express';
import { createProject, getProjects, deleteProject } from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createProject);
router.get('/org/:orgId', protect, getProjects);
router.delete('/:id', protect, deleteProject);

export default router;
