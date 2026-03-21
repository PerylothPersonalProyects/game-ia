exports.up = function(knex) {
  return knex.schema.createTable('upgrade_configs', (table) => {
    table.string('id', 191).primary();
    table.string('name', 191).notNullable();
    table.text('description').nullable();
    table.integer('base_cost').notNullable();
    table.float('cost_multiplier').notNullable().defaultTo(1.15);
    table.float('effect').notNullable();
    table.integer('max_level').notNullable().defaultTo(999);
    table.string('type', 191).notNullable();
    table.integer('tier').notNullable().defaultTo(1);
    table.boolean('enabled').notNullable().defaultTo(true);
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now());
    table.index('type');
    table.index('tier');
    table.index('enabled');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('upgrade_configs');
};
