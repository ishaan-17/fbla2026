import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "lost-and-found.db");

let _db: Database.Database | null = null;
let _initialized = false;

function getDb(): Database.Database {
  if (!_db) {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    _db = new Database(DB_PATH, { timeout: 10000 });
    _db.pragma("journal_mode = WAL");
    _db.pragma("busy_timeout = 5000");
    _db.pragma("foreign_keys = ON");
  }

  if (!_initialized) {
    _initialized = true;
    _db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        title           TEXT NOT NULL,
        description     TEXT NOT NULL,
        category        TEXT NOT NULL DEFAULT 'other',
        location_found  TEXT NOT NULL,
        date_found      TEXT NOT NULL,
        image_path      TEXT,
        reporter_name   TEXT NOT NULL DEFAULT '',
        reporter_email  TEXT NOT NULL DEFAULT '',
        status          TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'approved', 'claimed', 'archived')),
        ai_tags         TEXT,
        created_at      TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
      CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

      CREATE TABLE IF NOT EXISTS claims (
        id                   INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id              INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        claimant_name        TEXT NOT NULL,
        claimant_email       TEXT NOT NULL,
        claimant_description TEXT NOT NULL,
        status               TEXT NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at           TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_claims_item_id ON claims(item_id);
      CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);

      CREATE TABLE IF NOT EXISTS categories (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name  TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rewards (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        email       TEXT NOT NULL,
        name        TEXT NOT NULL,
        points      INTEGER NOT NULL DEFAULT 0,
        reason      TEXT NOT NULL,
        item_id     INTEGER REFERENCES items(id) ON DELETE SET NULL,
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_rewards_email ON rewards(email);

      CREATE TABLE IF NOT EXISTS inquiries (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id         INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        inquirer_name   TEXT NOT NULL,
        inquirer_email  TEXT NOT NULL,
        message         TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'read', 'replied')),
        created_at      TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_inquiries_item_id ON inquiries(item_id);
      CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    `);

    const insertCat = _db.prepare(
      "INSERT OR IGNORE INTO categories (name, label) VALUES (?, ?)"
    );
    const seedCategories = _db.transaction(() => {
      const cats = [
        ["water_bottle", "Water Bottle"],
        ["pencil_case", "Pencil Case"],
        ["backpack", "Backpack"],
        ["clothing", "Clothing"],
        ["electronics", "Electronics"],
        ["keys", "Keys"],
        ["book", "Book"],
        ["lunchbox", "Lunchbox"],
        ["umbrella", "Umbrella"],
        ["sports_equipment", "Sports Equipment"],
        ["jewelry", "Jewelry"],
        ["glasses", "Glasses"],
        ["headphones", "Headphones"],
        ["other", "Other"],
      ];
      for (const [name, label] of cats) {
        insertCat.run(name, label);
      }
    });
    seedCategories();
  }

  return _db;
}

// Proxy that lazily initializes the database on first use
const db = new Proxy({} as Database.Database, {
  get(_target, prop: string | symbol) {
    const realDb = getDb();
    const value = (realDb as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});

export default db;
