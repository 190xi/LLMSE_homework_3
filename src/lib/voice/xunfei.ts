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
  private resultText: string = '';
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
    if (response.code !== 0) {
      this.handleError(
        new Error(`识别错误: ${response.message} (${response.code})`)
      );
      return;
    }

    const data = response.data;
    if (!data) return;

    // 解析识别结果
    if (data.result) {
      const ws = data.result.ws;
      if (ws && Array.isArray(ws)) {
        let tempText = '';
        ws.forEach((item: any) => {
          if (item.cw && Array.isArray(item.cw)) {
            item.cw.forEach((word: any) => {
              tempText += word.w;
            });
          }
        });

        // 判断是否为最终结果
        const isFinal = data.status === 2;

        if (isFinal) {
          this.resultText += tempText;
        }

        const result: RecognitionResult = {
          text: isFinal ? this.resultText : tempText,
          isFinal,
          confidence: data.confidence,
        };

        this.listeners.onResult?.(result);

        // 如果是最终结果，触发完成回调
        if (isFinal) {
          this.updateStatus('completed');
          this.listeners.onComplete?.(this.resultText);
          this.cleanup();
        }
      }
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
        vad_eos: 5000, // 后端点检测超时时间
        dwa: 'wpgs', // 动态修正
        ptt: this.params.ptt, // 标点符号
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
   * 生成 WebSocket URL
   */
  private async getWebSocketUrl(): Promise<string> {
    const host = 'iat-api.xfyun.cn';
    const path = '/v2/iat';
    const date = new Date().toUTCString();

    // 生成签名原文
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    const signature = await this.hmacSHA256(
      signatureOrigin,
      this.config.apiSecret
    );

    // 生成 authorization
    const authorizationOrigin = `api_key="${this.config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = encodeURIComponent(btoa(authorizationOrigin));

    // 构建 URL
    const url = `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;

    return url;
  }

  /**
   * HMAC-SHA256 签名
   */
  private async hmacSHA256(message: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
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
