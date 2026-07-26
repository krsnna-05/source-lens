import { Router } from 'express';
import * as repositoryController from '../controllers/repository.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/github', repositoryController.listGithubRepos);
router.get('/github/lookup', repositoryController.lookupGithubRepo);
router.post('/', repositoryController.addRepository);
router.get('/', repositoryController.listRepositories);
router.delete('/:id', repositoryController.removeRepository);

export default router;
