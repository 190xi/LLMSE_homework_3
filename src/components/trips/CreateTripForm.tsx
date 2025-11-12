'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTripSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MapPin, Calendar, DollarSign, Users, Loader2 } from 'lucide-react';
import { z } from 'zod';

type CreateTripFormData = z.input<typeof createTripSchema>;

export function CreateTripForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTripFormData>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      numAdults: 1,
      numChildren: 0,
    },
  });

  const onSubmit = async (data: CreateTripFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '创建行程失败');
      }

      // Redirect to trip details page
      router.push(`/trips/${result.trip.id}`);
    } catch (err) {
      console.error('Create trip error:', err);
      setError(err instanceof Error ? err.message : '创建行程失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>创建新行程</CardTitle>
          <CardDescription>
            填写基本信息，稍后您可以使用 AI 助手生成详细的行程安排
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              目的地
            </Label>
            <Input
              id="destination"
              placeholder="例如：北京、东京、巴黎"
              {...register('destination')}
              disabled={isSubmitting}
            />
            {errors.destination && (
              <p className="text-sm text-red-600">
                {errors.destination.message}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                出发日期
              </Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                disabled={isSubmitting}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                返程日期
              </Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
                disabled={isSubmitting}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="totalBudget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              预算（人民币 ¥）
            </Label>
            <Input
              id="totalBudget"
              type="number"
              placeholder="5000"
              {...register('totalBudget', { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.totalBudget && (
              <p className="text-sm text-red-600">
                {errors.totalBudget.message}
              </p>
            )}
          </div>

          {/* Travelers */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numAdults" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                成人人数
              </Label>
              <Input
                id="numAdults"
                type="number"
                min="1"
                {...register('numAdults', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.numAdults && (
                <p className="text-sm text-red-600">
                  {errors.numAdults.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numChildren" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                儿童人数
              </Label>
              <Input
                id="numChildren"
                type="number"
                min="0"
                {...register('numChildren', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.numChildren && (
                <p className="text-sm text-red-600">
                  {errors.numChildren.message}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1"
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建行程'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
