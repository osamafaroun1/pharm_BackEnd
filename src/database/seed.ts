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
      firstName: 'محمد',
      lastName: 'الموزع',
      phone: '0991234567',
      username: 'owner',
      password: ownerPass,
      role: UserRole.OWNER,
      pharmacyName: 'موزع أساسي',
      pharmacyLocation: 'دمشق',
      landline: '011-123456',
      email: 'owner@example.com',
      pharmacyLocationDetails: 'الموزع الأساسي في دمشق',
      licenseImage: 'https://example.com/license-owner.png',
    });
    console.log('✅ Owner created - username: owner / password: owner123');

    // Create Admin
    const adminPass = await bcrypt.hash('admin123', 12);
    await User.create({
      firstName: 'أحمد',
      lastName: 'الأدمن',
      phone: '0992345678',
      username: 'admin',
      password: adminPass,
      role: UserRole.ADMIN,
      pharmacyName: 'إدارة النظام',
      pharmacyLocation: 'دمشق',
      landline: '011-234567',
      email: 'admin@example.com',
      pharmacyLocationDetails: 'إدارة النظام',
      licenseImage: 'https://example.com/license-admin.png',
    });
    console.log('✅ Admin created - username: admin / password: admin123');

    // Create Pharmacist
    const pharmPass = await bcrypt.hash('pharm123', 12);
    await User.create({
      firstName: 'أسامة',
      lastName: 'فارون',
      phone: '0993456789',
      email: 'osama@example.com',
      password: pharmPass,
      role: UserRole.PHARMACIST,
      pharmacyName: 'صيدلية الشفاء',
      pharmacyLocation: 'دمشق - المزة - شارع الجامعة',
      landline: '011-345678',
      pharmacyLocationDetails: 'صيدلية شفاء ممتازة في قلب المزة',
      licenseImage: 'https://example.com/license-pharm1.png',
    });
    console.log('✅ Pharmacist created - phone: 0993456789 / password: pharm123');

    // Create Warehouses
    const w1 = await Warehouse.create({
      name: 'مستودع الشام المركزي',
      location: 'دمشق - المزة',
      phone: '011-5551234',
      isActive: true,
      description: 'المستودع الرئيسي للأدوية في دمشق',
      managerName: 'محمود علي',
      managerPhone: '0998765432',
    });
    const w2 = await Warehouse.create({
      name: 'مستودع حلب للأدوية',
      location: 'حلب - العزيزية',
      phone: '021-5559876',
      isActive: true,
      description: 'مستودع أدوية حلب والشمال',
      managerName: 'أحمد حسك',
      managerPhone: '0991234567',
    });
    console.log('✅ Warehouses created');

    // Create Categories for W1
    const catPressure = await Category.create({
      name: 'أدوية الضغط',
      warehouseId: w1.id,
      isActive: true,
      description: 'جميع أدوية ارتفاع ضغط الدم',
    });
    const catDiabetes = await Category.create({
      name: 'أدوية السكري',
      warehouseId: w1.id,
      isActive: true,
      description: 'أدوية وأنسولين السكري',
    });
    const catAntibiotic = await Category.create({
      name: 'المضادات الحيوية',
      warehouseId: w1.id,
      isActive: true,
      description: 'مضادات حيوية واسعة الطيف',
    });
    const catPain = await Category.create({
      name: 'مسكنات الألم',
      warehouseId: w1.id,
      isActive: true,
      description: 'مسكنات وأدوية التهابات',
    });
    const catVitamin = await Category.create({
      name: 'الفيتامينات والمكملات',
      warehouseId: w1.id,
      isActive: true,
      description: 'فيتامينات ومكملات غذائية',
    });

    // Categories for W2
    const catHeart = await Category.create({
      name: 'أدوية القلب',
      warehouseId: w2.id,
      isActive: true,
      description: 'أدوية ضغط وقلب وشرايين',
    });
    const catAllergy = await Category.create({
      name: 'أدوية الحساسية',
      warehouseId: w2.id,
      isActive: true,
      description: 'مضادات هيستامين وأدوية حساسية',
    });
    console.log('✅ Categories created');

    // Products
    const products = [
      {
        name: 'أملوديبين',
        scientificName: 'Amlodipine 5mg',
        company: 'تامر',
        categoryId: catPressure.id,
        warehouseId: w1.id,
        price: 5000,
        stock: 120,
        unit: 'علبة',
        barcode: 'SYR001',
        description: 'دواء لعلاج ارتفاع ضغط الدم',
      },
      {
        name: 'لوسارتان',
        scientificName: 'Losartan 50mg',
        company: 'نوفارتيس',
        categoryId: catPressure.id,
        warehouseId: w1.id,
        price: 8500,
        stock: 80,
        unit: 'علبة',
        barcode: 'SYR002',
        description: 'دواء مثبط مستقبلات أنجيوتنسين 2 لتحال ضغط الدم',
      },
      {
        name: 'ميتفورمين',
        scientificName: 'Metformin 500mg',
        company: 'سيريا فارم',
        categoryId: catDiabetes.id,
        warehouseId: w1.id,
        price: 4500,
        stock: 200,
        unit: 'علبة',
        barcode: 'SYR003',
        description: 'دواء خفض سكر الدم عن طريق الفم',
      },
      {
        name: 'غلوكوفاج',
        scientificName: 'Glucophage 850mg',
        company: 'ميرك',
        categoryId: catDiabetes.id,
        warehouseId: w1.id,
        price: 12000,
        stock: 150,
        unit: 'علبة',
        barcode: 'SYR004',
        description: 'دواء ميتفورمين لعلاج السكري من النوع الثاني',
      },
      {
        name: 'أموكسيسيلين',
        scientificName: 'Amoxicillin 500mg',
        company: 'تامر',
        categoryId: catAntibiotic.id,
        warehouseId: w1.id,
        price: 7500,
        stock: 300,
        unit: 'علبة',
        barcode: 'SYR005',
        description: 'مضاد حيوي واسع الطيف',
      },
      {
        name: 'أزيثروميسين',
        scientificName: 'Azithromycin 500mg',
        company: 'سيريا فارم',
        categoryId: catAntibiotic.id,
        warehouseId: w1.id,
        price: 15000,
        stock: 90,
        unit: 'علبة',
        barcode: 'SYR006',
        description: 'مضاد حيوي كبسلات لعلاج الالتهابات',
      },
      {
        name: 'باراسيتامول',
        scientificName: 'Paracetamol 500mg',
        company: 'تامر',
        categoryId: catPain.id,
        warehouseId: w1.id,
        price: 2500,
        stock: 500,
        unit: 'علبة',
        barcode: 'SYR007',
        description: 'مسكن للألم وخافض للحرارة',
      },
      {
        name: 'إيبوبروفين',
        scientificName: 'Ibuprofen 400mg',
        company: 'نوفارتيس',
        categoryId: catPain.id,
        warehouseId: w1.id,
        price: 4000,
        stock: 250,
        unit: 'علبة',
        barcode: 'SYR008',
        description: 'مسكن ألم ومضاد للالتهابات',
      },
      {
        name: 'فيتامين سي',
        scientificName: 'Vitamin C 1000mg',
        company: 'بايروكسيم',
        categoryId: catVitamin.id,
        warehouseId: w1.id,
        price: 6000,
        stock: 180,
        unit: 'علبة',
        barcode: 'SYR009',
        description: 'فيتامين سي مكمل غذائي قوي',
      },
      {
        name: 'فيتامين د3',
        scientificName: 'Vitamin D3 1000IU',
        company: 'سيريا فارم',
        categoryId: catVitamin.id,
        warehouseId: w1.id,
        price: 9500,
        stock: 130,
        unit: 'علبة',
        barcode: 'SYR010',
        description: 'مكمل فيتامين د3 لتقوية العظام',
      },
      {
        name: 'أسبرين القلب',
        scientificName: 'Aspirin 100mg',
        company: 'بايير',
        categoryId: catHeart.id,
        warehouseId: w2.id,
        price: 3500,
        stock: 400,
        unit: 'علبة',
        barcode: 'SYR011',
        description: 'أسبرين مخفضة الجرعة لحماية القلب والأوعية',
      },
      {
        name: 'سيتيريزين',
        scientificName: 'Cetirizine 10mg',
        company: 'نوفارتيس',
        categoryId: catAllergy.id,
        warehouseId: w2.id,
        price: 5500,
        stock: 160,
        unit: 'علبة',
        barcode: 'SYR012',
        description: 'مضاد هيستامين لعلاج الحساسية',
      },
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
