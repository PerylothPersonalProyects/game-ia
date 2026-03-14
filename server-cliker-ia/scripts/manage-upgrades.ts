/**
 * Script para administrar mejoras del juego
 * 
 * Usage:
 *   npx tsx scripts/manage-upgrades.ts list
 *   npx tsx scripts/manage-upgrades.ts add <json>
 *   npx tsx scripts/manage-upgrades.ts update <id> <json>
 *   npx tsx scripts/manage-upgrades.ts delete <id>
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

interface IUpgradeConfig extends mongoose.Document {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  type: 'click' | 'passive';
  enabled: boolean;
}

const UpgradeConfig = mongoose.model<IUpgradeConfig>('UpgradeConfig', UpgradeConfigSchema);

// ============================================
// DEFAULT UPGRADES
// ============================================

const DEFAULT_UPGRADES = [
  // Click upgrades
  {
    id: 'click_1',
    name: 'Dedo Rápido',
    description: 'Mejora tu dedo para hacer clicks más rápidos',
    baseCost: 10,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    type: 'click',
  },
  {
    id: 'click_2',
    name: 'Mano Firme',
    description: 'Tu mano es más precisa y fuerte',
    baseCost: 100,
    costMultiplier: 1.6,
    effect: 5,
    maxLevel: 50,
    type: 'click',
  },
  {
    id: 'click_3',
    name: 'Poder Digital',
    description: 'Tus dedos tienen poder sobrenatural',
    baseCost: 1000,
    costMultiplier: 1.7,
    effect: 25,
    maxLevel: 25,
    type: 'click',
  },
  // Passive upgrades
  {
    id: 'passive_1',
    name: 'Inversor Novato',
    description: 'Empieza a ganar dinero automáticamente',
    baseCost: 50,
    costMultiplier: 1.5,
    effect: 1,
    maxLevel: 100,
    type: 'passive',
  },
  {
    id: 'passive_2',
    name: 'Emprendedor',
    description: 'Tus inversiones generan más ganancias',
    baseCost: 500,
    costMultiplier: 1.6,
    effect: 5,
    maxLevel: 50,
    type: 'passive',
  },
  {
    id: 'passive_3',
    name: 'Magnate',
    description: 'Construye un imperio financiero',
    baseCost: 5000,
    costMultiplier: 1.7,
    effect: 25,
    maxLevel: 25,
    type: 'passive',
  },
];

// ============================================
// COMMANDS
// ============================================

async function list() {
  const upgrades = await UpgradeConfig.find({});
  console.log('\n=== MEJORAS DISPONIBLES ===\n');
  upgrades.forEach(u => {
    console.log(`ID: ${u.id}`);
    console.log(`  Nombre: ${u.name}`);
    console.log(`  Descripción: ${u.description}`);
    console.log(`  Costo base: ${u.baseCost}`);
    console.log(`  Multiplicador: ${u.costMultiplier}`);
    console.log(`  Efecto: +${u.effect} (${u.type})`);
    console.log(`  Nivel máximo: ${u.maxLevel}`);
    console.log(`  Habilitada: ${u.enabled ? 'Sí' : 'No'}`);
    console.log('---');
  });
  console.log(`\nTotal: ${upgrades.length} mejoras\n`);
}

async function add(jsonStr: string) {
  try {
    const data = JSON.parse(jsonStr);
    
    if (!data.id || !data.name || !data.baseCost) {
      console.error('Error: Faltan campos requeridos (id, name, baseCost)');
      process.exit(1);
    }
    
    const existing = await UpgradeConfig.findOne({ id: data.id });
    if (existing) {
      console.error(`Error: Ya existe una mejora con ID "${data.id}"`);
      process.exit(1);
    }
    
    const upgrade = await UpgradeConfig.create({
      id: data.id,
      name: data.name,
      description: data.description || '',
      baseCost: data.baseCost,
      costMultiplier: data.costMultiplier || 1.5,
      effect: data.effect || 1,
      maxLevel: data.maxLevel || 100,
      type: data.type || 'click',
      enabled: data.enabled !== false,
    });
    
    console.log(`✓ Mejora "${upgrade.name}" creada con ID "${upgrade.id}"`);
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : 'JSON inválido');
    process.exit(1);
  }
}

async function update(id: string, jsonStr: string) {
  try {
    const data = JSON.parse(jsonStr);
    const upgrade = await UpgradeConfig.findOne({ id });
    
    if (!upgrade) {
      console.error(`Error: No se encontró mejora con ID "${id}"`);
      process.exit(1);
    }
    
    if (data.name) upgrade.name = data.name;
    if (data.description) upgrade.description = data.description;
    if (data.baseCost) upgrade.baseCost = data.baseCost;
    if (data.costMultiplier) upgrade.costMultiplier = data.costMultiplier;
    if (data.effect) upgrade.effect = data.effect;
    if (data.maxLevel) upgrade.maxLevel = data.maxLevel;
    if (data.type) upgrade.type = data.type;
    if (data.enabled !== undefined) upgrade.enabled = data.enabled;
    
    await upgrade.save();
    console.log(`✓ Mejora "${upgrade.name}" actualizada`);
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : 'JSON inválido');
    process.exit(1);
  }
}

async function remove(id: string) {
  const upgrade = await UpgradeConfig.findOne({ id });
  
  if (!upgrade) {
    console.error(`Error: No se encontró mejora con ID "${id}"`);
    process.exit(1);
  }
  
  await UpgradeConfig.deleteOne({ id });
  console.log(`✓ Mejora "${upgrade.name}" eliminada`);
}

async function seed() {
  const count = await UpgradeConfig.countDocuments();
  
  if (count > 0) {
    console.log(`Ya existen ${count} mejoras en la base de datos.`);
    const response = await ask('¿Deseas reiniciar con los valores por defecto? (s/n): ');
    if (response.toLowerCase() !== 's') {
      console.log('Operación cancelada.');
      process.exit(0);
    }
    await UpgradeConfig.deleteMany({});
  }
  
  await UpgradeConfig.insertMany(DEFAULT_UPGRADES);
  console.log(`✓ ${DEFAULT_UPGRADES.length} mejoras creadas`);
}

// ============================================
// MAIN
// ============================================

function ask(question: string): Promise<string> {
  return new Promise(resolve => {
    process.stdout.write(question);
    process.stdin.once('data', d => resolve(d.toString().trim()));
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB');
  
  try {
    switch (command) {
      case 'list':
        await list();
        break;
      case 'add':
        if (!args[1]) {
          console.error('Usage: add <json>');
          console.error('Example: add \'{"id":"new_1","name":"Nueva","baseCost":100,"effect":2}\'');
          process.exit(1);
        }
        await add(args[1]);
        break;
      case 'update':
        if (!args[1] || !args[2]) {
          console.error('Usage: update <id> <json>');
          process.exit(1);
        }
        await update(args[1], args[2]);
        break;
      case 'delete':
        if (!args[1]) {
          console.error('Usage: delete <id>');
          process.exit(1);
        }
        await remove(args[1]);
        break;
      case 'seed':
        await seed();
        break;
      default:
        console.log(`
Administración de Mejoras del Juego

Usage:
  npx tsx scripts/manage-upgrades.ts list              - Listar todas las mejoras
  npx tsx scripts/manage-upgrades.ts add <json>       - Agregar nueva mejora
  npx tsx scripts/manage-upgrades.ts update <id> <json> - Actualizar mejora
  npx tsx scripts/manage-upgrades.ts delete <id>       - Eliminar mejora
  npx tsx scripts/manage-upgrades.ts seed              - Crear mejoras por defecto

Examples:
  add:    add '{"id":"click_4","name":"Super Click","baseCost":5000,"effect":50,"type":"click"}'
  update: update click_1 '{"baseCost":15,"effect":2}'
  delete: delete click_1

JSON fields:
  - id: string (unique)
  - name: string
  - description: string
  - baseCost: number
  - costMultiplier: number (default: 1.5)
  - effect: number
  - maxLevel: number
  - type: "click" | "passive"
  - enabled: boolean (default: true)
`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main();
