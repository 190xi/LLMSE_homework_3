import { NextRequest, NextResponse } from 'next/server';
import { getQwenClient } from '@/lib/qwen';
import type { VoiceExpenseParseResult } from '@/types/expense-voice';

/**
 * POST /api/voice/parse-expense
 * 解析语音识别的费用描述，提取结构化信息
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '缺少语音文本' }, { status: 400 });
    }

    console.log('解析费用语音:', text);

    // 使用 Qwen AI 解析自然语言
    const prompt = `请从以下自然语言描述中提取费用信息，以JSON格式返回：

用户输入：${text}

要求：
1. 提取金额（amount）：数字，单位是元/人民币
2. 提取费用类别（category）：必须从以下选项中选择一个
   - transport（交通）：打车、出租车、公交、地铁、火车、飞机等
   - accommodation（住宿）：酒店、民宿、旅馆等
   - food（餐饮）：吃饭、早餐、午餐、晚餐、咖啡、饮料、小吃等
   - tickets（门票）：景区门票、博物馆、主题公园等
   - shopping（购物）：买东西、购物、纪念品等
   - other（其他）：无法归类的费用
3. 提取描述（description）：简短的费用描述（5-20字）
4. 如果没有明确提到金额，amount 设置为 null
5. 根据语义判断类别，如果不确定则设置为 "other"

返回格式（JSON）：
{
  "amount": 200,
  "category": "food",
  "description": "午餐",
  "confidence": 0.9
}

只返回JSON，不要任何其他文字。`;

    const qwenClient = getQwenClient();
    const completion = await qwenClient.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        {
          role: 'system',
          content:
            '你是一个费用记录助手，擅长从自然语言中提取费用相关信息。你只返回JSON格式的结果。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 返回空结果');
    }

    console.log('AI 返回:', content);

    // 提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法从 AI 响应中提取 JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 构建结果
    const result: VoiceExpenseParseResult = {
      amount: parsed.amount || undefined,
      currency: 'CNY',
      category: parsed.category || 'other',
      description: parsed.description || text.substring(0, 50),
      rawText: text,
      confidence: parsed.confidence || 0.8,
      missingFields: [],
    };

    // 检查缺失字段
    if (!result.amount) {
      result.missingFields?.push('amount');
    }
    if (!result.category || result.category === 'other') {
      if (!parsed.category) {
        result.missingFields?.push('category');
      }
    }

    console.log('解析结果:', result);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('语音费用解析错误:', error);
    return NextResponse.json(
      {
        error: '解析失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
