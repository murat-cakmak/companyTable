import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { getAuthenticatedUser, getAllCompaniesForSwitcher } from "@/app/actions/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Company Table",
  description: "Editable company data table application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let currentUser = undefined;
  let allCompanies = undefined;

  try {
    currentUser = await getAuthenticatedUser();

    if (currentUser.role === 'SUPER_ADMIN') {
      allCompanies = await getAllCompaniesForSwitcher();
    }
  } catch (e) {
    console.error("Layout auth error:", e);
    // Allow render even if auth fails (e.g. initial setup)
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex flex-col`}
      >
        {currentUser && (
          <AppHeader
            currentUser={currentUser as any} // Type assertion to bypass complex Prisma types in Server->Client prop passing
            allCompanies={allCompanies}
          />
        )}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
