import express from 'express';
import { body } from 'express-validator';
import {
  getAdminMetrics,
  getRequestsForReview,
  reviewRequest,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

// Strict authorization: reviewers and admins only
router.use(authenticate, authorize('reviewer', 'admin'));

const reviewValidation = [
  body('action').isIn(['approved', 'rejected', 'flagged']).withMessage("Action must be 'approved', 'rejected', or 'flagged'"),
  body('decisionReason').trim().isLength({ min: 5, max: 500 }).withMessage('Decision reason must be between 5 and 500 characters'),
  validateRequest,
];

router.get('/metrics', getAdminMetrics);
router.get('/requests', getRequestsForReview);
router.post('/requests/:id/review', reviewValidation, reviewRequest);
router.get('/audit-logs', getAuditLogs);

export default router;
