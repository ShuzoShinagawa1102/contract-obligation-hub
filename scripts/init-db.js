#!/usr/bin/env node
/**
 * Database initialization script for Contract Obligation Hub
 * Applies migrations to the SQLite database
 */

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "prisma", "dev.db");
const migrationDir = path.join(__dirname, "..", "prisma", "migrations");

function initDb() {
  const db = new Database(dbPath);

  // Check if tables already exist
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Case'")
    .all();

  if (tables.length > 0) {
    console.log("✓ Database already initialized.");
    db.close();
    return;
  }

  // Find and apply the first migration
  const migrations = fs.readdirSync(migrationDir).filter((d) => d !== "migration_lock.toml");
  migrations.sort();

  let applied = 0;
  for (const migration of migrations) {
    const sqlPath = path.join(migrationDir, migration, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;

    const sql = fs.readFileSync(sqlPath, "utf8");
    const statements = sql.split(";").filter((s) => s.trim().length > 0);
    for (const stmt of statements) {
      try {
        db.exec(stmt + ";");
      } catch (e) {
        console.error("Migration error:", e.message);
      }
    }
    applied++;
    console.log(`✓ Applied migration: ${migration}`);
  }

  if (applied === 0) {
    console.log("No migrations found.");
  } else {
    const newTables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all();
    console.log("✓ Tables created:", newTables.map((t) => t.name).join(", "));
  }

  db.close();
}

initDb();
