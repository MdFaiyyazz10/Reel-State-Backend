import express from 'express';
import {  signIn, registerAgent, updateAgent } from '../controller/user.js';
import {upload} from '../middleware/multer.js'

const router = express.Router();

router.post('/register', registerAgent);
router.post('/login', signIn);
router.put('/update/:id' , upload, updateAgent);

export default router;

