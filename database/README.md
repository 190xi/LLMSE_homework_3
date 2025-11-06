# 数据库设置指南

## ✅ 问题已修复

原始的 `schema.sql` 包含了需要额外扩展的地理位置索引。现在已经修复为兼容所有Supabase项目的版本。

## 🚀 快速设置步骤

### 1. 创建Supabase项目

1. 访问 [Supabase](https://supabase.com/)
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: ai-travel-planner（或你喜欢的名字）
   - **Database Password**: 设置一个强密码（保存好！）
   - **Region**: 选择离你最近的区域（如Singapore、Tokyo等）
4. 点击 "Create new project"
5. 等待2-3分钟，直到项目状态变为"Active"

### 2. 获取连接信息

1. 在项目页面，点击左侧 **Settings** 图标
2. 选择 **API**
3. 复制以下信息到你的 `.env.local`：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. 执行数据库Schema

#### 方法A：通过SQL Editor（推荐）

1. 在Supabase项目中，点击左侧 **SQL Editor**
2. 点击 "New Query"
3. 打开本地的 `database/schema.sql` 文件
4. 复制**全部内容**
5. 粘贴到SQL Editor
6. 点击 **Run** 或按 `Ctrl+Enter`
7. 等待执行完成（约10-15秒）

#### 方法B：使用Supabase CLI（高级用户）

```bash
# 安装Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接到你的项目
supabase link --project-ref your-project-ref

# 执行schema
supabase db push
```

### 4. 验证数据库设置

1. 在Supabase Dashboard，点击左侧 **Table Editor**
2. 你应该看到以下5个表：
   - ✅ `users` - 用户表
   - ✅ `trips` - 旅行计划表
   - ✅ `expenses` - 费用记录表
   - ✅ `attractions` - 景点表（可选）
   - ✅ `restaurants` - 餐厅表（可选）

3. 点击 `users` 表，确认有以下列：
   - id, email, phone, password_hash, display_name, avatar_url, default_budget, default_city, preferences, created_at, updated_at

### 5. 测试数据库连接

创建测试文件 `src/lib/supabase.ts`（如果还没有）：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

然后在开发服务器中测试：

```typescript
// 在任何组件中测试
import { supabase } from '@/lib/supabase';

// 测试连接
const { data, error } = await supabase.from('users').select('count');
console.log('Database connected:', !error);
```

## 📊 数据库Schema详解

### 核心表

#### 1. users（用户表）

存储用户基本信息和偏好设置。

**关键字段：**

- `id`: UUID主键
- `email`: 邮箱（唯一）
- `preferences`: JSONB格式的用户偏好

**RLS策略：**

- 用户只能查看和更新自己的数据

#### 2. trips（旅行计划表）

存储用户创建的旅行计划。

**关键字段：**

- `itinerary`: JSONB格式的详细行程
- `status`: draft | active | completed | archived
- `share_token`: 用于分享链接

**RLS策略：**

- 用户可以查看自己的行程或公开分享的行程
- 只能修改自己的行程

#### 3. expenses（费用记录表）

记录旅行中的各项花费。

**关键字段：**

- `category`: transport | accommodation | food | tickets | shopping | other
- `currency`: 货币代码（默认CNY）

**RLS策略：**

- 只能查看和修改属于自己行程的费用

#### 4. attractions & restaurants（景点和餐厅表）

缓存景点和餐厅信息，减少API调用。

**特点：**

- 所有认证用户可读
- 包含地理坐标
- 支持城市和坐标组合索引

## 🔧 常见问题解决

### 问题1: 执行Schema时出现权限错误

**症状：**

```
ERROR: permission denied for schema public
```

**解决方案：**

1. 确认你使用的是项目所有者账号
2. 在Supabase Dashboard检查Database设置中的权限
3. 尝试使用Service Role Key（仅限本地测试，不要泄露）

### 问题2: 表已存在

**症状：**

```
ERROR: relation "users" already exists
```

**解决方案：**

**选项A（推荐）：** 删除现有表并重新创建

```sql
-- 在SQL Editor中执行
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS attractions CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- 然后重新运行schema.sql
```

**选项B：** 只创建缺失的表

- 仔细检查哪些表缺失
- 只复制对应表的创建语句

### 问题3: RLS策略冲突

**症状：**

```
ERROR: policy "..." for table "..." already exists
```

**解决方案：**

```sql
-- 先删除所有策略
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
-- ... 重复所有策略

-- 然后重新运行schema.sql中的策略部分
```

### 问题4: 扩展不可用

**症状：**

```
ERROR: extension "postgis" is not available
```

**解决方案：**

- `uuid-ossp`: Supabase默认支持，无需担心
- `postgis`: 需要在Dashboard中启用
  1. 进入 Database → Extensions
  2. 搜索 "postgis"
  3. 点击启用

对于MVP阶段，地理扩展是**可选的**，不启用也不影响核心功能。

## 📈 数据库性能优化

### 已配置的索引

Schema中已经为常用查询配置了索引：

1. **用户表**
   - `idx_users_email`: 邮箱登录
   - `idx_users_phone`: 手机号查询

2. **旅行计划表**
   - `idx_trips_user_id`: 查询用户的所有行程
   - `idx_trips_status`: 按状态筛选
   - `idx_trips_start_date`: 按日期排序
   - `idx_trips_user_date`: 复合索引（用户+日期）

3. **费用记录表**
   - `idx_expenses_trip_id`: 查询行程的所有费用
   - `idx_expenses_category`: 按类别统计
   - `idx_expenses_recorded_at`: 按时间排序

### 后续优化建议

当数据量增长时，可以考虑：

1. **分区表**（当trips表超过100万行）

   ```sql
   -- 按年份分区
   CREATE TABLE trips_2025 PARTITION OF trips
   FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
   ```

2. **物化视图**（用于复杂统计）

   ```sql
   CREATE MATERIALIZED VIEW trip_stats AS
   SELECT user_id, COUNT(*) as trip_count, SUM(total_budget) as total_spent
   FROM trips
   GROUP BY user_id;
   ```

3. **定期清理**（归档旧数据）
   ```sql
   -- 将1年前的已完成行程归档
   UPDATE trips
   SET status = 'archived'
   WHERE status = 'completed'
   AND end_date < NOW() - INTERVAL '1 year';
   ```

## 🔐 安全最佳实践

### Row Level Security (RLS)

Schema已经为所有表启用了RLS。**永远不要禁用RLS！**

验证RLS是否启用：

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- rowsecurity应该都是true
```

### Service Role Key安全

- ❌ **绝不**在前端代码中使用Service Role Key
- ✅ 只在后端API中使用
- ✅ 通过环境变量管理，不要硬编码

### 数据加密

Supabase默认提供：

- ✅ 传输加密（SSL/TLS）
- ✅ 静态加密（数据库磁盘加密）
- ⚠️ 敏感字段（如密码）需要应用层加密（使用bcrypt）

## 📝 数据库维护

### 备份策略

Supabase自动提供：

- 每日自动备份（保留7天）
- 需要更长时间保留，请升级到付费计划

手动备份：

```bash
# 使用pg_dump
pg_dump -h db.xxxxx.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f backup_$(date +%Y%m%d).dump
```

### 监控查询性能

在Supabase Dashboard：

1. 进入 **Database** → **Query Performance**
2. 查看慢查询
3. 优化索引

常用性能查询：

```sql
-- 查看表大小
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看索引使用情况
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

## ✅ 设置完成检查清单

- [ ] Supabase项目已创建
- [ ] `schema.sql` 已成功执行
- [ ] 5个核心表已创建
- [ ] RLS策略已启用
- [ ] 索引已创建
- [ ] 连接信息已配置到 `.env.local`
- [ ] 数据库连接测试成功

## 📚 参考资源

- [Supabase文档](https://supabase.com/docs)
- [PostgreSQL索引优化](https://www.postgresql.org/docs/current/indexes.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [数据库备份](https://supabase.com/docs/guides/platform/backups)

---

**遇到问题？** 查看主文档中的故障排查章节或在Issues中提问。

**最后更新**: 2025-11-05
