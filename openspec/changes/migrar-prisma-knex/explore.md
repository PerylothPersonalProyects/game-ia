# Exploración: Migración de Prisma a Knex

## Resumen Ejecutivo

**RECOMENDACIÓN: PROCEDER CON LA MISMO - VIABLE**

La migración de Prisma a Knex para este proyecto clicker-game en MySQL es **VIABLE y RECOMENDABLE**. El código Prisma está contenido (~1500 líneas de código fuente), los modelos son simples (2 tablas), y Knex resuelve el problema del hosting compartido (cPanel) donde Prisma CLI no funciona.

---

## Current State

### Archivos Fuentes Prisma (8 archivos)

| Archivo | Líneas | Uso Principal |
|---------|--------|---------------|
| `src/services/IdleGameService.ts` | 853 | **Servicio principal** - todas las operaciones CRUD de juego |
| `src/api/routes/stats.ts` | 265 | Estadísticas globales con aggregate |
| `src/api/routes/leaderboard.ts` | 253 | Rankings con orderBy/limit |
| `src/api/routes/health.ts` | 90 | Health check con queryRaw |
| `src/database/repositories/PrismaPlayerRepository.ts` | 141 | Repository pattern Player |
| `src/database/repositories/PrismaUpgradeConfigRepository.ts` | 118 | Repository pattern UpgradeConfig |
| `src/database/prisma.ts` | 24 | Cliente singleton Prisma |
| `src/index.ts` + database/index.ts | ~40 | Entry points |

**Total código fuente: ~1,500 líneas**

### Archivos Generados (17MB+)
- Query engines (Windows DLL ~21MB, Linux .so ~17MB, WASM ~2MB)
- Runtime libraries para múltiples plataformas
- Type definitions (138KB+ index.d.ts)

### Modelos Prisma (2 tablas simples)

**Player:**
- id (UUID), playerId (unique), coins, coinsPerClick, coinsPerSecond
- upgrades (JSON), shopUpgrades (JSON)
- lastUpdate (BigInt), createdAt, updatedAt

**UpgradeConfig:**
- id, name, description, baseCost, costMultiplier, effect, maxLevel, type, tier, enabled

### Patrones de Query Prisma Usados
```typescript
// findUnique simple
prisma.player.findUnique({ where: { playerId } })

// findMany con filtros
prisma.upgradeConfig.findMany({ where: { enabled: true } })

// update con operaciones atómicas
prisma.player.update({ data: { coins: { increment: 10 } } })

// aggregate y count
prisma.player.aggregate({ _sum: { coins: true } })
prisma.player.count()

// raw query
prisma.$queryRaw`SELECT 1`
```

---

## Affected Areas

| Archivo | Cambio Requerido | Complejidad |
|---------|-----------------|-------------|
| `src/database/prisma.ts` | Reemplazar por `knex.ts` | Baja |
| `src/services/IdleGameService.ts` | Reescribir queries Prisma → Knex | **Alta** (853 líneas) |
| `src/api/routes/stats.ts` | Actualizar queries | Media |
| `src/api/routes/leaderboard.ts` | Actualizar queries | Media |
| `src/api/routes/health.ts` | Actualizar health check | Baja |
| `src/database/repositories/*.ts` | Reescribir repositories | Media |
| `prisma/schema.prisma` | Eliminar (reemplazado por knexfile) | N/A |
| `src/database/generated/` | Eliminar directorio completo | N/A |

---

## Approaches

### 1. **Knex.js (RECOMENDADO)**
Query builder SQL con migraciones imperativas.

- **Pros:**
  - ✅ Funciona en cPanel sin CLI (migraciones via npm scripts)
  - ✅ Bundle pequeño (~1MB vs 17MB+)
  - ✅ Experiencia previa del usuario
  - ✅ API fluida y cercana a SQL
  - ✅ mysql2 driver ya instalado
  - ✅ Migrations con rollback
  - ✅ Seeds para datos iniciales
- **Cons:**
  - TypeScript requiere tipado manual
  - No hay auto-completion de schema
- **Effort:** Media (~8-16 horas)

### 2. **Raw mysql2 (mysql2/promisify)**
Usar mysql2 directamente con promises.

- **Pros:**
  - Bundle mínimo
  - Control total del SQL
  - No hay abstracción
- **Cons:**
  - ❌ Sin migraciones automáticas
  - ❌ Sin type safety
  - ❌ Más código boilerplate
  - ❌ No hay query builder
- **Effort:** Alta (mucho boilerplate)

### 3. **TypeORM**
ORM tradicional con soporte TypeScript.

- **Pros:**
  - Type safety bueno
  - Migrations CLI
- **Cons:**
  - ❌ CLI puede tener problemas en cPanel
  - ❌ Curva de aprendizaje alta
  - ❌ Bundle considerable
  - ❌ Más complejo que Knex para este caso
- **Effort:** Alta

### 4. **Drizzle ORM**
ORM moderno, type-safe, ligero.

- **Pros:**
  - Type safety excelente
  - Bundle pequeño
  - SQL-like syntax
- **Cons:**
  - ❌ Menos maduro que Knex
  - ❌ Ecosistema más pequeño
  - ❌ Sin experiencia previa del usuario
- **Effort:** Media-Alta

---

## Recommendation

**MIGRAR A KNEX.JS** - Resuelve todos los problemas del usuario:

1. ✅ Funciona en cPanel sin CLI
2. ✅ Usuario ya lo conoce
3. ✅ Bundle pequeño
4. ✅ Migrations + Seeds
5. ✅ API query builder similar a Prisma
6. ✅ mysql2 ya instalado

### Por qué NO otras alternativas:
- **Raw mysql2**: Sin migraciones, mucho boilerplate
- **TypeORM**: Más complejo, misma limitación CLI
- **Drizzle**: Nuevo, sin experiencia del usuario

---

## Risks

| Riesgo | Impacto | Mitigation |
|--------|---------|------------|
| BigInt handling (lastUpdate) | Bajo | Convertir a Number/timestamp o String |
| JSON fields (upgrades) | Bajo | JSON.parse() manual (código ya lo hace) |
| Type safety manual | Medio | Definir interfaces TypeScript claras |
| Migración datos existentes | Bajo | Tablas simples, conversión directa |
| Atomic operations | Bajo | Knex soporta `increment` via raw |

---

## Ready for Proposal

**SÍ** - La migración es viable, los riesgos son manejables, y Knex resuelve el problema real de hosting compartido.

### Próximos pasos SDD:
1. Crear proposal (sdd-propose)
2. Definir spec de interfaces Knex
3. Diseño de migraciones iniciales
4. Plan de implementación por fases

---

## Métricas de Esfuerzo

- **Líneas de código a cambiar:** ~1,500
- **Archivos a modificar:** 8
- **Tiempo estimado:** 1-2 días
- **Complejidad general:** MEDIA
