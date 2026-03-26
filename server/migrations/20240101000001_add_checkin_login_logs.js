/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("checkin_checkout", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.uuid("parent_id");
    table.enum("type", ["checkin", "checkout"]).notNullable();
    table.text("note");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.index(["user_id", "created_at"]);
  });

  await knex.schema.createTable("login_logs", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.string("ip_address");
    table.string("user_agent");
    table.string("status").notNullable().defaultTo("success");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.index(["user_id", "created_at"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("login_logs");
  await knex.schema.dropTableIfExists("checkin_checkout");
}
