import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Product, Category, Warehouse } from '../models/index';

// البحث الدقيق بالباركود
export const getProductByBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findOne({
      where: { barcode: barcode.trim() },
      include: [
        { model: Category, as: 'category' },
        { model: Warehouse, as: 'warehouse' },
      ],
    });
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    return res.json(product);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { warehouseId, categoryId, search, active, page, limit } = req.query;

    // Pagination
    const pageNum  = parseInt(page as string)  || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset   = (pageNum - 1) * limitNum;

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (categoryId)  where.categoryId  = categoryId;
    if (active === 'true') where.isActive = true;
    if (search) {
      where[Op.or] = [
        { name:           { [Op.like]: `%${search}%` } },
        { scientificName: { [Op.like]: `%${search}%` } },
        { company:        { [Op.like]: `%${search}%` } },
        { barcode:        { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id','name'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id','name','location'] },
      ],
      limit:  limitNum,
      offset,
      order:  [['name', 'ASC']],
    });

    return res.json({
      products,
      total:    count,
      page:     pageNum,
      limit:    limitNum,
      hasMore:  offset + products.length < count,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const p = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }, { model: Warehouse, as: 'warehouse' }],
    });
    if (!p) return res.status(404).json({ message: 'المنتج غير موجود' });
    return res.json(p);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const p = await Product.create(req.body);
    return res.status(201).json(p);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'المنتج غير موجود' });
    const oldStock = (p as any).stock;
    await p.update(req.body);
    // إذا عاد المخزون من 0 — أرسل إشعارات
    if (oldStock <= 0 && req.body.stock > 0) {
      const { triggerStockNotifications } = require('./featuresController');
      triggerStockNotifications(p.id);
    }
    return res.json(p);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'المنتج غير موجود' });
    await p.update({ isActive: false });
    return res.json({ message: 'تم الحذف' });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};