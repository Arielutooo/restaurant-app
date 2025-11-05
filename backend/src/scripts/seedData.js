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

    // NO generar órdenes históricas - métricas desde 0
    console.log('\n📊 Métricas configuradas para empezar desde cero');
    console.log('💡 Las métricas se actualizarán en tiempo real conforme se generen pedidos');
    console.log('   (No se generaron datos históricos)');

    console.log('\n🎉 Base de datos inicializada correctamente!\n');
    console.log('📊 Datos creados:');
    console.log(`   - ${menuItems.length} items en el menú`);
    console.log(`   - ${createdStaff.length} miembros del staff`);
    console.log(`   - ${createdTables.length} mesas`);
    console.log(`   - 0 órdenes históricas (métricas desde cero)`);
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

