// scripts/simple-init.ts
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function initDatabase() {
    // Ensure the data directory exists
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'kits.sqlite');

    // Open the database
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Read schema SQL from a file
    const schemaPath = path.join(process.cwd(), 'lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema SQL to create tables
    await db.exec(schema);

    console.log('Database initialized successfully!');

    // Close the database connection
    await db.close();
}

initDatabase().catch(console.error);