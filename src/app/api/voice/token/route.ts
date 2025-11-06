/**
 * 科大讯飞语音识别 WebSocket URL 生成 API
 * 服务器端生成签名，避免客户端 crypto.subtle 兼容性问题
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // 获取环境变量
    const appId = process.env.NEXT_PUBLIC_XUNFEI_APP_ID;
    const apiKey = process.env.NEXT_PUBLIC_XUNFEI_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_XUNFEI_API_SECRET;

    if (!appId || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: '科大讯飞 API 配置不完整' },
        { status: 500 }
      );
    }

    // 生成 WebSocket URL
    const host = 'iat-api.xfyun.cn';
    const path = '/v2/iat';
    const date = new Date().toUTCString();

    // 生成签名原文
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;

    // 使用 Node.js crypto 模块生成 HMAC-SHA256 签名
    const hmac = crypto.createHmac('sha256', apiSecret);
    hmac.update(signatureOrigin);
    const signature = hmac.digest('base64');

    // 生成 authorization
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');

    // 构建完整 URL
    const url = `wss://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${host}`;

    return NextResponse.json({
      url,
      appId,
    });
  } catch (error) {
    console.error('生成语音识别 URL 失败:', error);
    return NextResponse.json(
      { error: '生成语音识别 URL 失败' },
      { status: 500 }
    );
  }
}
