'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface VoiceWaveformProps {
  /** 是否激活（录音中） */
  active: boolean;
  /** 音量级别 0-100 */
  audioLevel?: number;
  /** 波形条数量 */
  bars?: number;
  /** 颜色类别 */
  variant?: 'primary' | 'success' | 'error';
  /** 自定义类名 */
  className?: string;
}

export function VoiceWaveform({
  active,
  audioLevel = 0,
  bars = 5,
  variant = 'primary',
  className,
}: VoiceWaveformProps) {
  const variantColors = {
    primary: 'bg-indigo-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  const baseColor = variantColors[variant];

  // 根据音量生成每个条的高度
  const getBarHeight = (index: number) => {
    if (!active) return 20; // 静止时的基础高度

    // 中间的条高度最大，两边递减
    const center = Math.floor(bars / 2);
    const distance = Math.abs(center - index);
    const baseHeight = 20 + audioLevel * 0.6;
    const variation = Math.sin(Date.now() / 100 + index) * 10;

    // 根据距离中心的位置调整高度
    const heightFactor = 1 - distance * 0.15;
    return Math.max(15, (baseHeight - distance * 8 + variation) * heightFactor);
  };

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {Array.from({ length: bars }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'w-1 rounded-full transition-all duration-150',
            baseColor,
            !active && 'opacity-40'
          )}
          style={{
            height: `${getBarHeight(index)}px`,
          }}
        />
      ))}
    </div>
  );
}
