'use client'

import prisma from '@/db'

export default async function Home() {
    const kits = await prisma.kit.findMany()

    return <pre>{JSON.stringify(kits, null, 2)}</pre>
}
