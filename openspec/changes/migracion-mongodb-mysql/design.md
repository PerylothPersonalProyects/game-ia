# Design: Migración MongoDB → MySQL con Prisma ORM

## Technical Approach

Migración del backend de MongoDB/Mongoose a MySQL/Prisma ORM manteniendo la arquitectura hexagonal existente (Puerto/Adaptador). El strategy es:
1. Crear Prisma schema que mapea las entidades existentes Player y UpgradeConfig
2. Generar migraciones SQL locales ejecutables en phpMyAdmin (sin acceso shell)
3. Implementar nuevos adapters Prisma que satisfacen las interfaces existentes
4. Mantener adapters in-memory para tests

## Architecture Decisions

### Decision: JSON columns para arrays embebidos

**Choice**: Usar `Json` type de MySQL para `upgrades` y `shop_upgrades`
**Alternatives considered**: Tablas N:M separadas, JSON como TEXT
**Rationale**: Arrays pequeños (<50 items) no necesitan queries internas; MySQL 5.7 soporta JSON nativo con validación.

### Decision: snake_case en MySQL, camelCase en dominio

**Choice**: `@map("player_id")` en campos Prisma
**Alternatives considered**: camelCase directo en DB
**Rationale**: MySQL conventionally usa snake_case; Prisma `@map` permite mantener código TypeScript en camelCase.

### Decision: BIGINT para lastUpdate

**Choice**: `BigInt` en schema Prisma
**Alternatives considered**: DATETIME, TIMESTAMP
**Rationale**: Mantiene compatibilidad con timestamps de MongoDB (epoch ms); evita timezone issues en cálculos de offline earnings.

### Decision: UUID para primary key

**Choice**: `@id @default(uuid())`
**Alternatives considered**: AUTO_INCREMENT
**Rationale**: Mejor para sistemas distribuidos; sin colisiones entre environments.

### Decision: Feature flag para switch de adapters

**Choice**: Variable de entorno `USE_PRISMA_ADAPTER=true/false`
**Alternatives considered**: Código condicional con rebuild
**Rationale**: Permite rollback rápido sin deployment; útil para testing.

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                       │
│  ├── Use Cases (src/usecases/)                          │
│  └── Services (src/services/)                          │
└───────────────────────┬─────────────────────────────────┘
                        │ uses PlayerRepository interface
                        ▼
┌─────────────────────────────────────────────────────────┐
│ PORT (CONTRACT)                                         │
│  └── src/ports/index.ts (PlayerRepository, Upgrade...)  │
└───────────────────────┬─────────────────────────────────┘
                        │ implements
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ InMemory      │ │ Prisma        │ │ MongoDB       │
│ (tests only)  │ │ (production)  │ │ (fallback)   │
└───────────────┘ └───────────────┘ └───────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Create | Schema Prisma con Player y UpgradeConfig |
| `prisma/migrations/YYYYMMDD_init/` | Create | Migration SQL inicial |
| `prisma/seed-data/upgrades.json` | Create | 66 upgrades en JSON |
| `prisma/seed.ts` | Create | Script de seed |
| `src/database/prisma.ts` | Create | Cliente Prisma singleton |
| `src/database/repositories/PrismaPlayerRepository.ts` | Create | Implementación PlayerRepository |
| `src/database/repositories/PrismaUpgradeConfigRepository.ts` | Create | Implementación UpgradeConfigRepository |
| `src/database/connection.ts` | Modify | Mantener fallback MongoDB existente |
| `scripts/migrate-data-from-mongodb.ts` | Create | Script one-time data migration |
| `scripts/reset-database.ts` | Create | Reset + migrate + seed |

## Interfaces / Contracts

### Nuevo: Prisma Client Module

```typescript
// src/database/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Schema Prisma (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Player {
  id             String   @id @default(uuid())
  playerId       String   @unique @map("player_id")
  coins          Int      @default(0)
  coinsPerClick  Int      @default(1) @map("coins_per_click")
  coinsPerSecond Float    @default(0) @map("coins_per_second")
  upgrades       Json     @default("[]")
  shopUpgrades   Json     @default("[]") @map("shop_upgrades")
  lastUpdate     BigInt   @map("last_update")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("players")
}

model UpgradeConfig {
  id              String   @id
  name            String
  description     String?  @db.Text
  baseCost        Int      @map("base_cost")
  costMultiplier  Float    @default(1.15) @map("cost_multiplier")
  effect          Float
  maxLevel        Int      @default(999) @map("max_level")
  type            String   // 'click' | 'passive'
  tier            Int      @default(1)
  enabled         Boolean  @default(true)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("upgrade_configs")
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | PrismaPlayerRepository methods | Mock PrismaClient |
| Unit | JSON serialization/deserialization | Vitest |
| Integration | Full CRUD flow | Test against local MySQL container |
| E2E | API endpoints with new adapter | Playwright + real DB |

## Migration / Rollout

```
PHASE 1: Local Development
1. npx prisma init
2. Create schema.prisma
3. npx prisma migrate dev --name init
4. npx prisma generate
5. Implement repositories
6. npm run prisma:seed
7. Run tests

PHASE 2: Export SQL
1. npx prisma migrate dev --create-only
2. Copy SQL from prisma/migrations/*/migration.sql

PHASE 3: Production (cPanel)
1. phpMyAdmin → Import → paste SQL
2. Verify tables created
3. npm run prisma:seed (if shell available) or manual INSERT

PHASE 4: Switchover
1. Set USE_PRISMA_ADAPTER=true
2. Deploy new backend
3. Monitor for errors
4. If issues: USE_PRISMA_ADAPTER=false (rollback)
```

## Open Questions

- [ ] ¿El hosting cPanel tiene MySQL JSON functions habilitadas?
- [ ] ¿Hay capacidad para crear índices adicionales en `shop_upgrades.type`?
- [ ] ¿Se necesita mantener datos históricos de producción para migración?

## Environment Variables

```env
# Development
DATABASE_URL="mysql://admin:admin123@localhost:3306/clicker_game"
USE_PRISMA_ADAPTER=true

# Production
DATABASE_URL="mysql://user_cpanel:pass@localhost/clicker_game"
USE_PRISMA_ADAPTER=true
```
