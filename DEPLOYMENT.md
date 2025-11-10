# 服务器部署指南

本指南说明如何将AI Travel Planner通过GitHub Actions自动部署到你的服务器。

## 部署架构

- **构建方式**: Docker容器化部署
- **CI/CD**: GitHub Actions
- **镜像仓库**: GitHub Container Registry (ghcr.io)
- **部署触发**: 推送到main或develop分支时自动部署
- **运行环境**: Docker + docker-compose

### 部署流程图

```
代码推送 → GitHub Actions CI
  ├─ Lint & Type Check
  ├─ Security Scan
  └─ Build Docker Image → Push to GHCR
       ↓
  服务器部署
  ├─ Pull Docker Image from GHCR
  ├─ Tag as latest
  └─ Run with docker-compose
```

**优势**:

- ✅ 快速部署（1-2分钟）
- ✅ CI构建一次，到处运行
- ✅ 版本化镜像，易于回滚
- ✅ 利用GitHub Cache加速构建

## 前置条件

### 1. 服务器要求

- 操作系统: Linux (Ubuntu 20.04+ 推荐)
- Docker: 20.10+
- docker-compose: 2.0+
- 至少2GB RAM
- 至少10GB磁盘空间
- 开放端口: 3000 (或你配置的端口)

### 2. 服务器安装Docker

如果服务器还没有安装Docker，执行以下命令:

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到docker组（避免每次使用sudo）
sudo usermod -aG docker $USER
```

### 3. 服务器环境变量配置

在服务器的 `~/deploy/ai-travel-planner/.env.production` 文件中配置环境变量:

```bash
# 在服务器上创建目录和配置文件
mkdir -p ~/deploy/ai-travel-planner

cd ~/deploy/ai-travel-planner

# 创建环境变量文件
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://your-server-domain.com
DASHSCOPE_API_KEY=your_dashscope_api_key
EOF

# 设置文件权限
chmod 600 .env.production
```

## GitHub配置

### 1. 生成SSH密钥对

在你的本地机器上生成SSH密钥对用于GitHub Actions:

```bash
# 生成新的SSH密钥对
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy

# 查看公钥（稍后添加到服务器）
cat ~/.ssh/github_actions_deploy.pub

# 查看私钥（稍后添加到GitHub Secrets）
cat ~/.ssh/github_actions_deploy
```

### 2. 将公钥添加到服务器

在你的服务器上:

```bash
# 将公钥添加到authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "your_public_key_here" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. 配置GitHub Secrets

在GitHub仓库中配置以下Secrets (`Settings` → `Secrets and variables` → `Actions` → `New repository secret`):

#### 服务器访问相关

| Secret名称        | 说明               | 示例                                     |
| ----------------- | ------------------ | ---------------------------------------- |
| `SSH_PRIVATE_KEY` | 刚才生成的私钥内容 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_HOST`     | 服务器IP地址或域名 | `192.168.1.100` 或 `server.example.com`  |
| `SERVER_USER`     | SSH登录用户名      | `ubuntu` 或 `root`                       |

#### 构建时环境变量（Build-time）

这些环境变量会在 Docker 构建阶段注入，用于编译前端代码：

| Secret名称                      | 说明                      | 示例                                      | 必需 |
| ------------------------------- | ------------------------- | ----------------------------------------- | ---- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 项目 URL         | `https://xxxxx.supabase.co`               | ✅   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名公钥（前端） | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅   |

**重要说明**:

- `NEXT_PUBLIC_*` 开头的变量会被编译到前端代码中，因此这些变量是公开可见的
- 不要在这些变量中存储敏感信息
- 服务端密钥（如 `SUPABASE_SERVICE_ROLE_KEY`、`DASHSCOPE_API_KEY`）应该在服务器的 `.env.production` 中配置，而不是在 GitHub Secrets 中

**注意**: `GITHUB_TOKEN` 由 GitHub Actions 自动提供，无需手动配置。

### 4. 启用 GitHub Packages

确保仓库有权限写入 GitHub Container Registry:

1. 进入 `Settings` → `Actions` → `General`
2. 在 "Workflow permissions" 部分，确保选择了 "Read and write permissions"
3. 勾选 "Allow GitHub Actions to create and approve pull requests"

### 5. 配置GitHub Environment (可选但推荐)

在 `Settings` → `Environments` 中创建 `production-server` 环境:

- 可以设置部署前需要审批
- 可以限制只有特定分支可以部署
- 添加环境特定的secrets

## 部署流程

### 自动部署

当你推送代码到main或develop分支时，GitHub Actions会自动:

1. **代码质量检查** (并行执行)
   - ESLint代码检查
   - TypeScript类型检查
   - 代码格式检查
   - 安全漏洞扫描

2. **构建Docker镜像**
   - 使用多阶段构建优化镜像大小
   - 推送到GitHub Container Registry
   - 标记为 `branch-sha` 和 `latest`

3. **部署到服务器**
   - SSH连接到服务器
   - 登录到GitHub Container Registry
   - 拉取最新镜像
   - 停止旧容器，启动新容器
   - 健康检查验证

4. **部署验证**
   - 检查容器运行状态
   - 执行应用健康检查
   - 显示镜像信息

**总耗时**: 约1-2分钟（相比之前的25-30分钟）

### 手动触发部署

如果需要手动触发部署，可以在GitHub Actions页面点击"Run workflow"。

### 查看部署状态

```bash
# SSH连接到服务器
ssh your_user@your_server

# 查看容器状态
docker ps

# 查看应用日志
docker logs ai-travel-planner

# 实时查看日志
docker logs -f ai-travel-planner

# 检查应用健康状态
curl http://localhost:3000
```

## 服务器管理

### 手动部署（应急使用）

如果CI/CD出现问题，可以手动部署:

```bash
# SSH 登录到服务器
ssh your_user@your_server

# 切换到部署目录
cd ~/deploy/ai-travel-planner

# 登录到GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# 设置要部署的镜像标签
export IMAGE_TAG="ghcr.io/your-username/ai-travel-planner:main-latest"

# 执行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 回滚到指定版本

使用镜像标签快速回滚:

```bash
# 查看可用的镜像版本
docker images | grep ai-travel-planner

# 或在 GitHub Packages 页面查看所有版本
# https://github.com/your-username/ai-travel-planner/pkgs/container/ai-travel-planner

# 回滚到指定commit的镜像
export IMAGE_TAG="ghcr.io/your-username/ai-travel-planner:main-abc1234"
cd ~/deploy/ai-travel-planner
./deploy.sh

# 或回滚到上一个版本（如果本地还有）
docker images --format "{{.ID}}\t{{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | grep ai-travel-planner
docker tag <previous-image-id> ai-travel-planner:latest
docker-compose up -d
```

### 查看和清理日志

```bash
# 查看最近100行日志
docker logs --tail 100 ai-travel-planner

# 清理Docker系统（释放空间）
docker system prune -a

# 查看磁盘使用
docker system df
```

### 重启应用

```bash
cd ~/deploy/ai-travel-planner
docker-compose restart

# 或者重新部署
./deploy.sh
```

### 停止应用

```bash
cd ~/deploy/ai-travel-planner
docker-compose down
```

## 故障排查

### 1. 部署失败

检查GitHub Actions日志，常见问题:

- SSH密钥配置错误
- 服务器无法连接
- Docker未安装或未运行
- 磁盘空间不足

### 2. 容器启动失败

```bash
# 查看容器日志
docker logs ai-travel-planner

# 检查环境变量
docker exec ai-travel-planner env

# 检查Docker网络
docker network ls
docker network inspect ai-travel-planner_app-network
```

### 3. 应用无法访问

```bash
# 检查端口监听
sudo netstat -tlnp | grep 3000

# 检查防火墙
sudo ufw status
sudo ufw allow 3000/tcp

# 检查容器健康状态
docker inspect ai-travel-planner | grep Health -A 10
```

### 4. 内存不足

```bash
# 查看资源使用
docker stats

# 调整docker-compose.yml添加资源限制
# deploy:
#   resources:
#     limits:
#       memory: 512M
```

## 监控和日志

### 设置日志轮转

创建 `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

重启Docker:

```bash
sudo systemctl restart docker
```

### 监控建议

考虑安装以下监控工具:

- **Portainer**: Docker可视化管理 (推荐)
- **Prometheus + Grafana**: 指标监控
- **Uptime Kuma**: 应用可用性监控

## 安全建议

1. **定期更新系统和Docker**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **使用非root用户运行**
   容器已配置为使用非root用户运行

3. **配置防火墙**

   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 3000/tcp
   ```

4. **定期备份**
   - 设置数据库定期备份
   - 备份 `.env.production` 文件
   - 使用版本控制

5. **使用HTTPS**
   考虑配置Nginx反向代理和Let's Encrypt SSL证书

## 性能优化

### 1. 使用Nginx反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. 启用Docker BuildKit

在服务器上:

```bash
export DOCKER_BUILDKIT=1
```

### 3. 配置CDN

考虑使用CDN加速静态资源:

- Cloudflare
- AWS CloudFront
- Alibaba Cloud CDN

## 成本优化

- 使用较小的Docker基础镜像（已使用alpine）
- 定期清理未使用的镜像和容器
- 监控资源使用，选择合适的服务器规格
- 考虑使用Spot实例（如果使用云服务器）

## 下一步

部署成功后:

1. ✅ 验证应用可以正常访问
2. ✅ 检查所有功能是否正常
3. ✅ 配置域名和HTTPS
4. ✅ 设置监控和告警
5. ✅ 配置定期备份
6. ✅ 文档化你的部署流程

## 优化总结

### v2.0 部署系统优化 (2025)

**改进前后对比:**

| 指标     | 优化前             | 优化后       | 改进         |
| -------- | ------------------ | ------------ | ------------ |
| 部署时间 | 25-30分钟          | 1-2分钟      | ⚡ **快90%** |
| 构建次数 | 2次（CI + 服务器） | 1次（CI）    | 🔄 减少50%   |
| 磁盘使用 | 高（完整源码）     | 低（仅镜像） | 💾 减少70%   |
| 回滚速度 | 5-10分钟           | 30秒         | ⏮️ **快95%** |

**主要优化:**

1. ✅ **移除重复构建** - CI构建一次，服务器拉取镜像
2. ✅ **使用GitHub Container Registry** - 统一镜像管理
3. ✅ **移除Git操作冗余** - 不再在服务器维护git仓库
4. ✅ **优化Docker缓存** - GitHub Actions缓存加速构建
5. ✅ **简化deploy.sh** - 从131行减少到94行
6. ✅ **移除无用jobs** - 删除notify-success等无效步骤
7. ✅ **强化安全扫描** - 安全问题阻止部署
8. ✅ **版本化镜像** - 每个commit都有对应镜像，易于追溯

**技术栈:**

- Docker多阶段构建
- GitHub Container Registry (ghcr.io)
- GitHub Actions缓存
- 健康检查机制
- 自动镜像清理

## 支持

如有问题，请查看:

- GitHub Actions日志
- 服务器日志: `docker logs ai-travel-planner`
- GitHub Packages: 查看所有镜像版本
- 项目Issues: [GitHub Issues](https://github.com/your-repo/issues)
