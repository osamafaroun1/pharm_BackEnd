import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Warehouse extends Model {
  public id!: number;
  public name!: string;
  public location!: string;
  public phone!: string;
  public isActive!: boolean;
  public description!: string | null;
  public logo!: string | null;   // base64 أو URL
}

Warehouse.init(
  {
    id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name:        { type: DataTypes.STRING(200), allowNull: false },
    location:    { type: DataTypes.STRING(300), allowNull: false },
    phone:       { type: DataTypes.STRING(20),  allowNull: false },
    isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    logo:        { type: DataTypes.TEXT('long'), allowNull: true },
  },
  { sequelize, tableName: 'warehouses', modelName: 'Warehouse' }
);

export default Warehouse;