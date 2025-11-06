# GitHub Actions 配置指南

## 📋 概述

本项目已配置完整的CI/CD流程，包括：

- ✅ 代码质量检查（Lint + TypeScript）
- ✅ 单元测试
- ✅ 构建验证
- ✅ E2E测试
- ✅ 自动部署到Vercel
- ✅ Lighthouse性能检测
- ✅ 安全扫描

## 🚀 快速开始（MVP阶段）

MVP阶段推荐先启用基础功能，后续再逐步添加高级功能。

### 第一步：启用GitHub Actions

1. **在GitHub仓库中启用Actions**
   - 访问你的仓库：https://github.com/190xi/LLMSE_homework_3
   - 点击顶部的 **Actions** 标签
   - 如果看到"启用Actions"按钮，点击启用
   - 你应该会看到 "CI/CD Pipeline" workflow

2. **查看Workflow运行状态**
   - 每次push或创建PR时会自动触发
   - 可以在Actions标签查看运行状态

### 第二步：配置必需的Secrets

GitHub Actions需要一些敏感信息作为Secrets。

#### 配置路径

1. 进入仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**

#### 必需的Secrets（基础CI功能）

| Secret名称                      | 用途             | 如何获取                            | 优先级  |
| ------------------------------- | ---------------- | ----------------------------------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase URL     | Supabase Dashboard → Settings → API | P0 必需 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名密钥 | Supabase Dashboard → Settings → API | P0 必需 |

#### 可选的Secrets（高级功能）

| Secret名称               | 用途              | 如何获取                   | 功能       |
| ------------------------ | ----------------- | -------------------------- | ---------- |
| `VERCEL_TOKEN`           | Vercel部署令牌    | Vercel → Settings → Tokens | 自动部署   |
| `VERCEL_ORG_ID`          | Vercel组织ID      | Vercel项目设置             | 自动部署   |
| `VERCEL_PROJECT_ID`      | Vercel项目ID      | Vercel项目设置             | 自动部署   |
| `TEST_SUPABASE_URL`      | 测试环境数据库URL | 创建测试用Supabase项目     | E2E测试    |
| `TEST_SUPABASE_ANON_KEY` | 测试环境密钥      | 测试用Supabase项目         | E2E测试    |
| `CODECOV_TOKEN`          | 代码覆盖率上传    | codecov.io注册             | 测试覆盖率 |
| `LHCI_GITHUB_APP_TOKEN`  | Lighthouse CI     | GitHub App                 | 性能检测   |

### 第三步：配置Secrets（详细步骤）

#### 1. Supabase Secrets（必需）

```bash
# 在GitHub仓库中添加：
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**获取方式：**

1. 登录 [Supabase](https://supabase.com/)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制 "Project URL" 和 "anon/public" key

#### 2. Vercel Secrets（可选 - 用于自动部署）

**步骤A：创建Vercel Token**

1. 登录 [Vercel](https://vercel.com/)
2. 进入 **Settings** → **Tokens**
3. 点击 **Create Token**
4. 名称填写：`GitHub Actions CI/CD`
5. Scope选择：`Full Account`
6. 复制生成的token（只显示一次！）

```bash
Name: VERCEL_TOKEN
Value: your_vercel_token_here
```

**步骤B：获取Vercel项目ID**

方法1：通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 在项目目录执行
vercel link

# 会生成.vercel/project.json文件
cat .vercel/project.json
# 复制 orgId 和 projectId
```

方法2：通过Vercel Dashboard

1. 进入你的Vercel项目
2. **Settings** → **General**
3. 在"Project ID"部分复制ID
4. 在"Team ID"部分复制组织ID

```bash
Name: VERCEL_ORG_ID
Value: team_xxxxxxxxxxxxx

Name: VERCEL_PROJECT_ID
Value: prj_xxxxxxxxxxxxx
```

#### 3. 测试环境Secrets（可选 - 用于E2E测试）

**推荐做法：**
为E2E测试创建独立的Supabase项目，避免影响开发/生产数据。

1. 在Supabase创建新项目：`ai-travel-planner-test`
2. 运行相同的`database/schema.sql`
3. 获取测试项目的URL和Key

```bash
Name: TEST_SUPABASE_URL
Value: https://test-project.supabase.co

Name: TEST_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 简化配置（MVP阶段推荐）

如果你想先启用基础CI功能，可以使用简化版workflow。

我已经为你准备了两个版本：

### 完整版（当前）

文件：`.github/workflows/ci.yml`

- 包含所有功能
- 需要配置多个Secrets
- 适合生产环境

### 简化版（MVP推荐）

文件：`.github/workflows/ci-simple.yml`

- 只包含基础检查和构建
- 只需要Supabase Secrets
- 适合快速开始

使用简化版的步骤：

```bash
# 1. 重命名现有workflow（保留备份）
git mv .github/workflows/ci.yml .github/workflows/ci-full.yml.backup

# 2. 使用简化版
git mv .github/workflows/ci-simple.yml .github/workflows/ci.yml

# 3. 提交并推送
git add .
git commit -m "chore(ci): use simplified workflow for MVP"
git push
```

## 📊 Workflow运行说明

### 触发条件

Workflow会在以下情况自动运行：

1. **Push到main或develop分支**
   - 运行完整的CI流程
   - 如果是main分支，会触发生产部署

2. **创建Pull Request**
   - 运行CI检查
   - 部署预览环境（如果配置了Vercel）

### Jobs执行顺序

```
1. lint-and-type-check (并行)
2. unit-tests (并行)
   ↓
3. build (等待1、2完成)
   ↓
4. e2e-tests (等待3完成)
   ↓
5. deploy (等待4完成)
```

### 查看运行结果

1. 进入仓库的 **Actions** 标签
2. 点击最新的workflow运行
3. 查看每个job的详细日志
4. 如果失败，点击失败的job查看错误信息

## ⚙️ 高级配置

### 1. 分支保护规则

保护main分支，要求CI通过才能合并：

1. 仓库 → **Settings** → **Branches**
2. 点击 **Add branch protection rule**
3. Branch name pattern: `main`
4. 勾选：
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ 选择必需的checks：
     - Lint and Type Check
     - Unit Tests
     - Build
5. 点击 **Create**

### 2. 环境配置（用于部署）

为生产部署创建环境：

1. 仓库 → **Settings** → **Environments**
2. 点击 **New environment**
3. 名称：`production`
4. 配置：
   - ✅ Required reviewers（可选，要求人工审核）
   - ✅ Deployment branches: `main`
5. 在环境中添加Secrets（如Vercel相关）

### 3. 缓存优化

workflow已配置pnpm缓存，加速构建：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm' # 自动缓存pnpm依赖
```

第一次运行较慢（~3-5分钟），后续运行会快很多（~1-2分钟）。

### 4. 通知配置

**Slack通知（可选）：**

添加Slack webhook secret：

```bash
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/xxx
```

在workflow中添加步骤：

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "❌ CI/CD Failed: ${{ github.workflow }}"
      }
```

## 🐛 故障排查

### 问题1: Workflow不自动运行

**症状：**
Push代码后Actions标签没有新的运行记录。

**解决方案：**

1. 检查 Actions 是否启用：Settings → Actions → General → 允许所有Actions
2. 确认workflow文件路径正确：`.github/workflows/ci.yml`
3. 检查YAML语法是否正确（可以用在线YAML验证器）

### 问题2: Build失败 - 缺少环境变量

**症状：**

```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```

**解决方案：**

1. 确认已在GitHub Secrets中添加变量
2. 变量名拼写正确（区分大小写）
3. 在workflow中正确引用：`${{ secrets.VARIABLE_NAME }}`

### 问题3: pnpm install失败

**症状：**

```
ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY
```

**解决方案：**

```bash
# 本地重新生成lockfile
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: regenerate pnpm-lock.yaml"
git push
```

### 问题4: E2E测试失败

**症状：**

```
Error: Browser was not installed
```

**解决方案：**
E2E测试需要安装浏览器，workflow已配置：

```yaml
- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps chromium
```

如果仍失败，可以暂时禁用E2E测试job。

### 问题5: Vercel部署失败

**症状：**

```
Error: Invalid token
```

**解决方案：**

1. 确认 VERCEL_TOKEN 有效（token可能过期）
2. 重新创建token并更新Secret
3. 确认 VERCEL_ORG_ID 和 VERCEL_PROJECT_ID 正确

## 📈 性能优化

### 1. 跳过不必要的job

对于文档更新，可以跳过CI：

```bash
git commit -m "docs: update readme [skip ci]"
```

### 2. 并发限制

如果同时有多个workflow运行，可以配置并发控制：

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 3. 条件执行

只在特定路径变化时运行特定job：

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
      - '.github/workflows/**'
```

## 🎯 MVP阶段推荐配置

最小配置（立即可用）：

**必需Secrets：**

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**启用的Jobs：**

- ✅ Lint and Type Check
- ✅ Unit Tests
- ✅ Build

**暂时禁用：**

- ⏸️ E2E Tests（可在有测试用例后启用）
- ⏸️ Vercel部署（可在需要自动部署时启用）
- ⏸️ Lighthouse（可在有预览环境后启用）
- ⏸️ Security Scan（可在准备上线时启用）

## 📚 参考资源

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [pnpm/action-setup](https://github.com/pnpm/action-setup)
- [Vercel GitHub Action](https://github.com/amondnet/vercel-action)
- [Playwright GitHub Action](https://playwright.dev/docs/ci-intro)

## ✅ 配置完成检查清单

- [ ] GitHub Actions已启用
- [ ] 已添加Supabase Secrets（必需）
- [ ] Workflow运行成功（至少基础jobs）
- [ ] 已配置分支保护（可选）
- [ ] 已配置Vercel Secrets（可选）
- [ ] 已配置测试环境（可选）
- [ ] 团队成员了解工作流程

---

**遇到问题？** 查看故障排查部分或在Issues中提问。

**最后更新**: 2025-11-05
