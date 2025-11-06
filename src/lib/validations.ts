import { z } from 'zod';

/**
 * Validation schemas for the application
 */

// ============================================
// Auth Schemas
// ============================================

export const signUpSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少需要8个字符')
    .regex(/[A-Za-z]/, '密码必须包含至少一个字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
  displayName: z
    .string()
    .min(2, '显示名称至少需要2个字符')
    .max(50, '显示名称最多50个字符')
    .optional(),
});

export const signInSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal('', { message: '' })),
  defaultBudget: z.number().int().positive().optional(),
  defaultCity: z.string().max(100).optional(),
});

// ============================================
// Trip Schemas
// ============================================

export const createTripSchema = z.object({
  destination: z.string().min(1, '请输入目的地').max(255),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为YYYY-MM-DD'),
  totalBudget: z.number().int().positive('预算必须大于0'),
  numAdults: z.number().int().positive().default(1),
  numChildren: z.number().int().min(0).default(0),
  preferences: z.record(z.string(), z.any()).optional(),
});

export const updateTripSchema = createTripSchema.partial();

// ============================================
// Expense Schemas
// ============================================

export const createExpenseSchema = z.object({
  tripId: z.string().uuid('无效的行程ID'),
  amount: z.number().positive('金额必须大于0'),
  currency: z.string().length(3).default('CNY'),
  category: z.enum([
    'transport',
    'accommodation',
    'food',
    'tickets',
    'shopping',
    'other',
  ]),
  description: z.string().max(500).optional(),
  receiptUrl: z.string().url().optional(),
  recordedAt: z.string().datetime().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial().omit({
  tripId: true,
});

// ============================================
// User Preferences Schema
// ============================================

export const userPreferencesSchema = z.object({
  travelStyle: z
    .array(
      z.enum([
        'adventure',
        'relaxation',
        'culture',
        'food',
        'nature',
        'shopping',
      ])
    )
    .optional(),
  accommodationLevel: z.enum(['budget', 'comfort', 'luxury']).optional(),
  transportPreference: z
    .enum(['public', 'taxi', 'rental_car', 'mixed'])
    .optional(),
});

// ============================================
// Type exports
// ============================================

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
