"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string }) {
    try {
        const currentUser = await getAuthenticatedUser();

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

        // In a real app, verify old password first if provided.
        // Also hash the new password.
        const passwordHash = `HASH:${newPassword}`; // Mock hash

        await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                passwordHash: passwordHash,
                mustChangePassword: false // Clear the flag
            }
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to change password" };
    }
}
