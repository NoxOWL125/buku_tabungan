const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const Database = require(
  app.isPackaged
    ? path.join(
        process.resourcesPath,
        "standalone",
        "node_modules",
        "better-sqlite3"
      )
    : "better-sqlite3"
);


function initializeDatabase(databasePath, migrationsPath) {
  fs.mkdirSync(path.dirname(databasePath), {
    recursive: true,
  });

  const db = new Database(databasePath);

  try {
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE IF NOT EXISTS "_app_migrations" (
        "name" TEXT PRIMARY KEY,
        "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrations = fs
      .readdirSync(migrationsPath, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name)
      .sort();

    for (const migration of migrations) {
      const alreadyApplied = db
        .prepare(
          'SELECT name FROM "_app_migrations" WHERE name = ?'
        )
        .get(migration);

      if (alreadyApplied) continue;

      const migrationFile = path.join(
        migrationsPath,
        migration,
        "migration.sql"
      );

      if (!fs.existsSync(migrationFile)) {
        throw new Error(
          `File migrasi tidak ditemukan: ${migrationFile}`
        );
      }

      const sql = fs.readFileSync(migrationFile, "utf8");

      const applyMigration = db.transaction(() => {
        db.exec(sql);

        db.prepare(`
          INSERT INTO "_app_migrations" ("name")
          VALUES (?)
        `).run(migration);
      });

      applyMigration();

      console.log(`Migrasi berhasil: ${migration}`);
    }

    console.log("Database siap digunakan:", databasePath);

    return databasePath;
  } finally {
    db.close();
  }
}


module.exports = {
  initializeDatabase,
};