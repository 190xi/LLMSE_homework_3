# Supabase Auth 配置指南

本指南将帮助你在Supabase中配置用户认证功能。

## 前置条件

- ✅ 已创建Supabase项目
- ✅ 已运行主数据库Schema (`database/schema.sql`)
- ✅ 已在`.env.local`中配置Supabase URL和密钥

## 配置步骤

### 第1步：启用Email认证

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单 **Authentication** → **Providers**
4. 确保 **Email** 提供者已启用
5. （可选）配置邮件模板：
   - 点击 **Email Templates**
   - 自定义确认邮件、重置密码邮件等模板

### 第2步：配置邮件设置（重要）

1. 在 **Authentication** → **Settings** 中
2. 找到 **Email Auth** 部分
3. 配置以下选项：
   - ✅ **Enable email confirmations**: 关闭（开发阶段），生产环境建议开启
   - ✅ **Secure email change**: 开启
   - ✅ **Email OTP**: 可选（如果需要OTP登录）

### 第3步：运行Auth集成SQL脚本

1. 在Supabase Dashboard中，点击左侧菜单 **SQL Editor**
2. 点击 **New query**
3. 复制 `database/supabase-auth-setup.sql` 文件的全部内容
4. 粘贴到SQL编辑器中
5. 点击 **Run** 执行脚本

### 第4步：验证配置

运行以下SQL查询来验证配置是否成功：

```sql
-- 1. 检查RLS是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- 2. 检查RLS策略
SELECT *
FROM pg_policies
WHERE tablename = 'users';

-- 3. 检查触发器
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

预期结果：

- `users` 表的 `rowsecurity` 应为 `true`
- 应该有3个策略：查看、更新、插入
- 触发器 `on_auth_user_created` 应存在且启用

### 第5步：测试认证功能

你可以通过以下方式测试：

#### 方式1：使用Supabase客户端测试

在项目中创建一个测试API路由：

```typescript
// src/app/api/test-auth/route.ts
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Test signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return Response.json({ data, error });
}
```

#### 方式2：使用Supabase Dashboard测试

1. 在 **Authentication** → **Users** 中
2. 点击 **Add user** → **Create new user**
3. 输入邮箱和密码
4. 创建后，检查 `users` 表是否自动创建了对应记录

## 常见问题

### Q1: 用户注册后，users表中没有记录？

**解决方案**：

1. 检查触发器是否正确创建
2. 查看Supabase日志：**Database** → **Logs**
3. 确保 `auth.users` 表中有记录
4. 手动运行触发器函数测试：
   ```sql
   SELECT handle_new_user();
   ```

### Q2: 登录时提示"Invalid login credentials"？

**解决方案**：

1. 确认邮箱和密码正确
2. 检查 **Authentication** → **Users** 中用户状态
3. 如果启用了邮箱确认，确保用户已确认邮箱

### Q3: RLS策略导致无法访问数据？

**解决方案**：

1. 暂时禁用RLS进行测试：
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```
2. 检查策略条件是否正确
3. 确保使用了 `auth.uid()` 而不是 `current_user`

## 安全检查清单

在生产环境上线前，请确保：

- [ ] Email confirmation 已启用
- [ ] 密码强度要求已配置（最少8位字符）
- [ ] 所有RLS策略已启用并测试
- [ ] 邮件模板已自定义（移除默认Supabase品牌）
- [ ] 设置了合适的session过期时间
- [ ] 配置了合适的密码重置流程
- [ ] 已测试所有认证流程

## 下一步

配置完成后，你可以：

1. 实现用户注册API
2. 实现用户登录API
3. 创建登录/注册UI页面
4. 测试完整的认证流程

---

**配置文件版本**: v1.0
**更新日期**: 2025-11-06
