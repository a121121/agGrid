// kit-service.ts
// import { PrismaClient } from '@prisma/client';
import prisma from '@/db';

import { Kit } from '../types/kit';
// const prisma = new PrismaClient();

export class KitService {
    /**
     * Get the current version of a kit
     * @param originalKitId The original kit ID
     */
    async getCurrentVersion(id: number): Promise<Kit | null> {
        return await prisma.kit.findFirst({
            where: {
                id: id,
                validUntil: new Date('9999-12-31T23:59:59')
            }
        }) as Kit | null;
    }

    /**
     * Get all versions of a kit
     * @param originalKitId The original kit ID
     */
    async getVersionHistory(originalKitId: number) {
        return await prisma.kit.findMany({
            where: {
                originalKitId
            },
            orderBy: {
                version: 'asc'
            }
        });
    }

    /**
     * Update a kit and create a new version
     * @param kitId ID of the current version of the kit
     * @param updates Partial Kit object containing fields to update
     * @param userName User making the change
     */
    async updateKit(kitId: number, updates: Partial<Kit>, userName: string): Promise<Kit> {
        // Start a transaction
        return await prisma.$transaction(async (tx) => {
            // 1. Get current kit version
            const currentKit = await tx.kit.findUnique({
                where: { id: kitId }
            });

            if (!currentKit) {
                throw new Error(`Kit with ID ${kitId} not found`);
            }

            // Verify this is the current version
            const isCurrent = currentKit.validUntil.getTime() === new Date('9999-12-31T23:59:59').getTime();
            if (!isCurrent) {
                throw new Error(`Kit version ${currentKit.version} is not the current version`);
            }

            // 2. Set the validUntil timestamp for the current version
            // here basically we are freezing the previous version by making validUntil to now
            // lets keep "everything" ISO!
            const changeTime = new Date(); //This is actually ISO time/ date
            await tx.kit.update({
                where: { id: kitId },
                data: { validUntil: changeTime }
            });

            // 3. Create a new version
            const newVersion = currentKit.version + 1;
            const newKit = await tx.kit.create({
                data: {
                    ...currentKit, // baki sb cheezain purani lo
                    ...updates, // change yahan se lo
                    id: undefined, // Let Prisma auto-generate
                    userName, // Make sure userName is passed correctly
                    version: newVersion,
                    createdAt: changeTime,
                    validUntil: new Date('9999-12-31T23:59:59')
                }
            });

            // 4. Create audit log entries for each changed field
            const changedFields = Object.keys(updates) as Array<keyof Kit>;

            for (const field of changedFields) {
                // Type-safe way to access properties
                const oldValue = field in currentKit ? currentKit[field as keyof typeof currentKit] : null;
                const newValue = updates[field];

                // Only create log entry if the value actually changed
                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    await tx.auditLog.create({
                        data: {
                            kitId: currentKit.originalKitId,
                            userName,
                            version: newVersion,
                            field: field.toString(), // Convert the field key to a string
                            oldValue: JSON.stringify(oldValue),
                            newValue: JSON.stringify(newValue),
                            changedAt: changeTime
                        }
                    });
                }
            }

            return newKit as Kit;
        });
    }

    /**
     * Create a new kit
     * @param kitData Kit data
     */
    async createKit(kitData: Omit<Kit, 'id' | 'version'>): Promise<Kit> {
        return await prisma.$transaction(async (tx) => {
            // 1. Create initial kit version
            const kit = await tx.kit.create({
                data: {
                    ...kitData,
                    version: 1,
                    originalKitId: -1 // Temporary value
                }
            });

            // 2. Update originalKitId to point to itself
            const updatedKit = await tx.kit.update({
                where: { id: kit.id },
                data: { originalKitId: kit.id }
            });

            return updatedKit as Kit;
        });
    }

    /**
     * Get kit version at a specific point in time
     * @param originalKitId The original kit ID
     * @param timestamp The point in time
     */
    async getVersionAtTime(originalKitId: number, timestamp: Date): Promise<Kit | null> {
        return await prisma.kit.findFirst({
            where: {
                originalKitId,
                createdAt: {
                    lte: timestamp
                },
                validUntil: {
                    gt: timestamp
                }
            }
        }) as Kit | null;
    }


    /**
     * Get allkit versions at a specific point in time
     * @param timestamp The point in time
     */
    async getAllKitsAtDate(timestamp: Date): Promise<Kit | null | any> {
        return await prisma.kit.findMany({
            where: {
                createdAt: {
                    lte: timestamp
                },
                validUntil: {
                    gt: timestamp
                }
            }
        });
    }
}

/**
 * Get the audit log for a kit
 * @param originalKitId The original kit ID
 */
// async getAuditLog(originalKitId: number) {
//     return await prisma.auditLog.findMany({
//         where: {
//             kitId: originalKitId
//         },
//         orderBy: {
//             changedAt: 'asc'
//         }
//     });
// }