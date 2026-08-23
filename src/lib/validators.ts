import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name is too long'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title is too long'),
  description: z
    .string()
    .min(20, 'Describe the task in at least 20 characters')
    .max(2000, 'Description is too long'),
  pointsOffered: z.coerce
    .number({ invalid_type_error: 'Points must be a number' })
    .int('Points must be a whole number')
    .min(1, 'Offer at least 1 point')
    .max(100000, 'That is too many points'),
});
export type CreateTaskValues = z.infer<typeof createTaskSchema>;

export const applySchema = z.object({
  message: z
    .string()
    .min(10, 'Tell the owner why you are suitable (10+ characters)')
    .max(1000, 'Message is too long'),
});
export type ApplyValues = z.infer<typeof applySchema>;

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long'),
});
export type ProfileValues = z.infer<typeof profileSchema>;
