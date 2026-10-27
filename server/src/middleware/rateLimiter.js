import rateLimit from 'express-rate-limit';

// Standard rate limiter for public auth endpoints (15 min window, 100 requests)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for sensitive creation endpoints
export const createActionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Rate limit exceeded. Please wait a moment before creating more requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
