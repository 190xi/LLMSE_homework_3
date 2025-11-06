# Contributing to AI Travel Planner

感谢你对 AI Travel Planner 项目的关注和贡献！

## 开发工作流

### 分支策略

我们使用 Git Flow 工作流的简化版本：

```
main (生产分支)
  └── develop (开发主分支)
       ├── feature/user-auth
       ├── feature/trip-generation
       ├── feature/expense-management
       └── bugfix/login-error
```

- **main**: 生产分支，只包含稳定的发布版本
- **develop**: 开发主分支，包含最新的开发代码
- **feature/**: 功能分支，从 develop 分出
- **bugfix/**: Bug修复分支
- **hotfix/**: 紧急修复分支，从 main 分出

### 分支命名规范

- 功能分支: `feature/功能名称` (如 `feature/user-authentication`)
- Bug修复: `bugfix/bug描述` (如 `bugfix/login-redirect`)
- 紧急修复: `hotfix/问题描述` (如 `hotfix/api-error`)

### 开发流程

1. **创建分支**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **开发和提交**

   ```bash
   # 进行代码开发
   git add .
   git commit -m "feat(scope): description"
   ```

3. **保持同步**

   ```bash
   git fetch origin
   git rebase origin/develop
   ```

4. **推送和创建PR**

   ```bash
   git push origin feature/your-feature-name
   # 在GitHub上创建Pull Request
   ```

5. **代码审查和合并**
   - 至少1人审查通过
   - 所有CI检查通过
   - 解决所有评论
   - Squash merge到develop

## Commit规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type类型

- **feat**: 新功能
- **fix**: Bug修复
- **docs**: 文档更新
- **style**: 代码格式调整（不影响代码逻辑）
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动
- **ci**: CI配置文件和脚本的变动

### Scope范围

- **auth**: 认证相关
- **trips**: 旅行计划相关
- **expenses**: 费用管理相关
- **map**: 地图功能
- **voice**: 语音功能
- **ui**: UI组件
- **api**: API接口
- **db**: 数据库

### 示例

```bash
# 新功能
git commit -m "feat(auth): add Google OAuth login"

# Bug修复
git commit -m "fix(trips): resolve date picker timezone issue"

# 文档更新
git commit -m "docs(readme): update installation instructions"

# 性能优化
git commit -m "perf(map): optimize marker rendering"

# 重构
git commit -m "refactor(api): migrate to new error handling pattern"

# 多行提交
git commit -m "feat(trips): implement AI itinerary generation

- Integrate Qwen API
- Add prompt engineering
- Parse structured response
- Handle error cases

Closes #123"
```

### Commit Message要求

- 使用祈使语气（"add"而不是"added"或"adds"）
- 首字母小写
- 不要在结尾加句号
- Subject行不超过50个字符
- Body应该解释"什么"和"为什么"，而不是"怎么做"

## 代码规范

### TypeScript

- 使用TypeScript严格模式
- 所有函数和变量必须有类型注解
- 优先使用interface而不是type（除非需要联合类型）
- 使用ES6+语法

### 命名规范

- **文件名**: kebab-case (如 `user-profile.tsx`)
- **组件名**: PascalCase (如 `UserProfile`)
- **函数/变量**: camelCase (如 `getUserData`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- **接口**: PascalCase，以I开头（可选）(如 `IUserData` 或 `UserData`)
- **类型**: PascalCase (如 `UserRole`)

### 代码风格

- 使用2空格缩进
- 使用单引号
- 每行最多80个字符
- 使用尾随逗号（ES5）
- 使用分号

代码会自动通过Prettier格式化，运行：

```bash
pnpm format
```

### ESLint规则

代码必须通过ESLint检查：

```bash
pnpm lint
```

可以自动修复部分问题：

```bash
pnpm lint:fix
```

## 测试要求

### 单元测试

- 所有工具函数必须有单元测试
- 关键业务逻辑必须有测试覆盖
- 测试覆盖率目标 > 70%

运行测试：

```bash
pnpm test
pnpm test:watch  # 监听模式
```

### 组件测试

- 关键UI组件需要有测试
- 测试用户交互场景
- 使用React Testing Library

### E2E测试

- 关键用户路径必须有E2E测试
- 使用Playwright

运行E2E测试：

```bash
pnpm test:e2e
pnpm test:e2e:ui  # UI模式
```

## Pull Request流程

### PR标题

PR标题应该清晰描述变更：

```
feat(auth): Add Google OAuth login support
fix(trips): Fix date range validation
docs(api): Update API documentation
```

### PR描述模板

创建PR时请包含以下信息：

```markdown
## 变更描述

简要描述这个PR做了什么

## 变更类型

- [ ] 新功能
- [ ] Bug修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 其他

## 相关Issue

Closes #123
Related to #456

## 测试

- [ ] 单元测试已添加/更新
- [ ] E2E测试已添加/更新
- [ ] 手动测试已完成

## 检查清单

- [ ] 代码符合项目规范
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] 无TypeScript错误
- [ ] 已自我审查代码

## 截图/录屏

（如果是UI变更，请提供截图或录屏）

## 其他说明
```

### PR审查标准

审查者会检查：

- [ ] 代码质量和可读性
- [ ] 是否符合项目架构
- [ ] 测试覆盖是否充分
- [ ] 是否有潜在的性能问题
- [ ] 是否有安全隐患
- [ ] 文档是否完善
- [ ] Commit信息是否规范

## 开发环境设置

### 前置要求

- Node.js 20+
- pnpm 8+
- Git

### 初始化开发环境

1. **克隆仓库**

   ```bash
   git clone https://github.com/your-org/ai-travel-planner.git
   cd ai-travel-planner
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **配置环境变量**

   ```bash
   cp .env.example .env.local
   # 编辑 .env.local，填入你的API密钥
   ```

4. **设置Git Hooks**

   ```bash
   pnpm prepare  # 安装Husky hooks
   ```

5. **运行开发服务器**
   ```bash
   pnpm dev
   ```

### 开发工具推荐

**VSCode插件：**

- ESLint
- Prettier
- TypeScript Extension Pack
- Tailwind CSS IntelliSense
- GitLens

**VSCode配置（.vscode/settings.json）：**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 发布流程

### 版本号规范

遵循 [Semantic Versioning](https://semver.org/)：

- **MAJOR**: 不兼容的API变更
- **MINOR**: 向后兼容的新功能
- **PATCH**: 向后兼容的Bug修复

### 发布步骤

1. 从develop创建release分支
2. 更新版本号和CHANGELOG
3. 测试
4. 合并到main并打标签
5. 部署到生产环境
6. 合并回develop

## 常见问题

### Q: 如何解决merge冲突？

A: 使用rebase而不是merge保持提交历史整洁：

```bash
git fetch origin
git rebase origin/develop
# 解决冲突
git add .
git rebase --continue
```

### Q: 如何撤销commit？

A:

```bash
# 撤销最后一次commit，保留变更
git reset --soft HEAD~1

# 修改最后一次commit信息
git commit --amend
```

### Q: Pre-commit hook失败怎么办？

A:

```bash
# 修复lint错误
pnpm lint:fix

# 修复格式
pnpm format

# 重新提交
git add .
git commit -m "your message"
```

## 获取帮助

如果你有任何问题：

1. 查看 [文档](./docs/)
2. 搜索 [已有Issues](https://github.com/your-org/ai-travel-planner/issues)
3. 创建新Issue并详细描述问题
4. 在团队群组中提问

## 行为准则

- 尊重所有贡献者
- 建设性地提供反馈
- 专注于改进项目
- 接受建设性批评

---

感谢你的贡献！🎉
