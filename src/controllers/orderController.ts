import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, Product, User, Warehouse, Notification, Announcement } from '../models/index';
import { OrderStatus } from '../models/Order';
import { UserRole } from '../models/User';
import { Op } from 'sequelize';

const generateOrderNumber = () => {
  const now = new Date();
  return `ORD-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`;
};

const sendNotificationToRole = async (role: UserRole, title: string, message: string, relatedId: number) => {
  const users = await User.findAll({ where: { role, isActive: true } });
  for (const u of users) {
    await Notification.create({ userId: u.id, title, message, relatedId });
  }
};

export const createOrder = async (req: any, res: Response) => {
  try {
    const { items, warehouseId, notes } = req.body;
    let totalAmount = 0;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      pharmacistId: req.user.id,
      warehouseId,
      status: OrderStatus.PENDING,
      notes,
      totalAmount: 0,
    });

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) continue;
      const price = parseFloat(product.price as any);
      totalAmount += price * item.quantity;
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price,
        productName: product.name,
      });
    }

    await order.update({ totalAmount });

    const pharmacist = await User.findByPk(req.user.id);

    // فحص العروض — مغلّف بـ try-catch حتى لا يوقف الطلب
    try {
      const activeOffers = await Announcement.findAll({
        where: {
          isActive: true,
          minOrderAmount: { [Op.ne]: null, [Op.lte]: totalAmount },
        },
        order: [['sortOrder', 'ASC']],
      });

      if (activeOffers.length > 0) {
        const offerNote = activeOffers.map((o: any) =>
          `🎁 ${o.title}${o.subtitle ? ' — ' + o.subtitle : ''}`
        ).join('\n');
        await order.update({ offerNote });
      }
    } catch (offerErr) {
      // تجاهل خطأ العروض — الطلب يكتمل بدونها
      console.warn('offer check skipped:', offerErr);
    }

    // نقاط: كل 1000 ل.س = نقطة
    try {
      const pointsEarned = Math.floor(totalAmount / 1000);
      if (pointsEarned > 0) {
        await User.increment('points', { by: pointsEarned, where: { id: req.user.id } });
      }
    } catch {}

    const msg = `طلب جديد من صيدلية ${pharmacist?.pharmacyName} - رقم الطلب: ${order.orderNumber}`;
    await sendNotificationToRole(UserRole.ADMIN, 'طلب جديد 🔔', msg, order.id);
    await sendNotificationToRole(UserRole.OWNER, 'طلب جديد 🔔', msg, order.id);

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }, { model: User, as: 'pharmacist' }, { model: Warehouse, as: 'warehouse' }],
    });
    return res.status(201).json(fullOrder);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const getOrders = async (req: any, res: Response) => {
  try {
    const where: any = {};
    if (req.user.role === UserRole.PHARMACIST) where.pharmacistId = req.user.id;
    if (req.query.status) where.status = req.query.status;
    
    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'pharmacist', attributes: ['id','firstName','lastName','phone','pharmacyName'] },
        { model: Warehouse, as: 'warehouse' },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.json(orders);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};

export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'pharmacist' }],
    });
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    
    await order.update({ status, adminId: req.user.id });

    const pharmacist = (order as any).pharmacist;
    let title = '', message = '';

    if (status === OrderStatus.CONFIRMED) {
      title = 'تم تأكيد طلبك ✅';
      message = `تم تأكيد الطلب رقم ${order.orderNumber}. سيتم التواصل معك قريباً.`;
    } else if (status === OrderStatus.DELIVERING) {
      title = 'طلبك في الطريق 🚚';
      message = `الطلب رقم ${order.orderNumber} جاري التوصيل إليك.`;
    } else if (status === OrderStatus.DELIVERED) {
      title = 'تم تسليم طلبك 🎉';
      message = `تم تسليم الطلب رقم ${order.orderNumber} بنجاح.`;
    }

    if (pharmacist) {
      await Notification.create({ userId: pharmacist.id, title, message, relatedId: order.id });
    }
    
    await sendNotificationToRole(UserRole.OWNER, `تحديث طلب: ${title}`, message, order.id);

    return res.json(order);
  } catch (e: any) { return res.status(500).json({ message: e.message }); }
};