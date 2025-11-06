/**
 * 语音识别服务
 * 整合录音和识别功能
 */

import { VoiceRecorder } from './recorder';
import { PCMRecorder } from './pcm-recorder';
import { XunfeiRecognizer } from './xunfei';
import { AudioConverter } from './audio-converter';
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
  private recorder: VoiceRecorder | null = null;
  private pcmRecorder: PCMRecorder | null = null;
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

    // 根据模式选择录音器
    if (this.options.realtime) {
      // 实时模式：使用 PCMRecorder 直接获取 PCM 数据
      this.pcmRecorder = new PCMRecorder();
      this.setupPCMRecorderListeners();
    } else {
      // 非实时模式：使用 VoiceRecorder 录制完整音频
      this.recorder = new VoiceRecorder({
        maxDuration: this.options.maxDuration,
      });
      this.setupRecorderListeners();
    }
  }

  /**
   * 开始录音和识别
   */
  async start(): Promise<void> {
    try {
      // 检查环境变量
      const appId = process.env.NEXT_PUBLIC_XUNFEI_APP_ID;

      if (!appId) {
        throw new Error('科大讯飞 APP_ID 未配置，请检查环境变量');
      }

      // 创建识别器（只需 appId，签名在服务器端生成）
      this.recognizer = new XunfeiRecognizer({
        appId,
      });

      this.setupRecognizerListeners();

      // 如果是实时识别，先启动识别器
      if (this.options.realtime && this.options.autoStart) {
        console.log('正在启动识别器...');
        await this.recognizer.start();
        console.log('识别器启动完成，开始录音');
      }

      // 根据模式启动对应的录音器
      if (this.options.realtime && this.pcmRecorder) {
        await this.pcmRecorder.start();
      } else if (this.recorder) {
        await this.recorder.start();
      }

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
    if (this.pcmRecorder) {
      this.pcmRecorder.stop();
    }
    if (this.recorder) {
      this.recorder.stop();
    }
    this.recognizer?.end();
  }

  /**
   * 取消录音和识别
   */
  cancel(): void {
    if (this.pcmRecorder) {
      this.pcmRecorder.cancel();
    }
    if (this.recorder) {
      this.recorder.cancel();
    }
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
   * 设置 PCM 录音器监听 (实时模式)
   */
  private setupPCMRecorderListeners(): void {
    if (!this.pcmRecorder) return;

    this.pcmRecorder.on('onStateChange', (state) => {
      // 传递音量信息
      this.listeners.onAudioLevel?.(state.audioLevel);

      // 更新状态
      if (state.status === 'recording') {
        this.updateStatus('recording');
      } else if (state.status === 'error') {
        this.handleError(new Error(state.error || '录音错误'));
      }
    });

    this.pcmRecorder.on('onDataAvailable', (pcmData: Int16Array) => {
      // 实时发送 PCM 数据给识别器
      if (this.recognizer) {
        console.log('发送 PCM 数据:', pcmData.byteLength, 'bytes');
        this.recognizer.send(pcmData.buffer as ArrayBuffer);
      }
    });

    this.pcmRecorder.on('onError', (error) => {
      this.handleError(error);
    });
  }

  /**
   * 设置录音器监听 (非实时模式)
   */
  private setupRecorderListeners(): void {
    if (!this.recorder) return;

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

    this.recorder.on('onComplete', async (audio: AudioData) => {
      // 非实时识别：录音完成后再识别
      await this.recognizeAudio(audio);
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

      // 先转换音频格式为PCM
      console.log('转换音频格式为PCM...');
      const pcmBuffer = await AudioConverter.convertToPCM(audio.blob, 16000);
      console.log('音频转换完成，PCM数据大小:', pcmBuffer.byteLength, 'bytes');

      // 分块发送音频数据
      const chunkSize = 1280; // 每次发送 1280 字节 (40ms @ 16kHz)

      for (let i = 0; i < pcmBuffer.byteLength; i += chunkSize) {
        const chunk = pcmBuffer.slice(
          i,
          Math.min(i + chunkSize, pcmBuffer.byteLength)
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
    this.recorder?.destroy();
    this.pcmRecorder?.destroy();
    this.recognizer?.destroy();
    this.listeners = {};
  }
}
