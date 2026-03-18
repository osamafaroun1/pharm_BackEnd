import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Notification extends Model {
  public id!: number;
  public userId!: number;
  public title!: string;
  public message!: string;
  public type!: string;
  public isRead!: boolean;
  public relatedId!: number | null;
  public readonly createdAt!: Date;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING(50), defaultValue: 'order' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    relatedId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'notifications', modelName: 'Notification' }
);

export default Notification;
