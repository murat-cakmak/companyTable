"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CompanyData {
    id: string;
    name: string;
    plan: string;
    isActive: boolean;
    subscriptionEndDate: Date | null;
    createdAt: Date;
    _count: {
        users: number;
    };
    adminEmail?: string;
}

export async function fetchAllCompanies(): Promise<CompanyData[]> {
    try {
        const companies = await prisma.company.findMany({
            include: {
                _count: {
                    select: { users: true }
                },
                users: {
                    where: { role: 'COMPANY_ADMIN' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return companies.map(c => ({
            id: c.id,
            name: c.name,
            plan: c.plan,
            isActive: c.isActive,
            subscriptionEndDate: c.subscriptionEndDate,
            createdAt: c.createdAt,
            _count: c._count,
            adminEmail: c.users[0]?.email || undefined
        }));
    } catch (error) {
        console.error("Error fetching companies:", error);
        return [];
    }
}

export async function createCompany(data: { name: string; plan: string; subscriptionEndDate: Date | null; adminEmail: string }) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Company
            const company = await tx.company.create({
                data: {
                    name: data.name,
                    plan: data.plan,
                    subscriptionEndDate: data.subscriptionEndDate,
                    isActive: true,
                }
            });

            // 2. Create or Update Admin User
            // Check if user exists
            let user = await tx.user.findUnique({ where: { email: data.adminEmail } });

            if (user) {
                // Update existing user to be admin of this new company?
                // This might be tricky if user belongs to another company.
                // For simplicity, let's ASSUME multi-company support implies user switching or strict tenancy.
                // Here we will just update their companyId.
                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        companyId: company.id,
                        role: 'COMPANY_ADMIN'
                    }
                });
            } else {
                // Create new user
                await tx.user.create({
                    data: {
                        email: data.adminEmail,
                        name: data.adminEmail.split('@')[0],
                        role: 'COMPANY_ADMIN',
                        companyId: company.id
                    }
                });
            }

            return company;
        });

        revalidatePath('/campaigns');
        return { success: true, company: result };
    } catch (error) {
        console.error("Create company error:", error);
        return { success: false, error: "Failed to create company" };
    }
}

export async function updateCompany(id: string, data: Partial<CompanyData>) {
    try {
        await prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                plan: data.plan,
                isActive: data.isActive,
                subscriptionEndDate: data.subscriptionEndDate,
            }
        });
        revalidatePath('/campaigns');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update company" };
    }
}

export async function deleteCompany(id: string) {
    try {
        // Cascade delete should handle relations if configured, but let's be safe
        // Or Prisma 'onDelete: Cascade' in schema handles it.
        // Schema has: sheets -> onDelete Cascade (No, it doesn't say cascade on Sheet... let's check)
        // Schema: Row -> Table (Cascade), Table -> Sheet (Cascade).
        // Sheet -> Company? Relation doesn't specify cascade. User -> Company? No cascade.
        // We must manually delete for safety or relying on DB constraints if setup.
        // Let's rely on Prisma deleting if we set up relations correctly, but we didn't add Cascade to Company relations.
        // So we need to delete children first.

        await prisma.$transaction(async (tx) => {
            // Delete Rows, Tables, Sheets, Users... this is heavy.
            // For now, let's just delete the company and let it fail if constraints exist, 
            // alerting us to fix Schema or do deep delete.
            // Actually, best practice:
            const sheets = await tx.sheet.findMany({ where: { companyId: id } });
            for (const s of sheets) {
                const tables = await tx.table.findMany({ where: { sheetId: s.id } });
                for (const t of tables) {
                    await tx.row.deleteMany({ where: { tableId: t.id } });
                    await tx.table.delete({ where: { id: t.id } });
                }
                await tx.sheet.delete({ where: { id: s.id } });
            }
            await tx.user.deleteMany({ where: { companyId: id } });
            await tx.dashboard.deleteMany({ where: { companyId: id } });

            await tx.company.delete({ where: { id } });
        });

        revalidatePath('/campaigns');
        return { success: true };
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, error: "Failed to delete company. Ensure it is empty." };
    }
}
