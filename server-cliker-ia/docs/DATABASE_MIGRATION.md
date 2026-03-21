# Database Migration: MongoDB → MySQL with Prisma

## Overview

This document describes the migration from MongoDB to MySQL using Prisma ORM for the Clicker Game project.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Use Cases   │  │ Controllers │  │ Socket Handlers     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │              │
│         ▼                ▼                     ▼              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   PORTS (Interfaces)                  │    │
│  │  ┌─────────────────┐  ┌─────────────────────────┐   │    │
│  │  │ PlayerRepository│  │ UpgradeConfigRepository│   │    │
│  │  └────────┬────────┘  └───────────┬────────────┘   │    │
│  └───────────┼───────────────────────┼─────────────────┘    │
└──────────────┼───────────────────────┼──────────────────────┘
               │                       │
               ▼                       ▼
┌───────────────────────────────────────────────────────────────┐
│                    ADAPTERS Layer                             │
│                                                                │
│  ┌────────────────────┐    ┌────────────────────┐              │
│  │ InMemory (Tests)   │    │ Prisma (MySQL)    │              │
│  └────────────────────┘    └────────────────────┘              │
└───────────────────────────────────────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────────────────────────┐
│                    DATABASE Layer                             │
│                                                                │
│  ┌────────────────────┐    ┌────────────────────┐              │
│  │ MongoDB (Legacy)   │    │ MySQL (New)        │              │
│  │ mongoose          │    │ prisma + mysql2    │              │
│  └────────────────────┘    └────────────────────┘              │
└───────────────────────────────────────────────────────────────┘
```

## Schema

### Players Table

| Column          | Type         | Default     | Description                    |
|-----------------|--------------|-------------|--------------------------------|
| id              | VARCHAR(191) | uuid()      | Primary key                    |
| player_id       | VARCHAR(191) | -           | Unique player identifier       |
| coins           | INT          | 0           | Current coin balance           |
| coins_per_click | INT          | 1           | Coins earned per click         |
| coins_per_second| DOUBLE       | 0           | Passive income rate            |
| upgrades        | JSON         | []          | Purchased upgrades             |
| shop_upgrades   | JSON         | []          | Available shop upgrades        |
| last_update     | BIGINT       | -           | Timestamp for offline progress |
| created_at      | DATETIME     | now()       | Creation timestamp             |
| updated_at      | DATETIME     | now()       | Last update timestamp          |

### Upgrade Configs Table

| Column          | Type         | Default     | Description                    |
|-----------------|--------------|-------------|--------------------------------|
| id              | VARCHAR(191) | -           | Primary key (e.g., "click_1_1")|
| name            | VARCHAR(191) | -           | Display name                   |
| description     | TEXT         | -           | Upgrade description            |
| base_cost       | INT          | -           | Starting price                 |
| cost_multiplier | DOUBLE       | 1.15        | Price increase per level      |
| effect          | DOUBLE       | -           | Effect value                   |
| max_level       | INT          | 999         | Maximum purchasable level      |
| type            | VARCHAR(191) | -           | "click" or "passive"           |
| tier            | INT          | 1           | Tier 1-10                      |
| enabled         | BOOLEAN      | true        | Availability flag              |
| created_at      | DATETIME     | now()       | Creation timestamp             |
| updated_at      | DATETIME     | now()       | Last update timestamp          |

## Workflows

### Development (Local)

```bash
# 1. Install dependencies (already done)
npm install prisma @prisma/client mysql2

# 2. Generate Prisma client
npm run prisma:generate

# 3. Create a migration
npm run prisma:migrate --name add_new_field

# 4. Apply migrations
npm run prisma:migrate

# 5. Seed data
npm run prisma:seed

# 6. Open Prisma Studio (GUI)
npm run prisma:studio

# 7. Full reset (WARNING: deletes all data)
npm run db:prisma:reset
```

### Production (cPanel/phpMyAdmin)

```bash
# 1. Generate deployment SQL files
npm run db:mysql:deploy

# 2. Files are created at:
#    prisma/migrations/TIMESTAMP_deploy/
#    ├── 001_schema.sql
#    ├── 002_seed_upgrades.sql
#    └── README.md

# 3. In phpMyAdmin:
#    a. Select your database
#    b. Click "Import"
#    c. Upload 001_schema.sql first
#    d. Upload 002_seed_upgrades.sql second
```

## Commands Reference

| Command              | Description                              |
|---------------------|------------------------------------------|
| `npm run prisma:generate` | Generate Prisma Client                 |
| `npm run prisma:migrate`   | Create and apply migrations            |
| `npm run prisma:push`      | Push schema to database (no migrations)|
| `npm run prisma:seed`      | Seed database with upgrades            |
| `npm run prisma:studio`    | Open Prisma Studio GUI                 |
| `npm run db:prisma:reset`  | Reset database and reseed              |
| `npm run db:mysql:deploy`  | Generate SQL for phpMyAdmin           |
| `npm run db:mysql:reset`   | Reset MySQL database (drops tables)   |

## Upgrades Structure

The game includes 66 upgrades organized in 10 tiers:

| Tier | Click Upgrades | Passive Upgrades | Total |
|------|----------------|------------------|-------|
| 1    | 3              | 4                | 7     |
| 2    | 3              | 4                | 7     |
| 3    | 4              | 4                | 8     |
| 4    | 4              | 4                | 8     |
| 5    | 5              | 5                | 10    |
| 6    | 4              | 4                | 8     |
| 7    | 3              | 3                | 6     |
| 8    | 2              | 2                | 4     |
| 9    | 2              | 2                | 4     |
| 10   | 2              | 2                | 4     |
| **Total** | **32**     | **34**           | **66**|

## Environment Variables

### Development (.env)

```env
DATABASE_URL="mysql://root:@localhost:3306/clicker_game"
```

### Production (cPanel)

```env
DATABASE_URL="mysql://tu_usuario:tu_password@localhost/tu_base_de_datos"
```

## Troubleshooting

### Can't reach database

```
Error: P1001: Can't reach database server at `localhost:3306`
```

**Solution**: Make sure MySQL is running. On Windows, check XAMPP/WAMP services.

### Connection refused

```
Error: P1001: Can't reach database server
```

**Solution**: Check that the DATABASE_URL is correct. Common issues:
- Wrong port (default is 3306)
- Wrong credentials
- Database doesn't exist

### Prisma Client not generated

```
Error: Cannot find module '@prisma/client'
```

**Solution**: Run `npm run prisma:generate`

### Migration failed

```
Error: P1003: Database [...] does not exist
```

**Solution**: Create the database first in phpMyAdmin or MySQL CLI.

## File Structure

```
server-cliker-ia/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Seed script
│   ├── seed-data/
│   │   └── upgrades.json          # 66 upgrades data
│   └── migrations/
│       ├── 20260321000000_init/   # Initial migration
│       │   └── migration.sql
│       └── migration_lock.toml
├── src/
│   └── database/
│       ├── prisma.ts              # Prisma client singleton
│       ├── repositories/
│       │   ├── PrismaPlayerRepository.ts
│       │   ├── PrismaUpgradeConfigRepository.ts
│       │   └── index.ts
│       └── index.ts
├── scripts/
│   ├── reset-database-mysql.ts    # MySQL reset script
│   └── generate-mysql-deploy.ts   # phpMyAdmin deployment
└── docs/
    └── DATABASE_MIGRATION.md      # This file
```

## Migration Notes

1. **JSON Fields**: MySQL stores `upgrades` and `shopUpgrades` as JSON, maintaining compatibility with the domain layer.

2. **BigInt for timestamps**: `lastUpdate` uses BigInt to store timestamps, matching MongoDB's approach.

3. **Existing In-Memory adapters**: The `src/adapters/in-memory/` adapters remain for testing purposes and are not affected by this migration.

4. **Backward Compatibility**: The port interfaces (`PlayerRepository`, `UpgradeConfigRepository`) are unchanged, ensuring compatibility with existing use cases.
