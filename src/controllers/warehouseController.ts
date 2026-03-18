import { Request, Response } from 'express';
import { Warehouse, Category, Product } from '../models/index';

export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const where: any = {};
    if (req.query.active === 'true') where.isActive = true;
    const warehouses = await Warehouse.findAll({ where, include: [{ model: Category, as: 'categories', where: { isActive: true }, required: false }] });
    return res.json(warehouses);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const getWarehouse = async (req: Request, res: Response) => {
  try {
    const w = await Warehouse.findByPk(req.params.id, { include: [{ model: Category, as: 'categories' }] });
    if (!w) return res.status(404).json({ message: 'المستودع غير موجود' });
    return res.json(w);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const w = await Warehouse.create(req.body);
    return res.status(201).json(w);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const w = await Warehouse.findByPk(req.params.id);
    if (!w) return res.status(404).json({ message: 'المستودع غير موجود' });
    await w.update(req.body);
    return res.json(w);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const w = await Warehouse.findByPk(req.params.id);
    if (!w) return res.status(404).json({ message: 'المستودع غير موجود' });
    await w.update({ isActive: false });
    return res.json({ message: 'تم حذف المستودع' });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const where: any = {};
    if (req.query.warehouseId) where.warehouseId = req.query.warehouseId;
    if (req.query.active === 'true') where.isActive = true;
    const cats = await Category.findAll({ where, include: [{ model: Warehouse, as: 'warehouse' }] });
    return res.json(cats);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const c = await Category.create(req.body);
    return res.status(201).json(c);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const c = await Category.findByPk(req.params.id);
    if (!c) return res.status(404).json({ message: 'التصنيف غير موجود' });
    await c.update(req.body);
    return res.json(c);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const c = await Category.findByPk(req.params.id);
    if (!c) return res.status(404).json({ message: 'التصنيف غير موجود' });
    await c.destroy();
    return res.json({ message: 'تم الحذف' });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};
