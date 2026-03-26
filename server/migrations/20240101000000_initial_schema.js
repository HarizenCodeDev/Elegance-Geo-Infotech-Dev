/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Users table
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("name").notNullable();
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
    table
      .enum("role", ["root", "admin", "manager", "teamlead", "developer", "hr"])
      .notNullable()
      .defaultTo("developer");
    table.string("employee_id").unique();
    table.date("dob");
    table.string("gender");
    table.string("marital_status");
    table.string("designation");
    table.string("department");
    table.decimal("salary", 12, 2);
    table.string("profile_image");
    table.string("avatar");
    table
      .enum("attendance_status", ["Pending", "Present", "Absent"])
      .defaultTo("Pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Attendance table
  await knex.schema.createTable("attendance", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.date("date").notNullable();
    table.string("status").notNullable();
    table.timestamp("check_in_at");
    table.timestamp("check_out_at");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.unique(["user_id", "date"]);
  });

  // Leave table
  await knex.schema.createTable("leaves", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.string("type").notNullable();
    table.date("from_date").notNullable();
    table.date("to_date").notNullable();
    table.text("description");
    table
      .enum("status", ["Pending", "Approved", "Rejected"])
      .defaultTo("Pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Announcements table
  await knex.schema.createTable("announcements", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("title").notNullable();
    table.text("message").notNullable();
    table.specificType("audience_roles", "TEXT[]").defaultTo("{all}");
    table.specificType("audience_departments", "TEXT[]").defaultTo("{}");
    table.uuid("created_by").references("id").inTable("users").onDelete("SET NULL");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Chat messages table
  await knex.schema.createTable("chat_messages", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("from_user").references("id").inTable("users").onDelete("CASCADE");
    table.uuid("to_user").references("id").inTable("users").onDelete("SET NULL");
    table.string("to_group");
    table.text("text").notNullable();
    table.timestamp("ts").defaultTo(knex.fn.now());
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Create indexes
  await knex.raw(
    `CREATE INDEX idx_attendance_user_date ON attendance(user_id, date)`
  );
  await knex.raw(
    `CREATE INDEX idx_leaves_user ON leaves(user_id, created_at DESC)`
  );
  await knex.raw(
    `CREATE INDEX idx_announcements_created ON announcements(created_at DESC)`
  );
  await knex.raw(
    `CREATE INDEX idx_chat_to_user ON chat_messages(to_user, ts DESC)`
  );
  await knex.raw(
    `CREATE INDEX idx_chat_to_group ON chat_messages(to_group, ts DESC)`
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("chat_messages");
  await knex.schema.dropTableIfExists("announcements");
  await knex.schema.dropTableIfExists("leaves");
  await knex.schema.dropTableIfExists("attendance");
  await knex.schema.dropTableIfExists("users");
}
