# 修复 RLS 权限问题 - 配置 Service Role Key

## 问题已解决 ✅

我已经修改了所有 API 文件，从使用 `SUPABASE_ANON_KEY`（匿名密钥）改为使用 `SUPABASE_SERVICE_ROLE_KEY`（服务端密钥）。

**修改的文件**：

- ✅ `src/app/api/profile/route.ts`
- ✅ `src/app/api/trips/route.ts`
- ✅ `src/app/api/trips/[id]/route.ts`
- ✅ `src/app/api/trips/[id]/generate/route.ts`

## 为什么需要 Service Role Key？

**问题**：

- 匿名密钥（anon key）受 RLS 策略限制
- API 路由尝试查询数据时，`auth.uid()` 为空
- 导致查询返回 0 行，报错：`PGRST116 - Cannot coerce the result to a single JSON object`

**解决方案**：

- Service Role Key 可以绕过 RLS 策略
- 仅在服务端使用，不会暴露给客户端
- 我们在代码中仍然验证用户权限（通过 NextAuth session）

## 配置步骤

### 1. 获取 Service Role Key

1. 访问 https://supabase.com/dashboard
2. 选择您的项目
3. 进入 **Settings** → **API**
4. 在 "Project API keys" 部分找到 **`service_role` secret**
5. 点击"复制"按钮

⚠️ **重要**：Service Role Key 非常敏感，**绝对不要**：

- 提交到 Git 仓库
- 在前端代码中使用
- 公开分享

### 2. 更新 .env.local

在您的 `.env.local` 文件中添加以下配置：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...你的anon密钥（公开密钥）
SUPABASE_SERVICE_ROLE_KEY=eyJ...你的service_role密钥（服务端密钥）⚠️保密

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=你的32字符随机字符串

# 阿里云通义千问（测试 AI 功能时需要）
DASHSCOPE_API_KEY=sk-你的API密钥
```

### 3. 重启开发服务器

**非常重要**：修改 `.env.local` 后必须重启服务器才能生效！

```bash
# 在终端按 Ctrl+C 停止当前服务器
# 然后重新运行
pnpm dev
```

### 4. 验证配置

重启后访问 http://localhost:3000：

1. **测试注册**：
   - 访问 `/register`
   - 注册新用户
   - 应该自动登录成功

2. **测试创建行程**：
   - 点击"创建新行程"
   - 填写表单并提交
   - **应该不再出现 500 错误** ✅

3. **测试个人资料**：
   - 点击"个人资料"
   - **应该正常显示信息** ✅

## 完整的环境变量配置示例

```bash
# ==============================================
# Supabase 数据库配置
# ==============================================
# 项目 URL（公开）
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co

# 匿名密钥（公开，可以在前端使用）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 服务端密钥（私密，仅服务端使用）⚠️ 绝对不要提交到 Git
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==============================================
# NextAuth 认证配置
# ==============================================
NEXTAUTH_URL=http://localhost:3000
# 生成方法：openssl rand -base64 32
NEXTAUTH_SECRET=your-super-secret-random-string-at-least-32-chars

# ==============================================
# AI 服务配置（可选）
# ==============================================
# 阿里云通义千问 API 密钥
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

## 生成 NEXTAUTH_SECRET

如果还没有 `NEXTAUTH_SECRET`，可以使用以下命令生成：

### Windows PowerShell

```powershell
# 方法 1：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### macOS / Linux

```bash
# 方法 1：使用 OpenSSL
openssl rand -base64 32

# 方法 2：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 安全建议

### ✅ 应该做的

- ✅ 将 `.env.local` 添加到 `.gitignore`（已配置）
- ✅ 使用环境变量管理敏感信息
- ✅ 定期轮换 Service Role Key

### ❌ 绝对不要做

- ❌ 将 Service Role Key 提交到 Git
- ❌ 在客户端代码中使用 Service Role Key
- ❌ 公开分享 `.env.local` 文件

## 故障排查

### 问题 1：服务器启动失败

**错误**：`Missing SUPABASE_SERVICE_ROLE_KEY`

**解决**：

1. 检查 `.env.local` 文件是否存在
2. 确认添加了 `SUPABASE_SERVICE_ROLE_KEY=...`
3. 重启开发服务器

### 问题 2：仍然出现 500 错误

**解决**：

1. 确认已重启服务器（**非常重要**）
2. 检查 Service Role Key 是否正确
3. 查看终端错误日志

### 问题 3：Service Role Key 在哪里？

**解决**：

1. 访问 Supabase Dashboard
2. Settings → API
3. 找到 "service_role" secret
4. 点击复制（注意不是 anon public key）

## 下一步

配置完成后，您应该能够：

- ✅ 正常创建行程
- ✅ 查看个人资料
- ✅ 使用所有功能

如有问题，请检查终端的错误日志。
