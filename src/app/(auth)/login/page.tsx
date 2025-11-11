import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: '登录 - AI旅行规划师',
  description: '登录您的AI旅行规划师账户',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            AI 旅行规划师lalala
          </h1>
          <p className="mt-2 text-gray-600">智能化的旅行规划助手</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
