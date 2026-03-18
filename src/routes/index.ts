import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as warehouse from '../controllers/warehouseController';
import * as product from '../controllers/productController';
import * as order from '../controllers/orderController';
import * as notif from '../controllers/notificationController';
import * as owner from '../controllers/ownerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/profile', authenticate, auth.getProfile);
router.put('/auth/profile', authenticate, auth.updateProfile);

// Warehouses
router.get('/warehouses', authenticate, warehouse.getWarehouses);
router.get('/warehouses/:id', authenticate, warehouse.getWarehouse);
router.post('/warehouses', authenticate, authorize('admin','owner'), warehouse.createWarehouse);
router.put('/warehouses/:id', authenticate, authorize('admin','owner'), warehouse.updateWarehouse);
router.delete('/warehouses/:id', authenticate, authorize('admin','owner'), warehouse.deleteWarehouse);

// Categories
router.get('/categories', authenticate, warehouse.getCategories);
router.post('/categories', authenticate, authorize('admin','owner'), warehouse.createCategory);
router.put('/categories/:id', authenticate, authorize('admin','owner'), warehouse.updateCategory);
router.delete('/categories/:id', authenticate, authorize('admin','owner'), warehouse.deleteCategory);

// Products
import * as announcement from '../controllers/announcementController';
import * as features    from '../controllers/featuresController';
router.get('/announcements',     authenticate, announcement.getAnnouncements);
router.post('/announcements',    authenticate, authorize('admin','owner'), announcement.createAnnouncement);
router.put('/announcements/:id', authenticate, authorize('admin','owner'), announcement.updateAnnouncement);
router.delete('/announcements/:id', authenticate, authorize('admin','owner'), announcement.deleteAnnouncement);

router.get('/products/barcode/:barcode', authenticate, product.getProductByBarcode);
router.get('/products', authenticate, product.getProducts);
router.get('/products/:id', authenticate, product.getProduct);
router.post('/products', authenticate, authorize('admin','owner'), product.createProduct);
router.put('/products/:id', authenticate, authorize('admin','owner'), product.updateProduct);
router.delete('/products/:id', authenticate, authorize('admin','owner'), product.deleteProduct);

// Orders
router.post('/orders', authenticate, authorize('pharmacist'), order.createOrder);
router.get('/orders', authenticate, order.getOrders);
router.put('/orders/:id/status', authenticate, authorize('admin','owner'), order.updateOrderStatus);

// Notifications
router.get('/notifications', authenticate, notif.getNotifications);
router.put('/notifications/read', authenticate, notif.markAsRead);
router.get('/notifications/unread-count', authenticate, notif.getUnreadCount);

// Owner
router.get('/owner/admins', authenticate, authorize('owner'), owner.getAdmins);
router.post('/owner/admins', authenticate, authorize('owner'), owner.createAdmin);
router.put('/owner/admins/:id', authenticate, authorize('owner'), owner.updateAdmin);
router.delete('/owner/admins/:id', authenticate, authorize('owner'), owner.deleteAdmin);
router.get('/owner/incomes', authenticate, authorize('owner'), owner.getDailyIncomes);
router.post('/owner/incomes', authenticate, authorize('owner'), owner.addDailyIncome);
router.get('/owner/stats', authenticate, authorize('owner','admin'), owner.getDashboardStats);

// Favorites
router.get('/favorites',                    authenticate, features.getFavorites);
router.get('/favorites/ids',                authenticate, features.getFavoriteIds);
router.post('/favorites/:productId',        authenticate, features.addFavorite);
router.delete('/favorites/:productId',      authenticate, features.removeFavorite);

// Stock Alerts
router.get('/stock-alerts',                 authenticate, features.getMyAlerts);
router.post('/stock-alerts/:productId',     authenticate, features.addStockAlert);
router.delete('/stock-alerts/:productId',   authenticate, features.removeStockAlert);

// Stats
router.get('/my-stats',                     authenticate, features.getMyStats);

export default router;