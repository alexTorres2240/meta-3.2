
import { Router } from 'express';

import {
    googleLogin,
    googleCallback
} from '../controllers/google.controller.js';

const router = Router();

router.get('/login', googleLogin);

router.get('/callback', googleCallback);

export default router;
