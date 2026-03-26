import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "elegance_ems",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  },
});

async function checkAndAddIndexes() {
  try {
    console.log("Checking database indexes...\n");
    
    const indexes = await db.raw(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY indexname
    `);
    
    console.log("Existing indexes:");
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
    
    const neededIndexes = [
      { name: "idx_users_email", sql: "CREATE INDEX idx_users_email ON users(email)" },
      { name: "idx_users_role", sql: "CREATE INDEX idx_users_role ON users(role)" },
      { name: "idx_users_department", sql: "CREATE INDEX idx_users_department ON users(department)" },
      { name: "idx_attendance_date", sql: "CREATE INDEX idx_attendance_date ON attendance(date)" },
      { name: "idx_leaves_status", sql: "CREATE INDEX idx_leaves_status ON leaves(status)" },
      { name: "idx_login_logs_user_created", sql: "CREATE INDEX idx_login_logs_user_created ON login_logs(user_id, created_at DESC)" },
      { name: "idx_checkin_user_created", sql: "CREATE INDEX idx_checkin_user_created ON checkin_checkout(user_id, created_at DESC)" },
    ];
    
    const existingIndexNames = indexes.rows.map(idx => idx.indexname);
    
    console.log("\nAdding missing indexes...");
    for (const idx of neededIndexes) {
      if (!existingIndexNames.includes(idx.name)) {
        await db.raw(idx.sql);
        console.log(`  ✓ Created: ${idx.name}`);
      } else {
        console.log(`  - Already exists: ${idx.name}`);
      }
    }
    
    console.log("\n✅ Database optimization complete!");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}

checkAndAddIndexes();
