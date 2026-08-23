'use client';

import {
  ArrowRight,
  BriefcaseBusiness,
  Coins,
  Handshake,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const FEATURES = [
  {
    icon: BriefcaseBusiness,
    title: 'Post tasks with points',
    description:
      'Describe what you need and offer Skill Points from your balance — no money involved.',
  },
  {
    icon: Handshake,
    title: 'Apply & collaborate',
    description:
      'Browse open tasks, apply with a short pitch, and get assigned by the task owner.',
  },
  {
    icon: Coins,
    title: 'Earn & spend points',
    description:
      'Complete a task and the points transfer instantly through a secure ACID transaction.',
  },
];

const STEPS = [
  'Create your account and start with 100 free Skill Points.',
  'Post a task you need done, or apply to tasks posted by others.',
  'On completion, points move automatically — everyone grows together.',
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard" className={buttonClasses('primary', 'sm')}>
              Open app
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonClasses('ghost', 'sm', 'text-zinc-600')}
              >
                Log in
              </Link>
              <Link href="/register" className={buttonClasses('primary', 'sm')}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        {/* Hero */}
        <section className="animate-rise flex flex-col items-center pb-14 pt-12 text-center sm:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
            <SparklesInline />
            Community skill marketplace
          </span>
          <h1 className="mt-5 max-w-2xl text-balance text-4xl font-extrabold leading-tight tracking-tight text-zinc-950 sm:text-5xl">
            Trade skills,{' '}
            <span className="text-brand">not money.</span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-6 text-zinc-500">
            SkillSwap lets members help each other with tasks — design, code,
            writing, anything — and settle up with Skill Points instead of cash.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={isAuthenticated ? '/dashboard' : '/register'}
              className={buttonClasses('primary', 'lg')}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Create free account'}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            {!isAuthenticated && (
              <Link href="/login" className={buttonClasses('secondary', 'lg')}>
                I already have an account
              </Link>
            )}
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <ShieldCheck className="size-3.5" aria-hidden />
            Installable PWA · Works offline · Secure point transfers
          </p>
        </section>

        {/* Features */}
        <section className="grid gap-4 pb-14 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <feature.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-zinc-950">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-5 text-zinc-500">
                {feature.description}
              </p>
            </Card>
          ))}
        </section>

        {/* How it works */}
        <section className="pb-16">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-950">
            How it works
          </h2>
          <ol className="mx-auto mt-6 max-w-2xl space-y-3">
            {STEPS.map((step, index) => (
              <li key={step}>
                <Card className="flex items-start gap-4 p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1.5 text-sm leading-6 text-zinc-700">{step}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} SkillSwap · Built as an installable PWA
      </footer>
    </div>
  );
}

function SparklesInline() {
  return <Rocket className="size-3.5" aria-hidden />;
}
