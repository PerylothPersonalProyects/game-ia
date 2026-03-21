# SDD State: migracion-mongodb-mysql

## Phase

tasks

## Artifact Store

openspec

## Artifacts

| Artifact | Path |
|----------|------|
| proposal | openspec/changes/migracion-mongodb-mysql/proposal.md |
| spec | openspec/changes/migracion-mongodb-mysql/specs/database/spec.md |
| design | openspec/changes/migracion-mongodb-mysql/design.md |
| tasks | openspec/changes/migracion-mongodb-mysql/tasks.md |

## Spec Coverage

- Database Schema (Player, UpgradeConfig)
- Migration System (Prisma CLI)
- JSON Array Storage
- Seed Scripts
- cPanel/phpMyAdmin Workflow
- Modified: Connection Layer, Repository Pattern
- Removed: Mongoose ODM, MongoDB Connection

## Scenarios Written

- Create player record
- Update player coins
- Query upgrades by tier
- Query enabled upgrades only
- Generate initial migration
- Generate seed migration
- Store player upgrades (JSON)
- Store shop upgrades (JSON)
- Seed all upgrades
- Full database reset
- Export migration SQL
- Apply migration manually
- Initialize Prisma Client
- Player Repository operations

## Tasks Summary

- **Phase 1**: Instalación y Configuración (5 tasks)
- **Phase 2**: Schema y Migraciones (5 tasks)
- **Phase 3**: Repositorios Prisma (5 tasks)
- **Phase 4**: Seed de Datos (5 tasks)
- **Phase 5**: Scripts de Mantenimiento (3 tasks)
- **Phase 6**: Testing (6 tasks)
- **Phase 7**: Documentación (4 tasks)
- **Total**: 33 tasks atómicas

## Last Updated

2026-03-21
