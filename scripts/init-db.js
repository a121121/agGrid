// scripts/init-db.js
const fs=require('fs');
const path=require('path');
const sqlite3=require('sqlite3');
const { open }=require('sqlite');

// Custom generateKitData function based on your implementation
function generateKitData(count=100) {
    // All possible values based on the Kit type
    const kitNames=[
        'Kit B',
        'Kit C',
        'Kit C 125',
    ];

    const stateStatuses=[
        'Form 17 Pending',
        'Under Indegenization',
        'Part Under TF',
        'Die Under TF',
        'Part Trial Testing',
        'MCL',
        'Under Sourcing',
        'Sourcing Completed',
        'Beyond Capability'
    ];

    const currentStatuses=[
        'In Progress',
        'Evaluation',
        'Testing',
        'Completed',
        'On Hold',
        'Cancelled',
        'Ready for Production',
        'Awaiting Approval',
        null
    ];

    const manufacturers=[
        'Machine Shop',
        'Sheet Metal',
        'Rubber and Ploymer',
        'PMC',
        'Harness Manufacturing',
        'Spring Shop'
    ];

    const nouns=[
        'Component',
        'Assembly',
        'Module',
        'Unit',
        'Part',
        'System',
        'Device',
        'Element'
    ];

    const kits=[];

    for (let i=1; i<=count; i++) {
        const partNumber=`KIT-${String(i).padStart(3, '0')}`;
        const noun=`${nouns[Math.floor(Math.random()*nouns.length)]} ${String.fromCharCode(65+Math.floor(Math.random()*8))}`;
        const dieRequired=Math.random()>0.5;

        kits.push({
            partNumber,
            noun,
            kitName: kitNames[Math.floor(Math.random()*kitNames.length)],
            manufacturer: manufacturers[Math.floor(Math.random()*manufacturers.length)],
            stateStatus: stateStatuses[Math.floor(Math.random()*stateStatuses.length)],
            currentStatus: currentStatuses[Math.floor(Math.random()*currentStatuses.length)],
            remarks: `Auto-generated kit ${i}`,
            form48number: `F48-${String(i).padStart(3, '0')}`,
            dieRequired: dieRequired? 1:0,  // SQLite stores booleans as integers
            dieNumber: dieRequired? `DIE-${String(i).padStart(3, '0')}`:'',
            version: 1
        });
    }

    return kits;
}

async function seedUsers(db) {
    console.log('Seeding users...');

    const users=[
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
        return true;
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error seeding users:', error);
        throw error;
    }
}

async function seedKits(db, count=100) {
    console.log(`Seeding ${count} kits...`);

    const kits=generateKitData(count);

    // Get user IDs for assignment
    const users=await db.all('SELECT id FROM users');
    if (users.length===0) {
        throw new Error('No users found. Please seed users first.');
    }

    // Insert kits in a transaction
    await db.run('BEGIN TRANSACTION');

    try {
        for (const kit of kits) {
            // Randomly assign a user
            const userId=users[Math.floor(Math.random()*users.length)].id;

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
                    kit.dieRequired,
                    kit.dieNumber,
                    kit.version
                ]
            );
        }

        await db.run('COMMIT');
        console.log(`${count} kits seeded successfully`);
        return true;
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error seeding kits:', error);
        throw error;
    }
}

async function initDatabase() {
    // Ensure the data directory exists
    const dbDir=path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath=path.join(dbDir, 'kits.sqlite');

    console.log(`Initializing database at ${dbPath}`);

    // Check if database already exists
    const dbExists=fs.existsSync(dbPath);
    if (dbExists) {
        console.log('Database file already exists. Do you want to overwrite it? (y/n)');
        // Since we can't prompt in this script directly, we'll back it up instead
        const backupPath=`${dbPath}.backup-${Date.now()}`;
        fs.copyFileSync(dbPath, backupPath);
        console.log(`Created backup at ${backupPath}`);
    }

    // Open the database
    const db=await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    try {
        // Read schema SQL from a file
        const schemaPath=path.join(process.cwd(), 'lib/db/schema.sql');
        console.log(`Reading schema from ${schemaPath}`);

        if (!fs.existsSync(schemaPath)) {
            console.error(`Schema file not found at ${schemaPath}`);
            return;
        }

        const schema=fs.readFileSync(schemaPath, 'utf8');

        // Execute schema SQL to create tables
        console.log('Creating database tables...');
        await db.exec(schema);
        console.log('Database structure initialized successfully!');

        // Seed the database
        await seedUsers(db);
        await seedKits(db, 100); // You can change the number of kits here

        console.log('Database initialization and seeding complete!');

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        // Close the database connection
        await db.close();
        console.log('Database connection closed');
    }
}

// Run the initialization
initDatabase().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});