import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getQwenClient } from '@/lib/qwen';
import type { VoiceTripParseResult } from '@/types/trip-voice';

/**
 * POST /api/voice/parse-trip
 * 解析语音输入的行程信息
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '请提供语音识别文本' },
        { status: 400 }
      );
    }

    // 使用 AI 解析语音文本
    const prompt = `你是一个专业的旅行规划助手。请从用户的自然语言描述中提取以下旅行信息：

用户输入："""
${text}
"""

请提取以下信息（如果用户没有提供，则该字段为null）：
1. **destination**: 目的地城市或国家（字符串）
2. **days**: 旅行天数（数字，例如"5天"提取为5）
3. **totalBudget**: 总预算，单位为人民币元（数字，例如"1万元"提取为10000，"5千"提取为5000）
4. **numAdults**: 成人数量（数字，默认为1，如果没提到就是1）
5. **numChildren**: 儿童数量（数字，从"带孩子"、"有小孩"、"一个孩子"等推断，如果没提到就是0）
6. **preferences**: 旅行偏好标签数组（从以下标签中选择：美食、历史、自然、购物、动漫、艺术、文化、摄影、探险、休闲、亲子、度假、运动、音乐、建筑）

**重要规则**：
- 如果用户说"带孩子"、"有小孩"、"和孩子一起"等，则numChildren应该至少为1
- 如果用户说"两大一小"，则numAdults为2，numChildren为1
- 预算单位统一为人民币元（整数）
- 天数从"X天"、"X日"、"一周"（7天）等提取
- 如果用户给出了开始和结束日期，计算天数
- 偏好标签从用户的描述中推断，例如"喜欢美食"→["美食"]，"喜欢美食和动漫"→["美食","动漫"]
- 如果带孩子，自动添加"亲子"标签

请以JSON格式返回，不要包含任何其他文字：
\`\`\`json
{
  "destination": "提取的目的地或null",
  "days": 提取的天数或null,
  "totalBudget": 提取的预算或null,
  "numAdults": 提取的成人数或1,
  "numChildren": 提取的儿童数或0,
  "preferences": ["偏好1", "偏好2"]或[]
}
\`\`\``;

    const qwenClient = getQwenClient();
    const completion = await qwenClient.chat.completions.create({
      model: 'qwen-plus',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // 低温度以获得更确定的结果
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // 提取 JSON
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : responseText;

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      return NextResponse.json(
        { error: 'AI 解析失败，请重新描述' },
        { status: 500 }
      );
    }

    // 计算日期（如果有天数）
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (parsed.days && parsed.days > 0) {
      // 默认从明天开始
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      startDate = tomorrow.toISOString().split('T')[0];

      const end = new Date(tomorrow);
      end.setDate(end.getDate() + parsed.days - 1);
      endDate = end.toISOString().split('T')[0];
    }

    // 检查缺失的必填字段
    const missingFields: string[] = [];
    if (!parsed.destination) missingFields.push('destination');
    if (!parsed.days && !startDate) missingFields.push('dates');
    if (!parsed.totalBudget) missingFields.push('totalBudget');

    // 如果带孩子，确保包含"亲子"标签
    if (parsed.numChildren > 0) {
      if (!parsed.preferences) parsed.preferences = [];
      if (!parsed.preferences.includes('亲子')) {
        parsed.preferences.push('亲子');
      }
    }

    const result: VoiceTripParseResult = {
      destination: parsed.destination || undefined,
      startDate,
      endDate,
      days: parsed.days || undefined,
      totalBudget: parsed.totalBudget || undefined,
      numAdults: parsed.numAdults || 1,
      numChildren: parsed.numChildren || 0,
      preferences: parsed.preferences || [],
      rawText: text,
      confidence: missingFields.length === 0 ? 0.9 : 0.7,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
    };

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Parse trip voice error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
