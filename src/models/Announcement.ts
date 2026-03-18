import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Announcement extends Model {
  public id!: number;
  public title!: string;
  public subtitle!: string | null;
  public description!: string | null;
  public image!: string | null;       // base64
  public bgColor!: string;            // لون خلفية الكرت
  public badgeText!: string | null;   // نص الشارة مثل "عرض خاص"
  public badgeColor!: string | null;  // لون الشارة
  public isActive!: boolean;
  public sortOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Announcement.init(
  {
    id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title:       { type: DataTypes.STRING(200), allowNull: false },
    subtitle:    { type: DataTypes.STRING(300), allowNull: true },
    description: { type: DataTypes.TEXT,        allowNull: true },
    image:       { type: DataTypes.TEXT('long'), allowNull: true },
    bgColor:     { type: DataTypes.STRING(20),  allowNull: false, defaultValue: '#0f172a' },
    badgeText:   { type: DataTypes.STRING(50),  allowNull: true },
    badgeColor:  { type: DataTypes.STRING(20),  allowNull: true, defaultValue: '#f59e0b' },
    isActive:    { type: DataTypes.BOOLEAN,     defaultValue: true },
    sortOrder:   { type: DataTypes.INTEGER,     defaultValue: 0 },
  },
  { sequelize, tableName: 'announcements', modelName: 'Announcement' }
);

export default Announcement;