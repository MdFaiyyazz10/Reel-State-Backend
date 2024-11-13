import jwt from 'jsonwebtoken';
import { Admin } from '../model/admin.js';

export const adminAuth = async (req, res, next) => {
    const token = req.cookies.admin_token;

    if (!token) {
        return res.status(401).json({ message: 'Authorization denied Only Admin can Access this Route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(404).json({message: 'Admin not Found'})
        }

        if (admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Only Admin can access this route' });
        }

        req.admin = admin;
        next();
    } catch (err) {
        console.error('Token error:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
