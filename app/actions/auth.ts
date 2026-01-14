"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const DEMO_USER_EMAIL = 'mrtstab@gmail.com';
const COMPANY_COOKIE_NAME = 'admin_selected_company_id';

export async function getAuthenticatedUser() {
    // 1. Get Base User
    const user = await prisma.user.findUnique({
        where: { email: DEMO_USER_EMAIL },
        include: { company: true }
    });

    if (!user) throw new Error("User not found");

    // 2. Check Role and Cookie Override
    if (user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN') {
        const cookieStore = await cookies();
        const selectedId = cookieStore.get(COMPANY_COOKIE_NAME)?.value;

        if (selectedId) {
            // Verify the selected company exists (and maybe if admin has access to it)
            // For SUPER_ADMIN, easy access. For COMPANY_ADMIN, restrictive.
            // Assuming SUPER_ADMIN is the main use case requested.

            if (user.role === 'SUPER_ADMIN') {
                const targetCompany = await prisma.company.findUnique({ where: { id: selectedId } });
                if (targetCompany) {
                    return { ...user, companyId: targetCompany.id, company: targetCompany };
                }
            }
        }
    }

    return user;
}

export async function switchAdminCompany(companyId: string) {
    const cookieStore = await cookies();
    cookieStore.set(COMPANY_COOKIE_NAME, companyId);
    return { success: true };
}

export async function getAllCompaniesForSwitcher() {
    // Only fetch minimal data for switcher
    return await prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    });
}
