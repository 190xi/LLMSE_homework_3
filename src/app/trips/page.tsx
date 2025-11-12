'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus, Calendar, DollarSign, LogOut, User } from 'lucide-react';

interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
}

export default function TripsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTrips();
    }
  }, [status]);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trips');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取行程失败');
      }

      setTrips(data.trips);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err instanceof Error ? err.message : '获取行程失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">AI 旅行规划师</h1>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {session?.user?.displayName || session?.user?.email}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                个人资料
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">我的行程</h2>
            <p className="mt-1 text-gray-600">管理和查看您的旅行计划</p>
          </div>
          <Button size="lg" asChild>
            <Link href="/trips/new">
              <Plus className="mr-2 h-5 w-5" />
              创建新行程
            </Link>
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {trips.length === 0 ? (
          // Empty State
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 rounded-full bg-indigo-100 p-6">
                <MapPin className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold text-gray-900">
                还没有旅行计划
              </h3>
              <p className="mb-6 max-w-md text-center text-gray-600">
                开始规划您的第一次旅行吧！使用AI助手，轻松创建个性化的旅行计划。
              </p>
              <Button size="lg" asChild>
                <Link href="/trips/new">
                  <Plus className="mr-2 h-5 w-5" />
                  创建第一个行程
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Trips Grid
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Card key={trip.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {trip.destination}
                      </CardTitle>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(trip.start_date).toLocaleDateString(
                            'zh-CN'
                          )}{' '}
                          -{' '}
                          {new Date(trip.end_date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>预算: ¥{trip.total_budget.toLocaleString()}</span>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/trips/${trip.id}`}>查看详情</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
      className={`rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
