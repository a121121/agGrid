// scripts/init-db.ts
import { initDb, closeDb } from '../lib/db/db-init';
import { seedDatabase } from '../lib/db/seed-db';

async function initialize() {
    try {
        console.log('Initializing database...');
        await initDb();

        console.log('Seeding database with sample data...');
        await seedDatabase(50); // Seed with 50 kits instead of 500 for faster initialization

        console.log('Database initialization complete!');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await closeDb();
    }
}

initialize();