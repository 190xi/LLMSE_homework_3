# 服务器部署指南

本指南说明如何将AI Travel Planner通过GitHub Actions自动部署到你的服务器。

## 部署架构

- **构建方式**: Docker容器化部署
- **CI/CD**: GitHub Actions
- **部署触发**: 推送到main分支时自动部署
- **运行环境**: Docker + docker-compose

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
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://your-server-domain.com
OPENAI_API_KEY=your_openai_api_key
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

| Secret名称                      | 说明                 | 示例                                     |
| ------------------------------- | -------------------- | ---------------------------------------- |
| `SSH_PRIVATE_KEY`               | 刚才生成的私钥内容   | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_HOST`                   | 服务器IP地址或域名   | `192.168.1.100` 或 `server.example.com`  |
| `SERVER_USER`                   | SSH登录用户名        | `ubuntu` 或 `root`                       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase项目URL      | `https://xxx.supabase.co`                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名密钥     | `eyJhbGc...`                             |
| `TEST_DATABASE_URL`             | 测试数据库URL (可选) | `postgresql://...`                       |
| `TEST_SUPABASE_URL`             | 测试环境URL (可选)   | `https://...`                            |
| `TEST_SUPABASE_ANON_KEY`        | 测试环境密钥 (可选)  | `eyJhbGc...`                             |

### 4. 配置GitHub Environment (可选但推荐)

在 `Settings` → `Environments` 中创建 `production-server` 环境:

- 可以设置部署前需要审批
- 可以限制只有特定分支可以部署
- 添加环境特定的secrets

## 部署流程

### 自动部署

当你推送代码到main分支时，GitHub Actions会自动:

1. 运行代码检查 (lint, type-check, format)
2. 运行单元测试
3. 构建应用
4. 连接到服务器
5. 传输代码到服务器
6. 在服务器上构建Docker镜像
7. 停止旧容器并启动新容器
8. 验证部署是否成功

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
cd ~/deploy/ai-travel-planner
git pull origin main
chmod +x deploy.sh
./deploy.sh
```

### 回滚到上一个版本

```bash
cd ~/deploy/ai-travel-planner
# 查看备份
ls -la ~/deploy/ai-travel-planner_backup_*

# 回滚到指定备份
cd ~/deploy/ai-travel-planner_backup_YYYYMMDD_HHMMSS/ai-travel-planner
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

## 支持

如有问题，请查看:

- GitHub Actions日志
- 服务器日志: `docker logs ai-travel-planner`
- 项目Issues: [GitHub Issues](https://github.com/your-repo/issues)
