# 环境变量配置检查清单

## 当前问题

❌ Supabase 连接失败：`getaddrinfo ENOTFOUND qitxynncmqradruciyqw.supabase.co`

## 解决步骤

### 1. 验证 Supabase 项目

访问 https://supabase.com/dashboard 并检查：

- [ ] 项目是否存在
- [ ] 项目是否处于活动状态（Active）
- [ ] 可以正常访问 Dashboard

### 2. 获取正确的配置

在 Supabase Dashboard 中：

1. 进入 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...`（很长的字符串）

### 3. 更新 .env.local

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...你的完整anon密钥

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=至少32个字符的随机字符串

# 阿里云通义千问（可选，测试 AI 功能时需要）
DASHSCOPE_API_KEY=sk-...你的API密钥
```

### 4. 生成 NEXTAUTH_SECRET

如果没有 NEXTAUTH_SECRET，可以使用以下命令生成：

```bash
# 方法 1：使用 OpenSSL
openssl rand -base64 32

# 方法 2：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. 重启开发服务器

**重要**：修改 `.env.local` 后必须重启服务器

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
pnpm dev
```

## 验证配置

重启后，应该看到：

- ✅ 注册功能正常
- ✅ 登录功能正常
- ✅ 创建行程正常
- ✅ 个人资料正常

## 常见问题

### Q1: 如果没有 Supabase 项目怎么办？

创建新项目：

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 选择组织并创建项目
4. 等待项目初始化（约 2 分钟）
5. 在 SQL Editor 中执行 `database/schema.sql`
6. 在 SQL Editor 中执行 `database/fix-auth-trigger.sql`

### Q2: Supabase 项目暂停了怎么办？

免费项目会在 7 天不活动后暂停：

1. 进入项目 Dashboard
2. 点击 "Restore" 或 "Unpause"
3. 等待项目恢复

### Q3: 如何测试连接是否成功？

重启服务器后，在浏览器访问：

- http://localhost:3000/register - 尝试注册
- 如果没有错误提示，说明连接成功

## 下一步

配置完成后，请：

1. 重启开发服务器
2. 打开浏览器访问 http://localhost:3000
3. 尝试注册新用户
4. 测试创建行程功能
5. 报告结果
