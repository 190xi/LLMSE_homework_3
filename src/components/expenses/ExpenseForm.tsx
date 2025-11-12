'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ExpenseCategory,
  ExpenseCategoryLabels,
  Currency,
  CurrencyNames,
} from '@/types/expense';

// 从 createExpenseSchema 创建表单类型（不包含 tripId，因为会从 props 传入）
const formSchema = z.object({
  amount: z.number().positive('金额必须大于0'),
  currency: z.string().length(3),
  category: z.enum([
    'transport',
    'accommodation',
    'food',
    'tickets',
    'shopping',
    'other',
  ]),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  tripId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({ tripId, onSuccess, onCancel }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      currency: 'CNY',
      category: 'food',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          description: data.description,
          recordedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '创建费用记录失败');
      }

      reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建费用记录失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: ExpenseCategory[] = [
    'transport',
    'accommodation',
    'food',
    'tickets',
    'shopping',
    'other',
  ];

  const currencies: Currency[] = [
    'CNY',
    'USD',
    'EUR',
    'JPY',
    'GBP',
    'HKD',
    'TWD',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 金额和货币 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="amount">
            金额 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount', { valueAsNumber: true })}
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">货币</Label>
          <select
            id="currency"
            {...register('currency')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {CurrencyNames[curr]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 分类 */}
      <div className="space-y-2">
        <Label htmlFor="category">
          费用类别 <span className="text-red-500">*</span>
        </Label>
        <select
          id="category"
          {...register('category')}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {ExpenseCategoryLabels[cat]}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* 描述 */}
      <div className="space-y-2">
        <Label htmlFor="description">备注说明（可选）</Label>
        <Input
          id="description"
          type="text"
          placeholder="例如：午餐、打车费用等"
          {...register('description')}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* 按钮 */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          {isSubmitting ? '提交中...' : '添加费用'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        )}
      </div>
    </form>
  );
}
