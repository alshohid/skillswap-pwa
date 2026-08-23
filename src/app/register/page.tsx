'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserRoundPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/utils';
import { registerSchema, type RegisterValues } from '@/lib/validators';
import { useRegisterMutation } from '@/store/api/authApi';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [submitRegister, { isLoading: isPending }] = useRegisterMutation();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (values: RegisterValues) => {
    try {
      await submitRegister({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      }).unwrap();
      showToast('Welcome to SkillSwap! 🎉', 'success');
      router.replace('/dashboard');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <Link href="/" aria-label="SkillSwap home">
        <Logo />
      </Link>

      <Card className="mt-8 w-full max-w-sm p-6">
        <h1 className="text-xl font-bold tracking-tight text-zinc-950">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Start with 100 free Skill Points.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 space-y-4"
          noValidate
        >
          <FormField
            label="Full name"
            htmlFor="fullName"
            error={errors.fullName?.message}
            required
          >
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="John Doe"
              error={!!errors.fullName}
              {...register('fullName')}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
            required
          >
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
            hint="At least 6 characters"
            required
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.password}
              {...register('password')}
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
            required
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
          </FormField>

          <Button className="cursor-pointer" type="submit" fullWidth size="lg" loading={isPending}>
            {!isPending && <UserRoundPlus className="size-4" aria-hidden />}
            Create account
          </Button>
        </form>

        <p className="mt-5 cursor-pointer text-center text-sm text-zinc-500">
          Already a member?{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
