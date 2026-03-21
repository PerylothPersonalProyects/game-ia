-- ================================================
-- Script de inicialización MySQL para Clicker Game
-- Se ejecuta automáticamente cuando el contenedor se crea por primera vez
-- ================================================

-- Crear base de datos principal
CREATE DATABASE IF NOT EXISTS clicker_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear base de datos shadow de Prisma (necesaria para migraciones)
CREATE DATABASE IF NOT EXISTS `prisma_migrate_shadow_db_276d7bf2-4e8c-4a24-bdb4-1241e931c64d` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Otorgar permisos al usuario admin
GRANT ALL PRIVILEGES ON clicker_game.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON `prisma_migrate_shadow_db_276d7bf2-4e8c-4a24-bdb4-1241e931c64d`.* TO 'admin'@'%';
FLUSH PRIVILEGES;
