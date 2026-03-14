/**
 * Script para agregar mejoras de ejemplo al juego
 * 
 * Usage:
 *   npx tsx scripts/add-upgrades.ts
 */

import mongoose from 'mongoose';

// ============================================
// CONNECTION
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/clicker-game?authSource=admin';

// ============================================
// SCHEMA
// ============================================

const UpgradeConfigSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  baseCost: { type: Number, required: true },
  costMultiplier: { type: Number, required: true },
  effect: { type: Number, required: true },
  maxLevel: { type: Number, required: true },
  type: { type: String, enum: ['click', 'passive'], required: true },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

const UpgradeConfig = mongoose.model('UpgradeConfig', UpgradeConfigSchema);

// ============================================
// UPGRADES PARA AGREGAR
// ============================================

const NEW_UPGRADES = [
  // === TIER 1 (Early game) ===
  {
    id: 'click_1',
    name: 'Dedo Rápido',
    description: 'Tu dedo se mueve más rápido. +1 moneda por click',
    baseCost: 10,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    type: 'click' as const,
  },
  {
    id: 'passive_1',
    name: 'Bolsillo Pequeño',
    description: 'Empiezas a ahorrar. +1 moneda por segundo',
    baseCost: 50,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    type: 'passive' as const,
  },

  // === TIER 2 (Mid game) ===
  {
    id: 'click_2',
    name: 'Doble Click',
    description: 'Haces dos clicks en uno. +5 monedas por click',
    baseCost: 100,
    costMultiplier: 1.6,
    effect: 5,
    maxLevel: 50,
    type: 'click' as const,
  },
  {
    id: 'passive_2',
    name: 'Trabajo Part Time',
    description: 'Un pequeño ingreso extra. +5 monedas por segundo',
    baseCost: 500,
    costMultiplier: 1.6,
    effect: 5,
    maxLevel: 50,
    type: 'passive' as const,
  },

  // === TIER 3 (Late game) ===
  {
    id: 'click_3',
    name: 'Poder Digital',
    description: 'Tus dedos tienen poder sobrenatural. +25 monedas por click',
    baseCost: 1000,
    costMultiplier: 1.7,
    effect: 25,
    maxLevel: 25,
    type: 'click' as const,
  },
  {
    id: 'passive_3',
    name: 'Inversiones',
    description: 'Tu dinero trabaja por ti. +25 monedas por segundo',
    baseCost: 5000,
    costMultiplier: 1.7,
    effect: 25,
    maxLevel: 25,
    type: 'passive' as const,
  },

  // === TIER 4 (End game) ===
  {
    id: 'click_4',
    name: 'Toque de Midas',
    description: 'Todo lo que tocas se convierte en oro. +100 monedas por click',
    baseCost: 50000,
    costMultiplier: 1.8,
    effect: 100,
    maxLevel: 10,
    type: 'click' as const,
  },
  {
    id: 'passive_4',
    name: 'Imperio Financiero',
    description: 'Un verdadero magnate. +100 monedas por segundo',
    baseCost: 250000,
    costMultiplier: 1.8,
    effect: 100,
    maxLevel: 10,
    type: 'passive' as const,
  },
];

// ============================================
// MAIN
// ============================================

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB\n');

  let added = 0;
  let skipped = 0;

  for (const upgrade of NEW_UPGRADES) {
    const existing = await UpgradeConfig.findOne({ id: upgrade.id });
    
    if (existing) {
      console.log(`⏭️  Ya existe: ${upgrade.id} - ${upgrade.name}`);
      skipped++;
    } else {
      await UpgradeConfig.create(upgrade);
      console.log(`✅ Agregado: ${upgrade.id} - ${upgrade.name}`);
      added++;
    }
  }

  console.log(`\n=== RESUMEN ===`);
  console.log(`Agregados: ${added}`);
  console.log(`Omitidos: ${skipped}`);

  await mongoose.disconnect();
  console.log('\nDesconectado de MongoDB');
}

main();
