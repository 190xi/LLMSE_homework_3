'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@/lib/validations';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  User,
  Mail,
  Calendar as CalendarIcon,
  Loader2,
  LogOut,
} from 'lucide-react';

type UpdateProfileFormData = z.input<typeof updateProfileSchema>;

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  default_budget: number | null;
  default_city: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取个人资料失败');
      }

      setProfile(data.user);
      reset({
        displayName: data.user.display_name || '',
        avatarUrl: data.user.avatar_url || '',
        defaultBudget: data.user.default_budget || undefined,
        defaultCity: data.user.default_city || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : '获取个人资料失败');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '更新个人资料失败');
      }

      setProfile(result.user);
      setSuccessMessage('个人资料已成功更新！');

      // Update session with new display name
      await updateSession();
    } catch (err) {
      console.error('Update profile error:', err);
      setError(
        err instanceof Error ? err.message : '更新个人资料失败，请稍后重试'
      );
    } finally {
      setIsSaving(false);
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
          <Link href="/trips" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">AI 旅行规划师</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/trips">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回行程列表
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
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">个人资料</h2>
            <p className="mt-2 text-gray-600">管理您的账户信息和偏好设置</p>
          </div>

          <div className="space-y-6">
            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>账户信息</CardTitle>
                <CardDescription>您的账户基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">邮箱地址</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">注册时间</p>
                    <p className="font-medium">
                      {profile?.created_at &&
                        new Date(profile.created_at).toLocaleDateString(
                          'zh-CN'
                        )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Edit Form */}
            <Card>
              <CardHeader>
                <CardTitle>编辑资料</CardTitle>
                <CardDescription>更新您的个人信息</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="displayName"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      显示名称
                    </Label>
                    <Input
                      id="displayName"
                      placeholder="您的名字"
                      {...register('displayName')}
                      disabled={isSaving}
                    />
                    {errors.displayName && (
                      <p className="text-sm text-red-600">
                        {errors.displayName.message}
                      </p>
                    )}
                  </div>

                  {/* Avatar URL */}
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">头像 URL</Label>
                    <Input
                      id="avatarUrl"
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      {...register('avatarUrl')}
                      disabled={isSaving}
                    />
                    {errors.avatarUrl && (
                      <p className="text-sm text-red-600">
                        {errors.avatarUrl.message}
                      </p>
                    )}
                  </div>

                  {/* Default Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="defaultBudget">默认预算（人民币 ¥）</Label>
                    <Input
                      id="defaultBudget"
                      type="number"
                      placeholder="5000"
                      {...register('defaultBudget', { valueAsNumber: true })}
                      disabled={isSaving}
                    />
                    <p className="text-sm text-gray-500">
                      创建新行程时的默认预算
                    </p>
                    {errors.defaultBudget && (
                      <p className="text-sm text-red-600">
                        {errors.defaultBudget.message}
                      </p>
                    )}
                  </div>

                  {/* Default City */}
                  <div className="space-y-2">
                    <Label htmlFor="defaultCity">常住城市</Label>
                    <Input
                      id="defaultCity"
                      placeholder="北京"
                      {...register('defaultCity')}
                      disabled={isSaving}
                    />
                    <p className="text-sm text-gray-500">
                      您的常住城市，用于行程规划参考
                    </p>
                    {errors.defaultCity && (
                      <p className="text-sm text-red-600">
                        {errors.defaultCity.message}
                      </p>
                    )}
                  </div>

                  {/* Success/Error Messages */}
                  {successMessage && (
                    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                      {successMessage}
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      '保存更改'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
