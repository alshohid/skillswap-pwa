'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { BottomNav } from '@/components/common/BottomNav';
import { DashboardHeader } from '@/components/common/DashboardHeader';
import { Sidebar } from '@/components/common/Sidebar';

/**
 * Protected app shell:
 *   - ≥lg : fixed sidebar + content column
 *   - <lg : sticky header + bottom navigation (PWA pattern)
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <div className="min-h-dvh">
        <Sidebar />
        <div className="lg:pl-64">
          <DashboardHeader />
          <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 lg:pb-12">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
