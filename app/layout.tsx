import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { SubscriptionLockModal } from "@/components/SubscriptionLockModal";
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

    if (currentUser && currentUser.role === 'SUPER_ADMIN') {
      allCompanies = await getAllCompaniesForSwitcher();
    }
  } catch (e) {
    console.error("Layout auth error:", e);
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex flex-col`}
      >
        {currentUser && (
          <>
            <AppHeader
              currentUser={currentUser as any}
              allCompanies={allCompanies}
            />
            {currentUser.company && (
              <>
                <SubscriptionBanner endDate={currentUser.company.subscriptionEndDate} />
                <SubscriptionLockModal
                  endDate={currentUser.company.subscriptionEndDate}
                  role={currentUser.role}
                />
              </>
            )}
          </>
        )}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
