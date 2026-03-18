import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import '../models/index';
import { User, Warehouse, Category, Product, Order, OrderItem, Announcement } from '../models/index';
import { UserRole } from '../models/User';
import { OrderStatus } from '../models/Order';
import dotenv from 'dotenv';
dotenv.config();

const rand  = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick  = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── ثوابت ──
const TOTAL_PHARMACISTS   = 500;
const PRODUCTS_PER_WAREHOUSE = 2500;
const TOTAL_ORDERS        = 300;

const FIRST_NAMES = ['محمد','أحمد','عمر','خالد','يوسف','سامر','رامي','طارق','نادر','ماهر','وسيم','فراس','بلال','حسن','حسين','علي','إبراهيم','مصطفى','عبدالله','كريم','زياد','باسل','لؤي','نزار','هاني','وليد','سعد','جمال','صالح','ربيع','سليم','منذر','ثامر','غسان','شادي','أيمن','معاذ','عماد','رياض','فادي','جهاد','مازن','تامر','عدنان','نصر','رشيد','مجد','نبيل','حازم','قيس'];
const LAST_NAMES  = ['الأحمد','السيد','حسن','علي','إبراهيم','كريم','منصور','فارس','قاسم','زين','الحسن','الحسين','العلي','العمر','خليل','درويش','صالح','عيسى','يوسف','داود','نجار','حداد','سلوم','معلوف','جبور','خوري','سمعان','عطية','شاهين','بركات','حمود','زيدان','قطان','رشيد','فارس','الزعبي','الرفاعي','البيطار','الجندي','الكيلاني','المصري','الحلبي','الدمشقي','الشامي','السوري','النجار','الحداد','الترك','العباس','الطويل'];
const PHARMACY_NAMES_PREFIX = ['صيدلية','مركز أدوية','دار الدواء','صيدلانية'];
const PHARMACY_NAMES_SUFFIX = ['النور','الشفاء','الأمل','الرضا','السلامة','الحياة','الوفاء','البركة','الصحة','الدواء','الرحمة','الهدى','النهضة','التقدم','الوطنية','العربية','الشرق','الغرب','الوسط','الجنوب','الشمال','المركزية','الحديثة','الجديدة','القديمة','الكبرى','الصغرى','الذهبية','الفضية','الزرقاء','الخضراء','البيضاء','العلمية','الطبية','الدولية'];
const LOCATIONS = ['دمشق - المزة','دمشق - كفرسوسة','دمشق - المالكي','دمشق - باب توما','دمشق - الشعلان','دمشق - المهاجرين','دمشق - القصاع','دمشق - العباسيين','دمشق - برزة','دمشق - جوبر','دمشق - القابون','دمشق - ركن الدين','دمشق - دمر','دمشق - التجارة','دمشق - الصالحية','حلب - العزيزية','حلب - الجميلية','حلب - السريان','حلب - الشيخ مقصود','حلب - حمدانية','حمص - الوعر','حمص - الأرمن','حمص - المحطة','اللاذقية - الكورنيش','اللاذقية - الزراعة','طرطوس - المركز','حماة - المركز','دير الزور - المركز','الرقة - المركز','درعا - المركز'];
const COMPANIES = ['تامر','سيريا فارم','نوفارتيس','بايير','ميرك','فايزر','سانوفي','روش','أسترازينيكا','حماة فارما','دمشق فارما','وطنية للأدوية','الشرق للأدوية','بيوفارم','الوحدة الطبية','GlaxoSmithKline','AbbVie','Johnson & Johnson','Novartis','Roche','Eli Lilly','Bristol-Myers Squibb','Amgen','Gilead','Boehringer','Takeda','Astellas','Daiichi','Servier','Ipsen'];
const UNITS = ['علبة','شريط','قنينة','أنبوب','قطارة','حقنة','كيس','لتر','غرام'];

const WAREHOUSES_DATA = [
  { name: 'مستودع الشام المركزي',  location: 'دمشق - المزة',        phone: '011-5551234', description: 'المستودع الرئيسي للأدوية في دمشق' },
  { name: 'مستودع حلب للأدوية',    location: 'حلب - العزيزية',      phone: '021-5559876', description: 'مستودع أدوية حلب والشمال' },
  { name: 'مستودع حمص الطبي',      location: 'حمص - الوعر',         phone: '031-5553344', description: 'مستودع أدوية منطقة الوسط' },
  { name: 'مستودع اللاذقية',       location: 'اللاذقية - الزراعة',   phone: '041-5556677', description: 'مستودع الساحل السوري' },
];

const ALL_CATEGORIES = [
  'أدوية الضغط','أدوية السكري','المضادات الحيوية','مسكنات الألم','الفيتامينات والمكملات',
  'أدوية الجهاز الهضمي','أدوية الجهاز التنفسي','أدوية الجلد','أدوية القلب','أدوية الحساسية',
  'أدوية الأعصاب','أدوية العيون','أدوية الأطفال','أدوية نسائية','مضادات الفطريات',
  'أدوية الكلى','أدوية الكبد','أدوية المناعة','أدوية المفاصل','أدوية الطوارئ',
  'محاليل وريدية','مكملات غذائية','مستحضرات تجميلية طبية','أدوية الفيروسات','أدوية الغدة الدرقية',
];

// قاموس أسماء الأدوية الحقيقية لتوليد أسماء واقعية
const DRUG_PREFIXES = ['أملو','لوسار','ميتفور','غليب','أموكسي','أزيثرو','باراسيتا','إيبوبرو','فيتامين','أوميبرا','باند','رانيتي','ميتوكلو','سيتيري','لوراتا','أتورفاستا','روزوفاستا','كلوبيدو','غابابن','بريغابا','سيرترا','فلوكس','ديازي','أسيكلو','فلوكونا','هيدروكور','كلوتريما','أسبرين','ديكلوفي','نابروك'];
const DRUG_SUFFIXES = ['بين','تان','مين','ريد','سيلين','ميسين','مول','فين','سي','زول','تيدين','راميد','زين','دين','تاتين','ستاتين','غريل','نتين','لين','رالين','تين','بام','فير','زول','زون','ما','ك','ناك','سين','مات'];

// توليد اسم دواء عشوائي
const genDrugName = (index: number): string => {
  const prefix = DRUG_PREFIXES[index % DRUG_PREFIXES.length];
  const suffix = DRUG_SUFFIXES[Math.floor(index / DRUG_PREFIXES.length) % DRUG_SUFFIXES.length];
  const dose   = pick(['5mg','10mg','20mg','25mg','50mg','100mg','200mg','250mg','400mg','500mg','1000mg']);
  const sci    = `${prefix}${suffix} ${dose}`;
  return sci;
};

const genPrice = (): number => {
  const ranges = [[2000,5000],[5000,15000],[15000,35000],[35000,80000],[80000,200000]];
  const weights = [40, 35, 15, 7, 3]; // نسب
  const r = rand(1,100);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (r <= acc) {
      return rand(ranges[i][0], ranges[i][1]);
    }
  }
  return rand(5000, 20000);
};

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ DB Connected & Synced');

    // ══ 1. Users الأساسيين ══
    const ownerPass = await bcrypt.hash('owner123', 12);
    await User.findOrCreate({ where: { username: 'owner' }, defaults: { firstName: 'محمد', lastName: 'الموزع', phone: '0991234567', username: 'owner', password: ownerPass, role: UserRole.OWNER } });

    const adminPass = await bcrypt.hash('admin123', 12);
    await User.findOrCreate({ where: { username: 'admin' }, defaults: { firstName: 'أحمد', lastName: 'الأدمن', phone: '0992345678', username: 'admin', password: adminPass, role: UserRole.ADMIN } });

    const pharmPass = await bcrypt.hash('pharm123', 12);
    await User.findOrCreate({ where: { phone: '0993456789' }, defaults: { firstName: 'أسامة', lastName: 'فارون', phone: '0993456789', email: 'osama@example.com', password: pharmPass, role: UserRole.PHARMACIST, pharmacyName: 'صيدلية الشفاء', pharmacyLocation: 'دمشق - المزة' } });

    // ══ 2. 500 صيدلاني ══
    console.log(`\n⏳ توليد ${TOTAL_PHARMACISTS} صيدلاني...`);
    const hashedPharm = await bcrypt.hash('pharm123', 12);
    const pharmacistIds: number[] = [];
    let created = 0;

    for (let i = 0; i < TOTAL_PHARMACISTS; i++) {
      const fn   = FIRST_NAMES[i % FIRST_NAMES.length];
      const ln   = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
      const phone = `09${rand(10,99)}${String(i + 100000).slice(-6)}`;
      const pPrefix = pick(PHARMACY_NAMES_PREFIX);
      const pSuffix = PHARMACY_NAMES_SUFFIX[i % PHARMACY_NAMES_SUFFIX.length];
      const loc  = LOCATIONS[i % LOCATIONS.length];

      try {
        const [u, wasCreated] = await User.findOrCreate({
          where: { phone },
          defaults: {
            firstName: fn, lastName: ln, phone,
            password: hashedPharm, role: UserRole.PHARMACIST,
            pharmacyName: `${pPrefix} ${pSuffix}`,
            pharmacyLocation: loc,
          }
        });
        pharmacistIds.push(u.id);
        if (wasCreated) created++;
      } catch {}

      if ((i + 1) % 100 === 0) {
        console.log(`   ✓ ${i + 1}/${TOTAL_PHARMACISTS} صيدلاني`);
        await sleep(50);
      }
    }
    console.log(`✅ ${created} صيدلاني جديد (${pharmacistIds.length} إجمالاً)`);

    // ══ 3. Warehouses ══
    const warehouses: any[] = [];
    for (const wd of WAREHOUSES_DATA) {
      const [w] = await Warehouse.findOrCreate({ where: { name: wd.name }, defaults: { ...wd, isActive: true } });
      warehouses.push(w);
    }
    console.log(`✅ ${warehouses.length} مستودع`);

    // ══ 4. Categories ══
    const catsByWarehouse: Record<number, any[]> = {};
    for (const w of warehouses) {
      catsByWarehouse[w.id] = [];
      for (const catName of ALL_CATEGORIES) {
        const [c] = await Category.findOrCreate({ where: { name: catName, warehouseId: w.id }, defaults: { name: catName, warehouseId: w.id, isActive: true } });
        catsByWarehouse[w.id].push(c);
      }
    }
    console.log(`✅ ${warehouses.length * ALL_CATEGORIES.length} تصنيف`);

    // ══ 5. 2500 منتج لكل مستودع ══
    let totalProducts = 0;

    for (const w of warehouses) {
      console.log(`\n⏳ توليد ${PRODUCTS_PER_WAREHOUSE} منتج لـ ${w.name}...`);
      const cats = catsByWarehouse[w.id];
      let wCreated = 0;

      for (let i = 0; i < PRODUCTS_PER_WAREHOUSE; i++) {
        const cat     = cats[i % cats.length];
        const company = pick(COMPANIES);
        const drugName = genDrugName(i + (w.id * 1000));
        const price   = genPrice();
        const stock   = rand(0, 1) === 0 ? rand(10, 500) : 0; // 50% احتمال نفاد
        const barcode = `W${w.id}P${String(i + 1).padStart(5, '0')}`;
        const unit    = pick(UNITS);

        try {
          const [, wasCreated] = await Product.findOrCreate({
            where: { barcode },
            defaults: {
              name:           drugName.split(' ')[0] + (i > 0 ? ` ${i}` : ''),
              scientificName: drugName,
              company, categoryId: cat.id, warehouseId: w.id,
              price, stock, unit, barcode, isActive: true,
            }
          });
          if (wasCreated) wCreated++;
        } catch {}

        if ((i + 1) % 500 === 0) {
          console.log(`   ✓ ${i + 1}/${PRODUCTS_PER_WAREHOUSE} منتج`);
          await sleep(100);
        }
      }

      totalProducts += wCreated;
      console.log(`   ✅ ${wCreated} منتج جديد لـ ${w.name}`);
    }
    console.log(`\n✅ ${totalProducts} منتج إجمالاً`);

    // ══ 6. 300 طلب ══
    console.log('\n⏳ توليد الطلبات...');
    const allProducts: any[] = await Product.findAll({ where: { stock: { [require('sequelize').Op.gt]: 0 } }, limit: 500 });
    const statuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.DELIVERING, OrderStatus.DELIVERED, OrderStatus.DELIVERED];
    let orderCount = 0;

    for (let i = 0; i < TOTAL_ORDERS; i++) {
      try {
        const pharmId = pick(pharmacistIds);
        const itemCount = rand(2, 6);
        const selected: any[] = [];
        const used = new Set<number>();

        for (let j = 0; j < itemCount; j++) {
          let p: any;
          let tries = 0;
          do { p = pick(allProducts); tries++; } while (used.has(p.id) && tries < 20);
          used.add(p.id);
          selected.push(p);
        }

        if (selected.length === 0) continue;
        const warehouseId = selected[0].warehouseId;
        const daysAgo = rand(0, 90);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        const order: any = await Order.create({
          orderNumber: `ORD-${createdAt.getFullYear()}${String(createdAt.getMonth()+1).padStart(2,'0')}${String(createdAt.getDate()).padStart(2,'0')}-${rand(1000,9999)}`,
          pharmacistId: pharmId,
          warehouseId,
          status: pick(statuses),
          totalAmount: 0,
          notes: rand(0, 4) === 0 ? pick(['يرجى التوصيل صباحاً', 'عاجل', 'التوصيل بعد الظهر', 'يرجى الاتصال قبل التوصيل']) : null,
          createdAt, updatedAt: createdAt,
        });

        let total = 0;
        for (const prod of selected) {
          const qty = rand(1, 8);
          const price = parseFloat(prod.price);
          total += price * qty;
          await OrderItem.create({ orderId: order.id, productId: prod.id, quantity: qty, price, productName: prod.name });
        }
        await order.update({ totalAmount: total });
        orderCount++;
      } catch {}
    }
    console.log(`✅ ${orderCount} طلب`);

    // ══ 7. Announcements ══
    for (const ann of [
      { title: 'عرض فاتورة 200,000 ل.س', subtitle: 'احصل على هدية مجانية', description: 'عند الطلب بقيمة 200,000 ل.س أو أكثر تحصل على هدية مجانية', bgColor: '#0f172a', badgeText: '🎁 عرض خاص', badgeColor: '#f59e0b', isActive: true, sortOrder: 1, minOrderAmount: 200000 },
      { title: 'منتجات جديدة وصلت!', subtitle: 'تشكيلة جديدة من الأدوية', description: 'تم إضافة آلاف المنتجات الجديدة إلى مستودعاتنا', bgColor: '#1e3a5f', badgeText: '✨ جديد', badgeColor: '#22c55e', isActive: true, sortOrder: 2, minOrderAmount: null },
      { title: 'خدمة التوصيل السريع', subtitle: 'التوصيل خلال 24 ساعة', description: 'نضمن وصول طلبك خلال 24 ساعة لجميع المناطق', bgColor: '#1a1a2e', badgeText: '🚚 توصيل سريع', badgeColor: '#3b82f6', isActive: true, sortOrder: 3, minOrderAmount: null },
    ]) {
      await Announcement.findOrCreate({ where: { title: ann.title }, defaults: ann });
    }

    console.log('\n🎉 ═══════════════════════════════');
    console.log('    اكتمل توليد البيانات بنجاح!');
    console.log('═══════════════════════════════');
    console.log(`👥  الصيادلة:    ${TOTAL_PHARMACISTS + 3}`);
    console.log(`🏭  المستودعات:  ${warehouses.length}`);
    console.log(`📂  التصنيفات:   ${warehouses.length * ALL_CATEGORIES.length}`);
    console.log(`💊  المنتجات:    ${warehouses.length} × ${PRODUCTS_PER_WAREHOUSE} = ${warehouses.length * PRODUCTS_PER_WAREHOUSE}`);
    console.log(`📋  الطلبات:     ${orderCount}`);
    console.log('═══════════════════════════════\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();