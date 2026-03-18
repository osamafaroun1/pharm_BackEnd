import { Request, Response } from 'express';
import { Notification } from '../models/index';

export const getNotifications = async (req: any, res: Response) => {
  try {
    const notifs = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    return res.json(notifs);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id } });
    return res.json({ message: 'تم التحديث' });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const getUnreadCount = async (req: any, res: Response) => {
  try {
    const count = await Notification.count({ where: { userId: req.user.id, isRead: false } });
    return res.json({ count });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};
