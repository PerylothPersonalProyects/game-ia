# Prisma Workflow Guide

## Quick Reference

### Development Commands

```bash
# Start development with hot-reload
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Database Commands

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Push schema without migration history
npm run prisma:push

# Seed data
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Full reset (delete all data, recreate schema, seed)
npm run db:prisma:reset
```

## Workflows

### Schema-First Development

When you need to add a new table or column:

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration with description
npm run prisma:migrate --name add_new_feature

# 3. Apply migration
npm run prisma:migrate

# 4. Verify in Prisma Studio
npm run prisma:studio
```

### Direct Schema Push (No Migration History)

When you want to sync schema without creating migration files:

```bash
# 1. Edit prisma/schema.prisma
# 2. Push to database
npm run prisma:push

# Warning: This doesn't create migration files!
# Use only for development or when you manage schema manually.
```

### Deploy to Production (cPanel with MySQL 5.7)

**IMPORTANT**: MySQL 5.7 does NOT support `DEFAULT ("[]")` for JSON columns.
Use the pre-built SQL files instead of Prisma CLI migrations.

```bash
# 1. Open phpMyAdmin

# 2. Create database if needed
#    - Go to SQL tab
#    - Run: CREATE DATABASE clicker_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Import schema (NO JSON defaults - MySQL 5.7 compatible)
#    - Select database
#    - Go to Import tab
#    - Upload prisma/migrations/production_mysql57.sql

# 4. Import seed data (66 upgrades)
#    - Go to Import tab
#    - Upload prisma/migrations/production_seed.sql

# 5. Verify tables created
#    - Check 'players' table exists
#    - Check 'upgrade_configs' table has 66 rows
```

#### Files for MySQL 5.7 Production

| File | Purpose |
|------|---------|
| `prisma/migrations/production_mysql57.sql` | Schema without JSON defaults |
| `prisma/migrations/production_seed.sql` | 66 upgrades seed data |

#### Schema Notes

- `players.upgrades` and `players.shop_upgrades` are nullable JSON columns
- The application initializes empty arrays `[]` in code, not in database
- Prisma schema (`schema.prisma`) uses `@default("[]")` for local development only

### Add New Upgrade

```bash
# 1. Edit prisma/seed-data/upgrades.json
#    Add new upgrade object

# 2. Run seed to apply
npm run prisma:seed
```

### Reset Database

```bash
# Full reset (WARNING: deletes ALL data)
npm run db:prisma:reset

# This runs:
# 1. prisma db push --force-reset
# 2. prisma seed
```

## Prisma Studio

Prisma Studio provides a GUI to:
- View and edit data
- Browse tables
- Execute queries
- Manage relations

```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

## Common Issues

### Schema Validation Fails

```
Error: P1012: Environment variable not found: DATABASE_URL
```

**Solution**: Create `.env` file with `DATABASE_URL`

### Client Not Generated

```
Error: Cannot find module '@prisma/client'
```

**Solution**: 
```bash
npm run prisma:generate
```

### Migration Conflict

```
Error: P3009: found migrated 5 migrations but the schema is different
```

**Solution**: 
```bash
# Option 1: Reset migrations
npm run db:prisma:reset

# Option 2: Mark migration as rolled back
npx prisma migrate resolve --rolled-back "migration_name"
```

## File Locations

| File                     | Purpose                              |
|-------------------------|--------------------------------------|
| `prisma/schema.prisma`  | Database schema definition           |
| `prisma/seed.ts`        | Database seeding script              |
| `prisma/seed-data/`     | JSON data files for seeding          |
| `src/database/prisma.ts`| Prisma client singleton              |
| `src/database/repositories/` | Repository implementations    |

## Environment Configuration

### Development

```env
DATABASE_URL="mysql://root:@localhost:3306/clicker_game"
```

### Production (cPanel)

```env
DATABASE_URL="mysql://user:password@localhost/database"
```

## Tips

1. **Always run `prisma:generate`** after installing or updating dependencies
2. **Use `prisma:push`** for quick schema changes during development
3. **Use migrations** for production deployments
4. **Keep `upgrades.json` in sync** with any upgrade configuration changes
5. **Test seed script** with `npm run prisma:seed` before deploying
