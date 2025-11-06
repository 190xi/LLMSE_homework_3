'use client';

import React, { useState } from 'react';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RecognitionResult } from '@/types/voice';

export default function VoiceTestPage() {
  const [history, setHistory] = useState<
    Array<{ text: string; timestamp: Date; type: 'final' | 'intermediate' }>
  >([]);
  const [lastResult, setLastResult] = useState('');
  const [error, setError] = useState('');

  const handleResult = (result: RecognitionResult) => {
    setLastResult(result.text);
    setHistory((prev) => [
      ...prev,
      {
        text: result.text,
        timestamp: new Date(),
        type: result.isFinal ? 'final' : 'intermediate',
      },
    ]);
  };

  const handleComplete = (text: string) => {
    setLastResult(text);
    console.log('识别完成:', text);
  };

  const handleError = (err: Error) => {
    setError(err.message);
    console.error('识别错误:', err);
  };

  const clearHistory = () => {
    setHistory([]);
    setLastResult('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            语音识别测试
          </h1>
          <p className="text-gray-600">
            测试科大讯飞语音识别功能 - 支持实时转写
          </p>
        </div>

        {/* 配置检查 */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">环境配置检查</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={
                  process.env.NEXT_PUBLIC_XUNFEI_APP_ID
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {process.env.NEXT_PUBLIC_XUNFEI_APP_ID ? '✓' : '✗'}
              </span>
              <span>NEXT_PUBLIC_XUNFEI_APP_ID</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  process.env.NEXT_PUBLIC_XUNFEI_API_KEY
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {process.env.NEXT_PUBLIC_XUNFEI_API_KEY ? '✓' : '✗'}
              </span>
              <span>NEXT_PUBLIC_XUNFEI_API_KEY</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  process.env.NEXT_PUBLIC_XUNFEI_API_SECRET
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {process.env.NEXT_PUBLIC_XUNFEI_API_SECRET ? '✓' : '✗'}
              </span>
              <span>NEXT_PUBLIC_XUNFEI_API_SECRET</span>
            </div>
          </div>
          {(!process.env.NEXT_PUBLIC_XUNFEI_APP_ID ||
            !process.env.NEXT_PUBLIC_XUNFEI_API_KEY ||
            !process.env.NEXT_PUBLIC_XUNFEI_API_SECRET) && (
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ 请在 <code className="bg-yellow-100 px-1">.env.local</code>{' '}
                中配置科大讯飞 API 密钥
              </p>
            </div>
          )}
        </Card>

        {/* 语音输入组件 */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">语音输入测试</h2>
          <VoiceInput
            onComplete={handleComplete}
            onResult={handleResult}
            onError={handleError}
            realtime={true}
            maxDuration={60000}
          />
        </Card>

        {/* 最新结果 */}
        {lastResult && (
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">最新识别结果</h2>
            <p className="text-lg text-gray-900">{lastResult}</p>
          </Card>
        )}

        {/* 错误信息 */}
        {error && (
          <Card className="border-red-200 bg-red-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-red-900">
              错误信息
            </h2>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* 识别历史 */}
        {history.length > 0 && (
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">识别历史</h2>
              <Button variant="outline" size="sm" onClick={clearHistory}>
                清空历史
              </Button>
            </div>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {history.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 ${
                    item.type === 'final'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1 text-sm text-gray-900">{item.text}</p>
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                          item.type === 'final'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.type === 'final' ? '最终' : '中间'}
                      </span>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 使用说明 */}
        <Card className="border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-blue-900">使用说明</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800">
            <li>确保您已经配置了科大讯飞的 API 密钥</li>
            <li>点击麦克风按钮，允许浏览器访问麦克风</li>
            <li>开始说话，系统会实时转写您的语音</li>
            <li>录音完成后点击方形按钮停止</li>
            <li>识别结果会显示在下方</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
