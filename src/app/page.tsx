'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Sparkles, Wallet, Mic } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI 旅行规划师</h1>
          </div>

          {!isLoading && (
            <div className="flex gap-3">
              {session ? (
                <>
                  <span className="flex items-center text-sm text-gray-700">
                    欢迎，{session.user?.displayName || session.user?.email}
                  </span>
                  <Button asChild>
                    <Link href="/trips">进入应用</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">登录</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">注册</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </header>

        {/* Hero Content */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-5xl font-bold text-gray-900">
            智能化的
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {' '}
              旅行规划助手
            </span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            通过人工智能技术，为您量身定制完美的旅行计划。
            <br />
            语音输入、智能推荐、费用管理，一站式解决您的旅行规划需求。
          </p>

          {!session && (
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  <Sparkles className="mr-2 h-5 w-5" />
                  免费开始
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">登录</Link>
              </Button>
            </div>
          )}

          {session && (
            <Button size="lg" asChild>
              <Link href="/trips">
                <MapPin className="mr-2 h-5 w-5" />
                查看我的行程
              </Link>
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-indigo-100 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-indigo-100 p-3">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI 智能规划</h3>
              <p className="text-sm text-gray-600">
                基于阿里云通义千问，为您生成个性化的旅行计划
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3">
                <Mic className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">语音输入</h3>
              <p className="text-sm text-gray-600">
                通过语音描述您的旅行需求，轻松创建行程
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">费用管理</h3>
              <p className="text-sm text-gray-600">
                智能预算估算，实时费用记录，掌控旅行开支
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-green-100 p-3">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">地图可视化</h3>
              <p className="text-sm text-gray-600">
                在地图上查看行程路线，优化旅行路径
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        {!session && (
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-12 text-center text-white">
            <h3 className="mb-4 text-3xl font-bold">
              准备好开始您的旅行规划了吗？
            </h3>
            <p className="mb-6 text-lg opacity-90">
              立即注册，免费体验 AI 驱动的智能旅行规划
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-indigo-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/register">立即开始</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/50 py-8 backdrop-blur">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 AI 旅行规划师. 使用 Next.js 14 和阿里云通义千问构建。</p>
        </div>
      </footer>
    </main>
  );
}
