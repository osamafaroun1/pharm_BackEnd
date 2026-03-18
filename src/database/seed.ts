import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import '../models/index';
import { User, Warehouse, Category, Product } from '../models/index';
import { UserRole } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✅ DB Connected & Synced');

    // Create Owner
    const ownerPass = await bcrypt.hash('owner123', 12);
    await User.create({
      firstName: 'محمد', lastName: 'الموزع', phone: '0991234567',
      username: 'owner', password: ownerPass, role: UserRole.OWNER,
    });
    console.log('✅ Owner created - username: owner / password: owner123');

    // Create Admin
    const adminPass = await bcrypt.hash('admin123', 12);
    await User.create({
      firstName: 'أحمد', lastName: 'الأدمن', phone: '0992345678',
      username: 'admin', password: adminPass, role: UserRole.ADMIN,
    });
    console.log('✅ Admin created - username: admin / password: admin123');

    // Create Pharmacist
    const pharmPass = await bcrypt.hash('pharm123', 12);
    await User.create({
      firstName: 'أسامة', lastName: 'فارون', phone: '0993456789',
      email: 'osama@example.com', password: pharmPass, role: UserRole.PHARMACIST,
      pharmacyName: 'صيدلية الشفاء', pharmacyLocation: 'دمشق - المزة - شارع الجامعة',
    });
    console.log('✅ Pharmacist created - phone: 0993456789 / password: pharm123');

    // Create Warehouses
    const w1 = await Warehouse.create({
      name: 'مستودع الشام المركزي', location: 'دمشق - المزة', phone: '011-5551234', isActive: true,
      description: 'المستودع الرئيسي للأدوية في دمشق',
    });
    const w2 = await Warehouse.create({
      name: 'مستودع حلب للأدوية', location: 'حلب - العزيزية', phone: '021-5559876', isActive: true,
      description: 'مستودع أدوية حلب والشمال',
    });
    console.log('✅ Warehouses created');

    // Create Categories for W1
    const catPressure = await Category.create({ name: 'أدوية الضغط', warehouseId: w1.id, isActive: true });
    const catDiabetes = await Category.create({ name: 'أدوية السكري', warehouseId: w1.id, isActive: true });
    const catAntibiotic = await Category.create({ name: 'المضادات الحيوية', warehouseId: w1.id, isActive: true });
    const catPain = await Category.create({ name: 'مسكنات الألم', warehouseId: w1.id, isActive: true });
    const catVitamin = await Category.create({ name: 'الفيتامينات والمكملات', warehouseId: w1.id, isActive: true });

    // Categories for W2
    const catHeart = await Category.create({ name: 'أدوية القلب', warehouseId: w2.id, isActive: true });
    const catAllergy = await Category.create({ name: 'أدوية الحساسية', warehouseId: w2.id, isActive: true });
    console.log('✅ Categories created');

    // Products
    const products = [
      { name: 'أملوديبين', scientificName: 'Amlodipine 5mg', company: 'تامر', categoryId: catPressure.id, warehouseId: w1.id, price: 5000, stock: 120, unit: 'علبة', barcode: 'SYR001' },
      { name: 'لوسارتان', scientificName: 'Losartan 50mg', company: 'نوفارتيس', categoryId: catPressure.id, warehouseId: w1.id, price: 8500, stock: 80, unit: 'علبة', barcode: 'SYR002' },
      { name: 'ميتفورمين', scientificName: 'Metformin 500mg', company: 'سيريا فارم', categoryId: catDiabetes.id, warehouseId: w1.id, price: 4500, stock: 200, unit: 'علبة', barcode: 'SYR003' },
      { name: 'غلوكوفاج', scientificName: 'Glucophage 850mg', company: 'ميرك', categoryId: catDiabetes.id, warehouseId: w1.id, price: 12000, stock: 150, unit: 'علبة', barcode: 'SYR004' },
      { name: 'أموكسيسيلين', scientificName: 'Amoxicillin 500mg', company: 'تامر', categoryId: catAntibiotic.id, warehouseId: w1.id, price: 7500, stock: 300, unit: 'علبة', barcode: 'SYR005' },
      { name: 'أزيثروميسين', scientificName: 'Azithromycin 500mg', company: 'سيريا فارم', categoryId: catAntibiotic.id, warehouseId: w1.id, price: 15000, stock: 90, unit: 'علبة', barcode: 'SYR006' },
      { name: 'باراسيتامول', scientificName: 'Paracetamol 500mg', company: 'تامر', categoryId: catPain.id, warehouseId: w1.id, price: 2500, stock: 500, unit: 'علبة', barcode: 'SYR007' },
      { name: 'إيبوبروفين', scientificName: 'Ibuprofen 400mg', company: 'نوفارتيس', categoryId: catPain.id, warehouseId: w1.id, price: 4000, stock: 250, unit: 'علبة', barcode: 'SYR008' },
      { name: 'فيتامين سي', scientificName: 'Vitamin C 1000mg', company: 'بايروكسيم', categoryId: catVitamin.id, warehouseId: w1.id, price: 6000, stock: 180, unit: 'علبة', barcode: 'SYR009' },
      { name: 'فيتامين د3', scientificName: 'Vitamin D3 1000IU', company: 'سيريا فارم', categoryId: catVitamin.id, warehouseId: w1.id, price: 9500, stock: 130, unit: 'علبة', barcode: 'SYR010' },
      { name: 'أسبرين القلب', scientificName: 'Aspirin 100mg', company: 'بايير', categoryId: catHeart.id, warehouseId: w2.id, price: 3500, stock: 400, unit: 'علبة', barcode: 'SYR011' },
      { name: 'سيتيريزين', scientificName: 'Cetirizine 10mg', company: 'نوفارتيس', categoryId: catAllergy.id, warehouseId: w2.id, price: 5500, stock: 160, unit: 'علبة', barcode: 'SYR012' },
    ];

    for (const p of products) {
      await Product.create({ ...p, isActive: true });
    }
    console.log('✅ Products created');
    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
