import express from 'express';
import { body } from 'express-validator';
import { respondToRequest, getMyAlerts } from '../controllers/responseController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

const responseValidation = [
  body('status').isIn(['interested', 'declined']).withMessage("Status must be either 'interested' or 'declined'"),
  body('message').optional().trim().isLength({ max: 250 }).withMessage('Message cannot exceed 250 characters'),
  validateRequest,
];

router.post('/:requestId', authenticate, responseValidation, respondToRequest);
router.get('/my-alerts', authenticate, getMyAlerts);

export default router;
