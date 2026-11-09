import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  education: z.string().optional(),
  experience: z.string().optional(),
  target_role: z.string().optional(),
  target_company: z.string().optional(),
  bio: z.string().optional(),
  skills: z
    .array(
      z.object({
        skill_name: z.string(),
        proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
      })
    )
    .optional(),
});

