"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";

export function AppHeader() {
    return (
        <header className="h-10 border-b bg-white dark:bg-zinc-900 flex items-center px-4 shrink-0 shadow-sm z-10 justify-between">
            <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Company Data
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button suppressHydrationWarning className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full pl-2 pr-1 py-1 transition-colors focus:outline-none cursor-pointer">
                            <div className="flex flex-col items-end text-xs mr-1">
                                <span className="font-medium text-zinc-700 dark:text-zinc-200">Murat Çakmak</span>
                                <span className="text-zinc-500 text-[10px]">Admin</span>
                            </div>
                            <Avatar className="h-7 w-7 border border-zinc-200 dark:border-zinc-700">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>MÇ</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
