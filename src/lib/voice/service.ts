/**
 * 语音识别服务
 * 整合录音和识别功能
 */

import { VoiceRecorder } from './recorder';
import { XunfeiRecognizer } from './xunfei';
import type { VoiceStatus, RecognitionResult, AudioData } from '@/types/voice';

export interface VoiceRecognitionOptions {
  /** 实时识别（边录边识别） */
  realtime?: boolean;
  /** 最大录音时长 (ms) */
  maxDuration?: number;
  /** 是否自动开始识别 */
  autoStart?: boolean;
}

export class VoiceRecognitionService {
  private recorder: VoiceRecorder;
  private recognizer: XunfeiRecognizer | null = null;
  private options: VoiceRecognitionOptions;
  private currentStatus: VoiceStatus = 'idle';
  private recognizedText: string = '';

  private listeners: {
    onStatusChange?: (status: VoiceStatus) => void;
    onResult?: (result: RecognitionResult) => void;
    onComplete?: (text: string) => void;
    onError?: (error: Error) => void;
    onAudioLevel?: (level: number) => void;
  } = {};

  constructor(options?: VoiceRecognitionOptions) {
    this.options = {
      realtime: true,
      maxDuration: 60000,
      autoStart: true,
      ...options,
    };

    this.recorder = new VoiceRecorder({
      maxDuration: this.options.maxDuration,
    });

    this.setupRecorderListeners();
  }

  /**
   * 开始录音和识别
   */
  async start(): Promise<void> {
    try {
      // 检查环境变量
      const appId = process.env.NEXT_PUBLIC_XUNFEI_APP_ID;
      const apiKey = process.env.NEXT_PUBLIC_XUNFEI_API_KEY;
      const apiSecret = process.env.NEXT_PUBLIC_XUNFEI_API_SECRET;

      if (!appId || !apiKey || !apiSecret) {
        throw new Error('科大讯飞 API 配置不完整，请检查环境变量');
      }

      // 创建识别器
      this.recognizer = new XunfeiRecognizer({
        appId,
        apiKey,
        apiSecret,
      });

      this.setupRecognizerListeners();

      // 如果是实时识别，先启动识别器并等待连接成功
      if (this.options.realtime && this.options.autoStart) {
        console.log('正在启动识别器...');
        await this.recognizer.start();
        console.log('识别器启动完成，开始录音');
      }

      // 识别器就绪后再开始录音
      await this.recorder.start();

      this.updateStatus('recording');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('启动失败');
      this.handleError(err);
      throw err;
    }
  }

  /**
   * 停止录音和识别
   */
  stop(): void {
    this.recorder.stop();
    this.recognizer?.end();
  }

  /**
   * 取消录音和识别
   */
  cancel(): void {
    this.recorder.cancel();
    this.recognizer?.cancel();
    this.recognizedText = '';
    this.updateStatus('idle');
  }

  /**
   * 获取当前状态
   */
  getStatus(): VoiceStatus {
    return this.currentStatus;
  }

  /**
   * 获取识别文本
   */
  getText(): string {
    return this.recognizedText;
  }

  /**
   * 设置事件监听器
   */
  on<K extends keyof typeof this.listeners>(
    event: K,
    callback: NonNullable<(typeof this.listeners)[K]>
  ): void {
    this.listeners[event] = callback as any;
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof typeof this.listeners>(event: K): void {
    delete this.listeners[event];
  }

  /**
   * 设置录音器监听
   */
  private setupRecorderListeners(): void {
    this.recorder.on('onStateChange', (state) => {
      // 传递音量信息
      this.listeners.onAudioLevel?.(state.audioLevel);

      // 更新状态
      if (state.status === 'recording') {
        this.updateStatus('recording');
      } else if (state.status === 'error') {
        this.handleError(new Error(state.error || '录音错误'));
      }
    });

    this.recorder.on('onDataAvailable', (data) => {
      // 实时发送音频数据给识别器
      if (this.options.realtime && this.recognizer) {
        data.arrayBuffer().then((buffer) => {
          this.recognizer?.send(buffer);
        });
      }
    });

    this.recorder.on('onComplete', async (audio: AudioData) => {
      // 如果不是实时识别，录音完成后再识别
      if (!this.options.realtime) {
        await this.recognizeAudio(audio);
      }
    });

    this.recorder.on('onError', (error) => {
      this.handleError(error);
    });
  }

  /**
   * 设置识别器监听
   */
  private setupRecognizerListeners(): void {
    if (!this.recognizer) return;

    this.recognizer.on('onStatusChange', (status) => {
      if (status === 'recognizing') {
        this.updateStatus('recognizing');
      }
    });

    this.recognizer.on('onResult', (result) => {
      if (result.isFinal) {
        this.recognizedText = result.text;
      }
      this.listeners.onResult?.(result);
    });

    this.recognizer.on('onComplete', (text) => {
      this.recognizedText = text;
      this.updateStatus('completed');
      this.listeners.onComplete?.(text);
    });

    this.recognizer.on('onError', (error) => {
      this.handleError(error);
    });
  }

  /**
   * 识别音频（非实时模式）
   */
  private async recognizeAudio(audio: AudioData): Promise<void> {
    if (!this.recognizer) return;

    try {
      this.updateStatus('recognizing');
      await this.recognizer.start();

      // 分块发送音频数据
      const chunkSize = 1280; // 每次发送 1280 字节
      const buffer = audio.arrayBuffer;

      for (let i = 0; i < buffer.byteLength; i += chunkSize) {
        const chunk = buffer.slice(
          i,
          Math.min(i + chunkSize, buffer.byteLength)
        );
        this.recognizer.send(chunk);

        // 模拟延迟，避免发送过快
        await new Promise((resolve) => setTimeout(resolve, 40));
      }

      this.recognizer.end();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('识别失败');
      this.handleError(err);
    }
  }

  /**
   * 更新状态
   */
  private updateStatus(status: VoiceStatus): void {
    this.currentStatus = status;
    this.listeners.onStatusChange?.(status);
  }

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    this.updateStatus('error');
    this.listeners.onError?.(error);
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.recorder.destroy();
    this.recognizer?.destroy();
    this.listeners = {};
  }
}
