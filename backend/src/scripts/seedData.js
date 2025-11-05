import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import MenuItem from '../models/MenuItem.js';
import Staff from '../models/Staff.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant');
    console.log('📦 Conectado a MongoDB');

    // Limpiar datos existentes
    await MenuItem.deleteMany({});
    await Staff.deleteMany({});
    await Table.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});

    // Seed Menu Items
    const menuItems = [
      {
        name: 'Empanadas de Queso',
        description: 'Empanadas caseras rellenas con queso derretido',
        price: 3500,
        category: 'entrada',
        badges: ['más pedido'],
        stock: 50
      },
      {
        name: 'Tabla de Quesos',
        description: 'Selección de quesos artesanales con frutos secos',
        price: 8900,
        category: 'entrada',
        badges: ['recomendado'],
        stock: 20
      },
      {
        name: 'Lomo a lo Pobre',
        description: 'Lomo de res con papas fritas, huevos y cebolla caramelizada',
        price: 12500,
        category: 'plato_principal',
        badges: ['chef', 'más pedido'],
        stock: 30
      },
      {
        name: 'Pastel de Choclo',
        description: 'Tradicional pastel chileno con pino y pollo',
        price: 9800,
        category: 'plato_principal',
        stock: 25
      },
      {
        name: 'Salmón Grillado',
        description: 'Salmón fresco a la parrilla con vegetales',
        price: 14900,
        category: 'plato_principal',
        badges: ['nuevo'],
        stock: 15
      },
      {
        name: 'Cazuela de Vacuno',
        description: 'Cazuela tradicional con carne y verduras',
        price: 8500,
        category: 'plato_principal',
        stock: 20
      },
      {
        name: 'Cheesecake de Frutos Rojos',
        description: 'Suave cheesecake con salsa de frutos rojos',
        price: 4500,
        category: 'postre',
        badges: ['recomendado'],
        stock: 25
      },
      {
        name: 'Brownie con Helado',
        description: 'Brownie tibio con helado de vainilla',
        price: 3900,
        category: 'postre',
        badges: ['más pedido'],
        stock: 30
      },
      {
        name: 'Coca Cola 350ml',
        description: 'Bebida refrescante',
        price: 1500,
        category: 'bebida',
        stock: 100
      },
      {
        name: 'Jugo Natural Naranja',
        description: 'Jugo de naranja recién exprimido',
        price: 2500,
        category: 'bebida',
        badges: ['nuevo'],
        stock: 50
      },
      {
        name: 'Vino Casillero del Diablo',
        description: 'Copa de vino tinto reserva',
        price: 4500,
        category: 'bebida',
        stock: 40
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('✅ Menu items creados');

    // Seed Staff (PIN: 1234, Password: admin123 para owner)
    const hashedPin = await bcrypt.hash('1234', 10);
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const staff = [
      {
        name: 'Dueño Restaurant',
        email: 'owner@restaurant.com',
        role: 'owner',
        pinHash: hashedPin,
        passwordHash: hashedPassword,
        active: true
      },
      {
        name: 'Admin Sistema',
        email: 'admin@restaurant.com',
        role: 'admin',
        pinHash: hashedPin,
        passwordHash: hashedPassword,
        active: true
      },
      {
        name: 'Juan Pérez',
        email: 'waiter@restaurant.com',
        role: 'waiter',
        pinHash: hashedPin,
        passwordHash: hashedPassword,
        active: true
      },
      {
        name: 'María González',
        email: 'kitchen@restaurant.com',
        role: 'kitchen',
        pinHash: hashedPin,
        passwordHash: hashedPassword,
        active: true
      }
    ];

    const createdStaff = await Staff.insertMany(staff);
    console.log('✅ Staff creado');
    console.log('   Owner: owner@restaurant.com / admin123');
    console.log('   PIN para todos: 1234');

    // Seed Tables
    const tables = [];
    for (let i = 1; i <= 20; i++) {
      tables.push({
        number: i,
        area: i <= 10 ? 'main' : 'terraza',
        status: 'closed'
      });
    }

    const createdTables = await Table.insertMany(tables);
    console.log('✅ 20 mesas creadas');

    // Seed órdenes históricas (últimos 30 días)
    console.log('\n📊 Generando datos históricos de ventas...');
    const createdMenuItems = await MenuItem.find();
    
    const historicalOrders = [];
    const historicalPayments = [];
    
    const now = new Date();
    const methods = ['webpay', 'applepay', 'googlepay', 'pos'];
    
    // Generar 50 órdenes aleatorias en los últimos 30 días
    for (let i = 0; i < 50; i++) {
      // Fecha aleatoria en los últimos 30 días
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(hoursAgo, Math.floor(Math.random() * 60), 0, 0);

      // Mesa aleatoria
      const randomTable = createdTables[Math.floor(Math.random() * createdTables.length)];

      // 2-5 items aleatorios
      const numItems = Math.floor(Math.random() * 4) + 2;
      const orderItems = [];
      let total = 0;

      for (let j = 0; j < numItems; j++) {
        const randomItem = createdMenuItems[Math.floor(Math.random() * createdMenuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        orderItems.push({
          itemId: randomItem._id,
          quantity,
          price: randomItem.price,
          status: 'served'
        });
        
        total += randomItem.price * quantity;
      }

      // Propina aleatoria (0, 10%, 15% o 20%)
      const tipOptions = [0, 0.10, 0.15, 0.20];
      const tipPercent = tipOptions[Math.floor(Math.random() * tipOptions.length)];
      const tip = Math.round(total * tipPercent);

      const order = {
        tableId: randomTable._id,
        sessionId: `session_${i}_${Date.now()}`,
        items: orderItems,
        status: 'paid',
        total,
        tip,
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
        approvedBy: createdStaff[2]._id, // Waiter
        servedAt: new Date(createdAt.getTime() + 20 * 60000), // +20 min
        paidAt: new Date(createdAt.getTime() + 30 * 60000), // +30 min
        createdAt,
        updatedAt: new Date(createdAt.getTime() + 30 * 60000)
      };

      historicalOrders.push(order);

      // Crear pago correspondiente
      const payment = {
        orderId: null, // Se actualizará después
        method: order.paymentMethod,
        amount: total,
        tip,
        status: 'success',
        transactionId: `TXN_${Date.now()}_${i}`,
        confirmedAt: order.paidAt,
        createdAt: order.paidAt,
        updatedAt: order.paidAt
      };

      historicalPayments.push(payment);
    }

    // Insertar órdenes
    const createdOrders = await Order.insertMany(historicalOrders);
    console.log(`✅ ${createdOrders.length} órdenes históricas creadas`);

    // Actualizar pagos con orderId
    for (let i = 0; i < historicalPayments.length; i++) {
      historicalPayments[i].orderId = createdOrders[i]._id;
    }

    await Payment.insertMany(historicalPayments);
    console.log(`✅ ${historicalPayments.length} pagos históricos creados`);

    console.log('\n🎉 Base de datos inicializada correctamente!\n');
    console.log('📊 Datos creados:');
    console.log(`   - ${menuItems.length} items en el menú`);
    console.log(`   - ${createdStaff.length} miembros del staff`);
    console.log(`   - ${tables.length} mesas`);
    console.log(`   - ${createdOrders.length} órdenes históricas (últimos 30 días)`);
    console.log('\n🔐 Credenciales de acceso:');
    console.log('   Email: owner@restaurant.com');
    console.log('   Password: admin123');
    console.log('   PIN (todos): 1234\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

