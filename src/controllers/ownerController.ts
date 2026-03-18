import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, DailyIncome, Order } from '../models/index';
import { UserRole } from '../models/User';
import { Op } from 'sequelize';
import sequelize from '../config/database';

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await User.findAll({ where: { role: UserRole.ADMIN }, attributes: { exclude: ['password'] } });
    return res.json(admins);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, username, password } = req.body;
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(400).json({ message: 'اسم المستخدم مستخدم مسبقاً' });
    const hashed = await bcrypt.hash(password, 12);
    const admin = await User.create({ firstName, lastName, phone, username, password: hashed, role: UserRole.ADMIN });
    return res.status(201).json({ ...admin.toJSON(), password: undefined });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await User.findByPk(req.params.id);
    if (!admin || admin.role !== UserRole.ADMIN) return res.status(404).json({ message: 'الأدمن غير موجود' });
    const updates = { ...req.body };
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 12);
    await admin.update(updates);
    return res.json({ ...admin.toJSON(), password: undefined });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await User.findByPk(req.params.id);
    if (!admin || admin.role !== UserRole.ADMIN) return res.status(404).json({ message: 'الأدمن غير موجود' });
    await admin.update({ isActive: false });
    return res.json({ message: 'تم الحذف' });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const addDailyIncome = async (req: any, res: Response) => {
  try {
    const income = await DailyIncome.create({ ...req.body, addedBy: req.user.id });
    return res.status(201).json(income);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const getDailyIncomes = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const where: any = {};
    if (from && to) where.date = { [Op.between]: [from, to] };
    const incomes = await DailyIncome.findAll({ where, order: [['date', 'DESC']] });
    return res.json(incomes);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { OrderStatus } = require('../models/Order');
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: OrderStatus.PENDING } });
    const deliveredOrders = await Order.count({ where: { status: OrderStatus.DELIVERED } });
    const totalPharmacists = await User.count({ where: { role: UserRole.PHARMACIST, isActive: true } });
    
    const today = new Date().toISOString().split('T')[0];
    const todayIncome = await DailyIncome.findAll({ where: { date: today } });
    const totalTodayIncome = todayIncome.reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0);

    return res.json({ totalOrders, pendingOrders, deliveredOrders, totalPharmacists, totalTodayIncome });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};
