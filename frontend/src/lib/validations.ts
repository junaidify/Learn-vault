import { z } from 'zod';

/* =========================================
   Zod schemas — mirror backend Jakarta
   validation annotations EXACTLY.
   ========================================= */

// -------- Signup --------

export const signupSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters.')
    .max(50, 'Name must be 50 characters or fewer.'),

  username: z
    .string()
    .min(8, 'Username must be between 8-15 characters.')
    .max(15, 'Username must be between 8-15 characters.')
    .regex(/^[a-zA-Z0-9_]*$/, 'Username can contain letters, numbers and underscore.'),

  email: z
    .string()
    .min(1, 'Email should not be empty.')
    .email('Enter a proper email.'),

  password: z
    .string()
    .min(8, 'Password must be between 8-20 characters.')
    .max(20, 'Password must be between 8-20 characters.')
    .regex(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/,
      'Password must contain at least one digit, one lowercase and one uppercase letter.'
    ),

  role: z.enum(['STUDENT', 'AUTHOR'], {
    error: 'Please select a role.',
  }),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

// -------- Login --------

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your email or username.'),

  password: z.string().min(1, 'Password is required.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// -------- Course --------

export const courseSchema = z.object({
  name: z.string().min(1, "Course name is required."),

  description: z.string().min(1, "Please describe the course."),

  amount: z
    .number({ message: 'Enter a valid amount' })
    .positive('Amount must be a positive number.'),

  category: z.enum(['TECH', 'COMMUNICATION', 'PSYCHOLOGY', 'LANGUAGE'], {
    error: 'Please specify the category.',
  }),

  published: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

/* =========================================
   Helpers
   ========================================= */

/** Detect whether the identifier looks like an email address. */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
