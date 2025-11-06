# 环境变量配置指南

本文档说明如何配置AI Travel Planner项目所需的环境变量。

## 快速开始

1. 复制环境变量示例文件：

   ```bash
   cp .env.example .env.local
   ```

2. 按照下面的说明获取各项服务的API密钥

3. 编辑 `.env.local` 文件，填入你的密钥

## 环境变量清单

### 必需的环境变量 (P0)

这些环境变量是项目运行的最低要求：

| 变量名                          | 用途                  | 获取方式        | 备注                           |
| ------------------------------- | --------------------- | --------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase数据库URL     | Supabase控制台  | 以 `https://` 开头             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名密钥      | Supabase控制台  | 用于客户端访问                 |
| `DASHSCOPE_API_KEY`             | 阿里云通义千问API密钥 | 阿里云DashScope | 服务端使用                     |
| `NEXTAUTH_SECRET`               | NextAuth会话加密密钥  | 自行生成        | 使用 `openssl rand -base64 32` |
| `NEXTAUTH_URL`                  | NextAuth回调URL       | 手动设置        | 本地: `http://localhost:3000`  |

### 重要的环境变量 (P1)

这些环境变量用于核心功能：

| 变量名                          | 用途               | 获取方式     | 备注         |
| ------------------------------- | ------------------ | ------------ | ------------ |
| `NEXT_PUBLIC_XUNFEI_APP_ID`     | 科大讯飞应用ID     | 讯飞开放平台 | 语音识别功能 |
| `NEXT_PUBLIC_XUNFEI_API_KEY`    | 讯飞API Key        | 讯飞开放平台 | 客户端使用   |
| `NEXT_PUBLIC_XUNFEI_API_SECRET` | 讯飞API Secret     | 讯飞开放平台 | 客户端使用   |
| `NEXT_PUBLIC_AMAP_KEY`          | 高德地图API Key    | 高德开放平台 | 地图显示     |
| `NEXT_PUBLIC_AMAP_SECRET`       | 高德地图API Secret | 高德开放平台 | 安全验证     |

### 可选的环境变量 (P2)

这些环境变量用于增强功能：

| 变量名                   | 用途                 | 获取方式             | 默认值 |
| ------------------------ | -------------------- | -------------------- | ------ |
| `GOOGLE_CLIENT_ID`       | Google OAuth客户端ID | Google Cloud Console | -      |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth密钥     | Google Cloud Console | -      |
| `SENTRY_DSN`             | Sentry错误追踪DSN    | Sentry控制台         | -      |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry客户端DSN      | Sentry控制台         | -      |
| `UPSTASH_REDIS_URL`      | Redis缓存URL         | Upstash控制台        | -      |
| `UPSTASH_REDIS_TOKEN`    | Redis访问令牌        | Upstash控制台        | -      |

## 详细配置说明

### 1. Supabase 配置

**获取步骤：**

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目或选择现有项目
3. 进入 Project Settings → API
4. 复制以下信息：
   - URL (Project URL)
   - anon/public key

**配置示例：**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**数据库设置：**

1. 在Supabase SQL Editor中执行 `database/schema.sql` 文件
2. 启用Row Level Security (RLS)
3. 配置数据库备份策略

### 2. 阿里云通义千问 (DashScope)

**获取步骤：**

1. 访问 [阿里云DashScope](https://dashscope.aliyun.com/)
2. 注册/登录阿里云账号
3. 开通DashScope服务（首次使用有免费额度）
4. 进入 API-KEY 管理
5. 创建新的API Key

**配置示例：**

```env
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**费用说明：**

- 免费额度：100万tokens/月
- qwen-turbo: ¥0.0008/千tokens
- qwen-plus: ¥0.004/千tokens
- qwen-max: ¥0.04/千tokens

**测试API：**

```bash
curl -X POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-turbo","input":{"prompt":"你好"}}'
```

### 3. NextAuth 配置

**生成NEXTAUTH_SECRET：**

```bash
# Linux/macOS
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**配置示例：**

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here
```

**生产环境：**

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret
```

### 4. 科大讯飞语音识别

**获取步骤：**

1. 访问 [科大讯飞开放平台](https://www.xfyun.cn/)
2. 注册/登录账号并实名认证
3. 进入控制台 → 创建新应用
4. 选择 "语音听写（流式版）WebAPI"
5. 获取 APPID、APIKey、APISecret

**配置示例：**

```env
NEXT_PUBLIC_XUNFEI_APP_ID=12345678
NEXT_PUBLIC_XUNFEI_API_KEY=abcdef1234567890abcdef12
NEXT_PUBLIC_XUNFEI_API_SECRET=1234567890abcdef1234567890abcdef
```

**免费额度：**

- 500次/天（开发版）
- 超出后：¥0.0005/次

### 5. 高德地图

**获取步骤：**

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册/登录账号
3. 进入控制台 → 应用管理 → 创建新应用
4. 添加Key → 选择 "Web端(JS API)"
5. 设置Key名称和服务平台

**配置示例：**

```env
NEXT_PUBLIC_AMAP_KEY=your_amap_key_here
NEXT_PUBLIC_AMAP_SECRET=your_amap_secret_here
```

**安全设置：**

- 在控制台设置IP白名单或域名白名单
- 启用数字签名验证

**免费额度：**

- 个人开发者：30万次/日
- 企业开发者：100万次/日（需认证）

### 6. Google OAuth (可选)

**获取步骤：**

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建OAuth 2.0客户端ID
5. 配置授权重定向URI：
   - 开发环境: `http://localhost:3000/api/auth/callback/google`
   - 生产环境: `https://your-domain.com/api/auth/callback/google`

**配置示例：**

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 7. Sentry 错误追踪 (可选)

**获取步骤：**

1. 访问 [Sentry](https://sentry.io/)
2. 创建新项目（选择Next.js）
3. 复制DSN

**配置示例：**

```env
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**免费额度：**

- 5000 errors/月
- 10000 performance units/月

### 8. Upstash Redis (可选)

**获取步骤：**

1. 访问 [Upstash](https://upstash.com/)
2. 创建Redis数据库
3. 选择区域（建议选择离你用户最近的）
4. 复制REST URL和Token

**配置示例：**

```env
UPSTASH_REDIS_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA==
```

**免费额度：**

- 10,000 commands/日
- 256MB存储

## 环境区分

### 开发环境 (.env.local)

```env
# 开发环境配置
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_key
DASHSCOPE_API_KEY=dev_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev_secret
```

### 预发布环境 (.env.staging)

```env
# Staging环境配置（在Vercel中配置）
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging_key
DASHSCOPE_API_KEY=staging_key
NEXTAUTH_URL=https://staging.your-domain.com
NEXTAUTH_SECRET=staging_secret
```

### 生产环境 (.env.production)

```env
# 生产环境配置（在Vercel中配置）
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key
DASHSCOPE_API_KEY=prod_key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=prod_secret_very_secure
```

## 安全最佳实践

### ✅ 应该做的

1. **永远不要提交 `.env.local` 到Git**

   ```bash
   # 确保.gitignore包含
   .env*.local
   .env
   ```

2. **使用不同的密钥用于不同环境**
   - 开发、Staging、生产使用独立的API密钥
   - 定期轮换生产环境密钥

3. **限制API密钥权限**
   - 只授予必要的权限
   - 设置IP白名单和域名限制

4. **使用环境变量管理工具**
   - Vercel：在项目设置中配置
   - 1Password/BitWarden：团队密钥共享

5. **定期检查密钥使用情况**
   - 监控API调用量
   - 设置费用告警

### ❌ 不应该做的

1. **不要在前端代码中使用服务端密钥**
   - ❌ `DASHSCOPE_API_KEY`（后端专用）
   - ✅ `NEXT_PUBLIC_AMAP_KEY`（前端可用）

2. **不要在日志中打印敏感信息**

   ```typescript
   // ❌ 错误
   console.log('API Key:', process.env.DASHSCOPE_API_KEY);

   // ✅ 正确
   console.log('API Key:', process.env.DASHSCOPE_API_KEY ? '已配置' : '未配置');
   ```

3. **不要硬编码密钥**

   ```typescript
   // ❌ 错误
   const apiKey = 'sk-123456789';

   // ✅ 正确
   const apiKey = process.env.DASHSCOPE_API_KEY;
   ```

## 验证配置

创建一个脚本验证环境变量配置：

```typescript
// scripts/verify-env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DASHSCOPE_API_KEY',
  'NEXTAUTH_SECRET',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ 缺少以下环境变量:');
  missingVars.forEach((varName) => console.error(`  - ${varName}`));
  process.exit(1);
}

console.log('✅ 所有必需的环境变量已配置');
```

运行验证：

```bash
pnpm tsx scripts/verify-env.ts
```

## 故障排查

### 问题1: API调用失败

**症状：**

```
Error: Invalid API key
```

**解决方案：**

1. 检查环境变量是否正确配置
2. 确认API密钥没有过期
3. 检查API密钥是否有正确的权限
4. 确认没有多余的空格或换行符

### 问题2: Supabase连接失败

**症状：**

```
Error: Failed to connect to Supabase
```

**解决方案：**

1. 确认Supabase项目状态正常
2. 检查URL格式是否正确（需要https://）
3. 验证anon key是否正确
4. 检查网络连接

### 问题3: NextAuth会话问题

**症状：**

```
Error: [next-auth][error][JWT_SESSION_ERROR]
```

**解决方案：**

1. 重新生成NEXTAUTH_SECRET
2. 确认NEXTAUTH_URL与实际域名一致
3. 清除浏览器Cookie重新登录

## 参考链接

- [Next.js环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase文档](https://supabase.com/docs)
- [阿里云DashScope文档](https://help.aliyun.com/zh/dashscope/)
- [NextAuth配置](https://next-auth.js.org/configuration/options)
- [Vercel环境变量](https://vercel.com/docs/environment-variables)

---

**最后更新**: 2025-11-05
