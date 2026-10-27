import express from 'express';
import { body } from 'express-validator';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  cancelRequest,
  fulfillRequest,
} from '../controllers/requestController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createActionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const requestValidation = [
  body('patientName').trim().notEmpty().withMessage('Patient initials/name is required'),
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required'),
  body('unitsRequired').isInt({ min: 1, max: 20 }).withMessage('Units required must be between 1 and 20'),
  body('hospitalName').trim().notEmpty().withMessage('Hospital name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('contactPhone').trim().notEmpty().withMessage('Emergency contact phone is required'),
  validateRequest,
];

// Optional auth helper to attach user if token present without failing if absent
const optionalAuthenticate = async (req, res, next) => {
  if (req.headers.authorization || (req.cookies && req.cookies.token)) {
    return authenticate(req, res, next);
  }
  next();
};

router.post('/', authenticate, createActionLimiter, requestValidation, createRequest);
router.get('/my', authenticate, getMyRequests);
router.get('/', getAllRequests);
router.get('/:id', optionalAuthenticate, getRequestById);
router.patch('/:id/cancel', authenticate, cancelRequest);
router.patch('/:id/fulfill', authenticate, fulfillRequest);

export default router;
