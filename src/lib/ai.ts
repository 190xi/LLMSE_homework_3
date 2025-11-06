import OpenAI from 'openai';

if (!process.env.DASHSCOPE_API_KEY) {
  throw new Error('Missing DASHSCOPE_API_KEY environment variable');
}

// Initialize OpenAI client with DashScope API endpoint
// DashScope (Tongyi Qianwen) provides OpenAI-compatible API
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

export interface TripGenerationParams {
  destination: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  numAdults: number;
  numChildren: number;
  preferences?: {
    travelStyle?: string[];
    accommodationLevel?: string;
    transportPreference?: string;
  };
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    description: string;
    estimatedCost?: number;
    duration?: string;
  }[];
  totalEstimatedCost: number;
  notes?: string;
}

export interface GeneratedItinerary {
  overview: string;
  days: ItineraryDay[];
  budgetBreakdown: {
    accommodation: number;
    transport: number;
    food: number;
    activities: number;
    other: number;
  };
  tips: string[];
}

/**
 * Generate a detailed travel itinerary using AI
 */
export async function generateTripItinerary(
  params: TripGenerationParams
): Promise<GeneratedItinerary> {
  const {
    destination,
    startDate,
    endDate,
    totalBudget,
    numAdults,
    numChildren,
    preferences,
  } = params;

  // Calculate trip duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Build the prompt
  const prompt = `请为我生成一份详细的旅行计划，要求如下：

目的地：${destination}
出发日期：${startDate}
返程日期：${endDate}
行程天数：${duration} 天
总预算：¥${totalBudget}
出行人数：${numAdults} 位成人${numChildren > 0 ? `，${numChildren} 位儿童` : ''}
${preferences?.travelStyle?.length ? `旅行风格：${preferences.travelStyle.join('、')}` : ''}
${preferences?.accommodationLevel ? `住宿档次：${preferences.accommodationLevel}` : ''}
${preferences?.transportPreference ? `交通偏好：${preferences.transportPreference}` : ''}

请以JSON格式返回行程计划，格式如下：
{
  "overview": "行程总体概述（100-200字）",
  "days": [
    {
      "day": 1,
      "date": "2025-01-01",
      "title": "第一天主题",
      "activities": [
        {
          "time": "09:00",
          "activity": "活动名称",
          "location": "具体地点",
          "description": "活动详细描述",
          "estimatedCost": 100,
          "duration": "2小时"
        }
      ],
      "totalEstimatedCost": 500,
      "notes": "当日注意事项"
    }
  ],
  "budgetBreakdown": {
    "accommodation": 2000,
    "transport": 1000,
    "food": 800,
    "activities": 1000,
    "other": 200
  },
  "tips": ["实用建议1", "实用建议2", "实用建议3"]
}

要求：
1. 根据预算合理安排活动，确保总花费不超过预算
2. 每天的行程要合理，考虑交通时间和体力分配
3. 包含早中晚餐建议
4. 提供具体的时间安排
5. 预算分配要详细且合理
6. 提供3-5条实用的旅行建议

请直接返回JSON，不要包含其他说明文字。`;

  try {
    const response = await client.chat.completions.create({
      model: 'qwen-plus', // Using Qwen-Plus model
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业的旅行规划助手，擅长根据用户需求生成详细、实用的旅行计划。你的回答应该是结构化的JSON格式，包含完整的行程安排和预算分配。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI returned empty response');
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const itinerary: GeneratedItinerary = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (
      !itinerary.overview ||
      !itinerary.days ||
      !Array.isArray(itinerary.days)
    ) {
      throw new Error('Invalid itinerary structure from AI');
    }

    return itinerary;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('生成行程失败，请稍后重试');
  }
}
