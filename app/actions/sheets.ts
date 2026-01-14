"use server";

import { prisma } from "@/lib/prisma";
import { Sheet, Column } from "@/types/table";
import { getAuthenticatedUser } from "@/app/actions/auth";

// --- Fetch Data ---

export async function fetchCompanyData(): Promise<Sheet[]> {
    try {
        const user = await getAuthenticatedUser();
        const companyId = user.companyId;

        const dbSheets = await prisma.sheet.findMany({
            where: { companyId: companyId },
            include: {
                tables: {
                    include: {
                        rows: {
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });

        if (dbSheets.length === 0) return [];

        // Transform DB structure to Frontend structure
        const frontendSheets: Sheet[] = dbSheets.map((sheet) => ({
            id: sheet.id,
            name: sheet.name,
            color: sheet.color || undefined,
            tables: sheet.tables.map((table) => ({
                id: table.id,
                columns: table.columns as unknown as Column[],
                rowHeight: table.rowHeight || undefined,
                rows: table.rows.map((row) => ({
                    id: row.id,
                    cells: (row.data as any) || {},
                }))
            }))
        }));

        return frontendSheets;

    } catch (error) {
        console.error("Error fetching sheets:", error);
        // Do not throw to avoid crashing UI completely, return empty
        return [];
    }
}

// --- Save Data ---

export async function saveCompanyData(sheets: Sheet[]) {
    try {
        const user = await getAuthenticatedUser();
        const companyId = user.companyId;

        await prisma.$transaction(async (tx) => {
            // 1. Get existing IDs to update/delete
            const existingSheets = await tx.sheet.findMany({
                where: { companyId: companyId },
                select: { id: true }
            });
            const existingSheetIds = existingSheets.map((s) => s.id);
            const incomingSheetIds = sheets.map((s) => s.id);

            // Delete Sheets not in incoming
            const sheetsToDelete = existingSheetIds.filter((id) => !incomingSheetIds.includes(id));
            if (sheetsToDelete.length > 0) {
                await tx.sheet.deleteMany({ where: { id: { in: sheetsToDelete } } });
            }

            // Upsert Sheets
            for (let i = 0; i < sheets.length; i++) {
                const s = sheets[i];
                await tx.sheet.upsert({
                    where: { id: s.id },
                    update: {
                        name: s.name,
                        color: s.color,
                        order: i
                    },
                    create: {
                        id: s.id,
                        name: s.name,
                        color: s.color,
                        order: i,
                        companyId: companyId
                    }
                });

                // Handle Tables for this Sheet
                const incomingTables = s.tables;
                const existingTables = await tx.table.findMany({ where: { sheetId: s.id }, select: { id: true } });
                const existingTableIds = existingTables.map((t) => t.id);
                const incomingTableIds = incomingTables.map((t) => t.id);

                // Delete Tables
                const tablesToDelete = existingTableIds.filter((id) => !incomingTableIds.includes(id));
                if (tablesToDelete.length > 0) {
                    await tx.table.deleteMany({ where: { id: { in: tablesToDelete } } });
                }

                // Upsert Tables
                for (const t of incomingTables) {
                    await tx.table.upsert({
                        where: { id: t.id },
                        update: {
                            columns: t.columns as any,
                            rowHeight: t.rowHeight,
                        },
                        create: {
                            id: t.id,
                            sheetId: s.id,
                            name: "Table",
                            columns: t.columns as any,
                            rowHeight: t.rowHeight,
                        }
                    });

                    // Handle Rows (Full replace per table)
                    await tx.row.deleteMany({ where: { tableId: t.id } });

                    if (t.rows.length > 0) {
                        await tx.row.createMany({
                            data: t.rows.map((r) => ({
                                id: r.id,
                                tableId: t.id,
                                data: r.cells as any,
                                createdById: user.id, // User ID from getAuthenticatedUser
                            }))
                        });
                    }
                }
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Save failed SERVER SIDE:", error);
        return { success: false, error: String(error) };
    }
}
