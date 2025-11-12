# AI 旅行规划师 (AI Travel Planner)

[![Status](https://img.shields.io/badge/Status-MVP%20Complete-success)](https://github.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

智能化的 Web 应用，通过 AI 技术简化旅行规划过程，为用户提供个性化、全方位的旅行解决方案。

## 📊 项目状态

- ✅ **MVP 已完成** - 核心功能已实现并测试通过
- ✅ **测试日期**: 2025-11-06
- ✅ **TypeScript**: 零错误，类型安全
- ✅ **认证系统**: NextAuth.js + Supabase 完整集成
- ✅ **AI 集成**: 阿里云通义千问（Qwen-Plus）

## 🎯 已完成功能

### 1. 用户认证系统 ✅

- 用户注册（邮箱 + 密码）
- 用户登录（自动会话管理）
- 会话保持（30 天有效期）
- 路由保护（中间件）
- 退出登录

### 2. 行程管理 ✅

- 创建行程（目的地、日期、预算、人数）
- 行程列表（响应式网格布局）
- 行程详情（完整信息展示）
- 状态管理（草稿/进行中/已完成/已归档）
- 表单验证（Zod + React Hook Form）

### 3. AI 行程生成 ✅

- 智能生成每日行程安排
- 景点、餐厅、住宿推荐
- 活动时间和费用估算
- 预算分配建议
- 旅行提示和注意事项

### 4. 个人资料管理 ✅

- 查看个人信息
- 编辑显示名称和偏好设置
- 默认预算设置
- 会话实时更新

### 5. UI/UX 优化 ✅

- 响应式设计（手机/平板/桌面）
- shadcn/ui 组件库
- 加载状态和错误提示
- 空状态引导
- 动态首页（根据登录状态）

## 🚀 后续功能规划

- [ ] 语音输入（科大讯飞 WebIAT）
- [ ] 地图可视化（高德地图）
- [ ] 费用记录管理
- [ ] 行程编辑功能
- [ ] 行程分享功能
- [ ] 深色模式
- [ ] 国际化（i18n）

## 🛠️ 技术栈

### 前端

- **框架**: Next.js 14 (App Router) + React 18
- **语言**: TypeScript 5 (Strict Mode)
- **样式**: Tailwind CSS + shadcn/ui
- **表单**: React Hook Form + Zod
- **图标**: Lucide React
- **认证**: NextAuth.js

### 后端

- **API**: Next.js API Routes
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth + NextAuth.js
- **安全**: Row Level Security (RLS)

### AI 服务

- **LLM**: 阿里云通义千问 (Qwen-Plus)
- **SDK**: OpenAI SDK (兼容模式)

### 计划集成的服务

- **语音识别**: 科大讯飞 WebIAT（待实现）
- **地图**: 高德地图 JS API（待实现）

## 📁 项目结构

```
AI-Travel-Planner/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证页面组
│   │   │   ├── login/         # 登录页
│   │   │   └── register/      # 注册页
│   │   ├── trips/             # 行程相关页面
│   │   │   ├── page.tsx       # 行程列表
│   │   │   ├── new/           # 创建行程
│   │   │   └── [id]/          # 行程详情
│   │   ├── profile/           # 个人资料页
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证 API
│   │   │   ├── trips/         # 行程 CRUD
│   │   │   └── profile/       # 个人资料 API
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   │   ├── auth/              # 认证组件
│   │   ├── trips/             # 行程组件
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── Navbar.tsx         # 导航栏
│   │   └── Providers.tsx      # 上下文提供者
│   ├── lib/                   # 工具库
│   │   ├── auth.ts            # NextAuth 配置
│   │   ├── ai.ts              # AI 服务封装
│   │   ├── supabase.ts        # Supabase 客户端
│   │   ├── validations.ts     # Zod 验证模式
│   │   └── utils.ts           # 通用工具
│   ├── types/                 # TypeScript 类型定义
│   └── middleware.ts          # 路由保护中间件
├── database/                  # 数据库脚本
│   ├── schema.sql             # 完整数据库结构
│   └── fix-auth-trigger.sql   # 认证触发器修复
├── docs/                      # 项目文档
│   ├── PROJECT_SUMMARY.md     # 项目总结报告
│   ├── DEVELOPMENT_PLAN.md    # 开发计划
│   ├── TESTING_GUIDE.md       # 测试指南
│   ├── SERVICE_ROLE_KEY_SETUP.md # Service Role Key 配置
│   ├── PRD.md                 # 产品需求文档
│   └── TECH_STACK.md          # 技术栈说明
├── .github/workflows/         # CI/CD 配置
├── .env.example               # 环境变量示例
├── next.config.js             # Next.js 配置
├── tsconfig.json              # TypeScript 配置
├── tailwind.config.ts         # Tailwind 配置
├── components.json            # shadcn/ui 配置
└── package.json               # 依赖管理
```

## ⚙️ 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/AI-Travel-Planner.git
cd AI-Travel-Planner
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写以下配置：

```bash
# ==============================================
# Supabase 配置
# ==============================================
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=eyJ...你的service_role密钥  # ⚠️ 仅服务端使用

# ==============================================
# NextAuth 配置
# ==============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_character_secret  # 使用 openssl rand -base64 32 生成

# ==============================================
# 阿里云通义千问 API（AI 功能需要）
# ==============================================
DASHSCOPE_API_KEY=sk-your_api_key

# ==============================================
# 以下为计划功能的 API（可选，暂未实现）
# ==============================================
# NEXT_PUBLIC_XUNFEI_APP_ID=your_xunfei_app_id
# NEXT_PUBLIC_XUNFEI_API_KEY=your_xunfei_api_key
# NEXT_PUBLIC_XUNFEI_API_SECRET=your_xunfei_api_secret
# NEXT_PUBLIC_AMAP_KEY=your_amap_key
# NEXT_PUBLIC_AMAP_SECRET=your_amap_secret
```

**重要说明**:

- `SUPABASE_SERVICE_ROLE_KEY` 是必需的，用于服务端绕过 RLS 策略
- 获取方式：Supabase Dashboard → Settings → API → service_role secret
- ⚠️ 绝对不要将 Service Role Key 提交到 Git 或在前端使用

详细配置指南：[SERVICE_ROLE_KEY_SETUP.md](./docs/SERVICE_ROLE_KEY_SETUP.md)

### 4. 配置数据库

在 Supabase Dashboard 的 SQL Editor 中执行以下脚本：

1. **创建数据库结构**: 运行 `database/schema.sql`
2. **修复认证触发器**: 运行 `database/fix-auth-trigger.sql`

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

### 6. 测试功能

1. 访问 `/register` 注册新用户
2. 自动登录后，点击"创建新行程"
3. 填写行程信息（目的地、日期、预算等）
4. 在行程详情页点击"生成 AI 行程"（需配置 `DASHSCOPE_API_KEY`）
5. 访问 `/profile` 查看和编辑个人资料

## 💻 开发脚本

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # 运行 ESLint
pnpm format           # 格式化代码（Prettier）

# 测试
pnpm test             # 运行单元测试
pnpm test:e2e         # 运行端到端测试
```

## 🤖 AI API 使用示例

### 阿里云通义千问

项目使用 OpenAI SDK 兼容模式调用阿里云通义千问：

```typescript
import { generateTripItinerary } from '@/lib/ai';

const itinerary = await generateTripItinerary({
  destination: '北京',
  startDate: '2025-06-01',
  endDate: '2025-06-03',
  totalBudget: 3000,
  numAdults: 2,
  numChildren: 0,
  preferences: '美食、历史文化',
});
```

### 行程 API

```typescript
// 创建行程
POST /api/trips
{
  "destination": "北京",
  "startDate": "2025-06-01",
  "endDate": "2025-06-03",
  "totalBudget": 3000,
  "numAdults": 2,
  "numChildren": 0
}

// 生成 AI 行程
POST /api/trips/[id]/generate

// 获取行程列表
GET /api/trips

// 获取行程详情
GET /api/trips/[id]
```

## 🚢 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（与 `.env.local` 相同）
4. 点击部署

**环境变量清单**：

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` ⚠️
- ✅ `NEXTAUTH_URL`（改为实际域名）
- ✅ `NEXTAUTH_SECRET` ⚠️
- ⚙️ `DASHSCOPE_API_KEY`（可选）

### Docker 部署

```bash
# 构建镜像
docker build -t ai-travel-planner .

# 运行容器
docker run -p 3000:3000 --env-file .env.local ai-travel-planner
```

## ✅ 测试结果

所有核心功能测试通过（2025-11-06）

- ✅ 用户注册和登录
- ✅ 创建和查看行程
- ✅ AI 生成行程
- ✅ 个人资料管理
- ✅ 响应式布局
- ✅ 路由保护和权限验证

详细测试报告：[TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)

## 🔧 已解决的技术问题

### 1. RLS 策略导致查询失败

**问题**: 使用 anon key 查询时返回 0 行（PGRST116 错误）
**解决**: 改用 Service Role Key 在服务端绕过 RLS
**文档**: [SERVICE_ROLE_KEY_SETUP.md](./docs/SERVICE_ROLE_KEY_SETUP.md)

### 2. 数据库触发器被 RLS 阻止

**问题**: 注册后用户记录创建失败
**解决**: 使用 `SECURITY DEFINER` 提升触发器权限
**脚本**: `database/fix-auth-trigger.sql`

### 3. TypeScript 类型错误

**问题**: Zod schema 与 React Hook Form 类型不匹配
**解决**: 使用 `z.input` 处理表单输入类型

完整问题列表：[PROJECT_SUMMARY.md](./docs/PROJECT_SUMMARY.md)

## 🔒 安全性

- ✅ Row Level Security (RLS)
- ✅ Service Role Key 权限管理
- ✅ CSRF 保护（NextAuth）
- ✅ XSS 防护（React）
- ✅ 密码加密（Supabase Auth）
- ✅ 环境变量保护

## 📚 文档

- 📋 [项目总结报告](./docs/PROJECT_SUMMARY.md) - 完整功能、测试、部署指南
- 📝 [产品需求文档](./docs/PRD.md) - 功能需求和用户故事
- 🛠️ [技术栈说明](./docs/TECH_STACK.md) - 技术选型理由
- 📖 [开发计划](./docs/DEVELOPMENT_PLAN.md) - 分阶段开发计划
- 🧪 [测试指南](./docs/TESTING_GUIDE.md) - 功能测试步骤
- 🔑 [Service Role Key 配置](./docs/SERVICE_ROLE_KEY_SETUP.md) - 权限配置详解

## 🔑 获取 API 密钥

- **Supabase**: https://supabase.com/ - 免费套餐包含数据库和认证
- **阿里云通义千问**: https://dashscope.aliyun.com/ - 新用户有免费额度

## ❓ 常见问题

**Q: 注册后无法登录？**
A: 检查 Supabase Dashboard 中是否禁用了邮箱验证，或手动确认用户。

**Q: 创建行程时出现 500 错误？**
A: 确认已配置 `SUPABASE_SERVICE_ROLE_KEY` 并重启服务器。

**Q: AI 生成行程失败？**
A: 需要配置 `DASHSCOPE_API_KEY`，可在阿里云 DashScope 控制台获取。

**Q: 如何生成 NEXTAUTH_SECRET？**
A: 运行 `openssl rand -base64 32` 或 `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

更多问题请查看：[PROJECT_SUMMARY.md](./docs/PROJECT_SUMMARY.md)

## 💡 技术亮点

- 🚀 **现代化技术栈** - Next.js 14 App Router + TypeScript 严格模式
- 🔐 **安全性** - RLS + Service Role Key + NextAuth
- 🎨 **用户体验** - 响应式设计 + 加载状态 + 错误处理
- 🤖 **AI 集成** - 阿里云通义千问智能生成行程
- 📱 **响应式设计** - 完美适配手机/平板/桌面
- 🛠️ **开发体验** - TypeScript 类型安全 + ESLint + Prettier

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 后端即服务
- [NextAuth.js](https://next-auth.js.org/) - 认证解决方案
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [阿里云通义千问](https://tongyi.aliyun.com/) - AI 服务

## 📄 许可证

MIT
