'use client';

import { Download, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'skillswap_install_dismissed';

/** Floating "Add to Home Screen" card driven by beforeinstallprompt. */
export function InstallPrompt() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const { showToast } = useToast();

  const dismiss = useCallback(() => {
    setPromptEvent(null);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage unavailable — ignore */
    }
  }, []);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      let dismissedRecently = false;
      try {
        const at = Number(window.localStorage.getItem(DISMISS_KEY));
        dismissedRecently =
          Number.isFinite(at) && Date.now() - at < 7 * 24 * 60 * 60 * 1000;
      } catch {
        /* ignore */
      }
      // Already installed as a standalone app → never nag.
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone;
      if (!dismissedRecently && !standalone) {
        setPromptEvent(event as BeforeInstallPromptEvent);
      }
    };

    const onInstalled = () => {
      setPromptEvent(null);
      showToast('SkillSwap installed 🎉 Find it on your home screen.', 'success');
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [showToast]);

  if (!promptEvent) return null;

  const install = async () => {
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      showToast('Installing SkillSwap…', 'info');
    }
    setPromptEvent(null);
  };

  return (
    <div className="fixed inset-x-4 bottom-24 z-[55] lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-80">
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-lg">
        <Logo withText={false} sizeClass="size-10 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-950">Install SkillSwap</p>
          <p className="truncate text-xs text-zinc-500">
            Works offline · Full-screen experience
          </p>
        </div>
        <Button size="sm" onClick={() => void install()}>
          <Download className="size-3.5" aria-hidden />
          Install
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
