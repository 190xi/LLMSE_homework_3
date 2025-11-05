import { NextRequest, NextResponse } from 'next/server';
import { callQwenAPI } from '@/lib/qwen';

/**
 * 测试阿里云通义千问API
 * GET /api/test-qwen
 */
export async function GET(request: NextRequest) {
  try {
    // 测试简单的问答
    const response = await callQwenAPI(
      [
        {
          role: 'system',
          content: '你是一个友好的旅行助手。',
        },
        {
          role: 'user',
          content: '用一句话介绍北京的主要景点。',
        },
      ],
      'qwen-turbo'
    );

    return NextResponse.json({
      success: true,
      message: 'API调用成功',
      response: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}