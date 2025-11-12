import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExpenseStats } from '@/types/expense';
import { CurrencySymbols } from '@/types/expense';

interface BudgetOverviewProps {
  stats: ExpenseStats | null;
  isLoading?: boolean;
}

export function BudgetOverview({ stats, isLoading }: BudgetOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>预算总览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const {
    total_budget,
    total_spent,
    remaining_budget,
    budget_usage_percentage,
    expense_count,
  } = stats;

  const isOverBudget = remaining_budget < 0;
  const usageColor =
    budget_usage_percentage >= 100
      ? 'text-red-600'
      : budget_usage_percentage >= 80
        ? 'text-yellow-600'
        : 'text-green-600';

  const progressColor =
    budget_usage_percentage >= 100
      ? 'bg-red-500'
      : budget_usage_percentage >= 80
        ? 'bg-yellow-500'
        : 'bg-green-500';

  return (
    <Card>
      <CardHeader>
        <CardTitle>预算总览</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 预算进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">预算使用</span>
            <span className={`font-semibold ${usageColor}`}>
              {budget_usage_percentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-500 ${progressColor}`}
              style={{
                width: `${Math.min(budget_usage_percentage, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 预算统计 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">总预算</p>
            <p className="text-2xl font-bold text-gray-900">
              {CurrencySymbols.CNY}
              {total_budget.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">已支出</p>
            <p className="text-2xl font-bold text-blue-600">
              {CurrencySymbols.CNY}
              {total_spent.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">剩余预算</p>
            <p
              className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}
            >
              {CurrencySymbols.CNY}
              {Math.abs(remaining_budget).toLocaleString()}
              {isOverBudget && ' (超支)'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">记录数</p>
            <p className="text-2xl font-bold text-gray-900">
              {expense_count}
              <span className="ml-1 text-sm font-normal">笔</span>
            </p>
          </div>
        </div>

        {/* 超支警告 */}
        {isOverBudget && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">
              ⚠️ 您的支出已超出预算 {CurrencySymbols.CNY}
              {Math.abs(remaining_budget).toLocaleString()}，请注意控制开支。
            </p>
          </div>
        )}

        {/* 预算即将耗尽警告 */}
        {!isOverBudget &&
          budget_usage_percentage >= 80 &&
          budget_usage_percentage < 100 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                💡 您已使用 {budget_usage_percentage.toFixed(1)}%
                的预算，请合理安排后续开支。
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
