'use client';

import React from 'react';
import { Clock, MapPin, DollarSign, Navigation2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityCardProps {
  /** 活动时间 */
  time: string;
  /** 活动名称 */
  activity: string;
  /** 位置 */
  location: string;
  /** 描述 */
  description?: string;
  /** 预计费用 */
  estimatedCost?: number;
  /** 持续时间 */
  duration?: string;
  /** 活动类型 */
  type?: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'other';
  /** 点击导航回调 */
  onNavigate?: () => void;
  /** 点击卡片回调 */
  onClick?: () => void;
}

export function ActivityCard({
  time,
  activity,
  location,
  description,
  estimatedCost,
  duration,
  type = 'other',
  onNavigate,
  onClick,
}: ActivityCardProps) {
  // 根据类型设置颜色
  const typeConfig = {
    attraction: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      icon: MapPin,
    },
    restaurant: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      icon: MapPin,
    },
    hotel: {
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600',
      icon: MapPin,
    },
    transport: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      icon: Navigation2,
    },
    other: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-600',
      icon: Clock,
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  const handleClick = () => {
    console.log('[ActivityCard] 点击活动:', { activity, location });
    onClick?.();
  };

  return (
    <div
      className={`group relative rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-4 transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex gap-4">
        {/* 时间标签 */}
        <div className="flex flex-col items-center">
          <div
            className={`rounded-full p-2 ${config.bgColor} border ${config.borderColor}`}
          >
            <Clock className={`h-4 w-4 ${config.iconColor}`} />
          </div>
          <span className="mt-2 text-xs font-semibold text-gray-700">
            {time}
          </span>
        </div>

        {/* 内容区域 */}
        <div className="flex-1">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h4 className="text-base font-bold text-gray-900">{activity}</h4>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5" />
                <span>{location}</span>
              </div>
            </div>

            {estimatedCost && (
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <DollarSign className="h-3.5 w-3.5" />
                <span>¥{estimatedCost}</span>
              </div>
            )}
          </div>

          {description && (
            <p className="mb-2 line-clamp-2 text-sm text-gray-600">
              {description}
            </p>
          )}

          <div className="flex items-center justify-between">
            {duration && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{duration}</span>
              </div>
            )}

            {onNavigate && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate();
                }}
              >
                <Navigation2 className="mr-1 h-3 w-3" />
                导航
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DayItineraryProps {
  /** 日期 */
  date: string;
  /** 天数 */
  day: number;
  /** 标题 */
  title: string;
  /** 活动列表 */
  activities: Array<{
    time: string;
    activity: string;
    location: string;
    description?: string;
    estimatedCost?: number;
    duration?: string;
  }>;
  /** 当日总预算 */
  totalEstimatedCost?: number;
  /** 备注 */
  notes?: string;
  /** 活动点击回调 */
  onActivityClick?: (activity: any, index: number) => void;
  /** 导航回调 */
  onNavigate?: (activity: any) => void;
}

export function DayItinerary({
  date,
  day,
  title,
  activities,
  totalEstimatedCost,
  notes,
  onActivityClick,
  onNavigate,
}: DayItineraryProps) {
  return (
    <div className="space-y-3">
      {/* 活动列表 */}
      {activities.map((activity, index) => (
        <ActivityCard
          key={index}
          {...activity}
          onClick={() => onActivityClick?.(activity, index)}
          onNavigate={() => onNavigate?.(activity)}
        />
      ))}

      {/* 备注 */}
      {notes && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">💡 温馨提示：</span> {notes}
          </p>
        </div>
      )}
    </div>
  );
}
