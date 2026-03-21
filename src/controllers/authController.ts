import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index';
import { UserRole } from '../models/User';
import { Op } from 'sequelize';

const generateToken = (user: User) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET as string,
        {
            expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']
        }
    );
};

// Fields returned in every response (no password, no internal fields)
const publicFields = (user: User) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    landline: user.landline,
    email: user.email,
    role: user.role,
    pharmacyName: user.pharmacyName,
    pharmacyLocation: user.pharmacyLocation,
    pharmacyLocationDetails: user.pharmacyLocationDetails,
    licenseImage: user.licenseImage,
    isActive: user.isActive,
});

/* ── REGISTER ── */
export const register = async (req: Request, res: Response) => {
    try {
        const {
            firstName, lastName, phone, landline, email, password,
            pharmacyName, pharmacyLocation, pharmacyLocationDetails, licenseImage,
        } = req.body;



        const existing = await User.findOne({ where: email ? { email } : { phone } });
        if (existing) return res.status(400).json({ message: 'المستخدم موجود مسبقاً' });

        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({
            firstName, lastName, phone,
            landline: landline || null,
            email: email || null,
            password: hashed,
            role: UserRole.PHARMACIST,
            pharmacyName,
            pharmacyLocation,
            pharmacyLocationDetails: pharmacyLocationDetails || null,
            licenseImage: licenseImage || null,
        });

        return res.status(201).json({ message: 'تم إنشاء الحساب بنجاح', token: generateToken(user), user: publicFields(user) });
    } catch (err: any) {
        return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    }
};

/* ── LOGIN ── */
export const login = async (req: Request, res: Response) => {
    try {
        const { identity, password, role } = req.body;

        let user: any;

        if (role === 'admin' || role === 'owner') {
            user = await User.findOne({ where: { phone: identity, role } });
        } else {
            const { Op } = require('sequelize');
            user = await User.findOne({ where: { [Op.or]: [{ phone: identity }, { email: identity }], role: UserRole.PHARMACIST } });
        }

        if (!user) return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        if (!user.isActive) return res.status(401).json({ message: 'الحساب غير نشط، تواصل مع الإدارة' });

        const ok = await bcrypt.compare(password, user.password);

        if (!ok) return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

        return res.json({ message: 'تم تسجيل الدخول بنجاح', token: generateToken(user), user: publicFields(user) });
    } catch (err: any) {
        return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    }
};

/* ── GET PROFILE ── */
export const getProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
        return res.json(user);
    } catch (err: any) {
        return res.status(500).json({ message: 'خطأ في الخادم' });
    }
};

/* ── UPDATE PROFILE ── */
export const updateProfile = async (req: any, res: Response) => {
    try {
        const {
            firstName, lastName, phone, landline, email,
            pharmacyName, pharmacyLocation, pharmacyLocationDetails,
            licenseImage, password,
        } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({
                where: {
                    phone,
                    id: { [Op.ne]: user.id }
                }
            });
            if (phoneExists) {
                return res.status(409).json({ message: 'رقم الهاتف مستخدم مسبقاً' });
            }
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({
                where: {
                    email,
                    id: { [Op.ne]: user.id }
                }
            });
            if (emailExists) {
                return res.status(409).json({ message: 'البريد الإلكتروني مستخدم مسبقاً' });
            }
        }

        if (landline && landline !== user.landline) {
            const landLineExists = await User.findOne({
                where: {
                    landline,
                    id: { [Op.ne]: user.id }
                }
            });
            if (landLineExists) {
                return res.status(409).json({ message: 'رقم الهاتف الثابت مستخدم مسبقاً' });
            }
        }

        const updates: any = {
            firstName,
            lastName,
            phone,
            landline: landline ?? user.landline,
            email: email ?? user.email,
            pharmacyName,
            pharmacyLocation,
            pharmacyLocationDetails: pharmacyLocationDetails ?? user.pharmacyLocationDetails,
        };

        if (licenseImage !== undefined) {
            updates.licenseImage = licenseImage;
        }

        if (password) {
            updates.password = await bcrypt.hash(password, 12);
        }

        await user.update(updates);
        return res.json({
            message: 'تم تحديث البيانات بنجاح',
            user: publicFields(user)
        });
    } catch (err: any) {
        console.error('Update profile error:', err);
        return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    }
};
