// ============================================
// PRISMA SEED SCRIPT
// ============================================
// Seeds the database with all 66 upgrades

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Type for upgrade data from JSON
interface UpgradeSeed {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  type: string;
  tier: number;
  enabled: boolean;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Path to upgrades JSON file
  const seedDataPath = path.join(__dirname, 'seed-data', 'upgrades.json');
  
  if (!fs.existsSync(seedDataPath)) {
    throw new Error(`Seed data file not found: ${seedDataPath}`);
  }

  const upgrades: UpgradeSeed[] = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
  console.log(`📦 Found ${upgrades.length} upgrades to seed\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const upgrade of upgrades) {
    try {
      const existing = await prisma.upgradeConfig.findUnique({
        where: { id: upgrade.id },
      });

      if (existing) {
        // Check if data is different
        const isDifferent =
          existing.name !== upgrade.name ||
          existing.description !== upgrade.description ||
          existing.baseCost !== upgrade.baseCost ||
          existing.costMultiplier !== upgrade.costMultiplier ||
          existing.effect !== upgrade.effect ||
          existing.maxLevel !== upgrade.maxLevel ||
          existing.type !== upgrade.type ||
          existing.tier !== upgrade.tier ||
          existing.enabled !== upgrade.enabled;

        if (isDifferent) {
          await prisma.upgradeConfig.update({
            where: { id: upgrade.id },
            data: {
              name: upgrade.name,
              description: upgrade.description,
              baseCost: upgrade.baseCost,
              costMultiplier: upgrade.costMultiplier,
              effect: upgrade.effect,
              maxLevel: upgrade.maxLevel,
              type: upgrade.type,
              tier: upgrade.tier,
              enabled: upgrade.enabled,
            },
          });
          console.log(`  🔄 Updated: ${upgrade.id} (${upgrade.name})`);
          updated++;
        } else {
          console.log(`  ⏭️  Skipped (unchanged): ${upgrade.id}`);
          skipped++;
        }
      } else {
        await prisma.upgradeConfig.create({
          data: {
            id: upgrade.id,
            name: upgrade.name,
            description: upgrade.description,
            baseCost: upgrade.baseCost,
            costMultiplier: upgrade.costMultiplier,
            effect: upgrade.effect,
            maxLevel: upgrade.maxLevel,
            type: upgrade.type,
            tier: upgrade.tier,
            enabled: upgrade.enabled,
          },
        });
        console.log(`  ✅ Created: ${upgrade.id} (${upgrade.name})`);
        created++;
      }
    } catch (error) {
      console.error(`  ❌ Error seeding ${upgrade.id}:`, error);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SEED SUMMARY');
  console.log('='.repeat(50));
  console.log(`  ✅ Created: ${created}`);
  console.log(`  🔄 Updated: ${updated}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  📦 Total: ${created + updated + skipped}`);

  // Print statistics by tier
  console.log('\n📈 UPGRADES BY TIER');
  console.log('-'.repeat(40));
  for (let tier = 1; tier <= 10; tier++) {
    const tierUpgrades = upgrades.filter(u => u.tier === tier);
    const clickCount = tierUpgrades.filter(u => u.type === 'click').length;
    const passiveCount = tierUpgrades.filter(u => u.type === 'passive').length;
    const typeEmoji = tier <= 3 ? '🌱' : tier <= 6 ? '⚡' : tier <= 8 ? '🔥' : '💎';
    console.log(`  ${typeEmoji} Tier ${tier}: ${clickCount} click + ${passiveCount} passive = ${tierUpgrades.length} total`);
  }

  // Count by type
  const clickUpgrades = upgrades.filter(u => u.type === 'click').length;
  const passiveUpgrades = upgrades.filter(u => u.type === 'passive').length;
  console.log('\n📈 UPGRADES BY TYPE');
  console.log('-'.repeat(40));
  console.log(`  🖱️  Click upgrades: ${clickUpgrades}`);
  console.log(`  ⏰ Passive upgrades: ${passiveUpgrades}`);

  console.log('\n🎉 Seed completed successfully!\n');
}

main()
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
