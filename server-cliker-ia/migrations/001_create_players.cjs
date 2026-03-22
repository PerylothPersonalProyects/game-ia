exports.up = function(knex) {
  return knex.schema.createTable('players', (table) => {
    table.string('id', 191).primary();
    table.string('player_id', 191).unique().notNullable();
    table.integer('coins').notNullable().defaultTo(0);
    table.integer('coins_per_click').notNullable().defaultTo(1);
    table.float('coins_per_second').notNullable().defaultTo(0);
    table.json('upgrades').nullable();
    table.json('shop_upgrades').nullable();
    table.bigInteger('last_update').notNullable();
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('players');
};
