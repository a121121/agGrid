// 📄 lib/db/kit-service.ts
// this component talks to the databse directly
import { getDb } from './db-init';
import { Kit, Change, ChangeLog } from '@/types/kit';

// Interface for Kit data from database
export interface KitDto {
    id: number;
    part_number: string;
    noun: string;
    kit_name: string;
    state_status: string;
    current_status: string | null;
    remarks: string;
    manufacturer: string;
    form48_number: string;
    user_id: number;
    user_name?: string; // Joined from users table
    die_required: number; // SQLite stores booleans as 0/1
    die_number: string;
    version: number;
    created_at: string;
    updated_at: string;
}

// Convert database model to application model
export function mapKitDtoToKit(dto: KitDto): Kit {
    return {
        id: dto.id,
        partNumber: dto.part_number,
        noun: dto.noun,
        kitName: dto.kit_name as Kit['kitName'],
        stateStatus: dto.state_status as Kit['stateStatus'],
        currentStatus: dto.current_status,
        remarks: dto.remarks,
        manufacturer: dto.manufacturer as Kit['manufacturer'],
        form48number: dto.form48_number,
        user: dto.user_name || '',
        dieRequired: dto.die_required === 1,
        dieNumber: dto.die_number,
        version: dto.version
    };
}

// Convert application model to database model
export function mapKitToKitDto(kit: Kit, userId?: number): Partial<KitDto> {
    return {
        part_number: kit.partNumber,
        noun: kit.noun,
        kit_name: kit.kitName,
        state_status: kit.stateStatus,
        current_status: kit.currentStatus,
        remarks: kit.remarks,
        manufacturer: kit.manufacturer,
        form48_number: kit.form48number,
        user_id: userId,
        die_required: kit.dieRequired ? 1 : 0,
        die_number: kit.dieNumber,
        version: kit.version
    };
}

// Get all kits
export async function getAllKits(): Promise<Kit[]> {
    const db = await getDb();

    const kitDtos = await db.all<KitDto[]>(`
    SELECT k.*, u.name as user_name
    FROM kits k
    LEFT JOIN users u ON k.user_id = u.id
    ORDER BY k.id
  `);

    return kitDtos.map(mapKitDtoToKit);
}

// Get kit by ID
export async function getKitById(id: number): Promise<Kit | null> {
    const db = await getDb();

    const kitDto = await db.get<KitDto>(`
    SELECT k.*, u.name as user_name
    FROM kits k
    LEFT JOIN users u ON k.user_id = u.id
    WHERE k.id = ?
  `, [id]);

    return kitDto ? mapKitDtoToKit(kitDto) : null;
}

// Create a new kit
export async function createKit(kit: Omit<Kit, 'id'>, userId: number): Promise<Kit> {
    const db = await getDb();

    const kitDto = mapKitToKitDto(kit as Kit, userId);

    const result = await db.run(`
    INSERT INTO kits (
      part_number, noun, kit_name, state_status, current_status,
      remarks, manufacturer, form48_number, user_id,
      die_required, die_number, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
        kitDto.part_number,
        kitDto.noun,
        kitDto.kit_name,
        kitDto.state_status,
        kitDto.current_status,
        kitDto.remarks,
        kitDto.manufacturer,
        kitDto.form48_number,
        kitDto.user_id,
        kitDto.die_required,
        kitDto.die_number,
        1 // Initial version
    ]);

    const newKit = await getKitById(result.lastID!);
    if (!newKit) throw new Error('Failed to create kit');

    return newKit;
}

// Update a kit with change tracking
export async function updateKit(
    kit: Kit,
    changes: Change<Kit>[],
    userId: number
): Promise<Kit> {
    const db = await getDb();

    await db.run('BEGIN TRANSACTION');

    try {
        // 1. Update the kit record
        const kitDto = mapKitToKitDto(kit, userId);
        const newVersion = kit.version + 1;

        await db.run(`
      UPDATE kits SET
        part_number = ?,
        noun = ?,
        kit_name = ?,
        state_status = ?,
        current_status = ?,
        remarks = ?,
        manufacturer = ?,
        form48_number = ?,
        user_id = ?,
        die_required = ?,
        die_number = ?,
        version = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
            kitDto.part_number,
            kitDto.noun,
            kitDto.kit_name,
            kitDto.state_status,
            kitDto.current_status,
            kitDto.remarks,
            kitDto.manufacturer,
            kitDto.form48_number,
            kitDto.user_id,
            kitDto.die_required,
            kitDto.die_number,
            newVersion,
            kit.id
        ]);

        // 2. Create a change log entry
        const changeLogResult = await db.run(`
      INSERT INTO change_logs (kit_id, user_id, version)
      VALUES (?, ?, ?)
    `, [kit.id, userId, newVersion]);

        const changeLogId = changeLogResult.lastID!;

        // 3. Insert individual change details
        for (const change of changes) {
            await db.run(`
        INSERT INTO change_details (change_log_id, field, old_value, new_value)
        VALUES (?, ?, ?, ?)
      `, [
                changeLogId,
                change.field,
                JSON.stringify(change.oldValue),
                JSON.stringify(change.newValue)
            ]);
        }

        await db.run('COMMIT');

        const updatedKit = await getKitById(kit.id);
        if (!updatedKit) throw new Error('Failed to update kit');

        return updatedKit;
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error updating kit:', error);
        throw error;
    }
}

// Delete a kit
export async function deleteKit(id: number): Promise<boolean> {
    const db = await getDb();

    await db.run('BEGIN TRANSACTION');

    try {
        // Delete change details and logs first due to foreign key constraints
        const changeLogs = await db.all('SELECT id FROM change_logs WHERE kit_id = ?', [id]);

        for (const log of changeLogs) {
            await db.run('DELETE FROM change_details WHERE change_log_id = ?', [log.id]);
        }

        await db.run('DELETE FROM change_logs WHERE kit_id = ?', [id]);

        // Now delete the kit
        const result = await db.run('DELETE FROM kits WHERE id = ?', [id]);

        await db.run('COMMIT');

        return result.changes ? result.changes > 0 : false;
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error deleting kit:', error);
        throw error;
    }
}

// Get kit status at a specific date
export async function getKitStatusAtDate(kitId: number, date: Date): Promise<Kit | null> {
    const db = await getDb();

    // First get the baseline kit
    const kit = await getKitById(kitId);
    if (!kit) return null;

    // Find all change logs for this kit up to the specified date
    const changeLogs = await db.all(`
    SELECT cl.id, cl.version, cl.changed_at, cd.field, cd.old_value, cd.new_value
    FROM change_logs cl
    JOIN change_details cd ON cl.id = cd.change_log_id
    WHERE cl.kit_id = ? AND datetime(cl.changed_at) <= datetime(?)
    ORDER BY cl.changed_at ASC
  `, [kitId, date.toISOString()]);

    // If no changes, return the current kit (assuming it existed before the date)
    if (changeLogs.length === 0) {
        const kitCreatedAt = await db.get('SELECT created_at FROM kits WHERE id = ?', [kitId]);
        if (new Date(kitCreatedAt.created_at) > date) {
            // Kit didn't exist yet at the specified date
            return null;
        }
        return kit;
    }

    // Get the latest version at the specified date
    const latestVersion = changeLogs.reduce((max, log) =>
        Math.max(max, log.version), 0);

    // Get all fields that were different in this version
    const kitAtDate = { ...kit };

    for (const log of changeLogs) {
        const field = log.field as keyof Kit;
        const newValue = JSON.parse(log.new_value);

        // @ts-ignore: Dynamic field assignment
        kitAtDate[field] = newValue;
    }

    // Set the correct version
    kitAtDate.version = latestVersion;

    return kitAtDate;
}

// Add this new function to kit-service.ts
export async function getKitLatestVersion(kitId: number): Promise<number> {
    const db = await getDb();

    const result = await db.get<{ version: number }>(`
        SELECT version 
        FROM change_logs 
        WHERE kit_id = ? 
        ORDER BY version DESC 
        LIMIT 1
    `, [kitId]);

    return result?.version || 1; // Default to 1 if no history exists
}

// Get change history for a kit
export async function getKitChangeHistory(kitId: number, beforeDate?: Date): Promise<ChangeLog<Kit>[]> {
    const db = await getDb();

    // Define date condition based on the optional beforeDate parameter
    const dateCondition = beforeDate
        ? `AND datetime(cl.changed_at) <= datetime('${beforeDate.toISOString()}')`
        : '';

    // Get all change logs for this kit
    const changeLogs = await db.all(`
    SELECT 
      cl.id, 
      cl.version, 
      cl.changed_at, 
      u.name as user_name,
      cd.field, 
      cd.old_value, 
      cd.new_value
    FROM change_logs cl
    JOIN change_details cd ON cl.id = cd.change_log_id
    JOIN users u ON cl.user_id = u.id
    WHERE cl.kit_id = ? ${dateCondition}
    ORDER BY cl.changed_at DESC, cl.id DESC
  `, [kitId]);

    // Group changes by change log ID
    const changeLogMap = new Map<number, ChangeLog<Kit>>();

    for (const log of changeLogs) {
        if (!changeLogMap.has(log.id)) {
            changeLogMap.set(log.id, {
                id: log.id,
                version: log.version,
                changes: [],
                changedAt: new Date(log.changed_at),
                changedBy: log.user_name || `User ${log.user_id}`
            });
        }

        const changeLog = changeLogMap.get(log.id)!;
        changeLog.changes.push({
            field: log.field as keyof Kit,
            oldValue: JSON.parse(log.old_value),
            newValue: JSON.parse(log.new_value)
        });
    }

    return Array.from(changeLogMap.values());
}


const formatDateForApi = (date: Date): string => {
    return ((date).toISOString()).split('T')[0];
};

// Helper function to ensure date is handled correctly without timezone issues
function formatDateForSQLite(date: Date): string {
    // Format date as YYYY-MM-DD with time set to end of day in local timezone
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} 23:59:59`;
}


export async function getAllKitsAtDate(date: Date): Promise<Kit[]> {
    const db = await getDb();
    const formattedDate = formatDateForSQLite(date);

    const kits = await db.all<KitDto[]>(`
        WITH kit_data AS (
            -- Get current versions where created_at <= target date
            SELECT 
                k.id, k.part_number, k.noun, k.kit_name, k.state_status,
                k.current_status, k.remarks, k.manufacturer, k.form48_number,
                k.user_id, k.die_required, k.die_number, k.version,
                k.created_at, k.updated_at, 
                u.name as user_name
            FROM kits k
            LEFT JOIN users u ON k.user_id = u.id
            WHERE datetime(k.created_at) <= datetime(?)
            
            UNION ALL
            
            -- Get historical versions that would have been valid at target date
            SELECT 
                h.id, h.part_number, h.noun, h.kit_name, h.state_status,
                h.current_status, h.remarks, h.manufacturer, h.form48_number,
                h.user_id, h.die_required, h.die_number, h.version,
                h.created_at, h.updated_at,
                u.name as user_name
            FROM kit_history h
            LEFT JOIN users u ON h.user_id = u.id
            WHERE datetime(h.valid_from) <= datetime(?)
            AND datetime(?) < datetime(h.valid_until)
        ),
        -- Find the latest change BEFORE OR AT the target date for each kit
        latest_change_before_date AS (
            SELECT 
                cl.kit_id,
                MAX(cl.version) as max_version
            FROM change_logs cl
            WHERE datetime(cl.changed_at) <= datetime(?)
            GROUP BY cl.kit_id
        )
        SELECT 
            kd.id, kd.part_number, kd.noun, kd.kit_name, kd.state_status,
            kd.current_status, kd.remarks, kd.manufacturer, kd.form48_number,
            kd.user_id, kd.die_required, kd.die_number, kd.version,
            kd.created_at, kd.updated_at, kd.user_name
        FROM kit_data kd
        LEFT JOIN latest_change_before_date lc ON kd.id = lc.kit_id
        WHERE 
            -- If there's a change before our date, use that version
            (lc.max_version IS NOT NULL AND kd.version = lc.max_version)
            -- If there's no change before our date but the kit existed, use version 1
            OR (lc.max_version IS NULL AND kd.version = 1 AND datetime(kd.created_at) <= datetime(?))
        ORDER BY kd.part_number
    `, [formattedDate, formattedDate, formattedDate, formattedDate, formattedDate]);

    return kits.map(kitDto => mapKitDtoToKit(kitDto));
}
// export async function getAllKitsAtDate(date: Date): Promise<Kit[]> {
//     const db = await getDb();

//     // Get all kits that existed at the specified date
//     const baseKits = await db.all<KitDto[]>
//         (`
//         SELECT k.*, u.name as user_name
//         FROM kits k
//         LEFT JOIN users u ON k.user_id = u.id`,
//             // [date.toISOString().split('T')[0]]);
//             // [date.toISOString()]
//         );

//     // console.log(baseKits)
//     // Get all changes before the target date
//     const allChanges = await db.all<{
//         [x: string]: any;
//         kit_id: number;
//         field: string;
//         new_value: string;
//         changed_at: string;
//     }>(`
//         SELECT cl.kit_id, cd.field, cd.new_value, cl.changed_at as changed_at
//         FROM change_logs cl
//         JOIN change_details cd ON cl.id = cd.change_log_id
//         WHERE datetime(cl.changed_at) <= datetime(?)
//         GROUP BY cl.kit_id, cd.field
//     `, [formatDateForApi(date)]);

//     console.log(formatDateForApi(date))
//     // console.log(allChanges)
//     // Apply changes to base kits
//     return baseKits.map(kitDto => {
//         const kit = mapKitDtoToKit(kitDto);
//         const kitChanges = allChanges.filter((c: { kit_id: number; }) => c.kit_id === kit.id);

//         kitChanges.forEach((change: { field: string; new_value: string; }) => {
//             const field = change.field as keyof Kit;
//             // @ts-ignore: Dynamic field assignment
//             kit[field] = JSON.parse(change.new_value);
//         });

//         return kit;
//     });
// }