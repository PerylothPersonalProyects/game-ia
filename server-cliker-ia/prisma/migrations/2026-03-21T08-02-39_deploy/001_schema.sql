
CREATE TABLE IF NOT EXISTS `players` (
    `id` VARCHAR(191) NOT NULL,
    `player_id` VARCHAR(191) NOT NULL,
    `coins` INT NOT NULL DEFAULT 0,
    `coins_per_click` INT NOT NULL DEFAULT 1,
    `coins_per_second` DOUBLE NOT NULL DEFAULT 0,
    `upgrades` JSON NOT NULL DEFAULT ("[]"),
    `shop_upgrades` JSON NOT NULL DEFAULT ("[]"),
    `last_update` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `players_player_id_key` (`player_id`)
);


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
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `upgrade_configs_type_idx` (`type`),
    INDEX `upgrade_configs_tier_idx` (`tier`),
    INDEX `upgrade_configs_enabled_idx` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
