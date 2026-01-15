"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateProfile(data: { name: string }) {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) return { success: false, error: "Not authenticated" };

        await prisma.user.update({
            where: { id: currentUser.id },
            data: { name: data.name }
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update profile" };
    }
}

export async function changePassword(newPassword: string) {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) return { success: false, error: "Not authenticated" };

        // In real app, old password verification is needed.
        const passwordHash = `HASH:${newPassword}`;

        await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                passwordHash: passwordHash,
                mustChangePassword: false
            }
        });

        // Clear restriction cookie
        const cookieStore = await cookies();
        cookieStore.delete('must_change_password');

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to change password" };
    }
}
