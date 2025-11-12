'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
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
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Loader2,
  Heart,
} from 'lucide-react';
import { z } from 'zod';
import { TripVoiceInput } from './TripVoiceInput';
import type { VoiceTripParseResult } from '@/types/trip-voice';
import { cn } from '@/lib/utils';

type CreateTripFormData = z.input<typeof createTripSchema>;

// 旅行风格选项（支持中英文映射）
const TRAVEL_STYLES = [
  { value: 'food', label: '美食', icon: '🍜' },
  { value: 'culture', label: '文化', icon: '🎭' },
  { value: 'nature', label: '自然', icon: '🏞️' },
  { value: 'adventure', label: '探险', icon: '🧗' },
  { value: 'relaxation', label: '休闲', icon: '🏖️' },
  { value: 'shopping', label: '购物', icon: '🛍️' },
] as const;

// 住宿等级选项
const ACCOMMODATION_LEVELS = [
  { value: 'budget', label: '经济型' },
  { value: 'comfort', label: '舒适型' },
  { value: 'luxury', label: '豪华型' },
] as const;

// 交通偏好选项
const TRANSPORT_PREFERENCES = [
  { value: 'public', label: '公共交通' },
  { value: 'taxi', label: '出租车' },
  { value: 'rental_car', label: '租车' },
  { value: 'mixed', label: '混合' },
] as const;

export function CreateTripForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateTripFormData>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      numAdults: 1,
      numChildren: 0,
      preferences: {
        travelStyle: [],
        accommodationLevel: 'comfort',
        transportPreference: 'mixed',
        customPreferences: '', // 自由文本偏好
      },
    },
  });

  // 中英文旅行风格映射
  const mapChineseToEnglish = (chineseStyles: string[]): string[] => {
    const mapping: Record<string, string> = {
      美食: 'food',
      文化: 'culture',
      自然: 'nature',
      探险: 'adventure',
      休闲: 'relaxation',
      购物: 'shopping',
      历史: 'culture', // 历史归类为文化
      艺术: 'culture',
      摄影: 'nature',
      音乐: 'culture',
      建筑: 'culture',
      亲子: 'relaxation',
      度假: 'relaxation',
      运动: 'adventure',
      动漫: 'culture',
    };

    return chineseStyles
      .map((style) => mapping[style])
      .filter((v, i, arr) => v && arr.indexOf(v) === i); // 去重
  };

  // 处理语音解析结果
  const handleVoiceParsed = (result: VoiceTripParseResult) => {
    if (result.destination) {
      setValue('destination', result.destination);
    }
    if (result.startDate) {
      setValue('startDate', result.startDate);
    }
    if (result.endDate) {
      setValue('endDate', result.endDate);
    }
    if (result.totalBudget) {
      setValue('totalBudget', result.totalBudget);
    }
    if (result.numAdults) {
      setValue('numAdults', result.numAdults);
    }
    if (result.numChildren !== undefined) {
      setValue('numChildren', result.numChildren);
    }
    // 将中文偏好映射为英文枚举值，同时保存原始文本
    if (result.preferences && result.preferences.length > 0) {
      const englishStyles = mapChineseToEnglish(result.preferences);
      setValue('preferences.travelStyle', englishStyles as any);
      // 同时保存原始的偏好文本
      setValue('preferences.customPreferences', result.preferences.join('、'));
    }
  };

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 语音输入区域 */}
      <div className="rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-4">
        <TripVoiceInput onParsed={handleVoiceParsed} disabled={isSubmitting} />
      </div>

      {/* 分隔提示 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">
            或手动填写下方表单
          </span>
        </div>
      </div>

      {/* 表单卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>行程信息</CardTitle>
          <CardDescription>请填写或确认行程基本信息</CardDescription>
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

          {/* Travel Preferences */}
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">旅行偏好</h3>
              <span className="text-sm text-gray-500">（可选）</span>
            </div>

            {/* Travel Style - Multi-select */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">旅行风格</Label>
              <Controller
                name="preferences.travelStyle"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLES.map((style) => {
                      const isSelected =
                        field.value?.includes(style.value) || false;
                      return (
                        <button
                          key={style.value}
                          type="button"
                          onClick={() => {
                            const current = field.value || [];
                            const updated = isSelected
                              ? current.filter((v: string) => v !== style.value)
                              : [...current, style.value];
                            field.onChange(updated);
                          }}
                          disabled={isSubmitting}
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors',
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                          )}
                        >
                          <span>{style.icon}</span>
                          <span>{style.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Accommodation Level - Radio */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">住宿等级</Label>
              <Controller
                name="preferences.accommodationLevel"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    {ACCOMMODATION_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => field.onChange(level.value)}
                        disabled={isSubmitting}
                        className={cn(
                          'flex-1 rounded-lg border px-4 py-2 text-sm transition-colors',
                          field.value === level.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300'
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Transport Preference - Radio */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">交通偏好</Label>
              <Controller
                name="preferences.transportPreference"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {TRANSPORT_PREFERENCES.map((transport) => (
                      <button
                        key={transport.value}
                        type="button"
                        onClick={() => field.onChange(transport.value)}
                        disabled={isSubmitting}
                        className={cn(
                          'rounded-lg border px-4 py-2 text-sm transition-colors',
                          field.value === transport.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300'
                        )}
                      >
                        {transport.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Custom Preferences - Text Input */}
            <div className="space-y-2">
              <Label
                htmlFor="customPreferences"
                className="text-sm text-gray-700"
              >
                其他偏好说明
              </Label>
              <textarea
                id="customPreferences"
                {...register('preferences.customPreferences')}
                disabled={isSubmitting}
                rows={3}
                placeholder="例如：喜欢安静的景点、对海鲜过敏、需要无障碍设施..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                可以输入任何特殊需求或偏好，语音输入会自动填充此字段
              </p>
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
