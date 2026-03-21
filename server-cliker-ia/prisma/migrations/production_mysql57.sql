-- ============================================
-- MIGRACIÓN PARA MySQL 5.7 (cPanel)
-- Compatible con MySQL 5.7 - Sin DEFAULT en JSON
-- ============================================

-- ============================================
-- Tabla: players
-- ============================================
CREATE TABLE IF NOT EXISTS `players` (
    `id` VARCHAR(191) NOT NULL,
    `player_id` VARCHAR(191) NOT NULL,
    `coins` INT NOT NULL DEFAULT 0,
    `coins_per_click` INT NOT NULL DEFAULT 1,
    `coins_per_second` DOUBLE NOT NULL DEFAULT 0,
    `upgrades` JSON,
    `shop_upgrades` JSON,
    `last_update` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `players_player_id_key` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: upgrade_configs
-- ============================================
CREATE TABLE IF NOT EXISTS `upgrade_configs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT,
    `base_cost` INT NOT NULL,
    `cost_multiplier` DOUBLE NOT NULL DEFAULT 1.15,
    `effect` DOUBLE NOT NULL,
    `max_level` INT NOT NULL DEFAULT 999,
    `type` VARCHAR(191) NOT NULL,
    `tier` INT NOT NULL DEFAULT 1,
    `enabled` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `upgrade_configs_type_key` (`type`),
    INDEX `upgrade_configs_tier_key` (`tier`),
    INDEX `upgrade_configs_enabled_key` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
