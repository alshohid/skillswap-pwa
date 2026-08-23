import { cn, initials } from '@/lib/utils';

const PALETTE = [
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
];

export interface UserAvatarProps {
  name?: string | null;
  sizeClass?: string;
  className?: string;
}

/** Initials avatar with a deterministic colour per name. */
export function UserAvatar({
  name,
  sizeClass = 'size-9',
  className,
}: UserAvatarProps) {
  const text = initials(name);
  const palette =
    PALETTE[
      Math.abs(
        (name ?? '')
          .split('')
          .reduce((acc, char) => acc + char.charCodeAt(0), 0),
      ) % PALETTE.length
    ];

  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 select-none items-center justify-center rounded-full text-xs font-bold',
        sizeClass,
        palette,
        className,
      )}
    >
      {text}
    </span>
  );
}
