'use client';

import { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VoiceInput } from '@/components/voice/VoiceInput';
import type { VoiceTripParseResult } from '@/types/trip-voice';
import { Card, CardContent } from '@/components/ui/card';

interface TripVoiceInputProps {
  onParsed: (result: VoiceTripParseResult) => void;
  disabled?: boolean;
}

export function TripVoiceInput({ onParsed, disabled }: TripVoiceInputProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<VoiceTripParseResult | null>(
    null
  );

  const handleVoiceComplete = async (text: string) => {
    setIsParsing(true);
    setParseError(null);

    try {
      const response = await fetch('/api/voice/parse-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 解析失败');
      }

      const data = await response.json();
      const result: VoiceTripParseResult = data.result;

      setLastResult(result);
      onParsed(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'AI 解析失败，请重试';
      setParseError(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 语音输入提示 */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-indigo-900">试试语音输入！</h3>
              <p className="mt-1 text-sm text-indigo-700">
                例如：&ldquo;我想去日本，5
                天，预算1万元，喜欢美食和动漫，带孩子&rdquo;
              </p>
              <p className="mt-2 text-xs text-indigo-600">
                💡 AI会自动提取目的地、日期、预算、人数和偏好信息并填充到表单中
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 语音输入组件 */}
      <VoiceInput
        onComplete={handleVoiceComplete}
        disabled={disabled || isParsing}
        placeholder="点击麦克风，说出您的旅行计划..."
        realtime={true}
        maxDuration={30000}
      />

      {/* AI 解析状态 */}
      {isParsing && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-blue-800">AI 正在理解您的需求...</p>
        </div>
      )}

      {/* 解析错误 */}
      {parseError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-900">解析失败</p>
            <p className="mt-1 text-sm text-red-700">{parseError}</p>
          </div>
        </div>
      )}

      {/* 解析成功 */}
      {lastResult && !parseError && !isParsing && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">AI 已理解您的需求</h4>
          </div>

          <div className="space-y-2 text-sm text-green-800">
            {lastResult.destination && (
              <p>
                📍 目的地: <strong>{lastResult.destination}</strong>
              </p>
            )}
            {lastResult.days && (
              <p>
                📅 天数: <strong>{lastResult.days}天</strong>
                {lastResult.startDate && lastResult.endDate && (
                  <span className="ml-2 text-xs">
                    ({lastResult.startDate} 至 {lastResult.endDate})
                  </span>
                )}
              </p>
            )}
            {lastResult.totalBudget && (
              <p>
                💰 预算:{' '}
                <strong>¥{lastResult.totalBudget.toLocaleString()}</strong>
              </p>
            )}
            {(lastResult.numAdults || lastResult.numChildren) && (
              <p>
                👥 人数:{' '}
                <strong>
                  {lastResult.numAdults || 1}位成人
                  {lastResult.numChildren &&
                    lastResult.numChildren > 0 &&
                    `, ${lastResult.numChildren}位儿童`}
                </strong>
              </p>
            )}
            {lastResult.preferences && lastResult.preferences.length > 0 && (
              <p>
                ❤️ 偏好: <strong>{lastResult.preferences.join('、')}</strong>
              </p>
            )}
          </div>

          {lastResult.missingFields && lastResult.missingFields.length > 0 && (
            <div className="mt-3 rounded border border-yellow-300 bg-yellow-50 p-2">
              <p className="text-xs text-yellow-800">
                ⚠️ 以下信息需要补充:{' '}
                {lastResult.missingFields
                  .map((field) => {
                    switch (field) {
                      case 'destination':
                        return '目的地';
                      case 'dates':
                        return '日期';
                      case 'totalBudget':
                        return '预算';
                      default:
                        return field;
                    }
                  })
                  .join('、')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
