/**
 * Script para eliminar todas las tablas de la base de datos
 * Uso: node scripts/drop-tables.cjs
 */
require('dotenv').config();

const mysql = require('mysql2/promise');

async function dropTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_NAME || 'clicker_game',
  });

  console.log('Eliminando tablas...');

  try {
    // Eliminar en orden (respetando foreign keys)
    await connection.execute('DROP TABLE IF EXISTS upgrade_configs');
    await connection.execute('DROP TABLE IF EXISTS players');
    await connection.execute('DROP TABLE IF EXISTS knex_migrations');
    await connection.execute('DROP TABLE IF EXISTS knex_migrations_lock');
    
    console.log('✅ Todas las tablas eliminadas');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

dropTables();