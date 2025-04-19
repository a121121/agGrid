// lib/user-service.ts
import bcrypt from 'bcryptjs';
import prisma from '@/db';

export async function getAllUsers() {
    return await prisma.user.findMany({ select: { id: true, username: true, role: true } });
}

export async function createUser(username: string, password: string, role = 'user') {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            role,
        },
    });
}

export async function deleteUser(userId: string) {
    return await prisma.user.delete({ where: { id: parseInt(userId) } });
}
