"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

export interface CompanySettings {
    logoUrl?: string;
    brandColor?: string;
    dateFormat?: string;
    currency?: string;
}

export async function fetchCompanySettings() {
    try {
        const user = await getAuthenticatedUser();
        const company = await prisma.company.findUnique({
            where: { id: user.companyId },
            select: { settings: true, plan: true, subscriptionEndDate: true }
        });

        return {
            settings: (company?.settings as CompanySettings) || {},
            plan: company?.plan,
            subscriptionEndDate: company?.subscriptionEndDate
        };
    } catch (error) {
        return null;
    }
}

export async function updateCompanySettings(settings: CompanySettings) {
    try {
        const user = await getAuthenticatedUser();

        // Authorization check: Only ADMIN, COMPANY_ADMIN, SUPER_ADMIN
        if (!['ADMIN', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.company.update({
            where: { id: user.companyId },
            data: { settings: settings as any }
        });

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update settings" };
    }
}
