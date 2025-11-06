/**
 * 语音识别相关类型定义
 */

export type VoiceStatus =
  | 'idle'
  | 'recording'
  | 'recognizing'
  | 'completed'
  | 'error';

export interface VoiceRecorderOptions {
  /** 采样率 (Hz) */
  sampleRate?: number;
  /** 音频格式 */
  mimeType?: string;
  /** 最大录音时长 (ms) */
  maxDuration?: number;
}

export interface VoiceRecorderState {
  status: VoiceStatus;
  duration: number;
  audioLevel: number;
  error?: string;
}

export interface AudioData {
  blob: Blob;
  duration: number;
  arrayBuffer: ArrayBuffer;
}

export interface RecognitionResult {
  text: string;
  isFinal: boolean;
  confidence?: number;
}

export interface XunfeiConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

export interface XunfeiParams {
  /** 语言，支持中文、英文等 */
  language?: 'zh_cn' | 'en_us';
  /** 应用领域 */
  domain?: 'iat';
  /** 音频编码 */
  audioEncoding?: 'raw' | 'lame' | 'speex';
  /** 采样率 */
  sampleRate?: '16000' | '8000';
  /** 是否返回标点符号 */
  ptt?: 0 | 1;
}
