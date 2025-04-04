// 📄 lib/db/db-init.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
    if (db) return db;

    // Ensure the data directory exists
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'kits.sqlite');

    // Open the database
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    return db;
}

export async function initDb(): Promise<void> {
    const db = await getDb();

    // Read schema SQL from a file
    const schemaPath = path.join(process.cwd(), 'lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema SQL to create tables
    await db.exec(schema);

    console.log('Database initialized successfully');
}

// Call this function once at app startup
// initDb().catch(console.error);

export async function closeDb(): Promise<void> {
    if (db) {
        await db.close();
        db = null;
    }
}