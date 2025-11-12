'use client';

import { useState } from 'react';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { AlertCircle, CheckCircle2, Loader2, Lightbulb } from 'lucide-react';
import type { VoiceExpenseParseResult } from '@/types/expense-voice';
import { ExpenseCategoryLabels } from '@/types/expense';

interface ExpenseVoiceInputProps {
  onParsed: (result: VoiceExpenseParseResult) => void;
  className?: string;
}

export function ExpenseVoiceInput({
  onParsed,
  className,
}: ExpenseVoiceInputProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceExpenseParseResult | null>(
    null
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const handleVoiceComplete = async (text: string) => {
    console.log('语音识别完成:', text);

    setIsParsing(true);
    setParseError(null);

    try {
      // 调用费用解析 API
      const response = await fetch('/api/voice/parse-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '解析失败');
      }

      const result: VoiceExpenseParseResult = await response.json();
      console.log('费用解析结果:', result);

      setLastResult(result);
      onParsed(result);
    } catch (error) {
      console.error('费用解析错误:', error);
      setParseError(
        error instanceof Error ? error.message : '解析失败，请重试'
      );
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className={className}>
      {/* 使用提示 */}
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">语音记录示例：</p>
            <ul className="mt-2 space-y-1 text-xs text-blue-700">
              <li>• &ldquo;刚花了200元吃午饭&rdquo;</li>
              <li>• &ldquo;打车花了50元&rdquo;</li>
              <li>• &ldquo;买门票花了120&rdquo;</li>
              <li>• &ldquo;住宿费用500元&rdquo;</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 语音输入组件 */}
      <VoiceInput
        onComplete={handleVoiceComplete}
        placeholder="点击麦克风，说出费用信息..."
        maxDuration={30000} // 30秒足够记录费用
      />

      {/* AI 解析状态 */}
      {isParsing && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-sm text-blue-700">AI 正在理解您的费用信息...</p>
        </div>
      )}

      {/* 解析错误 */}
      {parseError && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900">解析失败</p>
            <p className="mt-1 text-xs text-red-700">{parseError}</p>
          </div>
        </div>
      )}

      {/* 解析成功结果 */}
      {lastResult && !isParsing && !parseError && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                解析成功！已自动填充表单
              </p>

              <div className="mt-3 space-y-2 text-sm text-green-800">
                {lastResult.amount && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">💰 金额：</span>
                    <span>¥{lastResult.amount}</span>
                  </div>
                )}

                {lastResult.category && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">📁 类别：</span>
                    <span>
                      {ExpenseCategoryLabels[lastResult.category] ||
                        lastResult.category}
                    </span>
                  </div>
                )}

                {lastResult.description && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">📝 描述：</span>
                    <span>{lastResult.description}</span>
                  </div>
                )}
              </div>

              {/* 缺失字段提示 */}
              {lastResult.missingFields &&
                lastResult.missingFields.length > 0 && (
                  <div className="mt-3 rounded border border-yellow-300 bg-yellow-50 p-2">
                    <p className="text-xs text-yellow-800">
                      ⚠️ 以下信息需要补充：
                      {lastResult.missingFields
                        .map((field) => {
                          switch (field) {
                            case 'amount':
                              return '金额';
                            case 'category':
                              return '类别';
                            default:
                              return field;
                          }
                        })
                        .join('、')}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
