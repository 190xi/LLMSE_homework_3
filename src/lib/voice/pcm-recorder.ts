/**
 * PCM 录音器 - 直接获取 PCM 数据
 * 用于实时语音识别，避免音频格式转换问题
 */

import type { VoiceRecorderState } from '@/types/voice';

export class PCMRecorder {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrame: number = 0;
  private startTime: number = 0;

  private state: VoiceRecorderState = {
    status: 'idle',
    duration: 0,
    audioLevel: 0,
  };

  private listeners: {
    onStateChange?: (state: VoiceRecorderState) => void;
    onDataAvailable?: (pcmData: Int16Array) => void;
    onError?: (error: Error) => void;
  } = {};

  private readonly targetSampleRate = 16000; // 科大讯飞要求 16kHz
  private readonly bufferSize = 1024; // 处理缓冲区大小 (64ms @ 16kHz，提升实时响应速度)

  /**
   * 开始录音
   */
  async start(): Promise<void> {
    if (this.state.status === 'recording') {
      throw new Error('录音已在进行中');
    }

    try {
      // 检查浏览器兼容性
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          '您的浏览器不支持录音功能。' +
            (window.location.protocol === 'http:'
              ? ' 请使用 HTTPS 协议访问，或在浏览器地址栏输入 chrome://flags/#unsafely-treat-insecure-origin-as-secure 添加您的域名为安全来源。'
              : ' 请使用最新版本的 Chrome、Firefox 或 Safari 浏览器。')
        );
      }

      // 请求麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.targetSampleRate,
          channelCount: 1,
          echoCancellation: true, // 回声消除
          noiseSuppression: true, // 噪声抑制
          autoGainControl: true, // 自动增益控制
        },
      });

      // 创建音频上下文（使用目标采样率）
      this.audioContext = new AudioContext({
        sampleRate: this.targetSampleRate,
      });

      console.log('音频上下文采样率:', this.audioContext.sampleRate);

      // 创建音频源
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      // 创建分析器（用于音量可视化）
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      // 创建 ScriptProcessor 节点
      this.processor = this.audioContext.createScriptProcessor(
        this.bufferSize,
        1, // 单声道输入
        1 // 单声道输出
      );

      // 处理音频数据
      this.processor.onaudioprocess = (e) => {
        if (this.state.status !== 'recording') return;

        const inputData = e.inputBuffer.getChannelData(0); // Float32Array

        // 转换为 Int16 PCM
        const pcmData = this.floatTo16BitPCM(inputData);

        // 触发数据回调
        this.listeners.onDataAvailable?.(pcmData);
      };

      // 连接节点
      this.source.connect(this.analyser);
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.startTime = Date.now();
      this.updateState({ status: 'recording' });

      // 开始音量监测
      this.startAudioLevelMonitoring();

      console.log('PCM 录音器启动成功');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('启动录音失败');
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
    if (this.state.status !== 'recording') return;

    this.updateState({ status: 'completed' });
    this.stopAudioLevelMonitoring();
    this.cleanup();
  }

  /**
   * 取消录音
   */
  cancel(): void {
    this.updateState({ status: 'idle', duration: 0, audioLevel: 0 });
    this.stopAudioLevelMonitoring();
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
   * Float32 转 Int16 PCM
   */
  private floatTo16BitPCM(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
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
   * 更新状态
   */
  private updateState(update: Partial<VoiceRecorderState>): void {
    this.state = { ...this.state, ...update };
    this.listeners.onStateChange?.(this.state);
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    // 断开节点连接
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    // 停止所有音轨
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;

    // 关闭音频上下文
    this.audioContext?.close();
    this.audioContext = null;
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.cancel();
    this.listeners = {};
  }
}
