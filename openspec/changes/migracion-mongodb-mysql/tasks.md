# Tasks: Migración MongoDB → MySQL con Prisma ORM

## Phase 1: Instalación y Configuración (Foundation)

- [ ] 1.1 Instalar dependencias Prisma (`npm install prisma @prisma/client --save`)
- [ ] 1.2 Inicializar Prisma con MySQL (`npx prisma init --datasource-provider mysql`)
- [ ] 1.3 Configurar `prisma/schema.prisma` con datasource mysql y generator
- [ ] 1.4 Crear archivo `.env` con `DATABASE_URL=mysql://user:pass@host:3306/dbname`
- [ ] 1.5 Crear archivo `.env.example` sin credenciales reales

## Phase 2: Schema y Migraciones (Core)

- [ ] 2.1 Definir modelo `Player` en `prisma/schema.prisma` (id, playerId, coins, coinsPerClick, coinsPerSecond, upgrades Json, shopUpgrades Json, lastUpdate BigInt, timestamps)
- [ ] 2.2 Definir modelo `UpgradeConfig` en `prisma/schema.prisma` (id, name, description, baseCost, costMultiplier, effect, maxLevel, type, tier, enabled, timestamps)
- [ ] 2.3 Generar migración inicial (`npx prisma migrate dev --name init`)
- [ ] 2.4 Generar Prisma Client (`npx prisma generate`)
- [ ] 2.5 Verificar SQL en `prisma/migrations/*/migration.sql`

## Phase 3: Repositorios Prisma (Core Implementation)

- [ ] 3.1 Crear cliente singleton `src/database/prisma.ts` (con globalThis para desarrollo)
- [ ] 3.2 Crear `src/database/repositories/PrismaPlayerRepository.ts` (implementa PlayerRepository)
- [ ] 3.3 Crear `src/database/repositories/PrismaUpgradeConfigRepository.ts` (implementa UpgradeConfigRepository)
- [ ] 3.4 Registrar adapters en `src/database/adapterFactory.ts` con feature flag `USE_PRISMA_ADAPTER`
- [ ] 3.5 Exportar nuevos módulos desde `src/database/index.ts`

## Phase 4: Seed de Datos (Infrastructure)

- [ ] 4.1 Crear directorio `prisma/seed-data/`
- [ ] 4.2 Crear `prisma/seed-data/upgrades.json` con los 66 upgrades (10 tiers)
- [ ] 4.3 Crear script `prisma/seed.ts` para插入/upsert upgrades
- [ ] 4.4 Crear script `scripts/reset-database.ts` (drop → migrate → seed)
- [ ] 4.5 Configurar `"prisma": {"seed": "ts-node prisma/seed.ts"}` en package.json

## Phase 5: Scripts de Mantenimiento (DevOps)

- [ ] 5.1 Agregar scripts npm: `db:migrate`, `db:migrate:prod`, `db:seed`, `db:reset`, `db:studio`
- [ ] 5.2 Crear script `scripts/migrate-data-from-mongodb.ts` para migración de datos existentes
- [ ] 5.3 Crear documentación `docs/database-migration.md` con workflow paso a paso

## Phase 6: Testing (Verification)

- [ ] 6.1 Verificar conexión local a MySQL (`npx prisma db pull` o `db push`)
- [ ] 6.2 Probar CRUD completo de Player (create, read, update, delete)
- [ ] 6.3 Probar consultas de UpgradeConfig (filter by tier, filter by enabled)
- [ ] 6.4 Probar `npm run db:reset` ejecuta completamente
- [ ] 6.5 Probar serialización/deserialización JSON de upgrades
- [ ] 6.6 Exportar SQL y verificar ejecución en phpMyAdmin local

## Phase 7: Documentación (Cleanup)

- [ ] 7.1 Documentar schema de migraciones en README de prisma
- [ ] 7.2 Documentar proceso de deployment en cPanel (phpMyAdmin workflow)
- [ ] 7.3 Documentar rollback procedure (USE_PRISMA_ADAPTER=false)
- [ ] 7.4 Actualizar archivo principal README.md del proyecto

---

## Verificación de Éxito

| Tarea | Criterio |
|-------|----------|
| Schema | `npx prisma validate` pasa sin errores |
| Migración | `npx prisma migrate status` muestra "applied" |
| Seed | 66 upgrades en tabla upgrade_configs |
| Repositories | Tests unitarios pasan (mock PrismaClient) |
| CRUD | Player CRUD funciona via API |
| Reset | `npm run db:reset` deja DB en estado limpio |
| Export | SQL ejecutable en phpMyAdmin |

## Orden de Implementación Recomendada

1. **Fase 1→2** primero (Foundation): Sin schema no hay nada
2. **Fase 3** después (Repositories): Dependen del schema generado
3. **Fase 4** en paralelo (Seed): Datos iniciales necesarios para tests
4. **Fase 5** (Scripts): Automatizan tareas repetitivas
5. **Fase 6** (Testing): Verifica que todo funciona
6. **Fase 7** (Docs): Al final, cuando todo está estable
