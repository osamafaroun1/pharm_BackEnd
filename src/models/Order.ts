import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

class Order extends Model {
  public id!: number;
  public orderNumber!: string;
  public pharmacistId!: number;
  public warehouseId!: number;
  public status!: OrderStatus;
  public totalAmount!: number;
  public notes!: string | null;
  public offerNote!: string | null;  // ← العروض المستحقة
  public adminId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    pharmacistId: { type: DataTypes.INTEGER, allowNull: false },
    warehouseId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM(...Object.values(OrderStatus)), defaultValue: OrderStatus.PENDING },
    totalAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    notes:     { type: DataTypes.TEXT, allowNull: true },
    offerNote: { type: DataTypes.TEXT, allowNull: true },
    adminId:   { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'orders', modelName: 'Order' }
);

export default Order;