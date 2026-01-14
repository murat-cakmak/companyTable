"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Mock auth
const DEMO_USER_EMAIL = 'mrtstab@gmail.com';

export interface UserData {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    createdAt: Date;
}

async function getAuthenticatedUser() {
    const user = await prisma.user.findUnique({
        where: { email: DEMO_USER_EMAIL },
        include: { company: true }
    });
    if (!user) throw new Error("User not found");
    return user;
}

export async function fetchCompanyUsers(): Promise<UserData[]> {
    try {
        const user = await getAuthenticatedUser();
        const users = await prisma.user.findMany({
            where: { companyId: user.companyId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            }
        });
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function inviteUser(email: string, role: string) {
    try {
        const admin = await getAuthenticatedUser();

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return { success: false, error: "User already exists with this email." };
        }

        // Create user
        await prisma.user.create({
            data: {
                email,
                name: email.split('@')[0], // Default name from email
                role: role as Role,
                companyId: admin.companyId,
                // In a real app we would send an invite email, no password set yet
            }
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error("Error inviting user:", error);
        return { success: false, error: "Failed to invite user." };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({ where: { id: userId } });
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete user." };
    }
}
