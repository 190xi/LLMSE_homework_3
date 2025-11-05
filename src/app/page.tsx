export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI 旅行规划师
        </h1>
        <p className="text-center text-lg mb-4">
          欢迎使用智能旅行规划助手
        </p>
        <div className="mt-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            项目初始化成功！开始您的旅行规划之旅...
          </p>
        </div>
      </div>
    </main>
  );
}