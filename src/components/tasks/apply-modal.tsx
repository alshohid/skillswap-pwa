'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { applySchema, type ApplyValues } from '@/lib/validators';

export interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  /** Resolves after the mutation succeeds so the form can reset. */
  onSubmit: (message: string) => Promise<void>;
  pending?: boolean;
}

export function ApplyModal({
  open,
  onClose,
  onSubmit,
  pending,
}: ApplyModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { message: '' },
  });

  const submit = async (values: ApplyValues) => {
    await onSubmit(values.message);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for this task"
      description="Tell the task owner why you are suitable."
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FormField
          label="Your message"
          htmlFor="apply-message"
          error={errors.message?.message}
          required
        >
          <Textarea
            id="apply-message"
            autoFocus
            placeholder="I have 2 years of React experience…"
            error={!!errors.message}
            {...register('message')}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            {!pending && <Send className="size-4" aria-hidden />}
            Submit application
          </Button>
        </div>
      </form>
    </Modal>
  );
}
