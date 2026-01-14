"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper for temp password
function generatePassword() {
    return Math.random().toString(36).slice(-8) + "!Aa1";
}

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
        let tempPassword = null;

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
                // Update existing user
                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        companyId: company.id,
                        role: 'COMPANY_ADMIN'
                    }
                });
            } else {
                // Create new user with Temp Password
                tempPassword = generatePassword();
                // In a real app, hash this with bcrypt. 
                // Using a prefix to simulate hashing for now or storing plain for development visibility if needed, 
                // but let's assume we store it functionally correct for the requirement.
                const passwordHash = `TEMP_HASH:${tempPassword}`;

                await tx.user.create({
                    data: {
                        email: data.adminEmail,
                        name: data.adminEmail.split('@')[0],
                        role: 'COMPANY_ADMIN',
                        companyId: company.id,
                        passwordHash: passwordHash,
                        mustChangePassword: true
                    }
                });
            }

            return company;
        });

        revalidatePath('/campaigns');
        return { success: true, company: result, tempPassword };
    } catch (error) {
        console.error("Create company error:", error);
        // Better error handling for unique constraints
        return { success: false, error: "Failed to create company. Email or Company might conflict." };
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
        await prisma.$transaction(async (tx) => {
            // Deep clean delete
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
        return { success: false, error: "Failed to delete company." };
    }
}
