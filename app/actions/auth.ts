"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DEMO_USER_EMAIL = 'mrtstab@gmail.com';
const COMPANY_COOKIE_NAME = 'admin_selected_company_id';
const SESSION_COOKIE_NAME = 'user_session_email';
const MUST_CHANGE_PASSWORD_COOKIE_NAME = 'must_change_password';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, error: "Email and password required" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return { success: false, error: "Invalid credentials" };
        }

        // Mock Password Check
        let isValid = false;

        if (user.passwordHash) {
            if (user.passwordHash.startsWith("TEMP_HASH:") || user.passwordHash.startsWith("HASH:")) {
                const storedPass = user.passwordHash.split(":")[1];
                if (storedPass === password) isValid = true;
            }
            else if (user.passwordHash === password) {
                isValid = true;
            }
        } else {
            if (email === DEMO_USER_EMAIL) isValid = true;
        }

        if (!isValid) {
            return { success: false, error: "Invalid credentials" };
        }

        // Set Session
        const cookieStore = await cookies();

        cookieStore.set(SESSION_COOKIE_NAME, email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        if (user.mustChangePassword) {
            cookieStore.set(MUST_CHANGE_PASSWORD_COOKIE_NAME, 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Login Error", error);
        return { success: false, error: "Something went wrong" };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(COMPANY_COOKIE_NAME);
    cookieStore.delete(MUST_CHANGE_PASSWORD_COOKIE_NAME);
    redirect('/login');
}

export async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionEmail = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Return null if explicit session check fails in strict mode, but here we fallback to demo or null
    if (!sessionEmail && !DEMO_USER_EMAIL) {
        return null;
    }

    // However, if we want to force login, we should strictly check sessionEmail.
    // For now, if no cookie, we return null so Layout won't render Header.
    if (!sessionEmail) return null;

    const emailToFetch = sessionEmail || DEMO_USER_EMAIL;

    // 1. Get Base User
    const user = await prisma.user.findUnique({
        where: { email: emailToFetch },
        include: { company: true }
    });

    if (!user) {
        return null;
    }

    // 2. Check Role and Cookie Override (For Super Admin Company Switching)
    if (user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN') {
        const selectedId = cookieStore.get(COMPANY_COOKIE_NAME)?.value;

        if (selectedId) {
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
    return await prisma.company.findMany({
        select: { id: true, name: true, subscriptionEndDate: true },
        orderBy: { name: 'asc' }
    });
}
