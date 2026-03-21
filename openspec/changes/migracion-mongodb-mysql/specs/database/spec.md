# Delta for Database Migration

## Purpose

Migración de MongoDB/Mongoose a MySQL/Prisma ORM para el backend del juego clicker. El objetivo es obtener control de versiones del schema mediante migraciones Prisma, aprovechando el hosting MySQL 5.7 existente en cPanel.

## ADDED Requirements

### Requirement: Player Table Schema

The system SHALL create a `players` table in MySQL with the following structure:

| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | UUID | PK, DEFAULT uuid() |
| player_id | VARCHAR(255) | UNIQUE, NOT NULL |
| coins | INT | DEFAULT 0 |
| coins_per_click | INT | DEFAULT 1 |
| coins_per_second | DECIMAL(10,2) | DEFAULT 0 |
| upgrades | JSON | DEFAULT '[]' |
| shop_upgrades | JSON | DEFAULT '[]' |
| last_update | BIGINT | NOT NULL |
| created_at | DATETIME | DEFAULT NOW() |
| updated_at | DATETIME | ON UPDATE NOW() |

#### Scenario: Create player record

- GIVEN a new player with valid player_id
- WHEN the system inserts a new record via Prisma
- THEN the record SHALL be created with UUID primary key
- AND `coins` SHALL default to 0
- AND `upgrades`/`shop_upgrades` SHALL default to empty JSON arrays
- AND `created_at` SHALL be set automatically

#### Scenario: Update player coins

- GIVEN an existing player with id
- WHEN updating coins via Prisma increment transaction
- THEN the operation SHALL be atomic
- AND `updated_at` SHALL reflect the modification timestamp

### Requirement: UpgradeConfig Table Schema

The system SHALL create an `upgrade_configs` table in MySQL with the following structure:

| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | VARCHAR(255) | PK |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| base_cost | INT | NOT NULL |
| cost_multiplier | DECIMAL(5,2) | DEFAULT 1.15 |
| effect | DECIMAL(10,2) | NOT NULL |
| max_level | INT | DEFAULT 999 |
| type | ENUM('click','passive') | NOT NULL |
| tier | INT | DEFAULT 1 |
| enabled | BOOLEAN | DEFAULT TRUE |
| created_at | DATETIME | DEFAULT NOW() |
| updated_at | DATETIME | ON UPDATE NOW() |

#### Scenario: Query upgrades by tier

- GIVEN 66 upgrades across 10 tiers
- WHEN querying upgrades filtered by tier
- THEN the system SHALL return only upgrades matching the tier
- AND results SHALL be ordered by id

#### Scenario: Query enabled upgrades only

- GIVEN upgrades with enabled/disabled status
- WHEN fetching active upgrades for shop display
- THEN only upgrades with `enabled = true` SHALL be returned

### Requirement: Prisma Migration System

The system SHALL implement versioned migrations using Prisma CLI.

#### Scenario: Generate initial migration

- GIVEN Prisma schema defined with Player and UpgradeConfig
- WHEN running `npx prisma migrate dev --name init`
- THEN a migration file SHALL be created in `prisma/migrations/`
- AND the SQL SHALL create both tables correctly
- AND the migration SHALL be idempotent on retry

#### Scenario: Generate seed migration

- GIVEN initial migration applied
- WHEN running `npx prisma migrate dev --name seed-upgrades`
- THEN a migration SHALL insert all 66 upgrades
- AND duplicate inserts SHALL be handled via upsert

### Requirement: JSON Array Storage Format

The system SHALL store embedded arrays as JSON in MySQL.

#### Scenario: Store player upgrades

- GIVEN a player with purchased upgrades
- WHEN serializing to MySQL
- THEN `upgrades` field SHALL contain JSON array:

```json
[
  {
    "id": "click_1",
    "name": "Dedo Rápido",
    "description": "Aumenta monedas por clic",
    "cost": 10,
    "costMultiplier": 1.15,
    "effect": 1,
    "maxLevel": 999,
    "purchased": 5
  }
]
```

#### Scenario: Store shop upgrades

- GIVEN a player with items in shop cart
- WHEN serializing to MySQL
- THEN `shop_upgrades` field SHALL contain JSON array:

```json
[
  {
    "id": "click_2",
    "name": "Mano Firme",
    "cost": 100
  }
]
```

### Requirement: Seed Scripts

The system SHALL provide scripts to populate initial data.

#### Scenario: Seed all upgrades

- GIVEN `prisma/seed-data/upgrades.json` contains 66 upgrade definitions
- WHEN running `npm run prisma:seed`
- THEN all upgrades SHALL be inserted/updated via upsert
- AND each tier SHALL have approximately 6-7 upgrades

#### Scenario: Full database reset

- GIVEN existing database with data
- WHEN running `npm run db:reset`
- THEN all tables SHALL be dropped
- AND migrations SHALL be re-applied
- AND seed data SHALL be inserted
- AND the database SHALL be in clean initial state

### Requirement: cPanel/phpMyAdmin Workflow

The system SHALL support manual SQL execution via phpMyAdmin.

#### Scenario: Export migration SQL

- GIVEN local Prisma migration generated
- WHEN exporting SQL for production
- THEN the SQL SHALL be standalone (no Prisma-specific syntax)
- AND SHALL be executable directly in phpMyAdmin

#### Scenario: Apply migration manually

- GIVEN SQL migration file exported
- WHEN pasting into phpMyAdmin SQL tab
- THEN the migration SHALL apply without errors
- AND tables SHALL be created with correct schema

## MODIFIED Requirements

### Requirement: Database Connection Layer

(Previously: Mongoose connection in `src/db/connection.ts`)

The system SHALL use Prisma Client for database connections.

#### Scenario: Initialize Prisma Client

- GIVEN application starting
- WHEN importing Prisma Client
- THEN a single instance SHALL be created
- AND connection pooling SHALL be managed by Prisma

### Requirement: Repository Adapter Pattern

(Previously: Mongoose implementations in `src/adapters/`)

The system SHALL implement Repository pattern using Prisma.

#### Scenario: Player Repository operations

- GIVEN PlayerRepository interface defined in `src/ports/`
- WHEN implementing with Prisma adapter
- THEN CRUD operations SHALL use Prisma Client
- AND raw queries SHALL be avoided

## REMOVED Requirements

### Requirement: Mongoose ODM

(Reason: Replaced by Prisma ORM for schema versioning and type safety)

### Requirement: MongoDB Connection

(Reason: Hosting provider only supports MySQL)

## Criterios de Éxito

| Criterio | Estado |
|----------|--------|
| Schema crea las 2 tablas correctamente | ☐ |
| Migraciones se generan sin errores | ☐ |
| Seed inserta los 66 upgrades | ☐ |
| `npm run db:reset` funciona completamente | ☐ |
| La aplicación conecta a MySQL exitosamente | ☐ |
| CRUD de Player funciona correctamente | ☐ |
| Queries de UpgradeConfig funcionan correctamente | ☐ |
