# Design: Migración de Prisma a Knex.js

## Technical Approach

Reemplazar Prisma ORM por Knex.js query builder para el proyecto clicker-game en MySQL. Mantener el schema existente (players, upgrade_configs) y migrar todas las queries Prisma → Knex. El enfoque es **big-bang**: reemplazar Prisma completamente, generar migraciones desde el schema actual, y eliminar el código Prisma.

## Architecture Decisions

### Decision: Knex.js como query builder

**Choice**: Knex.js 3.x
**Alternatives considered**: Raw mysql2, TypeORM, Drizzle ORM
**Rationale**: 
- ✅ Funciona en cPanel sin CLI (migraciones via npm scripts)
- ✅ Bundle pequeño (~1MB vs 17MB+ Prisma)
- ✅ API query builder similar a Prisma
- ✅ mysql2 driver ya instalado
- ✅ Migrations con rollback + Seeds

### Decision: Helper functions para tipos

**Choice**: Funciones helper `parsePlayerRow()` / `serializePlayerData()`
**Alternatives considered**: any/unknown, inline parsing
**Rationale**: 
- Reutilizable en todos los métodos
- Centraliza conversión BigInt → Number y JSON parse
- Testeable de forma aislada

### Decision: Eliminar Prisma completamente

**Choice**: Remove all Prisma files
**Alternatives considered**: Mantener dual (Prisma + Knex)
**Rationale**: 
- Reduce bundle y complejidad
- Evita conflictos de sincronización
- El proyecto usa ~1500 líneas Prisma-containes

## Data Flow

```
Cliente HTTP
    │
    ▼
src/api/routes/*.ts  ──► IdleGameService
    │                      │
    │                      ▼
    │               src/database/knex.ts
    │                      │
    │                      ▼
    └────────────────────► MySQL
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `knexfile.ts` | Create | Config Knex CLI con dev/prod |
| `src/database/knex.ts` | Create | Cliente Knex singleton |
| `src/database/types.ts` | Create | Interfaces Player, UpgradeConfig |
| `src/database/helpers.ts` | Create | parsePlayerRow, serializePlayerData |
| `src/database/connection.ts` | Create | Pool management |
| `src/database/index.ts` | Modify | Export Knex, no Prisma |
| `migrations/001_create_tables.js` | Create | CREATE players, upgrade_configs |
| `migrations/002_seed_upgrades.js` | Create | Seed upgrade_configs |
| `seeds/001_upgrades.js` | Create | Seed data helper |
| `src/services/IdleGameService.ts` | Modify | Reescribir Prisma → Knex |
| `src/api/routes/stats.ts` | Modify | Actualizar queries |
| `src/api/routes/leaderboard.ts` | Modify | Actualizar queries |
| `src/api/routes/health.ts` | Modify | Knex health check |
| `prisma/schema.prisma` | Delete | Reemplazado por knexfile |
| `prisma/` (entire) | Delete | Eliminar directorio |
| `src/database/generated/` | Delete | Eliminar cliente Prisma |
| `src/database/prisma.ts` | Delete | Reemplazado por knex.ts |
| `src/database/repositories/` | Delete | Repositorios Prisma |
| `package.json` | Modify | Remover @prisma/client, agregar knex |

## Interfaces / Contracts

### Types (src/database/types.ts)

```typescript
export interface Player {
  id: string;
  playerId: string;
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: PlayerUpgrade[];
  shopUpgrades: PlayerUpgrade[];
  lastUpdate: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  type: 'click' | 'passive';
  tier: number;
  enabled: boolean;
}
```

### Helpers (src/database/helpers.ts)

```typescript
import type { Player } from './types';

export function parsePlayerRow(row: any): Player {
  return {
    ...row,
    coins: Number(row.coins),
    coinsPerClick: Number(row.coins_per_click),
    coinsPerSecond: Number(row.coins_per_second),
    lastUpdate: Number(row.last_update),
    upgrades: typeof row.upgrades === 'string' ? JSON.parse(row.upgrades) : row.upgrades ?? [],
    shopUpgrades: typeof row.shop_upgrades === 'string' ? JSON.parse(row.shop_upgrades) : row.shop_upgrades ?? [],
  };
}

export function serializePlayerData(data: Partial<Player>) {
  return {
    ...data,
    upgrades: typeof data.upgrades === 'object' ? JSON.stringify(data.upgrades) : data.upgrades,
    shopUpgrades: typeof data.shopUpgrades === 'object' ? JSON.stringify(data.shopUpgrades) : data.shopUpgrades,
    last_update: BigInt(Date.now()).toString(),
  };
}
```

### Knex Client (src/database/knex.ts)

```typescript
import knex from 'knex';
import config from '../../knexfile';

const db = knex(config[process.env.NODE_ENV || 'development']);

export default db;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | helpers.ts parse/serialize | Vitest with mock rows |
| Integration | IdleGameService methods | Test against local MySQL |
| E2E | API routes full flow | Playwright/CI |

## Migration / Rollback

### Deploy en cPanel

```bash
# 1. Local: generar migraciones
npm run db:migrate:make init_schema

# 2. Push cambios
git push

# 3. cPanel: ejecutar migraciones
npm run db:migrate

# 4. O aplicar SQL manualmente en phpMyAdmin
# Los archivos en migrations/ contienen el SQL
```

### Rollback Plan

1. Mantener backup del schema Prisma actual (`prisma/migrations/`)
2. Script `scripts/reset-database-prisma.js` para restaurar si falla
3. Feature flag para switch Prisma/Knex durante transición (opcional)

## Open Questions

- [ ] ¿Ejecutar migraciones Knex en cPanel o aplicar SQL manualmente via phpMyAdmin?
- [ ] ¿Mantener los repositorios existentes (ports/adapters) o integrar queries directamente en IdleGameService?

## Summary

- **Approach**: Big-bang replacement de Prisma por Knex.js
- **Key Decisions**: Knex por compatibilidad cPanel, helpers para tipos, eliminación completa de Prisma
- **Files Affected**: 4 new, 6 modified, 4 deleted directories
- **Testing Strategy**: Unit helpers + Integration IdleGameService
