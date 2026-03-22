const upgrades = require('./data/upgrades.json');

exports.seed = function(knex) {
  // Clear existing entries
  return knex('upgrade_configs').del()
    .then(function () {
      // Insert upgrade configs
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const entries = upgrades.map(upgrade => ({
        id: upgrade.id,
        name: upgrade.name,
        description: upgrade.description,
        base_cost: upgrade.baseCost,
        cost_multiplier: upgrade.costMultiplier,
        effect: upgrade.effect,
        max_level: upgrade.maxLevel,
        type: upgrade.type,
        tier: upgrade.tier,
        enabled: upgrade.enabled,
        created_at: now,
        updated_at: now,
      }));
      return knex('upgrade_configs').insert(entries);
    });
};
