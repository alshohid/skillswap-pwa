'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/utils';
import {
  createTaskSchema,
  type CreateTaskValues,
} from '@/lib/validators';
import { useCreateTaskMutation } from '@/store/api/tasksApi';

const POINT_PRESETS = [25, 50, 100];

export default function CreateTaskPage() {
  const router = useRouter();
  const [createTask, { isLoading: isPending }] = useCreateTaskMutation();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { title: '', description: '', pointsOffered: 50 },
  });

  const pointsOffered = watch('pointsOffered');

  const onSubmit = async (values: CreateTaskValues) => {
    try {
      const created = await createTask({
        title: values.title,
        description: values.description,
        pointsOffered: values.pointsOffered,
      }).unwrap();

      showToast('Task created 🎉', 'success');
      router.replace(
        created?.id
          ? `/dashboard/tasks/${created.id}`
          : '/dashboard/my-tasks',
      );
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <div className="animate-rise mx-auto max-w-xl">
      <PageHeader
        title="Create a Task"
        subtitle="Describe what you need and how many points you offer."
        backHref="/dashboard/tasks"
      />

      <Card className="p-5 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            label="Title"
            htmlFor="title"
            error={errors.title?.message}
            hint="A short summary, e.g. “Build a responsive landing page”."
            required
          >
            <Input
              id="title"
              placeholder="What do you need help with?"
              error={!!errors.title}
              {...register('title')}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="description"
            error={errors.description?.message}
            hint="Include context, expectations and deliverables."
            required
          >
            <Textarea
              id="description"
              placeholder="Describe the task in detail…"
              error={!!errors.description}
              {...register('description')}
            />
          </FormField>

          <FormField
            label="Skill Points offered"
            htmlFor="pointsOffered"
            error={errors.pointsOffered?.message}
            hint="These points transfer to the assignee when the task is completed."
            required
          >
            <div className="flex items-center gap-2">
              <Input
                id="pointsOffered"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                className="w-32"
                error={!!errors.pointsOffered}
                {...register('pointsOffered')}
              />
              {POINT_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={
                    Number(pointsOffered) === preset ? 'primary' : 'secondary'
                  }
                  size="sm"
                  onClick={() => setValue('pointsOffered', preset)}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </FormField>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
            <Button type="submit" size="lg" loading={isPending}>
              {!isPending && <Plus className="size-4" aria-hidden />}
              Publish task
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
