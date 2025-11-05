# AI 旅行规划师

智能化的Web应用，通过人工智能技术简化旅行规划过程，为用户提供个性化、全方位的旅行解决方案。

## 技术栈

### 前端
- **框架**: Next.js 14 + React 18 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand + React Query
- **表单处理**: React Hook Form + Zod
- **日期处理**: date-fns
- **图表**: Recharts
- **拖拽**: @dnd-kit/core

### 后端
- **API**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **认证**: NextAuth.js

### 第三方服务
- **LLM**: 阿里云通义千问 (qwen-plus)
- **语音识别**: 科大讯飞 WebIAT
- **地图**: 高德地图 JS API

## 项目结构

```
AI-Travel-Planner/
├── docs/                    # 文档
│   ├── PRD.md              # 产品需求文档
│   └── TECH_STACK.md       # 技术栈选型文档
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 首页
│   │   └── globals.css     # 全局样式
│   ├── components/         # React组件（待创建）
│   ├── lib/                # 工具函数和API封装
│   │   ├── qwen.ts         # 阿里云通义千问API封装
│   │   └── utils.ts        # 通用工具函数
│   └── stores/             # Zustand状态管理（待创建）
├── .env.local              # 环境变量（需配置）
├── .env.example            # 环境变量示例
├── components.json         # shadcn/ui配置
├── tailwind.config.ts      # Tailwind配置
└── package.json            # 项目依赖
```

## 环境配置

1. 复制 `.env.example` 到 `.env.local`
2. 填写以下API密钥：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# 阿里云通义千问 API
DASHSCOPE_API_KEY=your_dashscope_api_key

# 科大讯飞语音识别
NEXT_PUBLIC_XUNFEI_APP_ID=your_xunfei_app_id
NEXT_PUBLIC_XUNFEI_API_KEY=your_xunfei_api_key
NEXT_PUBLIC_XUNFEI_API_SECRET=your_xunfei_api_secret

# 高德地图 API
NEXT_PUBLIC_AMAP_KEY=your_amap_key
NEXT_PUBLIC_AMAP_SECRET=your_amap_secret
```

### 获取API密钥

- **阿里云通义千问**: https://dashscope.aliyun.com/
- **科大讯飞**: https://www.xfyun.cn/
- **高德地图**: https://lbs.amap.com/
- **Supabase**: https://supabase.com/

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint
```

访问 http://localhost:3000 查看应用。

## 功能特性

### MVP核心功能（P0）
- [x] 项目基础架构搭建
- [x] 阿里云通义千问API集成
- [ ] 用户注册登录
- [ ] 语音/文字输入旅行需求
- [ ] AI生成基础行程（景点、餐厅、住宿）
- [ ] 行程展示（列表形式）
- [ ] 预算估算
- [ ] 费用记录
- [ ] 云端数据存储

### 后续功能（P1-P3）
见 docs/PRD.md 中的详细规划

## 阿里云通义千问API使用

项目使用 **OpenAI SDK 兼容模式** 调用阿里云通义千问，位于 `src/lib/qwen.ts`。

通过设置 `baseURL` 为阿里云的兼容模式地址，可以使用 OpenAI SDK 的标准接口调用通义千问：

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});
```

### 使用示例

```typescript
import { callQwenAPI, generateItinerary } from '@/lib/qwen';

// 基础调用（支持 qwen-turbo、qwen-plus、qwen-max）
const response = await callQwenAPI([
  { role: 'system', content: '你是一个旅行助手' },
  { role: 'user', content: '推荐北京景点' }
], 'qwen-plus');

// 生成行程
const itinerary = await generateItinerary(
  '北京',      // 目的地
  3,           // 天数
  3000,        // 预算
  '美食、历史' // 偏好
);
```

### API测试

访问 `http://localhost:3000/api/test-qwen` 可以测试阿里云通义千问API是否配置正确。

## 部署

推荐使用 Vercel 部署：

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

## 开发计划

### Phase 1: MVP开发（当前阶段）
- [x] 技术栈搭建、项目初始化
- [ ] 用户系统开发
- [ ] 核心功能开发（语音输入、AI行程生成）
- [ ] 预算管理功能

### Phase 2: 功能增强
- [ ] 地图可视化
- [ ] 行程编辑优化
- [ ] 语音费用记录

### Phase 3: 持续迭代
- [ ] 根据用户反馈优化
- [ ] 添加社区功能
- [ ] 多语言支持

## 相关文档

- [产品需求文档 (PRD)](./docs/PRD.md)
- [技术栈选型说明](./docs/TECH_STACK.md)

## 许可证

MIT