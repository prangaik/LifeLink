import express from 'express';
import { getPotentialMatches, inviteSelectedDonors } from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id/matches', authenticate, getPotentialMatches);
router.post('/:id/invite', authenticate, inviteSelectedDonors);

export default router;
