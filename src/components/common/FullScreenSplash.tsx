import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

/** Full-screen loading state shown while the auth session bootstraps. */
export function FullScreenSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50">
      <Logo />
      <Loader2 className="size-5 animate-spin text-brand" aria-hidden />
    </div>
  );
}
