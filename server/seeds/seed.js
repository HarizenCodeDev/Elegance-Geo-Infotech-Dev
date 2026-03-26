import bcrypt from "bcryptjs";
import db from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Check if root user exists
    const existingRoot = await db("users").where("role", "root").first();
    if (existingRoot) {
      console.log("⚠️  Root user already exists. Skipping seed.");
      return;
    }

    // Create root user
    const hashedPassword = await bcrypt.hash(
      process.env.DEFAULT_PASSWORD || "admin123",
      12
    );

    const [rootUser] = await db("users")
      .insert({
        name: process.env.DEFAULT_NAME || "Admin",
        email: process.env.DEFAULT_EMAIL || "admin@elegance.com",
        password: hashedPassword,
        role: "root",
        employee_id: "EMP001",
        department: "Administration",
        designation: "System Administrator",
      })
      .returning("*");

    console.log(`✅ Root user created:`);
    console.log(`   Email: ${rootUser.email}`);
    console.log(`   Password: ${process.env.DEFAULT_PASSWORD || "admin123"}`);
    console.log("\n⚠️  Please change this password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seed();
