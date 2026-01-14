"use server";

import { prisma } from "@/lib/prisma";

// Mock user email as we did in sheets.ts
const DEMO_USER_EMAIL = 'mrtstab@gmail.com';

export interface DashboardStats {
    totalSheets: number;
    totalTables: number;
    totalRows: number;
    lastUpdated: Date | null;
    recentSheets: { id: string; name: string; updatedAt: Date }[];
}

import { getAuthenticatedUser } from "@/app/actions/auth";

export async function fetchDashboardStats(): Promise<DashboardStats> {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return {
                totalSheets: 0,
                totalTables: 0,
                totalRows: 0,
                lastUpdated: null,
                recentSheets: []
            };
        }

        const sheets = await prisma.sheet.findMany({
            where: { companyId: user.companyId },
            include: {
                tables: {
                    include: {
                        _count: {
                            select: { rows: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const totalSheets = sheets.length;
        const totalTables = sheets.reduce((acc, sheet) => acc + sheet.tables.length, 0);
        const totalRows = sheets.reduce((acc, sheet) => acc + sheet.tables.reduce((tAcc, table) => tAcc + table._count.rows, 0), 0);
        const lastUpdated = sheets.length > 0 ? sheets[0].updatedAt : null;

        // Take top 5 recent sheets
        const recentSheets = sheets.slice(0, 5).map(s => ({
            id: s.id,
            name: s.name,
            updatedAt: s.updatedAt
        }));

        return {
            totalSheets,
            totalTables,
            totalRows,
            lastUpdated,
            recentSheets
        };

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw new Error("Failed to load dashboard data");
    }
}
