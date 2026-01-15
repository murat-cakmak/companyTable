import React from "react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Hero / Visual */}
            <div className="hidden lg:flex flex-col bg-zinc-900 text-white p-12 justify-between">
                <div>
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <span className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <span className="w-4 h-4 border-2 border-white rounded-sm" />
                        </span>
                        CompanyTable
                    </div>
                    <div className="mt-20 max-w-md">
                        <h1 className="text-4xl font-bold tracking-tight mb-6">Manage your data with confidence.</h1>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            The most powerful, secure, and flexible spreadsheet-like database for modern companies.
                        </p>
                    </div>
                </div>
                <div className="text-zinc-500 text-sm">
                    © 2026 CompanyTable Inc.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Sign in to your account</h2>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Enter your credentials to access the dashboard.
                        </p>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
