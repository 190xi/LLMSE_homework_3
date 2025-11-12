'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetOverview } from '@/components/expenses/BudgetOverview';
import { ExpenseChart } from '@/components/expenses/ExpenseChart';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import type { Expense, ExpenseStats } from '@/types/expense';

export default function ExpensesPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载费用列表
  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/trips/${tripId}/expenses`);

      if (!response.ok) {
        throw new Error('加载费用记录失败');
      }

      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载费用记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载费用统计
  const loadStats = async () => {
    try {
      setIsStatsLoading(true);
      const response = await fetch(`/api/trips/${tripId}/expenses/stats`);

      if (!response.ok) {
        throw new Error('加载费用统计失败');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Load stats error:', err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadExpenses();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  // 删除费用
  const handleDelete = async (expenseId: string) => {
    try {
      const response = await fetch(
        `/api/trips/${tripId}/expenses/${expenseId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('删除费用记录失败');
      }

      // 重新加载数据
      await Promise.all([loadExpenses(), loadStats()]);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除费用记录失败');
    }
  };

  // 添加费用成功
  const handleAddSuccess = async () => {
    setShowForm(false);
    // 重新加载数据
    await Promise.all([loadExpenses(), loadStats()]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* 页面头部 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">费用管理</h1>
          </div>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" />
                关闭表单
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                添加费用
              </>
            )}
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* 添加费用表单 */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>添加费用记录</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm
                tripId={tripId}
                onSuccess={handleAddSuccess}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* 两列布局 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 左侧：预算总览和图表 */}
          <div className="space-y-6 lg:col-span-1">
            <BudgetOverview stats={stats} isLoading={isStatsLoading} />
            <ExpenseChart stats={stats} isLoading={isStatsLoading} />
          </div>

          {/* 右侧：费用列表 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>费用记录</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseList
                  expenses={expenses}
                  isLoading={isLoading}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
