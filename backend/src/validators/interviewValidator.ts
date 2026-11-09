import { z } from 'zod';

export const createInterviewSchema = z.object({
  company: z.string().min(1, 'Target company is required'),
  role: z.string().min(1, 'Target role is required'),
  difficulty: z.enum(['Junior', 'Mid-Level', 'Senior', 'Lead']),
  type: z.enum(['Technical', 'Behavioral', 'System Design', 'Custom']),
  duration_minutes: z.number().min(10).max(120).optional(),
});

export const submitAnswerSchema = z.object({
  question_id: z.string().min(1, 'Question ID is required'),
  answer: z.string().min(1, 'Answer text is required'),
  code_submitted: z.string().optional(),
});

