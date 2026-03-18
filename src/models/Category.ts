import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Category extends Model {
  public id!: number;
  public name!: string;
  public warehouseId!: number;
  public description!: string | null;
  public isActive!: boolean;
}

Category.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    warehouseId: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, tableName: 'categories', modelName: 'Category' }
);

export default Category;
