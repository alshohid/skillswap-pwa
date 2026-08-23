import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

/** Label + control + validation message stack used by every form. */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
