const bcrypt = require('bcryptjs');
const { sequelize, User, LeaveType } = require('./models');

async function seed() {
  try {
    await sequelize.sync({ force: true }); // WARNING: This drops tables!
    console.log('Database synced.');

    // Create Default Leave Types
    const annual = await LeaveType.create({ name: 'Annual Leave', default_days: 14 });
    const sick = await LeaveType.create({ name: 'Sick Leave', default_days: 14 });
    const hospitalization = await LeaveType.create({ name: 'Hospitalization', default_days: 60 });
    const emergency = await LeaveType.create({ name: 'Emergency Leave', default_days: 3 });

    console.log('Leave Types seeded.');

    // Create Admin User
    const adminHash = await bcrypt.hash('admin123', 10);
    await User.create({
      full_name: 'System Admin',
      email: 'admin@cetaknow.com',
      password_hash: adminHash,
      role: 'admin'
    });

    console.log('Admin user seeded (admin@cetaknow.com / admin123).');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
