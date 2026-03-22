import User from './User';
import Warehouse from './Warehouse';
import Category from './Category';
import Product from './Product';
import Order from './Order';
import OrderItem from './OrderItem';
import DailyIncome from './DailyIncome';
import Announcement from './Announcement';

// Associations
Warehouse.hasMany(Category, { foreignKey: 'warehouseId', as: 'categories' });
Category.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

Warehouse.hasMany(Product, { foreignKey: 'warehouseId', as: 'products' });
Product.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Order, { foreignKey: 'pharmacistId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'pharmacistId', as: 'pharmacist' });

Order.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });
Order.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export { User, Warehouse, Category, Product, Order, OrderItem, DailyIncome, Announcement, Favorite };
import Favorite   from './Favorite';

Favorite.belongsTo(Product,  { foreignKey: 'productId', as: 'product' });
Favorite.belongsTo(User,     { foreignKey: 'userId',    as: 'user' });
