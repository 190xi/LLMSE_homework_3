import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: '注册 - AI旅行规划师',
  description: '注册一个新的AI旅行规划师账户',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">AI 旅行规划师</h1>
          <p className="mt-2 text-gray-600">智能化的旅行规划助手</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
