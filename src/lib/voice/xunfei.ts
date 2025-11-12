/**
 * 科大讯飞语音识别 WebSocket 客户端
 * WebIAT (Web Interactive Audio Transcription)
 */

import type {
  XunfeiConfig,
  XunfeiParams,
  RecognitionResult,
  VoiceStatus,
} from '@/types/voice';

export class XunfeiRecognizer {
  private ws: WebSocket | null = null;
  private config: XunfeiConfig;
  private params: Required<XunfeiParams>;
  private resultText: string = ''; // 已确认的文本（所有段落累积）
  private currentSegmentText: string = ''; // 当前段落的临时文本
  private status: VoiceStatus = 'idle';
  private connectionReady: Promise<void> | null = null;
  private resolveConnection: (() => void) | null = null;

  private listeners: {
    onStatusChange?: (status: VoiceStatus) => void;
    onResult?: (result: RecognitionResult) => void;
    onError?: (error: Error) => void;
    onComplete?: (text: string) => void;
    onReady?: () => void;
  } = {};

  constructor(config: XunfeiConfig, params?: Partial<XunfeiParams>) {
    this.config = config;
    this.params = {
      language: 'zh_cn',
      domain: 'iat',
      audioEncoding: 'raw',
      sampleRate: '16000',
      ptt: 1, // 返回标点符号
      vinfo: 1, // 开启流式返回，减少延迟
      ...params,
    };
  }

  /**
   * 开始识别
   */
  async start(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      throw new Error('识别已在进行中');
    }

    try {
      this.resultText = '';
      this.updateStatus('recognizing');

      // 创建连接就绪 Promise
      this.connectionReady = new Promise((resolve) => {
        this.resolveConnection = resolve;
      });

      const url = await this.getWebSocketUrl();
      this.ws = new WebSocket(url);

      this.setupWebSocketHandlers();

      // 等待连接就绪
      await this.connectionReady;
      console.log('WebSocket 已就绪，可以发送音频数据');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('启动识别失败');
      this.handleError(err);
      throw err;
    }
  }

  /**
   * 发送音频数据
   */
  send(audioData: ArrayBuffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未连接，无法发送音频数据');
      return;
    }

    try {
      // 将 ArrayBuffer 转换为 Base64
      const base64Audio = this.arrayBufferToBase64(audioData);

      const frame = {
        data: {
          status: 1, // 1: 数据中间帧
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: base64Audio,
        },
      };

      this.ws.send(JSON.stringify(frame));
    } catch (error) {
      console.error('发送音频数据失败:', error);
    }
  }

  /**
   * 结束识别
   */
  end(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // 发送结束帧
      const endFrame = {
        data: {
          status: 2, // 2: 数据结束帧
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: '',
        },
      };

      this.ws.send(JSON.stringify(endFrame));
    } catch (error) {
      console.error('发送结束帧失败:', error);
    }
  }

  /**
   * 取消识别
   */
  cancel(): void {
    this.cleanup();
    this.updateStatus('idle');
    this.resultText = '';
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
   * 设置 WebSocket 事件处理器
   */
  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('科大讯飞 WebSocket 连接成功');
      // 连接成功后发送业务参数
      this.sendBusinessParams();
    };

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        this.handleMessage(response);
      } catch (error) {
        console.error('解析识别结果失败:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      this.handleError(new Error('语音识别连接错误'));
    };

    this.ws.onclose = () => {
      console.log('科大讯飞 WebSocket 连接关闭');
      this.cleanup();
    };
  }

  /**
   * 处理识别结果消息
   */
  private handleMessage(response: any): void {
    console.log('收到识别结果:', JSON.stringify(response, null, 2));

    if (response.code !== 0) {
      this.handleError(
        new Error(`识别错误: ${response.message} (${response.code})`)
      );
      return;
    }

    const data = response.data;
    if (!data) {
      console.warn('响应中没有data字段');
      return;
    }

    // 解析识别结果
    if (data.result) {
      const ws = data.result.ws;
      if (ws && Array.isArray(ws) && ws.length > 0) {
        // 解析当前帧的文本
        let frameText = '';
        ws.forEach((item: any) => {
          if (item.cw && Array.isArray(item.cw)) {
            item.cw.forEach((word: any) => {
              frameText += word.w;
            });
          }
        });

        // 判断是否为整个识别会话的结束
        const isSessionEnd = data.status === 2;
        console.log(
          '会话状态 data.status:',
          data.status,
          '是否结束:',
          isSessionEnd,
          '当前帧文本:',
          frameText
        );

        if (isSessionEnd) {
          // 会话结束：使用之前的实时识别文本作为最终结果
          // 注意：最后一帧可能只包含标点符号，所以优先使用 currentSegmentText
          if (this.currentSegmentText) {
            this.resultText = this.currentSegmentText;
          } else if (frameText) {
            this.resultText = frameText;
          }

          console.log('识别完成，最终结果:', this.resultText);

          const result: RecognitionResult = {
            text: this.resultText,
            isFinal: true,
            confidence: data.confidence,
          };

          this.listeners.onResult?.(result);
          this.updateStatus('completed');
          this.listeners.onComplete?.(this.resultText);

          // 清理状态
          this.currentSegmentText = '';
          this.cleanup();
        } else {
          // 实时识别中：这是临时结果，直接替换（不累积）
          this.currentSegmentText = frameText;

          console.log('实时识别文本:', this.currentSegmentText);

          const result: RecognitionResult = {
            text: this.currentSegmentText,
            isFinal: false,
            confidence: data.confidence,
          };

          this.listeners.onResult?.(result);
        }
      } else {
        console.warn('ws字段为空或不是数组');
      }
    } else {
      console.log('响应中没有result字段，可能是确认帧');
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    this.updateStatus('error');
    this.listeners.onError?.(error);
    this.cleanup();
  }

  /**
   * 更新状态
   */
  private updateStatus(status: VoiceStatus): void {
    this.status = status;
    this.listeners.onStatusChange?.(status);
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  /**
   * 发送业务参数
   */
  private sendBusinessParams(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const businessParams = {
      common: {
        app_id: this.config.appId,
      },
      business: {
        language: this.params.language,
        domain: this.params.domain,
        accent: 'mandarin', // 普通话
        vad_eos: 1500, // 后端点检测超时时间 (从5000ms降低到1500ms，提升响应速度)
        dwa: 'wpgs', // 动态修正
        ptt: this.params.ptt, // 标点符号
        pd: 'travel', // 领域：旅游场景，提高识别准确度
        rlang: 'zh-cn', // 原始音频语言
        nunum: 1, // 将数字转为阿拉伯数字
      },
      data: {
        status: 0, // 0: 第一帧
        format: 'audio/L16;rate=16000',
        encoding: 'raw',
        audio: '',
      },
    };

    console.log('发送业务参数:', businessParams);
    this.ws.send(JSON.stringify(businessParams));

    // 标记连接已就绪
    if (this.resolveConnection) {
      this.resolveConnection();
      this.resolveConnection = null;
    }

    // 触发就绪回调
    this.listeners.onReady?.();
  }

  /**
   * 生成 WebSocket URL（通过服务器端 API）
   */
  private async getWebSocketUrl(): Promise<string> {
    try {
      // 调用服务器端 API 生成 URL，避免客户端 crypto.subtle 兼容性问题
      const response = await fetch('/api/voice/token');

      if (!response.ok) {
        throw new Error(`获取语音识别 URL 失败: ${response.status}`);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('服务器返回的 URL 为空');
      }

      console.log('成功获取 WebSocket URL');
      return data.url;
    } catch (error) {
      console.error('获取 WebSocket URL 失败:', error);
      throw new Error('无法连接到语音识别服务，请检查网络连接');
    }
  }

  /**
   * ArrayBuffer 转 Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.cancel();
    this.listeners = {};
  }
}
