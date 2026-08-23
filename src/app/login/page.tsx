'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Info, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/utils';
import { loginSchema, type LoginValues } from '@/lib/validators';
import { useLoginMutation } from '@/store/api/authApi';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/dashboard';
  const expired = searchParams.get('expired');

  const { isAuthenticated, isLoading, login } = useAuth();
  const [submitLogin, { isLoading: isPending }] = useLoginMutation();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Already signed in → skip the form entirely.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isLoading, nextPath, router]);

  const onSubmit = async (values: LoginValues) => {
    try {
      const result = await submitLogin(values).unwrap();

      const token = result?.data?.access_token;
      if (!token) throw new Error('No access token returned by the server.');
      // /auth/me revalidates automatically once the token lands in the store.
      login(token, result?.data?.user ?? undefined);
      router.replace(nextPath);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <Card className="mt-8 w-full max-w-sm p-6">
      <h1 className="text-xl font-bold tracking-tight text-zinc-950">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Log in to keep trading skills.
      </p>

      {expired && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2.5 text-xs font-medium text-amber-700">
          <Info className="size-4 shrink-0" aria-hidden />
          Your session expired. Please log in again.
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 space-y-4"
        noValidate
      >
        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          required
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <Button className="cursor-pointer" type="submit" fullWidth size="lg" loading={isPending}>
          {!isPending && <LogIn className="size-4" aria-hidden />}
          Log in
        </Button>
      </form>

      <p className="mt-5 cursor-pointer text-center text-sm text-zinc-500">
        New here?{' '}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <Link href="/" aria-label="SkillSwap home">
        <Logo />
      </Link>
      <Suspense fallback={<div className="mt-8 h-96 w-full max-w-sm animate-pulse rounded-2xl bg-white" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
