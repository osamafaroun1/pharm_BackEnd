import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class StockAlert extends Model {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public notified!: boolean;
}

StockAlert.init({
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  notified:  { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'stock_alerts', modelName: 'StockAlert' });

export default StockAlert;