export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        <h1 className="mb-8 text-center text-4xl font-bold">AI 旅行规划师</h1>
        <p className="mb-4 text-center text-lg">欢迎使用智能旅行规划助手</p>
        <div className="mt-8 rounded-lg border bg-gray-50 p-6 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            项目初始化成功！开始您的旅行规划之旅...
          </p>
        </div>
      </div>
    </main>
  );
}
