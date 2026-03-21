// ============================================
// PRISMA PHPMyAdmin DEPLOY SCRIPT
// ============================================
// Generates SQL migration files for manual deployment to phpMyAdmin

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

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
  console.log('📝 Generating SQL for phpMyAdmin deployment...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputDir = path.join(__dirname, '..', 'prisma', 'migrations', `${timestamp}_deploy`);
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate schema SQL
  const schemaSQL = `-- ============================================
-- Clicker Game - MySQL Schema
-- Generated: ${new Date().toISOString()}
-- For deployment via phpMyAdmin
-- ============================================

-- Create players table
CREATE TABLE IF NOT EXISTS \`players\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`player_id\` VARCHAR(191) NOT NULL,
    \`coins\` INT NOT NULL DEFAULT 0,
    \`coins_per_click\` INT NOT NULL DEFAULT 1,
    \`coins_per_second\` DOUBLE NOT NULL DEFAULT 0,
    \`upgrades\` JSON NOT NULL DEFAULT ('[]'),
    \`shop_upgrades\` JSON NOT NULL DEFAULT ('[]'),
    \`last_update\` BIGINT NOT NULL,
    \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (\`id\`),
    UNIQUE INDEX \`players_player_id_key\` (\`player_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create upgrade_configs table
CREATE TABLE IF NOT EXISTS \`upgrade_configs\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`name\` VARCHAR(191) NOT NULL,
    \`description\` TEXT,
    \`base_cost\` INT NOT NULL,
    \`cost_multiplier\` DOUBLE NOT NULL DEFAULT 1.15,
    \`effect\` DOUBLE NOT NULL,
    \`max_level\` INT NOT NULL DEFAULT 999,
    \`type\` VARCHAR(191) NOT NULL,
    \`tier\` INT NOT NULL DEFAULT 1,
    \`enabled\` BOOLEAN NOT NULL DEFAULT true,
    \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (\`id\`),
    INDEX \`upgrade_configs_type_idx\` (\`type\`),
    INDEX \`upgrade_configs_tier_idx\` (\`tier\`),
    INDEX \`upgrade_configs_enabled_idx\` (\`enabled\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

  const schemaPath = path.join(outputDir, '001_schema.sql');
  fs.writeFileSync(schemaPath, schemaSQL);
  console.log(`✅ Schema SQL saved to: ${schemaPath}`);

  // Generate seed SQL for upgrades
  const seedDataPath = path.join(__dirname, '..', 'prisma', 'seed-data', 'upgrades.json');
  const upgrades: UpgradeSeed[] = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

  let seedSQL = `-- ============================================
-- Clicker Game - Upgrade Configs Seed Data
-- Generated: ${new Date().toISOString()}
-- Total upgrades: ${upgrades.length}
-- ============================================

-- Disable foreign key checks for seed
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
DELETE FROM \`upgrade_configs\`;

-- Insert upgrades
INSERT INTO \`upgrade_configs\` (\`id\`, \`name\`, \`description\`, \`base_cost\`, \`cost_multiplier\`, \`effect\`, \`max_level\`, \`type\`, \`tier\`, \`enabled\`) VALUES
`;

  const values = upgrades.map((u) => {
    const desc = u.description.replace(/'/g, "''");
    return `('${u.id}', '${u.name.replace(/'/g, "''")}', '${desc}', ${u.baseCost}, ${u.costMultiplier}, ${u.effect}, ${u.maxLevel}, '${u.type}', ${u.tier}, ${u.enabled})`;
  });

  seedSQL += values.join(',\n');
  seedSQL += '\n;\n\n-- Re-enable foreign key checks\nSET FOREIGN_KEY_CHECKS = 1;\n';

  const seedPath = path.join(outputDir, '002_seed_upgrades.sql');
  fs.writeFileSync(seedPath, seedSQL);
  console.log(`✅ Seed SQL saved to: ${seedPath}`);

  // Generate README for deployment
  const readme = `# phpMyAdmin Deployment Guide

## Generated Files

1. \`001_schema.sql\` - Creates database tables
2. \`002_seed_upgrades.sql\` - Seeds the upgrade configurations

## Deployment Steps

### Option 1: Import via phpMyAdmin

1. Log in to phpMyAdmin on your cPanel hosting
2. Select your database (or create one if needed)
3. Click on "Import" tab
4. Upload \`001_schema.sql\` first
5. Upload \`002_seed_upgrades.sql\` second

### Option 2: Manual SQL execution

1. Open phpMyAdmin
2. Select your database
3. Click on "SQL" tab
4. Copy and paste the contents of each file

## Verification

After deployment, run this query to verify:

\`\`\`sql
SELECT COUNT(*) as total_upgrades FROM upgrade_configs;
\`\`\`

Expected result: ${upgrades.length} upgrades

## Database Connection

Make sure your \`.env\` file has the correct DATABASE_URL:

\`\`\`
DATABASE_URL="mysql://your_user:your_password@localhost/your_database"
\`\`\`

## Troubleshooting

- If you get "Table already exists" errors, run schema first
- If you get encoding issues, ensure UTF-8 encoding is selected
- For large imports, increase PHP memory limit in phpMyAdmin
`;

  const readmePath = path.join(outputDir, 'README.md');
  fs.writeFileSync(readmePath, readme);
  console.log(`✅ README saved to: ${readmePath}`);

  console.log('\n📦 Deployment package created successfully!');
  console.log(`   Location: ${outputDir}\n`);
}

main()
  .catch((error) => {
    console.error('\n❌ Error generating SQL:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
