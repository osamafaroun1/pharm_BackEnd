import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class OrderItem extends Model {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number;
  public productName!: string;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    productName: { type: DataTypes.STRING(200), allowNull: false },
  },
  { sequelize, tableName: 'order_items', modelName: 'OrderItem' }
);

export default OrderItem;
