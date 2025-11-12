'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreateTripForm } from '@/components/trips/CreateTripForm';
import { MapPin, ArrowLeft } from 'lucide-react';

export default function NewTripPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
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
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">创建新行程</h2>
            <p className="mt-2 text-gray-600">
              开始规划您的完美旅行，我们的 AI 助手会帮助您生成详细的行程安排
            </p>
          </div>

          <CreateTripForm />
        </div>
      </main>
    </div>
  );
}
