/**
 * 语音行程解析相关类型定义
 */

/**
 * 语音行程解析结果
 */
export interface VoiceTripParseResult {
  destination?: string; // 目的地
  startDate?: string; // 开始日期 YYYY-MM-DD
  endDate?: string; // 结束日期 YYYY-MM-DD
  days?: number; // 天数
  totalBudget?: number; // 预算（人民币）
  numAdults?: number; // 成人数量
  numChildren?: number; // 儿童数量
  preferences?: string[]; // 旅行偏好标签
  rawText: string; // 原始语音文本
  confidence: number; // 置信度 0-1
  missingFields?: string[]; // 缺失的必填字段
}

/**
 * 旅行偏好类别
 */
export const TravelPreferenceTags = [
  '美食',
  '历史',
  '自然',
  '购物',
  '动漫',
  '艺术',
  '文化',
  '摄影',
  '探险',
  '休闲',
  '亲子',
  '度假',
  '运动',
  '音乐',
  '建筑',
] as const;

export type TravelPreferenceTag = (typeof TravelPreferenceTags)[number];
