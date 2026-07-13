import express from 'express';
import { createOrganization, getOrganizations, inviteMember } from '../controllers/organizationController.js';
import { protect } from '../middleware/auth.js'; // roleCheck could also be applied directly if we only want admin role system-wide, but since org roles are inside org document, we check inside controller.

const router = express.Router();

router.route('/')
  .post(protect, createOrganization)
  .get(protect, getOrganizations);

router.post('/:id/invite', protect, inviteMember);

export default router;
