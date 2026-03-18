import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class DailyIncome extends Model {
  public id!: number;
  public date!: Date;
  public amount!: number;
  public description!: string | null;
  public addedBy!: number;
}

DailyIncome.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    addedBy: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: 'daily_incomes', modelName: 'DailyIncome' }
);

export default DailyIncome;
