'use client';

import { useState } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Expense } from '@/types/expense';
import {
  ExpenseCategoryLabels,
  ExpenseCategoryColors,
  CurrencySymbols,
} from '@/types/expense';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading?: boolean;
  onDelete?: (expenseId: string) => void;
  onEdit?: (expense: Expense) => void;
}

export function ExpenseList({
  expenses,
  isLoading,
  onDelete,
  onEdit,
}: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (expenseId: string) => {
    if (!confirm('确定要删除这条费用记录吗？')) {
      return;
    }

    setDeletingId(expenseId);
    try {
      await onDelete?.(expenseId);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                <div className="h-6 w-1/2 rounded bg-gray-200"></div>
                <div className="h-3 w-1/3 rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 text-6xl">💰</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            暂无费用记录
          </h3>
          <p className="text-center text-sm text-gray-500">
            点击上方&ldquo;添加费用&rdquo;按钮开始记录您的旅行支出
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const isDeleting = deletingId === expense.id;

        return (
          <Card key={expense.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 分类标签 */}
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          ExpenseCategoryColors[expense.category],
                      }}
                    />
                    <span className="text-sm font-medium text-gray-600">
                      {ExpenseCategoryLabels[expense.category]}
                    </span>
                  </div>

                  {/* 金额 */}
                  <p className="mb-1 text-2xl font-bold text-gray-900">
                    {CurrencySymbols[expense.currency]}
                    {Number(expense.amount).toLocaleString()}
                  </p>

                  {/* 描述 */}
                  {expense.description && (
                    <p className="mb-2 text-sm text-gray-600">
                      {expense.description}
                    </p>
                  )}

                  {/* 时间 */}
                  <p className="text-xs text-gray-500">
                    {format(
                      new Date(expense.recorded_at),
                      'yyyy年MM月dd日 HH:mm',
                      { locale: zhCN }
                    )}
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="ml-4 flex gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(expense)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      {isDeleting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
