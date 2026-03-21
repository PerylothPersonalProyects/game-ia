# Proposal: Migración MongoDB → MySQL con Prisma ORM

## Intent

Migrar la base de datos de MongoDB a MySQL usando Prisma ORM para resolver la falta de control de versiones del schema. El objetivo es tener migraciones versionadas y trazables, aprovechando el hosting MySQL 5.7 existente en cPanel sin acceso shell.

## Scope

### In Scope
- Crear Prisma schema para Player y UpgradeConfig
- Implementar sistema de migraciones MySQL (npx prisma migrate)
- Scripts de seed para datos iniciales (66 upgrades, 10 tiers)
- Reescribir capa de datos usando Prisma Client
- Mantener abstracción Repository (Puerto/Adaptador)
- Script de migración de datos existentes MongoDB → MySQL
- Script de limpieza y reinstalación DB desde cero
- Documentación del workflow de migraciones

### Out of Scope
- Cambios en frontend
- Migración de datos históricos de producción (data cleaning primero)
- Reestructuración del modelo de datos

## Approach

1. **Schema Prisma**: Mapear Player y UpgradeConfig con JSON columns para arrays embebidos
2. **Migraciones**: Usar `prisma migrate dev` localmente, generar SQL para apply manual vía phpMyAdmin
3. **Arquitectura**: Crear nuevo adapter `prisma/` manteniendo interfaces existentes en `src/ports/`
4. **Seed**: Script `prisma/seed.ts` con los 66 upgrades predefinidos
5. **Workflow**: desarrollo local → exportar SQL → aplicar en phpMyAdmin → verificar

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | New | Schema con Player y UpgradeConfig |
| `src/db/connection.ts` | Modified | Nueva conexión Prisma Client |
| `src/adapters/prisma/` | New | Repository implementations |
| `scripts/migrate.ts` | New | Script migración datos |
| `scripts/seed.ts` | Modified | Seed con 66 upgrades |
| `src/adapters/in-memory/` | Modified | Actualizar para tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Operadores atómicos MongoDB ($inc) | High | Transacciones Prisma con increment |
| JSON columns en MySQL 5.7 | Med | Validar parsing array en PHPMyAdmin |
| Sin acceso shell | High | Generar SQL standalone para phpMyAdmin |
| Arrays embebidos sin índices | Med | Añadir campos indexados separadamente |

## Rollback Plan

1. Mantener conexión MongoDB existente como fallback
2. Feature flag para alternar entre adapters
3. Script para revertir a MongoDB en producción
4. Backup completo antes de aplicar migración

## Dependencies

- Prisma CLI (dev dependency)
- MySQL 5.7 en cPanel (verificar soporte JSON)
- Acceso phpMyAdmin para apply manual

## Success Criteria

- [ ] Schema Prisma compila sin errores
- [ ] 66 upgrades seedeados correctamente
- [ ] CRUD Player funcional vía Prisma
- [ ] Migración de datos existentes verificada
- [ ] Tests pasan con nuevo adapter Prisma
- [ ] SQL migration reproducible en ambiente limpio
- [ ] Documentación de workflow completa
