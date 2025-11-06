# Husky Git Hooks 使用说明

本项目使用Husky来管理Git hooks，确保代码质量。

## 已配置的Hooks

### 1. pre-commit

在执行 `git commit` 之前运行，会自动：

- 运行ESLint检查并自动修复
- 运行Prettier格式化代码
- 只检查暂存的文件（通过lint-staged）

### 2. commit-msg

验证commit消息格式，确保遵循Conventional Commits规范。

**有效的commit消息格式：**

```
<type>(<scope>): <subject>

type: feat, fix, docs, style, refactor, perf, test, chore, ci
scope: 可选，如 auth, trips, expenses
subject: 简短描述（不超过50字符）
```

## 初始化Husky

如果你是第一次克隆项目，需要运行：

```bash
pnpm install  # 会自动运行 pnpm prepare
```

或者手动初始化：

```bash
pnpm prepare
```

## 跳过Hooks（不推荐）

在特殊情况下，如果需要跳过hooks：

```bash
# 跳过pre-commit
git commit --no-verify -m "your message"

# 或使用缩写
git commit -n -m "your message"
```

**注意：** 只在紧急情况下使用，否则会导致代码质量问题。

## 常见问题

### 问题1: Husky不工作

**解决方案：**

```bash
# 重新安装husky
pnpm prepare

# 确保hooks文件有执行权限（Linux/macOS）
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### 问题2: Pre-commit失败

**症状：**

```
✖ pnpm lint-staged:
  ✖ eslint --fix [FAILED]
```

**解决方案：**

1. 手动运行lint并修复问题：

   ```bash
   pnpm lint:fix
   ```

2. 如果是格式问题：

   ```bash
   pnpm format
   ```

3. 修复后重新提交：
   ```bash
   git add .
   git commit -m "your message"
   ```

### 问题3: Commit-msg验证失败

**症状：**

```
❌ Invalid commit message format!
```

**解决方案：**
使用正确的格式重新提交：

```bash
# ❌ 错误
git commit -m "updated code"

# ✅ 正确
git commit -m "feat(trips): add AI itinerary generation"
```

## 最佳实践

1. **提交前检查**

   ```bash
   # 查看将要提交的文件
   git status

   # 查看改动
   git diff
   ```

2. **分阶段提交**

   ```bash
   # 只添加特定文件
   git add src/components/TripCard.tsx
   git commit -m "feat(trips): add TripCard component"
   ```

3. **写好commit消息**

   ```bash
   # 包含详细信息
   git commit -m "feat(auth): implement Google OAuth login

   - Add Google OAuth provider
   - Configure callback URL
   - Update login page UI

   Closes #123"
   ```

## 禁用Husky（开发调试用）

如果你需要临时禁用所有hooks进行调试：

```bash
# 禁用
export HUSKY=0

# 启用
unset HUSKY
```

或者在package.json的scripts中：

```json
{
  "scripts": {
    "commit-no-hooks": "HUSKY=0 git commit"
  }
}
```

---

**记住：** Hooks是为了帮助我们保持代码质量，不要轻易绕过它们！
