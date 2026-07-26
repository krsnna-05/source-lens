import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.get('/github/login', authController.githubLogin);
router.post('/github/callback', authController.githubCallback);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

export default router;
