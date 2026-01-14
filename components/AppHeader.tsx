"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Import cn utility

export function AppHeader() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Editor" },
        { href: "/dashboard", label: "Dashboard" },
    ];

    return (
        <header className="h-10 border-b bg-white dark:bg-zinc-900 flex items-center px-4 shrink-0 shadow-sm z-10 justify-between">
            <div className="flex items-center gap-6">
                <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Company Data
                </div>
                <nav className="flex items-center gap-4">
                    {links.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-xs font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full" suppressHydrationWarning>
                            <Avatar className="h-6 w-6">
                                <AvatarImage src="/avatars/01.png" alt="@murat" />
                                <AvatarFallback className="text-[10px]">MA</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Murat Admin</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    admin@demo.com
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 font-medium">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
