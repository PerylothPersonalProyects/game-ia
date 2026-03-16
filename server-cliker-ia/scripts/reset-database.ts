/**
 * Script para borrar la base de datos del juego
 * 
 * Usage:
 *   npx tsx scripts/reset-database.ts
 * 
 * ⚠️ ADVERTENCIA: Este script BORRA TODOS los datos
 */

import mongoose from 'mongoose';

// ============================================
// CONNECTION
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/clicker-game?authSource=admin';

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('⚠️  ATENCIÓN: Este script borrará TODOS los datos de la base de datos');
  console.log(`📍 URI: ${MONGODB_URI}\n`);
  
  // Extraer nombre de DB de la URI
  const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'unknown';
  console.log(`🗑️  Base de datos a borrar: ${dbName}\n`);
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Conectado a MongoDB\n');

  try {
    // Drop de la base de datos completa
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Base de datos borrada correctamente');
  } catch (error) {
    console.error('❌ Error al borrar la base de datos:', error);
  }

  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
  console.log('\n🔄 La base de datos está vacía. Ejecuta la migración para agregar los upgrades.');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
