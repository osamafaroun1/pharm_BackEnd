import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum UserRole {
  PHARMACIST = 'pharmacist',
  ADMIN      = 'admin',
  OWNER      = 'owner',
}

class User extends Model {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public phone!: string;
  public landline!: string | null;          // ← هاتف ثابت
  public email!: string | null;
  public password!: string;
  public role!: UserRole;
  public pharmacyName!: string;
  public pharmacyLocation!: string;
  public pharmacyLocationDetails!: string | null;  // ← تفاصيل الموقع
  public licenseImage!: string | null;      // ← صورة شهادة الصيدلية (base64 أو URL)
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id:                     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName:              { type: DataTypes.STRING(100), allowNull: false },
    lastName:               { type: DataTypes.STRING(100), allowNull: false },
    phone:                  { type: DataTypes.STRING(20),  allowNull: false },
    landline:               { type: DataTypes.STRING(30),  allowNull: true },
    email:                  { type: DataTypes.STRING(255), allowNull: true, unique: true },
    password:               { type: DataTypes.STRING(255), allowNull: false },
    role:                   { type: DataTypes.ENUM(...Object.values(UserRole)), allowNull: false, defaultValue: UserRole.PHARMACIST },
    pharmacyName:           { type: DataTypes.STRING(200), allowNull: false },
    pharmacyLocation:       { type: DataTypes.TEXT,        allowNull: false },
    pharmacyLocationDetails:{ type: DataTypes.TEXT,        allowNull: true },
    licenseImage:           { type: DataTypes.TEXT('long'),allowNull: true },   // base64
    isActive:               { type: DataTypes.BOOLEAN,     defaultValue: true },
  },
  { sequelize, tableName: 'users', modelName: 'User' }
);

export default User;