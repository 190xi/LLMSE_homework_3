'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MapPin,
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  Edit,
  Trash2,
  Loader2,
  Clock,
  MapPinIcon,
  Plus,
  ArrowRight,
} from 'lucide-react';
import type { Expense, ExpenseStats } from '@/types/expense';

interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    description: string;
    estimatedCost?: number;
    duration?: string;
  }[];
  totalEstimatedCost: number;
  notes?: string;
}

interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  num_adults: number;
  num_children: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  preferences: Record<string, any>;
  itinerary: ItineraryDay[];
  created_at: string;
  updated_at: string;
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // 费用相关状态
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTrip();
      fetchExpenses();
    }
  }, [status, params.id]);

  const fetchTrip = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/trips/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取行程详情失败');
      }

      setTrip(data.trip);
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError(err instanceof Error ? err.message : '获取行程详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setIsLoadingExpenses(true);

      // 并行加载费用列表和统计数据
      const [expensesRes, statsRes] = await Promise.all([
        fetch(`/api/trips/${params.id}/expenses`),
        fetch(`/api/trips/${params.id}/expenses/stats`),
      ]);

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData.expenses || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setExpenseStats(statsData.stats);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleGenerateItinerary = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);

      const response = await fetch(`/api/trips/${params.id}/generate`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成行程失败');
      }

      // Update trip with generated itinerary
      setTrip(data.trip);
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setGenerationError(
        err instanceof Error ? err.message : '生成行程失败，请稍后重试'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/trips" className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">AI 旅行规划师</h1>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/trips">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回行程列表
              </Link>
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-red-600">{error}</p>
              <Button className="mt-4" asChild>
                <Link href="/trips">返回行程列表</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const tripDuration =
    Math.ceil(
      (new Date(trip.end_date).getTime() -
        new Date(trip.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/trips" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">AI 旅行规划师</h1>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/trips">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回行程列表
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">
                {trip.destination}
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                {new Date(trip.start_date).toLocaleDateString('zh-CN')} -{' '}
                {new Date(trip.end_date).toLocaleDateString('zh-CN')}
                <span className="ml-2 text-gray-500">({tripDuration} 天)</span>
              </p>
            </div>
            <StatusBadge status={trip.status} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Trip Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>行程概览</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">总预算</p>
                    <p className="text-lg font-semibold">
                      ¥{trip.total_budget.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">出行人数</p>
                    <p className="text-lg font-semibold">
                      {trip.num_adults} 成人
                      {trip.num_children > 0 && `, ${trip.num_children} 儿童`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">行程天数</p>
                    <p className="text-lg font-semibold">{tripDuration} 天</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button className="w-full" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    编辑行程
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除行程
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Trip Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* AI Itinerary Section */}
            <Card>
              <CardHeader>
                <CardTitle>行程安排</CardTitle>
                <CardDescription>
                  使用 AI 助手生成详细的每日行程
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trip.itinerary && trip.itinerary.length > 0 ? (
                  // Display itinerary
                  <div className="space-y-6">
                    {trip.itinerary.map((day) => (
                      <Card
                        key={day.day}
                        className="border-l-4 border-l-indigo-500"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              第 {day.day} 天 - {day.title}
                            </CardTitle>
                            <span className="text-sm text-gray-500">
                              {day.date}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {day.activities.map((activity, idx) => (
                              <div
                                key={idx}
                                className="flex gap-4 border-b pb-4 last:border-0"
                              >
                                <div className="flex flex-col items-center">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-600">
                                    {activity.time}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-semibold text-gray-900">
                                      {activity.activity}
                                    </h4>
                                    {activity.estimatedCost && (
                                      <span className="text-sm text-gray-600">
                                        ¥{activity.estimatedCost}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                                    <MapPinIcon className="h-3 w-3" />
                                    <span>{activity.location}</span>
                                    {activity.duration && (
                                      <>
                                        <span>•</span>
                                        <span>{activity.duration}</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="mt-2 text-sm text-gray-700">
                                    {activity.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {day.notes && (
                              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                                💡 {day.notes}
                              </div>
                            )}
                            <div className="pt-2 text-right">
                              <span className="text-sm font-medium text-gray-700">
                                当日预算：¥{day.totalEstimatedCost}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Empty state
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-indigo-100 p-6">
                      <Sparkles className="h-12 w-12 text-indigo-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      还没有行程安排
                    </h3>
                    <p className="mb-6 max-w-md text-gray-600">
                      点击下方按钮，让 AI 助手根据您的偏好生成个性化的旅行计划
                    </p>
                    {generationError && (
                      <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                        {generationError}
                      </div>
                    )}
                    <Button
                      size="lg"
                      onClick={handleGenerateItinerary}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          生成 AI 行程
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>费用记录</CardTitle>
                    <CardDescription>记录和管理旅行花费</CardDescription>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/trips/${params.id}/expenses`}>
                      <Plus className="mr-2 h-4 w-4" />
                      添加费用
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingExpenses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : expenseStats && expenseStats.expense_count > 0 ? (
                  <div className="space-y-4">
                    {/* 预算统计 */}
                    <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">总预算</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ¥{trip?.total_budget.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">已花费</p>
                          <p className="text-2xl font-bold text-indigo-600">
                            ¥{expenseStats.total_spent.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">剩余预算</p>
                          <p
                            className={`text-xl font-semibold ${
                              expenseStats.remaining_budget >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            ¥{expenseStats.remaining_budget.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">预算使用</p>
                          <p className="text-xl font-semibold text-gray-700">
                            {expenseStats.budget_usage_percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* 预算进度条 */}
                      <div className="mt-4">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full transition-all ${
                              expenseStats.budget_usage_percentage > 100
                                ? 'bg-red-500'
                                : expenseStats.budget_usage_percentage > 80
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min(expenseStats.budget_usage_percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 最近费用记录 */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          最近记录 ({expenseStats.expense_count} 条)
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {expenses.slice(0, 3).map((expense) => (
                          <div
                            key={expense.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {expense.description || '未分类'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  expense.recorded_at
                                ).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                              ¥{expense.amount.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 查看全部按钮 */}
                    <Button variant="outline" className="w-full" asChild>
                      <Link
                        href={`/trips/${params.id}/expenses`}
                        className="flex items-center justify-center"
                      >
                        查看全部费用记录
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  // 空状态
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-green-100 p-6">
                      <DollarSign className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      还没有费用记录
                    </h3>
                    <p className="mb-6 max-w-md text-gray-600">
                      开始记录您的旅行花费，轻松掌控预算
                    </p>
                    <Button size="lg" variant="outline" asChild>
                      <Link href={`/trips/${params.id}/expenses`}>
                        <Plus className="mr-2 h-5 w-5" />
                        添加费用
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Trip['status'] }) {
  const statusConfig = {
    draft: { label: '草稿', className: 'bg-gray-100 text-gray-700' },
    active: { label: '进行中', className: 'bg-green-100 text-green-700' },
    completed: { label: '已完成', className: 'bg-blue-100 text-blue-700' },
    archived: { label: '已归档', className: 'bg-gray-100 text-gray-500' },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
