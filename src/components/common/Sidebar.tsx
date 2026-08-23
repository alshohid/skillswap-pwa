'use client';

import {
  ClipboardList,
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/common/Logo';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: SidebarItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'Browse Tasks', icon: Compass },
  { href: '/dashboard/my-tasks', label: 'My Tasks', icon: ClipboardList },
  { href: '/dashboard/applications', label: 'Applications', icon: FileText },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Wallet },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

/** Desktop navigation rail (hidden below lg). */
export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
      <div className="px-5 py-5">
        <Link href="/dashboard" aria-label="SkillSwap home">
          <Logo />
        </Link>
      </div>

      <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand/10 text-brand'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
              )}
            >
              <item.icon className="size-4.5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-zinc-200 p-4">
        <UserAvatar name={user?.full_name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-950">
            {user?.full_name ?? '…'}
          </p>
          <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-danger/5 hover:text-danger"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
