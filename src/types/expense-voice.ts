/**
 * 语音费用解析结果类型定义
 */

export interface VoiceExpenseParseResult {
  /** 金额 */
  amount?: number;
  /** 货币类型 */
  currency?: string;
  /** 费用类别 */
  category?:
    | 'transport'
    | 'accommodation'
    | 'food'
    | 'tickets'
    | 'shopping'
    | 'other';
  /** 费用描述 */
  description?: string;
  /** 原始语音文本 */
  rawText: string;
  /** 置信度 (0-1) */
  confidence: number;
  /** 缺失的字段 */
  missingFields?: string[];
}

/**
 * 费用类别映射（中文 -> 英文枚举）
 */
export const EXPENSE_CATEGORY_MAPPING: Record<
  string,
  VoiceExpenseParseResult['category']
> = {
  // 交通相关
  打车: 'transport',
  出租车: 'transport',
  的士: 'transport',
  滴滴: 'transport',
  公交: 'transport',
  地铁: 'transport',
  火车: 'transport',
  高铁: 'transport',
  飞机: 'transport',
  机票: 'transport',
  租车: 'transport',
  加油: 'transport',
  停车: 'transport',
  过路费: 'transport',

  // 住宿相关
  酒店: 'accommodation',
  民宿: 'accommodation',
  旅馆: 'accommodation',
  宾馆: 'accommodation',
  住宿: 'accommodation',
  房费: 'accommodation',

  // 餐饮相关
  吃: 'food',
  喝: 'food',
  早餐: 'food',
  午餐: 'food',
  晚餐: 'food',
  午饭: 'food',
  晚饭: 'food',
  宵夜: 'food',
  夜宵: 'food',
  饭: 'food',
  餐: 'food',
  饮料: 'food',
  咖啡: 'food',
  奶茶: 'food',
  小吃: 'food',
  零食: 'food',
  水果: 'food',

  // 门票相关
  门票: 'tickets',
  票: 'tickets',
  景区: 'tickets',
  景点: 'tickets',
  博物馆: 'tickets',
  主题公园: 'tickets',
  游乐园: 'tickets',
  动物园: 'tickets',
  水族馆: 'tickets',

  // 购物相关
  买: 'shopping',
  购物: 'shopping',
  逛街: 'shopping',
  商场: 'shopping',
  超市: 'shopping',
  纪念品: 'shopping',
  礼物: 'shopping',
  衣服: 'shopping',
  鞋: 'shopping',
  化妆品: 'shopping',

  // 其他
  其他: 'other',
  杂费: 'other',
};
