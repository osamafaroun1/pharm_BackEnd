import { Request, Response } from 'express';
import Announcement from '../models/Announcement';

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const where: any = {};
        if (req.query.active === 'true') where.isActive = true;
        const items = await Announcement.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']] });
        return res.json(items);
    } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const item = await Announcement.create(req.body);
        return res.status(201).json(item);
    } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
    try {
        const item = await Announcement.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'الإعلان غير موجود' });
        await item.update(req.body);
        return res.json(item);
    } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const item = await Announcement.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'الإعلان غير موجود' });
        await item.destroy();
        return res.json({ message: 'تم الحذف' });
    } catch (e: any) { return res.status(500).json({ message: e.message }); }
};