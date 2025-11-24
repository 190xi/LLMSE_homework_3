/**
 * 阿里云通义千问API调用封装（使用OpenAI SDK兼容模式）
 * 官方文档: https://help.aliyun.com/zh/dashscope/
 */

import OpenAI from 'openai';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DayActivity {
  date: string;
  morning: string;
  afternoon: string;
  evening: string;
  meals: string;
  accommodation: string;
  daily_budget: number;
}

interface ItineraryData {
  days: DayActivity[];
  total_budget: number;
  tips: string;
}

/**
 * 创建阿里云通义千问客户端（兼容OpenAI SDK）
 */
export function createQwenClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is not configured');
  }

  return new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  });
}

// 懒加载客户端实例，避免在构建时初始化
let qwenClientInstance: OpenAI | null = null;

export function getQwenClient(): OpenAI {
  if (!qwenClientInstance) {
    qwenClientInstance = createQwenClient();
  }
  return qwenClientInstance;
}

/**
 * 调用阿里云通义千问API
 * @param messages 对话消息列表
 * @param model 模型名称，默认使用 qwen-plus
 * @returns AI生成的回复
 */
export async function callQwenAPI(
  messages: Message[],
  model: 'qwen-turbo' | 'qwen-plus' | 'qwen-max' = 'qwen-plus'
): Promise<string> {
  try {
    const client = getQwenClient();
    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling Qwen API:', error);
    throw error;
  }
}

/**
 * 生成旅行行程
 * @param destination 目的地
 * @param days 天数
 * @param budget 预算
 * @param preferences 偏好
 * @returns 行程JSON
 */
export async function generateItinerary(
  destination: string,
  days: number,
  budget: number,
  preferences: string
): Promise<ItineraryData> {
  const messages: Message[] = [
    {
      role: 'system',
      content: `你是一个专业的旅行规划助手，擅长根据用户需求生成详细的旅行计划。
请以JSON格式返回行程，包含以下字段：
- days: 每日行程数组
  - date: 日期
  - morning: 上午安排（景点名称、地址、时间、费用）
  - afternoon: 下午安排
  - evening: 晚上安排
  - meals: 餐饮推荐
  - accommodation: 住宿推荐
  - daily_budget: 当日预算
- total_budget: 总预算
- tips: 旅行提示`,
    },
    {
      role: 'user',
      content: `请为我规划一个${destination}的${days}日游，预算${budget}元，偏好：${preferences}。请返回JSON格式的行程。`,
    },
  ];

  const response = await callQwenAPI(messages, 'qwen-plus');

  try {
    // 尝试解析JSON
    return JSON.parse(response);
  } catch {
    // 如果返回的不是纯JSON，尝试提取JSON部分
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse itinerary JSON from API response');
  }
}

/**
 * 智能问答助手
 * @param question 用户问题
 * @param context 上下文信息（当前行程等）
 * @returns AI回答
 */
export async function chatWithAssistant(
  question: string,
  context?: string
): Promise<string> {
  const messages: Message[] = [
    {
      role: 'system',
      content: '你是一个友好的旅行助手，可以回答用户关于旅行的各种问题。',
    },
  ];

  if (context) {
    messages.push({
      role: 'system',
      content: `当前上下文：${context}`,
    });
  }

  messages.push({
    role: 'user',
    content: question,
  });

  return callQwenAPI(messages, 'qwen-turbo');
}
