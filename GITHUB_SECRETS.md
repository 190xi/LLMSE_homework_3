# GitHub Secrets 配置清单

> ✨ **新版本无需在服务器上手动创建 `.env.production` 文件！**
>
> 所有环境变量通过 GitHub Secrets 配置，CI/CD 会在部署时自动创建环境文件。

## 配置位置

`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

## 必需的 Secrets

### 1. 服务器访问相关 (3个)

| Secret 名称       | 说明               | 示例/获取方式                               |
| ----------------- | ------------------ | ------------------------------------------- |
| `SSH_PRIVATE_KEY` | SSH 私钥           | `ssh-keygen -t ed25519 -C "github-actions"` |
| `SERVER_HOST`     | 服务器IP地址或域名 | `192.168.1.100` 或 `server.example.com`     |
| `SERVER_USER`     | SSH登录用户名      | `ubuntu` 或 `root`                          |

### 2. 构建时环境变量 (7个)

这些变量会被编译到前端代码中，因此是公开可见的：

| Secret 名称                     | 说明                    | 获取方式                                       | 必需 |
| ------------------------------- | ----------------------- | ---------------------------------------------- | ---- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 项目 URL       | Supabase Dashboard → Settings → API → URL      | ✅   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名公钥       | Supabase Dashboard → Settings → API → anon key | ✅   |
| `NEXT_PUBLIC_XUNFEI_APP_ID`     | 讯飞语音识别 App ID     | 讯飞开放平台 → 控制台 → 应用详情               | ⭕   |
| `NEXT_PUBLIC_XUNFEI_API_KEY`    | 讯飞语音识别 API Key    | 讯飞开放平台 → 控制台 → 应用详情               | ⭕   |
| `NEXT_PUBLIC_XUNFEI_API_SECRET` | 讯飞语音识别 API Secret | 讯飞开放平台 → 控制台 → 应用详情               | ⭕   |
| `NEXT_PUBLIC_AMAP_KEY`          | 高德地图 API Key        | 高德开放平台 → 控制台 → 应用管理               | ⭕   |
| `NEXT_PUBLIC_AMAP_SECRET`       | 高德地图 API Secret     | 高德开放平台 → 控制台 → 应用管理               | ⭕   |

**图例**：✅ 必需 | ⭕ 可选（功能可选）

### 3. 运行时环境变量 (4个)

这些变量只在服务器端使用，不会暴露给前端：

| Secret 名称                 | 说明                   | 获取方式                                               |
| --------------------------- | ---------------------- | ------------------------------------------------------ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥    | Supabase Dashboard → Settings → API → service_role key |
| `NEXTAUTH_SECRET`           | NextAuth.js 加密密钥   | `openssl rand -base64 32`                              |
| `NEXTAUTH_URL`              | 应用访问地址           | `https://your-domain.com` 或 `http://server-ip:3000`   |
| `DASHSCOPE_API_KEY`         | 阿里云通义千问 API Key | 阿里云控制台 → DashScope                               |

## 总计：14 个 Secrets

- ✅ 服务器访问：3个
- ✅ 构建时变量：7个（2个必需 + 5个可选）
- ✅ 运行时变量：4个

**关于可选变量**：

- 讯飞语音识别（5个变量）：如果不使用语音识别功能，可以不配置
- 高德地图（2个变量）：如果不使用地图功能，可以不配置
- 未配置的可选变量不会影响应用的核心功能

## 配置完成后

1. 推送代码到 `main` 或 `develop` 分支
2. GitHub Actions 会自动：
   - 构建 Docker 镜像
   - 在服务器上创建 `.env.production` 文件
   - 部署应用

## 安全注意事项

⚠️ **重要**：

- `NEXT_PUBLIC_*` 开头的变量会被编译到前端代码，不要存储敏感信息
- 服务端密钥（`SUPABASE_SERVICE_ROLE_KEY`、`DASHSCOPE_API_KEY`）只在服务器端使用
- 定期轮换 API 密钥
- 不要在代码中硬编码这些值

## 故障排查

### 部署失败：缺少环境变量

如果看到类似错误：

```
Error: Missing NEXT_PUBLIC_SUPABASE_URL
```

**解决方法**：

1. 检查是否在 GitHub Secrets 中配置了该变量
2. 确保变量名称完全匹配（区分大小写）
3. 重新运行 workflow

### 应用运行错误

如果应用部署成功但运行时报错：

1. SSH 登录到服务器
2. 检查生成的环境文件：
   ```bash
   cat ~/deploy/ai-travel-planner/.env.production
   ```
3. 检查容器日志：
   ```bash
   docker logs ai-travel-planner
   ```

## 更多信息

详细部署指南请查看：[DEPLOYMENT.md](./DEPLOYMENT.md)
