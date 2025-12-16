import { Router } from 'express';

// This router is a simple placeholder for non-Nest usage.
const router = Router();

router.get('/spaces', (_req, res) => res.status(501).json({ message: 'Use NestJS controller' }));
router.post('/reservations', (_req, res) => res.status(501).json({ message: 'Use NestJS controller' }));

export default router;