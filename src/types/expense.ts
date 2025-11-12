/**
 * 费用管理相关类型定义
 */

/**
 * 费用分类
 */
export type ExpenseCategory =
  | 'transport' // 交通
  | 'accommodation' // 住宿
  | 'food' // 餐饮
  | 'tickets' // 门票
  | 'shopping' // 购物
  | 'other'; // 其他

/**
 * 费用分类标签（中文）
 */
export const ExpenseCategoryLabels: Record<ExpenseCategory, string> = {
  transport: '交通',
  accommodation: '住宿',
  food: '餐饮',
  tickets: '门票',
  shopping: '购物',
  other: '其他',
};

/**
 * 费用分类颜色（用于图表）
 */
export const ExpenseCategoryColors: Record<ExpenseCategory, string> = {
  transport: '#3b82f6', // blue-500
  accommodation: '#8b5cf6', // violet-500
  food: '#f59e0b', // amber-500
  tickets: '#10b981', // emerald-500
  shopping: '#ec4899', // pink-500
  other: '#6b7280', // gray-500
};

/**
 * 货币类型
 */
export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'HKD' | 'TWD';

/**
 * 货币符号
 */
export const CurrencySymbols: Record<Currency, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  HKD: 'HK$',
  TWD: 'NT$',
};

/**
 * 货币名称
 */
export const CurrencyNames: Record<Currency, string> = {
  CNY: '人民币',
  USD: '美元',
  EUR: '欧元',
  JPY: '日元',
  GBP: '英镑',
  HKD: '港币',
  TWD: '新台币',
};

/**
 * 费用记录
 */
export interface Expense {
  id: string;
  trip_id: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  description?: string;
  receipt_url?: string;
  recorded_at: string; // ISO 8601 datetime
  created_at: string; // ISO 8601 datetime
}

/**
 * 创建费用的输入数据
 */
export interface CreateExpenseInput {
  trip_id: string;
  amount: number;
  currency?: Currency;
  category: ExpenseCategory;
  description?: string;
  receipt_url?: string;
  recorded_at?: string;
}

/**
 * 更新费用的输入数据
 */
export interface UpdateExpenseInput {
  amount?: number;
  currency?: Currency;
  category?: ExpenseCategory;
  description?: string;
  receipt_url?: string;
  recorded_at?: string;
}

/**
 * 分类费用统计
 */
export interface CategoryExpenseBreakdown {
  category: ExpenseCategory;
  total: number;
  count: number;
  average: number;
  percentage: number; // 占总支出的百分比
}

/**
 * 费用统计数据
 */
export interface ExpenseStats {
  trip_id: string;
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  budget_usage_percentage: number;
  expense_count: number;
  breakdown: CategoryExpenseBreakdown[];
}

/**
 * 日支出统计
 */
export interface DailyExpense {
  date: string; // YYYY-MM-DD
  total: number;
  count: number;
}

/**
 * 语音费用解析结果
 */
export interface VoiceExpenseParseResult {
  amount?: number;
  category?: ExpenseCategory;
  description?: string;
  confidence: number; // 0-1，置信度
}
