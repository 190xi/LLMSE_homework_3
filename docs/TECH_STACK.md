# AI 旅行规划师 - 技术栈选型方案

## 1. 技术架构概览

### 1.1 整体架构

采用 **前后端分离** + **云原生** 架构：

```
┌─────────────────────────────────────────────────┐
│                   用户端                        │
│  ┌──────────────────────────────────────────┐   │
│  │   Web 前端 (React + TypeScript)          │   │
│  │   - 地图展示 - 语音交互 - 行程管理         │   │
│  └──────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────┘
                 │ HTTPS/WebSocket
┌────────────────▼────────────────────────────────┐
│              后端 API 层                         │
│  ┌──────────────────────────────────────────┐    │
│  │   Node.js + Express / Next.js API        │    │
│  │   - RESTful API - 业务逻辑 - 认证授权     │    │
│  └──────────────────────────────────────────┘    │
└───┬──────────┬──────────┬──────────┬─────────────┘
    │          │          │          │
┌───▼───┐ ┌──▼─────┐ ┌──▼─────┐ ┌──▼──────────┐
│ 数据库 │  │ LLM API│  │语音API  │ │  地图 API    │
│Supabase│ │阿里云   │  │ 讯飞    │ │  高德        │
└────────┘ └─────────┘ └─────────┘ └──────────────┘
```

---

## 2. 前端技术栈

### 2.1 核心框架

**推荐方案：React 18 + TypeScript + Next.js 14**

**选择理由：**

- **React 18**:
  - 市场占有率高，生态成熟
  - 组件化开发，便于维护
  - 虚拟DOM，性能优秀
  - 丰富的第三方库支持
- **TypeScript**:
  - 静态类型检查，减少运行时错误
  - 更好的代码提示和重构体验
  - 大型项目必备
- **Next.js 14**:
  - SSR/SSG支持，SEO友好
  - 文件系统路由，开发效率高
  - API Routes，可直接写后端接口
  - 自动代码分割，性能优化
  - 内置图片优化

**替代方案：**

- Vue 3 + TypeScript + Nuxt 3（学习曲线更平缓）
- SvelteKit（更轻量，性能更优）

---

### 2.2 UI 框架

**推荐方案：Tailwind CSS + shadcn/ui**

**选择理由：**

- **Tailwind CSS**:
  - 原子化CSS，开发速度快
  - 高度可定制
  - 打包体积小（按需加载）
  - 响应式设计简单
- **shadcn/ui**:
  - 基于Radix UI，可访问性优秀
  - 组件可直接复制到项目，完全可控
  - 设计精美，现代化
  - 与Tailwind完美集成

**替代方案：**

- Ant Design / Material-UI（组件更丰富，但定制性较差）
- Chakra UI（API友好，但性能稍差）

---

### 2.3 状态管理

**推荐方案：Zustand + React Query (TanStack Query)**

**选择理由：**

- **Zustand**:
  - 轻量级（约1KB）
  - API简单直观
  - 无需Context Provider包裹
  - TypeScript支持优秀
- **React Query**:
  - 专注于服务端状态管理
  - 自动缓存、重新验证
  - 乐观更新、无限滚动支持
  - 完美解决数据同步问题

**使用场景划分：**

- Zustand：管理客户端UI状态（主题、语言、临时表单数据）
- React Query：管理服务端数据（旅行计划、用户信息、费用记录）

**替代方案：**

- Redux Toolkit（更适合超大型项目）
- Jotai / Recoil（原子化状态管理）

---

### 2.4 地图组件

**推荐方案：高德地图 Web JS API 2.0**

**选择理由：**

- **国内场景优势**：
  - 数据准确性高（中国地区）
  - 免费额度充足（日调用30万次）
  - 中文文档完善
  - 包含公交、地铁、POI数据
- **技术特性**：
  - 支持自定义标记和路线
  - 提供路径规划API
  - 实时路况数据
  - 移动端适配良好

**集成方式：**

```bash
npm install @amap/amap-jsapi-loader
```

**替代方案：**

- 百度地图（API类似，免费额度更少）
- Mapbox GL JS（国际化项目首选，但需要VPN，国内数据较弱）

---

### 2.5 语音识别

**推荐方案：科大讯飞 Web 语音听写 (WebIAT)**

**选择理由：**

- **中文识别准确率高**：业界领先
- **实时流式识别**：边说边识别，用户体验好
- **方言支持**：支持多种方言和口音
- **免费额度**：每日500次调用（测试阶段足够）
- **WebSocket接口**：实时性强

**集成方式：**

```javascript
// 使用讯飞 Web 语音 SDK
import IatRecorder from 'iat-recorder';
```

**替代方案：**

- 阿里云智能语音（价格更低，但准确率稍差）
- 浏览器原生 Web Speech API（免费但支持度有限）

---

### 2.6 其他重要库

#### 表单处理

**推荐：React Hook Form + Zod**

- React Hook Form：性能优秀，无需re-render
- Zod：TypeScript优先的schema验证库

#### 日期处理

**推荐：date-fns**

- 轻量级（相比Moment.js）
- Tree-shakeable
- 函数式API

#### 图表可视化

**推荐：Recharts**

- React原生组件
- 响应式设计
- 用于费用统计饼图、折线图

#### 拖拽交互

**推荐：dnd-kit**

- 现代化拖拽库
- 性能优秀
- 无障碍支持
- 用于行程项目拖拽排序

#### 图片处理

**推荐：next/image + Cloudinary**

- Next.js内置图片优化
- Cloudinary提供CDN和图片压缩

---

## 3. 后端技术栈

### 3.1 后端框架

**推荐方案 A：Next.js 14 API Routes (全栈一体)**

**选择理由：**

- **开发效率高**：前后端同一项目，减少配置
- **部署简单**：Vercel一键部署
- **适合中小型项目**：开发团队小、迭代快
- **SSR集成**：可直接在服务端获取数据

**文件结构：**

```
app/
  api/
    auth/
      route.ts          # 用户认证
    trips/
      route.ts          # 旅行计划CRUD
      [id]/route.ts     # 单个计划详情
    generate-itinerary/
      route.ts          # AI生成行程
    expenses/
      route.ts          # 费用记录
```

**适用场景：**

- 个人项目或小团队
- 快速原型开发
- 不需要复杂微服务架构

---

**推荐方案 B：Node.js + Express + TypeScript (传统分离)**

**选择理由：**

- **灵活性高**：可自由选择架构模式
- **适合大型项目**：团队分工明确
- **性能可控**：可精细优化
- **生态成熟**：中间件丰富

**技术栈组合：**

```
Express + TypeScript + Prisma ORM + JWT
```

**项目结构：**

```
src/
  controllers/      # 控制器
  services/         # 业务逻辑
  models/           # 数据模型
  middlewares/      # 中间件
  routes/           # 路由定义
  utils/            # 工具函数
  config/           # 配置文件
```

**适用场景：**

- 中大型项目
- 需要高度定制化
- 前后端团队分离

---

### 3.2 API 设计

**推荐：RESTful API + tRPC (可选)**

**RESTful API 规范：**

```
GET    /api/trips              # 获取所有行程
POST   /api/trips              # 创建新行程
GET    /api/trips/:id          # 获取单个行程
PUT    /api/trips/:id          # 更新行程
DELETE /api/trips/:id          # 删除行程

POST   /api/generate-itinerary # AI生成行程
POST   /api/expenses           # 记录费用
GET    /api/expenses/:tripId   # 获取行程费用
```

**tRPC (可选，用于Next.js全栈项目)：**

- 类型安全的API调用
- 无需手动定义接口类型
- 开发体验极佳

---

### 3.3 认证授权

**推荐方案：NextAuth.js (如果使用Next.js) 或 JWT**

**NextAuth.js 优势：**

- 开箱即用的OAuth集成（Google、GitHub等）
- 会话管理自动化
- 安全性高（CSRF保护）
- 支持多种数据库

**配置示例：**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: SupabaseAdapter({...}),
};
```

**JWT 方案（Express项目）：**

- 使用 `jsonwebtoken` 库
- Access Token + Refresh Token模式
- Token存储在HttpOnly Cookie

---

## 4. 数据库与存储

### 4.1 数据库选择

**推荐方案：Supabase (PostgreSQL)**

**选择理由：**

- **功能全面**：
  - PostgreSQL数据库（关系型，支持JSON字段）
  - 内置认证系统（Auth）
  - 实时订阅（Realtime）
  - 对象存储（Storage）
  - 边缘函数（Edge Functions）
- **开发友好**：
  - 自动生成RESTful API
  - 自动生成TypeScript类型
  - Dashboard可视化管理
  - 本地开发环境支持
- **免费额度充足**：
  - 500MB数据库空间
  - 1GB文件存储
  - 50,000 MAU
- **开源**：可自部署，无供应商锁定

**数据库设计工具：**

- Prisma ORM（类型安全，迁移管理）
- Supabase Client（官方SDK，简单易用）

**连接示例：**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 查询数据
const { data, error } = await supabase
  .from('trips')
  .select('*')
  .eq('user_id', userId);
```

---

**替代方案：**

**Firebase (Firestore + Authentication)**

- **优势**：
  - 实时同步开箱即用
  - 认证系统完善
  - 免费额度更高
  - Google生态集成
- **劣势**：
  - NoSQL数据库（复杂查询较弱）
  - 关系型数据建模复杂
  - 价格不透明
- **适用场景**：移动端为主、需要极致实时性

**MongoDB + MongoDB Atlas**

- **优势**：
  - NoSQL灵活性
  - 横向扩展能力强
  - 地理位置查询优秀
- **劣势**：
  - 关系型数据建模困难
  - 事务支持较弱
- **适用场景**：文档型数据、大数据量

---

### 4.2 文件存储

**推荐方案：Supabase Storage**

**用于存储：**

- 用户头像
- 景点图片
- 费用小票/发票
- 行程导出的PDF文件

**替代方案：**

- Cloudinary（专业图片CDN，有免费额度）
- AWS S3（企业级，需要配置复杂）
- 阿里云OSS（国内速度快）

---

### 4.3 缓存

**推荐方案：Redis (Upstash)**

**使用场景：**

- 热门目的地数据缓存
- 汇率数据缓存
- API限流
- 会话存储

**为什么选择Upstash：**

- Serverless Redis（按需付费）
- 免费额度（10,000次/天）
- 全球边缘节点
- HTTP REST API（无需TCP连接）

---

## 5. 第三方服务集成

### 5.1 大语言模型 API

**推荐方案：阿里云通义千问 (Qwen)**

**选择理由：**

- **国内访问稳定**：无需VPN，低延迟
- **中文理解优秀**：专为中文场景优化，旅行规划更精准
- **价格低廉**：约为OpenAI的1/5，成本更可控
- **免费额度充足**：100万tokens/月（约可生成200-300个行程）
- **API稳定可靠**：阿里云基础设施保障
- **支持Function Calling**：可结构化输出JSON格式
- **官方文档完善**：中文文档，上手简单

**可用模型：**

- **qwen-plus**：推荐用于行程规划（性能强，价格适中）
- **qwen-turbo**：用于简单任务（速度快，价格低）
- **qwen-max**：复杂多日行程（能力最强）

**费用对比（每1000 tokens）：**

- qwen-turbo：¥0.0008（约$0.0001）
- qwen-plus：¥0.004（约$0.0006）
- qwen-max：¥0.04（约$0.006）
- 对比：GPT-4o约$0.005，贵约8倍

**接入步骤：**

1. 注册阿里云账号：https://dashscope.aliyun.com/
2. 开通DashScope服务
3. 创建API Key
4. 安装SDK：`npm install @alicloud/dashscope`

**调用示例：**

```typescript
import OpenAI from 'openai'; // 兼容OpenAI SDK

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

const response = await client.chat.completions.create({
  model: 'qwen-plus', // 或 qwen-turbo、qwen-max
  messages: [
    {
      role: 'system',
      content:
        '你是一个专业的旅行规划助手，擅长根据用户需求生成详细的旅行计划。',
    },
    {
      role: 'user',
      content: `请为我规划一个${destination}的${days}日游，预算${budget}元，偏好${preferences}`,
    },
  ],
  // 支持结构化输出
  response_format: { type: 'json_object' },
});

const itinerary = JSON.parse(response.choices[0].message.content);
```

**Function Calling 示例：**

```typescript
const response = await client.chat.completions.create({
  model: 'qwen-plus',
  messages: messages,
  tools: [
    {
      type: 'function',
      function: {
        name: 'generate_itinerary',
        description: '生成旅行行程',
        parameters: {
          type: 'object',
          properties: {
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  attractions: { type: 'array' },
                  restaurants: { type: 'array' },
                  accommodation: { type: 'object' },
                },
              },
            },
            total_budget: { type: 'number' },
          },
        },
      },
    },
  ],
});
```

**成本优化：**

- 使用qwen-turbo处理简单查询（如景点信息）
- 使用qwen-plus生成行程规划
- 缓存常见目的地推荐结果
- 优化Prompt，减少Token消耗
- 利用免费额度（100万tokens/月）

---

**替代方案：**

**1. OpenAI GPT-4o / GPT-4o-mini**

- **优势**：
  - 推理能力最强
  - 生成质量顶尖
  - 生态成熟
- **劣势**：
  - 价格较高（GPT-4o: $5/百万tokens输入）
  - 国内访问需要代理
  - 无免费额度
- **适用**：预算充足、对质量要求极高的场景
- **价格**：GPT-4o-mini $0.15/百万tokens（较便宜选择）

**2. Anthropic Claude 3.5 Sonnet**

- **优势**：
  - 超大上下文窗口（200K tokens）
  - 输出质量接近GPT-4
  - 价格适中（$3/百万tokens输入）
- **劣势**：
  - 国内访问需要代理
  - 中文能力略弱于通义千问
- **适用**：需要处理长文本（多日复杂行程）

**3. 其他国产模型**

- **百度文心一言**：价格低，但能力稍弱
- **智谱GLM-4**：性能不错，价格适中
- **讯飞星火**：中文理解好，但API调用限制较多

**4. 开源模型（Qwen2.5、LLaMA 3）+ 自部署**

- **优势**：无调用费用，数据隐私可控
- **劣势**：需要GPU服务器（月成本$100+），运维成本高
- **适用**：长期大规模使用、对数据安全要求极高

---

**推荐策略：**

- **开发阶段**：使用阿里云通义千问（免费额度+低成本）
- **生产环境**：主用通义千问，OpenAI作为备用
- **高端用户**：可选GPT-4o（按需付费）

---

### 5.2 语音识别 API

**推荐：科大讯飞 WebIAT**

**接入步骤：**

1. 注册科大讯飞开放平台
2. 创建应用，获取APPID、APISecret、APIKey
3. 使用WebSocket实时接口

**前端集成：**

```javascript
import IatRecorder from '@iat/recorder';

const recorder = new IatRecorder({
  appId: 'your_appid',
  apiKey: 'your_apikey',
  apiSecret: 'your_apisecret',
  onTextChange: (text) => {
    console.log('识别结果：', text);
  },
});

recorder.start(); // 开始录音
```

**费用：**

- 免费额度：500次/天
- 超出后：0.0005元/次

---

**替代方案：**

**1. 浏览器原生 Web Speech API**

```javascript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'zh-CN';
recognition.onresult = (event) => {
  const text = event.results[0][0].transcript;
};
recognition.start();
```

- **优势**：完全免费，无需后端
- **劣势**：浏览器支持度有限（Chrome/Edge较好），准确率一般

**2. 阿里云智能语音**

- 价格更低（0.0004元/次）
- 适合成本敏感项目

---

### 5.3 地图 API

**推荐：高德地图 Web服务 API**

**所需功能模块：**

1. **地图 JS API**：地图显示、标记、路线
2. **地理编码 API**：地址→经纬度转换
3. **路径规划 API**：驾车/公交/步行路线规划
4. **POI搜索 API**：搜索景点、餐厅
5. **天气查询 API**：获取目的地天气

**免费额度：**

- 个人开发者：30万次/日
- 企业认证：100万次/日

**调用示例：**

```javascript
// 初始化地图
const map = new AMap.Map('container', {
  zoom: 11,
  center: [116.397428, 39.90923],
});

// 添加标记
const marker = new AMap.Marker({
  position: [116.397428, 39.90923],
  title: '北京故宫',
});
map.add(marker);

// 路径规划
AMap.plugin('AMap.Driving', () => {
  const driving = new AMap.Driving({
    map: map,
  });
  driving.search(startPoint, endPoint);
});
```

---

### 5.4 其他可选服务

**图片服务：Unsplash API**

- 免费高质量旅游图片
- 用于景点默认图片展示
- 5000次请求/小时

**天气服务：OpenWeatherMap / 和风天气**

- 提供目的地天气预报
- 免费额度：1000次/天

**汇率服务：ExchangeRate-API**

- 实时汇率转换
- 免费额度：1500次/月

**邮件服务：Resend / SendGrid**

- 发送验证邮件、行程提醒
- Resend免费额度：3000封/月

---

## 6. 开发工具与工程化

### 6.1 包管理器

**推荐：pnpm**

- 速度快，节省磁盘空间
- 严格的依赖管理（避免幽灵依赖）
- 支持Monorepo

### 6.2 代码质量

**ESLint + Prettier + Husky + lint-staged**

- ESLint：代码规范检查
- Prettier：代码格式化
- Husky：Git Hooks（提交前自动检查）
- lint-staged：只检查暂存文件

### 6.3 测试

**推荐：Vitest + React Testing Library + Playwright**

- Vitest：单元测试（比Jest更快）
- React Testing Library：组件测试
- Playwright：E2E测试

### 6.4 CI/CD

**推荐：GitHub Actions**

- 免费（公开仓库）
- 配置简单
- 与GitHub无缝集成

**工作流示例：**

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

### 6.5 API文档

**推荐：Swagger / OpenAPI**

- 自动生成API文档
- 可在线测试接口

---

## 7. 部署方案

### 7.1 前端部署

**推荐：Vercel (如果使用Next.js)**

**优势：**

- 零配置部署
- 自动HTTPS
- 全球CDN
- 免费额度充足
- Preview部署（每个PR自动部署预览）
- 边缘函数支持

**免费额度：**

- 100GB带宽/月
- 无限站点数
- 100GB小时Edge Function执行时间

**部署步骤：**

1. 连接GitHub仓库
2. 自动检测Next.js项目
3. 配置环境变量
4. 自动构建部署

---

**替代方案：**

- Netlify（类似Vercel，免费额度更少）
- Cloudflare Pages（免费额度大，但功能较少）
- 阿里云OSS + CDN（国内访问快，需要备案）

---

### 7.2 后端部署（如果独立后端）

**推荐：Railway / Render**

**Railway优势：**

- 支持Docker部署
- 自动从GitHub部署
- 内置数据库（PostgreSQL、Redis）
- 免费额度：$5/月

**Render优势：**

- 完全免费层（有限制）
- 支持定时任务
- 自动SSL

**部署步骤：**

1. 创建`Dockerfile`
2. 连接GitHub仓库
3. 配置环境变量
4. 自动构建部署

---

**替代方案：**

- Fly.io（全球边缘部署）
- DigitalOcean App Platform（稳定但较贵）
- 阿里云/腾讯云（需要手动配置）

---

### 7.3 数据库部署

**推荐：Supabase Cloud**

- 托管PostgreSQL
- 免费层：500MB存储
- 自动备份
- 全球CDN

**替代方案：**

- Neon（Serverless PostgreSQL，免费额度更大）
- PlanetScale（MySQL兼容，免费层慷慨）

---

### 7.4 监控与日志

**推荐：Sentry + Vercel Analytics**

**Sentry**：

- 错误追踪
- 性能监控
- 免费额度：5000错误/月

**Vercel Analytics**：

- 页面访问统计
- Web Vitals性能指标
- 免费（Hobby计划）

---

## 8. 推荐技术栈组合

### 方案 A：全栈 Next.js（推荐新手/小团队）

```
前端：Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui
状态：Zustand + React Query
后端：Next.js API Routes
数据库：Supabase (PostgreSQL)
认证：NextAuth.js
部署：Vercel
LLM：阿里云通义千问 (qwen-plus)
语音：科大讯飞 WebIAT
地图：高德地图 JS API
```

**优势：**

- 学习曲线平缓
- 开发效率高
- 部署简单
- 成本低

**适合：**

- 快速MVP开发
- 个人项目
- 小团队（1-3人）

---

### 方案 B：前后端分离（推荐大团队/企业级）

```
前端：React 18 + TypeScript + Vite + Tailwind CSS + Ant Design
状态：Redux Toolkit + RTK Query
后端：Node.js + Express + TypeScript + Prisma ORM
数据库：PostgreSQL (自部署) + Redis
认证：JWT + Passport.js
部署：前端Vercel，后端Railway/AWS
LLM：阿里云通义千问 (qwen-plus)
语音：科大讯飞
地图：高德地图
```

**优势：**

- 前后端完全解耦
- 可独立扩展
- 更灵活的架构
- 适合微服务演进

**适合：**

- 中大型项目
- 团队分工明确
- 需要高度定制

---

## 9. 开发环境配置

### 9.1 必备工具

```bash
# Node.js 版本管理
nvm install 20  # 使用Node.js 20 LTS

# 包管理器
npm install -g pnpm

# 代码编辑器
VSCode + 插件：
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Extension Pack
  - GitLens
```

### 9.2 项目初始化（方案A：Next.js）

```bash
# 创建Next.js项目
pnpm create next-app@latest ai-travel-planner \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd ai-travel-planner

# 安装依赖
pnpm add @supabase/supabase-js \
         next-auth \
         openai \
         zustand \
         @tanstack/react-query \
         react-hook-form \
         zod \
         date-fns \
         recharts \
         @dnd-kit/core \
         @amap/amap-jsapi-loader

# 安装开发依赖
pnpm add -D @types/node \
            eslint-config-prettier \
            prettier \
            husky \
            lint-staged

# 初始化Supabase
pnpm add @supabase/supabase-js
supabase init  # 如果需要本地开发

# 初始化Git Hooks
pnpm dlx husky-init
```

### 9.3 环境变量配置

创建 `.env.local` 文件：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# 阿里云通义千问 (兼容OpenAI SDK)
DASHSCOPE_API_KEY=your_dashscope_api_key

# 科大讯飞
NEXT_PUBLIC_XUNFEI_APP_ID=your_appid
NEXT_PUBLIC_XUNFEI_API_KEY=your_apikey
NEXT_PUBLIC_XUNFEI_API_SECRET=your_apisecret

# 高德地图
NEXT_PUBLIC_AMAP_KEY=your_amap_key
NEXT_PUBLIC_AMAP_SECRET=your_amap_secret
```

---

## 10. 成本估算

### 10.1 开发阶段（前3个月）

| 服务           | 免费额度       | 预计费用     |
| -------------- | -------------- | ------------ |
| Vercel         | 100GB带宽      | $0           |
| Supabase       | 500MB数据库    | $0           |
| 阿里云通义千问 | 100万tokens/月 | $0（额度内） |
| 科大讯飞       | 500次/日       | $0           |
| 高德地图       | 30万次/日      | $0           |
| **合计**       |                | **$0/月**    |

### 10.2 运营阶段（1000 MAU）

| 服务           | 费用                           |
| -------------- | ------------------------------ |
| Vercel Pro     | $20/月                         |
| Supabase Pro   | $25/月                         |
| 阿里云通义千问 | $30-50/月（约200-500万tokens） |
| 科大讯飞       | $50/月                         |
| 高德地图       | $0（额度内）                   |
| **合计**       | **$125-145/月**                |

**成本优化建议：**

- 缓存常见行程推荐（减少LLM调用）
- 使用qwen-turbo处理简单任务（比qwen-plus便宜5倍）
- 图片使用CDN + 懒加载
- 数据库查询优化（索引）
- 利用免费额度（通义千问100万tokens/月）

---

## 11. 技术风险与应对

### 11.1 LLM API稳定性

**风险**：阿里云通义千问API可能限流或故障
**应对**：

- 实现多LLM提供商切换（通义千问 → OpenAI → Claude作为备用）
- 缓存热门目的地推荐结果
- 设置超时和重试机制
- 监控API调用量和费用

### 11.2 语音识别准确性

**风险**：方言、口音影响识别
**应对**：

- 提供文字编辑功能
- 显示识别结果，允许修改
- 支持多轮对话澄清

### 11.3 地图API调用限制

**风险**：超出免费额度
**应对**：

- 缓存地理编码结果
- 前端地图懒加载
- 监控API调用量

### 11.4 数据安全

**风险**：用户隐私泄露
**应对**：

- 启用Supabase Row Level Security (RLS)
- 敏感数据加密存储
- 定期安全审计

---

## 12. 总结与建议

### 12.1 MVP 优先级

**第一阶段（2周）**：

1. 搭建Next.js + Supabase基础框架
2. 实现用户注册登录
3. 接入阿里云通义千问API，实现基础行程生成

**第二阶段（2周）**：

1. 实现语音输入（科大讯飞）
2. 行程展示页面（列表形式）
3. 费用记录功能（文字输入）

**第三阶段（2周）**：

1. 地图可视化（高德地图）
2. 行程编辑功能
3. 数据云端同步

### 12.2 学习资源

- Next.js官方文档：https://nextjs.org/docs
- Supabase教程：https://supabase.com/docs
- Tailwind CSS：https://tailwindcss.com/docs
- 阿里云通义千问文档：https://help.aliyun.com/zh/dashscope/
- 科大讯飞语音文档：https://www.xfyun.cn/doc/
- 高德地图API文档：https://lbs.amap.com/api/jsapi-v2/summary

### 12.3 最终建议

**如果你是新手或小团队**：
→ 选择 **方案A（Next.js全栈）**

- 快速上手
- 社区活跃
- 成本低廉

**如果你是经验丰富的团队**：
→ 选择 **方案B（前后端分离）**

- 更好的扩展性
- 团队协作高效
- 适合长期维护

---

**文档版本**: v1.0
**最后更新**: 2025-11-05
**作者**: AI Travel Planner Team
