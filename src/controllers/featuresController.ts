import { Response } from 'express';
import { Favorite, Product, User } from '../models/index';
import { Category, Warehouse } from '../models/index';

const productInclude = [
  { model: Category,  as: 'category'  },
  { model: Warehouse, as: 'warehouse' },
];

/* ══ FAVORITES ══ */
export const getFavorites = async (req: any, res: Response) => {
  try {
    const favs = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product', include: productInclude }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(favs.map((f: any) => f.product).filter(Boolean));
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const addFavorite = async (req: any, res: Response) => {
  try {
    await Favorite.findOrCreate({ where: { userId: req.user.id, productId: req.params.productId } });
    return res.json({ message: 'تمت الإضافة للمفضلة' });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const removeFavorite = async (req: any, res: Response) => {
  try {
    await Favorite.destroy({ where: { userId: req.user.id, productId: req.params.productId } });
    return res.json({ message: 'تمت الإزالة من المفضلة' });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const getFavoriteIds = async (req: any, res: Response) => {
  try {
    const favs = await Favorite.findAll({ where: { userId: req.user.id }, attributes: ['productId'] });
    return res.json(favs.map((f: any) => f.productId));
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};


/* ══ STATS ══ */
export const getMyStats = async (req: any, res: Response) => {
  try {
    const { Order, OrderItem } = require('../models/index');
    const { Op } = require('sequelize');

    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);

    const [allOrders, monthOrders, user] = await Promise.all([
      Order.findAll({
        where: { pharmacistId: req.user.id },
        include: [{ model: OrderItem, as: 'items' }],
      }),
      Order.findAll({
        where: { pharmacistId: req.user.id, createdAt: { [Op.gte]: startOfMonth } },
      }),
      User.findByPk(req.user.id, { attributes: ['points'] }),
    ]);

    // إجمالي المشتريات
    const totalSpent = allOrders.reduce((s: number, o: any) => s + parseFloat(o.totalAmount || 0), 0);
    const monthSpent = monthOrders.reduce((s: number, o: any) => s + parseFloat(o.totalAmount || 0), 0);

    // أكثر المنتجات طلباً
    const productCount: Record<string, { name: string; count: number }> = {};
    for (const order of allOrders as any[]) {
      for (const item of order.items || []) {
        if (!productCount[item.productId]) productCount[item.productId] = { name: item.productName, count: 0 };
        productCount[item.productId].count += item.quantity;
      }
    }
    const topProducts = Object.values(productCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json({
      totalOrders:   allOrders.length,
      monthOrders:   monthOrders.length,
      totalSpent,
      monthSpent,
      topProducts,
      points: (user as any)?.points || 0,
    });
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};