// ============================================
// PRISMA RESET DATABASE SCRIPT
// ============================================
// Resets the MySQL database by dropping and recreating tables
// WARNING: This deletes ALL data!

import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('⚠️  WARNING: This script will DELETE ALL data from the database!');
  console.log('   Press Ctrl+C to cancel...\n');

  // Wait a moment for user to cancel
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🗑️  Starting database reset...\n');

  try {
    // Connect directly with mysql2 to disable FK checks
    const pool = mysql.createPool(databaseUrl);
    const connection = await pool.getConnection();

    try {
      // Disable foreign key checks
      console.log('  📝 Disabling foreign key checks...');
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');

      // Drop tables in correct order (respecting foreign keys)
      console.log('  📝 Dropping upgrade_configs table...');
      await connection.query('DROP TABLE IF EXISTS `upgrade_configs`');

      console.log('  📝 Dropping players table...');
      await connection.query('DROP TABLE IF EXISTS `players`');

      // Re-enable foreign key checks
      console.log('  📝 Enabling foreign key checks...');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');

      console.log('\n✅ Database tables dropped successfully!');
      console.log('\n📌 Next steps:');
      console.log('   1. Run migrations: npm run prisma:migrate');
      console.log('   2. Or push schema: npm run prisma:push');
      console.log('   3. Seed data: npm run prisma:seed');
      console.log('   4. Or do all at once: npm run db:prisma:reset');
    } finally {
      connection.release();
      await pool.end();
    }
  } catch (error) {
    console.error('\n❌ Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase()
  .then(() => {
    console.log('\n✅ Reset script completed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Reset failed:', error);
    process.exit(1);
  });
