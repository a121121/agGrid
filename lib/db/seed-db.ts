// 📄 lib/db/seed-db.ts
import { getDb } from './db-init';
import { Kit } from '@/types/kit';
import { generateKitData } from '@/lib/generateKitData';

export async function seedUsers(): Promise<void> {
    const db = await getDb();

    const users = [
        { name: 'John Doe', email: 'john.doe@example.com' },
        { name: 'Jane Smith', email: 'jane.smith@example.com' },
        { name: 'Mike Johnson', email: 'mike.johnson@example.com' },
        { name: 'Sarah Williams', email: 'sarah.williams@example.com' },
        { name: 'David Brown', email: 'david.brown@example.com' },
        { name: 'Emily Davis', email: 'emily.davis@example.com' },
        { name: 'Robert Wilson', email: 'robert.wilson@example.com' },
        { name: 'Lisa Miller', email: 'lisa.miller@example.com' }
    ];

    // Insert users in a transaction
    await db.run('BEGIN TRANSACTION');

    try {
        for (const user of users) {
            await db.run(
                'INSERT INTO users (name, email) VALUES (?, ?)',
                [user.name, user.email]
            );
        }

        await db.run('COMMIT');
        console.log('Users seeded successfully');
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error seeding users:', error);
        throw error;
    }
}

export async function seedKits(count: number = 500): Promise<void> {
    const db = await getDb();
    const kits = generateKitData(count);

    // Get user IDs for assignment
    const users = await db.all('SELECT id FROM users');
    if (users.length === 0) {
        throw new Error('No users found. Please seed users first.');
    }

    // Insert kits in a transaction
    await db.run('BEGIN TRANSACTION');

    try {
        for (const kit of kits) {
            // Randomly assign a user
            const userId = users[Math.floor(Math.random() * users.length)].id;

            await db.run(
                `INSERT INTO kits (
          part_number, noun, kit_name, state_status, current_status, 
          remarks, manufacturer, form48_number, user_id, 
          die_required, die_number, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    kit.partNumber,
                    kit.noun,
                    kit.kitName,
                    kit.stateStatus,
                    kit.currentStatus,
                    kit.remarks,
                    kit.manufacturer,
                    kit.form48number,
                    userId,
                    kit.dieRequired ? 1 : 0,
                    kit.dieNumber,
                    kit.version
                ]
            );
        }

        await db.run('COMMIT');
        console.log(`${count} kits seeded successfully`);
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error seeding kits:', error);
        throw error;
    }
}

export async function seedDatabase(kitCount: number = 500): Promise<void> {
    try {
        await seedUsers();
        await seedKits(kitCount);
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

// Run this once to seed the database
// seedDatabase().catch(console.error);