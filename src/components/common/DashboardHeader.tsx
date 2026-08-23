'use client';

import { Bell, Coins, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/common/Logo';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/hooks/use-auth';
import { useGetBalanceQuery } from '@/store/api/transactionsApi';
import { formatPoints } from '@/lib/utils';

/** Sticky top bar: brand (mobile), live balance, applications and account menu. */
export function DashboardHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: balance } = useGetBalanceQuery(undefined, { skip: !user });
  const points = balance ?? user?.skill_points ?? 0;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/dashboard" className="lg:hidden" aria-label="SkillSwap home">
          <Logo />
        </Link>
        {/* Sidebar owns branding on desktop */}
        <span className="hidden lg:block" aria-hidden />

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <span
            title="Your balance"
            className="hidden items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand sm:inline-flex"
          >
            <Coins className="size-3.5" aria-hidden />
            {formatPoints(points)}
          </span>

          <Link
            href="/dashboard/applications"
            aria-label="Applications"
            title="Applications"
            className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
          >
            <Bell className="size-5" aria-hidden />
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              className="rounded-full transition hover:ring-4 hover:ring-zinc-200/70"
            >
              <UserAvatar name={user?.full_name} sizeClass="size-9" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg"
                >
                  <div className="border-b border-zinc-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-zinc-950">
                      {user?.full_name ?? '…'}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    role="menuitem"
                    href="/dashboard/profile"
                    className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                  >
                    <UserIcon className="size-4 text-zinc-400" aria-hidden />
                    Profile
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/5"
                  >
                    <LogOut className="size-4" aria-hidden />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
