import express from 'express';
import { 
    registerPartner, 
    partnerSignIn, 
   
} from '../controller/partner.js';

const router = express.Router();

router.post('/register', registerPartner);
router.post('/login', partnerSignIn);

export default router;
