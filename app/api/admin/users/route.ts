// app/api/admin/users/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { createUser, deleteUser, getAllUsers } from '@/utils/create-user';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const users = await getAllUsers();
    return NextResponse.json(users);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { username, password, role } = await req.json();

    try {
        const newUser = await createUser(username, password, role);
        return NextResponse.json(newUser, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = await req.json();
    try {
        await deleteUser(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'User deletion failed' }, { status: 500 });
    }
}
