/**
 * 音频格式转换工具
 * 将浏览器录制的音频转换为科大讯飞要求的 PCM 格式
 */

export class AudioConverter {
  /**
   * 将 Blob 音频转换为 16kHz 单声道 PCM
   */
  static async convertToPCM(
    audioBlob: Blob,
    targetSampleRate: number = 16000
  ): Promise<ArrayBuffer> {
    // 创建音频上下文
    const audioContext = new AudioContext({ sampleRate: targetSampleRate });

    try {
      // 将 Blob 转换为 ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();

      // 解码音频数据
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 获取第一个声道的数据（单声道）
      const channelData = audioBuffer.getChannelData(0);

      // 如果采样率不是目标采样率，需要重采样
      let resampledData: Float32Array;
      if (audioBuffer.sampleRate !== targetSampleRate) {
        resampledData = this.resample(
          channelData,
          audioBuffer.sampleRate,
          targetSampleRate
        );
      } else {
        resampledData = channelData;
      }

      // 将 Float32Array (-1 to 1) 转换为 Int16Array (-32768 to 32767)
      const pcmData = new Int16Array(resampledData.length);
      for (let i = 0; i < resampledData.length; i++) {
        const s = Math.max(-1, Math.min(1, resampledData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      return pcmData.buffer;
    } finally {
      await audioContext.close();
    }
  }

  /**
   * 重采样音频数据
   */
  private static resample(
    input: Float32Array,
    inputSampleRate: number,
    outputSampleRate: number
  ): Float32Array {
    if (inputSampleRate === outputSampleRate) {
      return input;
    }

    const ratio = inputSampleRate / outputSampleRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const inputIndex = i * ratio;
      const index = Math.floor(inputIndex);
      const fraction = inputIndex - index;

      if (index + 1 < input.length) {
        // 线性插值
        output[i] = input[index] * (1 - fraction) + input[index + 1] * fraction;
      } else {
        output[i] = input[index];
      }
    }

    return output;
  }

  /**
   * 实时转换音频流 (用于实时识别)
   * 这个方法用于处理 MediaRecorder 的实时数据块
   */
  static async convertBlobToPCMChunk(blob: Blob): Promise<ArrayBuffer> {
    return this.convertToPCM(blob, 16000);
  }
}
