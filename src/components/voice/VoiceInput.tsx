'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceWaveform } from './VoiceWaveform';
import { VoiceRecognitionService } from '@/lib/voice/service';
import type { VoiceStatus, RecognitionResult } from '@/types/voice';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  /** 识别完成后的回调 */
  onComplete?: (text: string) => void;
  /** 实时识别结果回调 */
  onResult?: (result: RecognitionResult) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 是否实时识别 */
  realtime?: boolean;
  /** 最大录音时长 (ms) */
  maxDuration?: number;
  /** 占位文本 */
  placeholder?: string;
  /** 自定义类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

export function VoiceInput({
  onComplete,
  onResult,
  onError,
  realtime = true,
  maxDuration = 60000,
  placeholder = '点击麦克风开始语音输入...',
  className,
  disabled = false,
}: VoiceInputProps) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recognizedText, setRecognizedText] = useState(''); // 最终确认的文本
  const [intermediateText, setIntermediateText] = useState(''); // 临时的中间结果
  const [errorMessage, setErrorMessage] = useState('');
  const [duration, setDuration] = useState(0);

  const serviceRef = useRef<VoiceRecognitionService | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // 组件卸载时清理
      serviceRef.current?.destroy();
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setErrorMessage('');
      setRecognizedText('');
      setIntermediateText('');
      setDuration(0);

      // 创建服务实例
      const service = new VoiceRecognitionService({
        realtime,
        maxDuration,
        autoStart: true,
      });

      // 设置事件监听
      service.on('onStatusChange', (newStatus) => {
        setStatus(newStatus);
      });

      service.on('onResult', (result) => {
        console.log('VoiceInput 收到结果:', result);

        if (result.isFinal) {
          // 最终结果：显示在已确认文本区域
          setRecognizedText(result.text);
          setIntermediateText('');
        } else {
          // 中间结果：只更新临时文本，不累积
          setIntermediateText(result.text);
        }

        // 调用外部回调
        onResult?.(result);
      });

      service.on('onComplete', (text) => {
        console.log('VoiceInput 识别完成:', text);
        setRecognizedText(text);
        setIntermediateText('');
        onComplete?.(text);
      });

      service.on('onError', (error) => {
        setErrorMessage(error.message);
        onError?.(error);
      });

      service.on('onAudioLevel', (level) => {
        setAudioLevel(level);
      });

      serviceRef.current = service;

      // 开始录音
      await service.start();

      // 启动时长计时器
      const startTime = Date.now();
      durationTimerRef.current = setInterval(() => {
        setDuration(Date.now() - startTime);
      }, 100);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('启动失败');
      setErrorMessage(err.message);
      setStatus('error');
      onError?.(err);
    }
  };

  const stopRecording = () => {
    serviceRef.current?.stop();
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  const cancelRecording = () => {
    serviceRef.current?.cancel();
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    setRecognizedText('');
    setIntermediateText('');
    setDuration(0);
    setErrorMessage('');
  };

  const isRecording = status === 'recording';
  const isRecognizing = status === 'recognizing';
  const isProcessing = isRecording || isRecognizing;
  const hasError = status === 'error';

  // 格式化时长显示
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 获取状态文本
  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return '正在录音...';
      case 'recognizing':
        return '识别中...';
      case 'completed':
        return '识别完成';
      case 'error':
        return '识别失败';
      default:
        return placeholder;
    }
  };

  // 获取按钮变体
  const getButtonVariant = () => {
    if (hasError) return 'error';
    if (isRecording) return 'success';
    return 'primary';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 控制按钮 */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={isProcessing ? stopRecording : startRecording}
          disabled={disabled}
          className={cn(
            'relative h-16 w-16 rounded-full p-0 transition-all',
            isRecording &&
              'animate-pulse bg-green-500 ring-4 ring-green-500/20 hover:bg-green-600',
            hasError && 'bg-red-500 hover:bg-red-600',
            !isProcessing && !hasError && 'bg-indigo-500 hover:bg-indigo-600'
          )}
        >
          {isRecognizing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isRecording ? (
            <Square className="h-6 w-6" />
          ) : hasError ? (
            <AlertCircle className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        {/* 波形动画 */}
        {isRecording && (
          <VoiceWaveform
            active={isRecording}
            audioLevel={audioLevel}
            variant="success"
            className="flex-1"
          />
        )}

        {/* 状态文本和时长 */}
        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium',
              isRecording && 'text-green-600',
              isRecognizing && 'text-blue-600',
              hasError && 'text-red-600',
              !isProcessing && !hasError && 'text-gray-600'
            )}
          >
            {getStatusText()}
          </p>
          {isProcessing && (
            <p className="mt-1 text-xs text-gray-500">
              {formatDuration(duration)} / {formatDuration(maxDuration)}
            </p>
          )}
        </div>

        {/* 取消按钮 */}
        {isProcessing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cancelRecording}
          >
            取消
          </Button>
        )}
      </div>

      {/* 识别结果显示 */}
      {(recognizedText || intermediateText || errorMessage) && (
        <div
          className={cn(
            'rounded-lg border p-4',
            hasError ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
          )}
        >
          {errorMessage ? (
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-900">识别失败</p>
                <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900">
                识别结果：
              </p>
              <p className="text-base text-gray-700">
                {recognizedText}
                {intermediateText && (
                  <span className="text-gray-400"> {intermediateText}</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 使用提示 */}
      {status === 'idle' && !errorMessage && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-700">
            💡 提示：点击麦克风按钮开始语音输入，录音完成后点击方形按钮停止。
          </p>
        </div>
      )}
    </div>
  );
}
