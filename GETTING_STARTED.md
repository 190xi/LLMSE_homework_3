# 🚀 快速开始指南

欢迎使用 AI Travel Planner！本指南将帮助你快速搭建开发环境。

## ✅ 已完成的基础设施

以下配置已经完成，无需额外设置：

- ✅ 项目结构搭建
- ✅ TypeScript配置
- ✅ Tailwind CSS配置
- ✅ ESLint + Prettier配置
- ✅ 测试框架配置（Vitest + Playwright）
- ✅ Git工作流规范
- ✅ CI/CD流程（GitHub Actions）
- ✅ 数据库Schema设计
- ✅ Husky + lint-staged配置

## 📋 前置要求

确保你的系统已安装：

- **Node.js** 20+ ([下载](https://nodejs.org/))
- **pnpm** 8+ ([安装](https://pnpm.io/installation))
- **Git** ([下载](https://git-scm.com/downloads))

检查版本：

```bash
node --version  # 应该 >= 20.0.0
pnpm --version  # 应该 >= 8.0.0
git --version
```

## 🛠️ 第一步：安装依赖

```bash
# 安装项目依赖
pnpm install

# 这会自动：
# 1. 安装所有npm包
# 2. 设置Husky Git hooks
# 3. 准备开发环境
```

## 🔑 第二步：配置环境变量

1. **复制环境变量模板**

   ```bash
   cp .env.example .env.local
   ```

2. **编辑 `.env.local` 文件**

   至少需要配置以下必需的环境变量（MVP阶段）：

   ```env
   # Supabase（数据库）
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # 阿里云通义千问（AI）
   DASHSCOPE_API_KEY=your_dashscope_api_key

   # NextAuth（认证）
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret  # 使用下面的命令生成
   ```

3. **生成NextAuth密钥**

   ```bash
   # Linux/macOS
   openssl rand -base64 32

   # Windows PowerShell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **获取第三方服务API密钥**

   详细获取步骤请参考：[环境变量配置指南](./docs/ENV_SETUP.md)

   | 服务           | 文档链接                      | 优先级  |
   | -------------- | ----------------------------- | ------- |
   | Supabase       | https://supabase.com/         | P0 必需 |
   | 阿里云通义千问 | https://dashscope.aliyun.com/ | P0 必需 |
   | 科大讯飞       | https://www.xfyun.cn/         | P1 重要 |
   | 高德地图       | https://lbs.amap.com/         | P1 重要 |

## 🗄️ 第三步：设置数据库

### 创建Supabase项目

1. 访问 [Supabase](https://supabase.com/) 并登录
2. 创建新项目
3. 等待项目初始化（约2分钟）

### 运行数据库迁移

1. 在Supabase控制台，进入 **SQL Editor**
2. 复制 `database/schema.sql` 文件的内容
3. 粘贴到SQL Editor并���击 **Run**
4. 确认所有表创建成功

或者使用Supabase CLI：

```bash
# 安装Supabase CLI（可选）
pnpm add -g supabase

# 链接项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push
```

## 🚀 第四步：启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 服务器将在以下地址运行：
# ➜  Local:   http://localhost:3000
# ➜  Network: use --host to expose
```

访问 http://localhost:3000 查看应用！

## 🧪 第五步：验证环境

### 测试阿里云通义千问API

访问：http://localhost:3000/api/test-qwen

如果配置正确，你应该看到AI的响应。

### 运行测试

```bash
# 运行单元测试
pnpm test

# 运行ESLint检查
pnpm lint

# 检查TypeScript类型
pnpm type-check

# 检查代码格式
pnpm format:check
```

## 📚 开发工作流

### 创建新功能

```bash
# 1. 切换到develop分支
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/your-feature-name

# 3. 开发功能
# ... 编写代码 ...

# 4. 提交代码（会自动运行lint和格式化）
git add .
git commit -m "feat(scope): description"

# 5. 推送并创建PR
git push origin feature/your-feature-name
```

### Commit消息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```bash
# 新功能
git commit -m "feat(auth): add Google OAuth login"

# Bug修复
git commit -m "fix(trips): resolve date picker issue"

# 文档更新
git commit -m "docs(readme): update setup instructions"
```

详细规范请参考：[贡献指南](./CONTRIBUTING.md)

## 🔧 常用命令

### 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 运行ESLint
pnpm lint:fix     # 自动修复lint错误
pnpm format       # 格式化代码
pnpm type-check   # TypeScript类型检查
```

### 测试命令

```bash
pnpm test         # 运行单元测试
pnpm test:watch   # 监听模式运行测试
pnpm test:ui      # UI模式运行测试
pnpm test:e2e     # 运行E2E测试
pnpm test:e2e:ui  # UI模式运行E2E测试
```

## 📖 项目文档

- [产品需求文档 (PRD)](./docs/PRD.md) - 了解产品功能和需求
- [技术栈选型](./docs/TECH_STACK.md) - 理解技术选型理由
- [开发计划](./docs/DEVELOPMENT_PLAN.md) - 详细的开发路线图
- [环境变量配置](./docs/ENV_SETUP.md) - API密钥获取指南
- [贡献指南](./CONTRIBUTING.md) - 开发规范和工作流

## 🐛 常见问题

### 问题1: pnpm install 失败

**解决方案：**

```bash
# 清除缓存
pnpm store prune

# 重新安装
rm -rf node_modules
pnpm install
```

### 问题2: 开发服务器无法启动

**症状：**

```
Error: EADDRINUSE: address already in use :::3000
```

**解决方案：**

```bash
# 查找占用3000端口的进程
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# 或者使用其他端口
pnpm dev -p 3001
```

### 问题3: 环境变量未生效

**解决方案：**

1. 确保文件名是 `.env.local`（不是 `.env.local.txt`）
2. 重启开发服务器（Ctrl+C然后 `pnpm dev`）
3. 确认环境变量名称正确（注意大小写）
4. 客户端变量必须以 `NEXT_PUBLIC_` 开头

### 问题4: Husky hooks不工作

**解决方案：**

```bash
# 重新初始化husky
pnpm prepare

# Linux/macOS需要添加执行权限
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

## 🎯 下一步

完成环境搭建后，你可以：

1. **阅读开发计划** - 查看 [DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md)
2. **选择任务** - 从 [Phase 1 任务清单](./docs/DEVELOPMENT_PLAN.md#phase-1-基础架构搭建-week-1-2) 开始
3. **加入开发** - 创建功能分支并开始编码

### 推荐第一个任务

如果你不确定从哪里开始，推荐按以下顺序：

1. ✅ 环境搭建（当前步骤）
2. 📝 熟悉项目结构和文档
3. 🔐 实现用户注册登录功能
4. 🤖 集成AI行程生成
5. 💰 开发费用管理功能

## 🆘 获取帮助

如果遇到问题：

1. 查看文档（docs/目录）
2. 搜索已有 Issues
3. 在团队群组中提问
4. 创建新 Issue 并详细描述问题

## 🌟 开发愉快！

现在你已经完成了所有的环境配置，可以开始开发了！

记住：

- 📖 经常查阅文档
- 🧪 编写测试
- 💬 遵循commit规范
- 🔍 代码审查时认真对待

Happy Coding! 🚀

---

**最后更新**: 2025-11-05
