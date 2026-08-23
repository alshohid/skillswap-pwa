'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Coins, Pencil, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/common/PageHeader';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import {
  formatMonthYear,
  formatPoints,
  getErrorMessage,
} from '@/lib/utils';
import { profileSchema, type ProfileValues } from '@/lib/validators';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/usersApi';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // GET /users/me — the dedicated profile endpoint.
  const {
    data: profile,
    isLoading,
  } = useGetProfileQuery(undefined, { skip: !user });

  const [updateProfile, { isLoading: isPending }] = useUpdateProfileMutation();

  const [editOpen, setEditOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '' },
  });

  // Pre-fill the edit form whenever it opens.
  useEffect(() => {
    if (editOpen) {
      reset({ fullName: profile?.full_name ?? user?.full_name ?? '' });
    }
  }, [editOpen, profile?.full_name, user?.full_name, reset]);

  if (isLoading && !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  const shown = profile ?? user;

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateProfile({ fullName: values.fullName }).unwrap();
      setEditOpen(false);
      showToast('Profile updated ✅', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <div className="animate-rise mx-auto max-w-xl">
      <PageHeader title="Profile" />

      {/* Identity card */}
      <Card className="p-6 text-center">
        <UserAvatar
          name={shown?.full_name}
          sizeClass="mx-auto size-20 text-2xl"
        />
        <h2 className="mt-4 text-lg font-bold text-zinc-950">
          {shown?.full_name ?? 'Member'}
        </h2>
        <p className="text-sm text-zinc-500">{shown?.email}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand/5 p-3">
            <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500">
              <Coins className="size-3.5 text-brand" aria-hidden />
              Balance
            </p>
            <p className="mt-0.5 font-bold tabular-nums text-brand">
              {formatPoints(shown?.skill_points ?? 0)}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500">
              <CalendarDays className="size-3.5" aria-hidden />
              Member since
            </p>
            <p className="mt-0.5 font-bold text-zinc-700">
              {shown?.created_at
                ? formatMonthYear(shown.created_at)
                : '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">About</h3>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
          {shown?.bio || 'No bio yet — tell the community about yourself.'}
        </p>
      </Card>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        className="mt-4"
        onClick={() => setEditOpen(true)}
      >
        <Pencil className="size-4" aria-hidden />
        Edit Profile
      </Button>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        description="Currently only your display name can be changed."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            label="Full name"
            htmlFor="profile-name"
            error={errors.fullName?.message}
            required
          >
            <Input
              id="profile-name"
              autoFocus
              error={!!errors.fullName}
              {...register('fullName')}
            />
          </FormField>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-zinc-500">
            <UserRound className="size-3.5 shrink-0" aria-hidden />
            Email addresses can't be changed right now.
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
