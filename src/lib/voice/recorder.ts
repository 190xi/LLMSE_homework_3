/**
 * 语音录制工具类
 * 封装浏览器 MediaRecorder API
 */

import type {
  VoiceRecorderOptions,
  VoiceRecorderState,
  AudioData,
} from '@/types/voice';

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private animationFrame: number = 0;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  private options: Required<VoiceRecorderOptions> = {
    sampleRate: 16000,
    mimeType: 'audio/webm',
    maxDuration: 60000, // 60秒
  };

  private state: VoiceRecorderState = {
    status: 'idle',
    duration: 0,
    audioLevel: 0,
  };

  private listeners: {
    onStateChange?: (state: VoiceRecorderState) => void;
    onDataAvailable?: (data: Blob) => void;
    onComplete?: (audio: AudioData) => void;
    onError?: (error: Error) => void;
  } = {};

  constructor(options?: Partial<VoiceRecorderOptions>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  /**
   * 检查浏览器是否支持录音
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * 请求麦克风权限并开始录音
   */
  async start(): Promise<void> {
    if (!VoiceRecorder.isSupported()) {
      throw new Error('当前浏览器不支持录音功能');
    }

    if (this.state.status === 'recording') {
      throw new Error('录音已在进行中');
    }

    try {
      // 请求麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // 创建音频分析器（用于音量可视化）
      this.setupAudioAnalyser();

      // 创建 MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
      });

      this.audioChunks = [];
      this.startTime = Date.now();

      // 设置事件监听
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          this.listeners.onDataAvailable?.(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const duration = Date.now() - this.startTime;
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const arrayBuffer = await blob.arrayBuffer();

        const audioData: AudioData = {
          blob,
          duration,
          arrayBuffer,
        };

        this.updateState({ status: 'completed', duration });
        this.listeners.onComplete?.(audioData);
        this.cleanup();
      };

      this.mediaRecorder.onerror = (event) => {
        const error = new Error(`录音错误: ${event}`);
        this.updateState({ status: 'error', error: error.message });
        this.listeners.onError?.(error);
        this.cleanup();
      };

      // 开始录音
      this.mediaRecorder.start(100); // 每100ms触发一次 dataavailable
      this.updateState({ status: 'recording', duration: 0 });

      // 开始音量监测
      this.startAudioLevelMonitoring();

      // 设置最大录音时长
      setTimeout(() => {
        if (this.state.status === 'recording') {
          this.stop();
        }
      }, this.options.maxDuration);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('录音初始化失败');
      this.updateState({ status: 'error', error: err.message });
      this.listeners.onError?.(err);
      this.cleanup();
      throw err;
    }
  }

  /**
   * 停止录音
   */
  stop(): void {
    if (this.state.status !== 'recording') {
      return;
    }

    this.mediaRecorder?.stop();
    this.stopAudioLevelMonitoring();
  }

  /**
   * 取消录音
   */
  cancel(): void {
    if (this.state.status !== 'recording') {
      return;
    }

    this.audioChunks = [];
    this.mediaRecorder?.stop();
    this.stopAudioLevelMonitoring();
    this.updateState({ status: 'idle', duration: 0, audioLevel: 0 });
    this.cleanup();
  }

  /**
   * 获取当前状态
   */
  getState(): VoiceRecorderState {
    return { ...this.state };
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
   * 设置音频分析器
   */
  private setupAudioAnalyser(): void {
    if (!this.stream) return;

    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    const source = this.audioContext.createMediaStreamSource(this.stream);
    source.connect(this.analyser);
  }

  /**
   * 开始音量监测
   */
  private startAudioLevelMonitoring(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (this.state.status !== 'recording') return;

      this.analyser!.getByteFrequencyData(dataArray);

      // 计算平均音量
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const average = sum / bufferLength;
      const audioLevel = Math.min(100, (average / 255) * 100);

      this.updateState({ audioLevel });

      // 更新录音时长
      const duration = Date.now() - this.startTime;
      this.updateState({ duration });

      this.animationFrame = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  /**
   * 停止音量监测
   */
  private stopAudioLevelMonitoring(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
  }

  /**
   * 更新状态并触发回调
   */
  private updateState(update: Partial<VoiceRecorderState>): void {
    this.state = { ...this.state, ...update };
    this.listeners.onStateChange?.(this.state);
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    // 停止所有音轨
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;

    // 关闭音频上下文
    this.audioContext?.close();
    this.audioContext = null;
    this.analyser = null;

    // 清空录音数据
    this.mediaRecorder = null;
  }

  /**
   * 获取浏览器支持的 MIME 类型
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // 默认值
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.cancel();
    this.listeners = {};
  }
}
