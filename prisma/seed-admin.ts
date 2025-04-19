// scripts/seed-admin.ts
import { createUser } from '../utils/create-user';

async function seedAdmin() {
    try {
        await createUser(
            'admin',
            'securepassword',
            'admin'
        );
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Failed to create admin user:', error);
    }
}

seedAdmin();