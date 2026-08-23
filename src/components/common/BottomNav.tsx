'use client';

import { Home, Plus, Search, User, Wallet, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Raised circular action in the middle of the bar. */
  primary?: boolean;
  /** Paths that should NOT activate this item. */
  exclude?: string[];
}

const ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  {
    href: '/dashboard/tasks',
    label: 'Browse',
    icon: Search,
    exclude: ['/dashboard/tasks/create'],
  },
  { href: '/dashboard/tasks/create', label: 'Create', icon: Plus, primary: true },
  { href: '/dashboard/transactions', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exclude?.some((path) => pathname.startsWith(path))) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Mobile-only bottom navigation with a raised Create action (PWA pattern). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item);

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex flex-col items-center"
              >
                <span className="-mt-7 flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 ring-4 ring-white transition-transform active:scale-95">
                  <item.icon className="size-6" aria-hidden />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                active ? 'text-brand' : 'text-zinc-500 hover:text-zinc-800',
              )}
            >
              <item.icon className="size-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
