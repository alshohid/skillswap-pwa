'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatPoints } from '@/lib/utils';

export interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
  /** Receipt from POST /tasks/:id/complete. */
  pointsTransferred: number;
  /** Live balance once the invalidated balance query refetches. */
  newBalance?: number;
}

/** Success celebration shown right after the ACID point transfer. */
export function CompletionModal({
  open,
  onClose,
  pointsTransferred,
  newBalance,
}: CompletionModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="animate-pop-in flex flex-col items-center gap-2 py-6 text-center">
        <span className="text-5xl" aria-hidden>
          🎉
        </span>
        <h2 className="mt-1 text-lg font-bold text-zinc-950">Task completed!</h2>
        <p className="text-2xl font-extrabold text-success">
          +{formatPoints(pointsTransferred)}
        </p>
        <p className="text-sm text-zinc-500">
          {newBalance !== undefined
            ? `Your new balance is ${formatPoints(newBalance)}.`
            : 'The points have been transferred to you.'}
        </p>
        <Button size="lg" className="mt-4" fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
