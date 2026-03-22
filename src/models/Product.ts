import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Product extends Model {
  public id!: number;
  public name!: string;
  public scientificName!: string | null;
  public barcode!: string | null;
  public company!: string | null;
  public categoryId!: number;
  public warehouseId!: number;
  public price!: number;
  public unit!: string;
  public description!: string | null;
  public imageUrl!: string | null;
  public isActive!: boolean;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    scientificName: { type: DataTypes.STRING(200), allowNull: true },
    barcode: { type: DataTypes.STRING(100), allowNull: true, unique: true },
    company: { type: DataTypes.STRING(200), allowNull: true },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    warehouseId: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    unit: { type: DataTypes.STRING(50), defaultValue: 'علبة' },
    description: { type: DataTypes.TEXT, allowNull: true },
    imageUrl: { type: DataTypes.TEXT('long'), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, tableName: 'products', modelName: 'Product' }
);

export default Product;