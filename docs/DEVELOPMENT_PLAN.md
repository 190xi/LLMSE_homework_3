# AI 旅行规划师 - 开发计划文档

## 文档信息
- **版本**: v1.0
- **创建日期**: 2025-11-05
- **最后更新**: 2025-11-05
- **编制依据**: PRD.md, TECH_STACK.md, README.md

---

## 1. 项目概述

### 1.1 项目目标
开发一款基于AI的智能旅行规划Web应用，为用户提供：
- 语音/文字输入的自然交互方式
- AI驱动的个性化行程规划
- 全流程的费用管理
- 地图可视化和智能推荐

### 1.2 技术选型总结
基于技术栈选型文档，本项目采用 **方案A：Next.js全栈架构**

**核心技术栈：**
- **前端**: Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **状态管理**: Zustand (UI状态) + React Query (服务端数据)
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **认证**: NextAuth.js
- **LLM**: 阿里云通义千问 (qwen-plus)
- **语音识别**: 科大讯飞 WebIAT
- **地图服务**: 高德地图 JS API
- **部署**: Vercel (前端) + Supabase Cloud (数据库)

### 1.3 开发周期规划
- **MVP阶段**: 8-12周（P0功能）
- **功能增强**: 4-6周（P1功能）
- **持续迭代**: 持续进行（P2-P3功能）

---

## 2. 开发阶段与里程碑

### Phase 1: 基础架构搭建 (Week 1-2)

#### 里程碑 M1: 开发环境就绪
**时间**: Week 1-2
**目标**: 完成项目基础设施，团队可以开始并行开发

#### 任务清单

**Week 1: 项目初始化**
- [x] Next.js项目创建（已完成）
- [x] TypeScript配置（已完成）
- [x] Tailwind CSS配置（已完成）
- [x] ESLint + Prettier配置（已完成）
- [ ] Git工作流规范建立
  - 分支策略：main (生产) / develop (开发) / feature/* (功能)
  - Commit规范：使用Conventional Commits
  - PR审查流程
- [ ] 项目文档完善
  - API文档规范
  - 组件开发规范
  - 代码审查清单

**Week 2: 核心服务配置**
- [ ] **数据库设置**
  - 创建Supabase项目
  - 设计数据库Schema（见3.1节）
  - 创建数据表并设置RLS策略
  - 配置数据库索引
  - 编写数据库迁移脚本
- [ ] **认证系统**
  - NextAuth.js配置
  - 集成Google OAuth
  - 集成Email登录
  - 会话管理配置
- [ ] **第三方服务集成**
  - 阿里云通义千问API测试（已有基础集成）
  - 科大讯飞账号注册及API Key获取
  - 高德地图账号注册及API Key获取
  - Supabase连接配置
- [ ] **开发工具配置**
  - Husky + lint-staged设置
  - GitHub Actions CI/CD配置
  - 本地开发环境Docker配置（可选）

**交付物：**
- 可运行的开发环境
- 数据库Schema文档
- 环境变量配置清单
- CI/CD自动化流程

---

### Phase 2: MVP核心功能开发 (Week 3-10)

#### 里程碑 M2: 用户系统上线
**时间**: Week 3-4
**目标**: 用户可以注册、登录、管理个人信息

#### 任务清单

**2.1 用户认证与授权 (Week 3)**
- [ ] **前端页面**
  - 登录页面 (`/login`)
  - 注册页面 (`/register`)
  - 忘记密码页面 (`/forgot-password`)
  - 个人资料页面 (`/profile`)
- [ ] **API接口**
  - `POST /api/auth/signup` - 邮箱注册
  - `POST /api/auth/signin` - 登录
  - `POST /api/auth/reset-password` - 重置密码
  - `GET /api/user/profile` - 获取用户信息
  - `PUT /api/user/profile` - 更新用户信息
- [ ] **功能实现**
  - 邮箱验证流程
  - 密码加密存储
  - JWT Token管理
  - 会话持久化
- [ ] **测试**
  - 单元测试（认证逻辑）
  - 集成测试（登录流程）

**2.2 用户偏好管理 (Week 4)**
- [ ] **数据模型**
  - 用户偏好设置表设计
  - 默认值配置
- [ ] **前端组件**
  - 偏好设置表单
  - 偏好标签选择器
- [ ] **API接口**
  - `GET /api/user/preferences` - 获取偏好
  - `PUT /api/user/preferences` - 更新偏好
- [ ] **功能实现**
  - 旅行偏好标签（美食、历史、自然等）
  - 默认预算范围
  - 常用出发城市

---

#### 里程碑 M3: AI行程生成功能上线
**时间**: Week 5-7
**目标**: 用户可以通过语音或文字输入需求，AI生成旅行行程

#### 任务清单

**3.1 需求输入界面 (Week 5)**
- [ ] **前端页面**
  - 行程创建向导页面 (`/trips/new`)
  - 分步表单（目的地、日期、预算、偏好）
  - 语音输入组件
- [ ] **语音识别集成**
  - 集成科大讯飞WebIAT SDK
  - 实时语音转文字
  - 录音状态可视化
  - 语音识别结果编辑
- [ ] **表单验证**
  - React Hook Form集成
  - Zod Schema验证
  - 实时表单验证反馈
- [ ] **UI/UX优化**
  - 录音波形动画
  - 识别中Loading状态
  - 友好的错误提示

**3.2 AI行程生成引擎 (Week 6)**
- [ ] **Prompt工程**
  - 设计行程规划Prompt模板
  - 定义结构化输出格式（JSON Schema）
  - 测试不同场景下的生成效果
  - Prompt优化和迭代
- [ ] **API接口开发**
  - `POST /api/trips/generate` - 生成行程
    - 输入: 目的地、日期、预算、偏好、人数
    - 输出: 结构化行程JSON
  - `POST /api/trips` - 保存行程
  - `GET /api/trips/:id` - 获取行程详情
- [ ] **行程生成逻辑**
  - 调用通义千问API
  - 解析AI响应
  - 数据格式标准化
  - 错误处理和重试机制
- [ ] **数据处理**
  - 行程数据结构设计
  - 预算计算逻辑
  - 时间安排合理性验证

**3.3 行程展示页面 (Week 7)**
- [ ] **前端组件**
  - 行程详情页 (`/trips/:id`)
  - 日程时间线组件
  - 景点卡片组件
  - 餐厅推荐卡片
  - 住宿信息卡片
  - 交通方式显示
- [ ] **数据可视化**
  - 按日期分组展示
  - 每日预算显示
  - 时间轴布局
  - 图片懒加载
- [ ] **状态管理**
  - Zustand store for UI状态
  - React Query for 行程数据
  - 乐观更新
- [ ] **性能优化**
  - 虚拟滚动（如果行程很长）
  - 图片优化（next/image）
  - 骨架屏加载

---

#### 里程碑 M4: 费用管理功能上线
**时间**: Week 8-9
**目标**: 用户可以记录和管理旅行费用

#### 任务清单

**4.1 预算估算 (Week 8)**
- [ ] **AI预算计算**
  - 集成在行程生成中
  - 分类预算（交通、住宿、餐饮、门票、其他）
  - 预算合理性检查
- [ ] **预算展示**
  - 预算总览卡片
  - 各项费用占比饼图（Recharts）
  - 预算与实际对比
- [ ] **预算调整**
  - 手动调整预算项
  - AI重新优化行程

**4.2 费用记录 (Week 9)**
- [ ] **前端页面**
  - 费用管理页面 (`/trips/:id/expenses`)
  - 费用记录表单
  - 费用列表组件
- [ ] **语音费用记录**
  - 复用语音输入组件
  - 自然语言理解费用信息
  - 提取金额、类别、描述
- [ ] **API接口**
  - `POST /api/expenses` - 添加费用记录
  - `GET /api/expenses/:tripId` - 获取行程费用
  - `PUT /api/expenses/:id` - 更新费用
  - `DELETE /api/expenses/:id` - 删除费用
- [ ] **数据统计**
  - 实时剩余预算计算
  - 各类别支出统计
  - 日均支出趋势图
  - 超支预警功能
- [ ] **多币种支持**
  - 币种选择器
  - 实时汇率API集成（ExchangeRate-API）
  - 统一换算为用户本币

---

#### 里程碑 M5: MVP功能完整并测试
**时间**: Week 10
**目标**: 所有P0功能开发完成，系统可用

#### 任务清单

**5.1 功能整合与完善**
- [ ] **旅行计划管理**
  - 行程列表页 (`/trips`)
  - 行程状态管理（草稿/进行中/已完成）
  - 行程搜索和筛选
  - 行程删除和归档
- [ ] **云端同步**
  - Supabase实时订阅
  - 离线数据缓存
  - 冲突解决机制
- [ ] **响应式设计**
  - 移动端适配
  - 平板适配
  - 触摸交互优化

**5.2 测试与优化**
- [ ] **功能测试**
  - 端到端测试（Playwright）
  - 关键路径测试（注册→登录→创建行程→记录费用）
  - 边界条件测试
- [ ] **性能测试**
  - Lighthouse性能评分 > 90
  - 页面加载时间 < 3秒
  - AI生成时间 < 10秒
- [ ] **兼容性测试**
  - Chrome/Firefox/Safari/Edge测试
  - 移动端浏览器测试
- [ ] **安全测试**
  - SQL注入测试
  - XSS攻击防护
  - CSRF保护验证
  - 敏感数据加密检查

**5.3 部署准备**
- [ ] **环境变量配置**
  - 生产环境变量设置
  - API Key安全管理
- [ ] **监控与日志**
  - Sentry错误追踪集成
  - Vercel Analytics配置
  - 日志记录规范
- [ ] **文档完善**
  - 用户使用手册
  - API文档
  - 部署文档

---

### Phase 3: 功能增强 (Week 11-16)

#### 里程碑 M6: 地图可视化上线
**时间**: Week 11-12
**目标**: 用户可以在地图上查看行程路线

#### 任务清单

**6.1 地图集成 (Week 11)**
- [ ] **高德地图集成**
  - 安装`@amap/amap-jsapi-loader`
  - 地图容器组件
  - 地图初始化配置
- [ ] **地图标记**
  - 景点标记（自定义图标）
  - 餐厅标记
  - 酒店标记
  - 点击标记显示详情气泡
- [ ] **路线规划**
  - 调用高德路径规划API
  - 显示驾车/公交/步行路线
  - 路线时间和距离显示
- [ ] **地图交互**
  - 缩放、拖拽
  - 标记点击事件
  - 路线切换

**6.2 行程地图视图 (Week 12)**
- [ ] **页面布局调整**
  - 左侧地图 + 右侧行程列表（桌面端）
  - 标签切换地图/列表（移动端）
- [ ] **地图同步**
  - 点击行程项定位到地图
  - 点击地图标记定位到行程项
  - 当前日期高亮
- [ ] **周边推荐**
  - 基于当前位置POI搜索
  - 附近景点/餐厅推荐
  - 距离和评分显示

---

#### 里程碑 M7: 行程编辑优化
**时间**: Week 13-14
**目标**: 用户可以自由编辑和调整行程

#### 任务清单

**7.1 拖拽编辑 (Week 13)**
- [ ] **拖拽功能**
  - 集成`@dnd-kit/core`
  - 行程项拖拽排序
  - 跨日期拖拽
  - 拖拽视觉反馈
- [ ] **行程编辑**
  - 添加/删除景点
  - 修改时间安排
  - 调整预算
  - 添加备注
- [ ] **API接口**
  - `PUT /api/trips/:id` - 更新行程
  - `PATCH /api/trips/:id/reorder` - 重新排序

**7.2 AI优化建议 (Week 14)**
- [ ] **路线优化**
  - 分析行程路线
  - 提供优化建议（减少往返）
  - 一键应用优化
- [ ] **时间调整建议**
  - 检测时间冲突
  - 合理性提醒
- [ ] **预算优化方案**
  - 超预算时提供替代方案
  - 同价位推荐
- [ ] **多方案生成**
  - 生成2-3个备选行程
  - 方案对比视图
  - 方案切换

---

#### 里程碑 M8: 行程分享与导出
**时间**: Week 15-16
**目标**: 用户可以分享和导出行程

#### 任务清单

**8.1 行程导出 (Week 15)**
- [ ] **PDF导出**
  - 使用`react-pdf`或`jsPDF`
  - 设计PDF模板
  - 包含行程、地图截图、费用统计
- [ ] **日历集成**
  - 生成`.ics`文件
  - Google Calendar链接
  - Apple Calendar链接
- [ ] **数据导出**
  - 导出为JSON
  - 导出为Excel（费用明细）

**8.2 行程分享 (Week 16)**
- [ ] **分享链接生成**
  - 公开行程页面
  - 分享链接复制
  - 权限控制（公开/私密）
- [ ] **协作编辑（可选）**
  - 邀请同行者
  - 实时协作
  - 权限管理
- [ ] **社交分享**
  - 生成精美卡片
  - 分享到微信/微博/朋友圈

---

### Phase 4: 持续迭代 (Week 17+)

#### P2功能：智能助手
- [ ] **实时问答**
  - 聊天界面
  - 上下文理解（当前行程）
  - 常见问题快捷回复
- [ ] **提醒功能**
  - 出发提醒
  - 天气预警
  - 景点开放时间提醒
  - 预算超支提醒

#### P3功能：社区与分享
- [ ] **行程模板**
  - 模板浏览
  - 模板复制
  - 模板评分
- [ ] **用户评价**
  - 景点评分
  - 照片上传
  - 游记发布
- [ ] **社交功能**
  - 关注用户
  - 点赞收藏
  - 评论互动

---

## 3. 技术实现细节

### 3.1 数据库Schema设计

#### 用户表 (users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  display_name VARCHAR(100),
  avatar_url TEXT,
  default_budget INTEGER DEFAULT 3000,
  default_city VARCHAR(100),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
```

#### 旅行计划表 (trips)
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget INTEGER NOT NULL,
  num_adults INTEGER DEFAULT 1,
  num_children INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  itinerary JSONB NOT NULL DEFAULT '[]',
  shared BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_start_date ON trips(start_date);
CREATE INDEX idx_trips_share_token ON trips(share_token) WHERE share_token IS NOT NULL;

-- RLS策略
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trips" ON trips FOR SELECT USING (auth.uid() = user_id OR (shared = true));
CREATE POLICY "Users can create trips" ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON trips FOR DELETE USING (auth.uid() = user_id);
```

#### 费用记录表 (expenses)
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CNY',
  category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'tickets', 'shopping', 'other')),
  description TEXT,
  receipt_url TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_recorded_at ON expenses(recorded_at);

-- RLS策略
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view expenses of own trips" ON expenses FOR SELECT
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can create expenses" ON expenses FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));
```

#### 触发器 (自动更新updated_at)
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.2 API接口规范

#### 认证接口
```
POST   /api/auth/signup          # 用户注册
POST   /api/auth/signin          # 用户登录
POST   /api/auth/signout         # 用户登出
POST   /api/auth/reset-password  # 重置密码
GET    /api/auth/verify-email    # 验证邮箱
```

#### 用户接口
```
GET    /api/user/profile         # 获取用户信息
PUT    /api/user/profile         # 更新用户信息
GET    /api/user/preferences     # 获取用户偏好
PUT    /api/user/preferences     # 更新用户偏好
```

#### 行程接口
```
GET    /api/trips                # 获取用户所有行程
POST   /api/trips                # 创建行程
GET    /api/trips/:id            # 获取行程详情
PUT    /api/trips/:id            # 更新行程
DELETE /api/trips/:id            # 删除行程
POST   /api/trips/generate       # AI生成行程
POST   /api/trips/:id/optimize   # 优化行程
GET    /api/trips/shared/:token  # 获取分享行程
```

#### 费用接口
```
GET    /api/expenses/:tripId     # 获取行程费用列表
POST   /api/expenses             # 添加费用记录
PUT    /api/expenses/:id         # 更新费用记录
DELETE /api/expenses/:id         # 删除费用记录
GET    /api/expenses/:tripId/stats # 费用统计
```

#### 语音接口
```
POST   /api/voice/recognize      # 语音识别（如果需要后端处理）
POST   /api/voice/expense        # 语音费用解析
```

### 3.3 AI Prompt设计

#### 行程生成Prompt模板
```typescript
const ITINERARY_GENERATION_PROMPT = `你是一个专业的旅行规划师，擅长根据用户需求制定详细的旅行计划。

用户需求：
- 目的地：{destination}
- 旅行天数：{days}天
- 预算：{budget}元（人民币）
- 同行人数：成人{adults}人，儿童{children}人
- 旅行偏好：{preferences}
- 住宿偏好：{accommodation_level}
- 交通偏好：{transport_preference}

请生成一个详细的旅行计划，包含以下内容：
1. 每日详细行程（景点、餐厅、交通）
2. 住宿推荐
3. 预算分配
4. 实用建议

输出格式要求（JSON）：
{
  "summary": "行程概要",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "当日主题",
      "activities": [
        {
          "time": "09:00-11:00",
          "type": "attraction",
          "name": "景点名称",
          "address": "详细地址",
          "description": "简要描述",
          "duration": 120,
          "ticket_price": 50,
          "tips": "游览建议"
        },
        {
          "time": "12:00-13:00",
          "type": "restaurant",
          "name": "餐厅名称",
          "cuisine": "菜系",
          "average_cost": 80,
          "specialties": ["特色菜1", "特色菜2"]
        }
      ],
      "accommodation": {
        "name": "酒店名称",
        "type": "经济型/舒适型/豪华型",
        "address": "地址",
        "price_range": "200-300"
      },
      "daily_budget": 500
    }
  ],
  "budget_breakdown": {
    "transport": 1000,
    "accommodation": 1500,
    "food": 1200,
    "tickets": 500,
    "other": 300,
    "total": 4500
  },
  "tips": ["实用建议1", "实用建议2"]
}

注意事项：
1. 行程安排要合理，考虑景点间的距离和交通时间
2. 预算要详细准确，总预算不超过{budget}元
3. 根据同行人员特点推荐合适的景点（有儿童推荐亲子景点，有老人避免高强度活动）
4. 餐饮推荐要考虑当地特色
5. 时间安排要留有余地，不要过于紧凑
`;
```

#### 费用解析Prompt
```typescript
const EXPENSE_PARSING_PROMPT = `从用户的语音输入中提取费用信息。

用户输入：{user_input}

请解析出以下信息并以JSON格式返回：
{
  "amount": 数字（单位：元）,
  "category": "transport|accommodation|food|tickets|shopping|other",
  "description": "费用描述"
}

示例：
输入："刚花了200块钱吃了顿饭"
输出：{"amount": 200, "category": "food", "description": "吃饭"}

输入："打车去机场花了150"
输出：{"amount": 150, "category": "transport", "description": "打车去机场"}
`;
```

### 3.4 前端组件架构

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证相关页面组
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/              # 主应用页面组（需要登录）
│   │   ├── layout.tsx            # Dashboard布局
│   │   ├── page.tsx              # 首页（行程列表）
│   │   ├── trips/
│   │   │   ├── new/              # 创建行程
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 行程详情
│   │   │       └── expenses/     # 费用管理
│   │   └── profile/              # 用户资料
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── trips/
│   │   ├── expenses/
│   │   └── voice/
│   ├── layout.tsx                # 根布局
│   └── globals.css
├── components/                   # React组件
│   ├── ui/                       # shadcn/ui组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/                     # 认证组件
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   ├── trips/                    # 行程组件
│   │   ├── TripCard.tsx
│   │   ├── TripList.tsx
│   │   ├── ItineraryTimeline.tsx
│   │   ├── ActivityCard.tsx
│   │   ├── DayTab.tsx
│   │   └── TripWizard/
│   │       ├── Step1Destination.tsx
│   │       ├── Step2DateBudget.tsx
│   │       ├── Step3Preferences.tsx
│   │       └── Step4Review.tsx
│   ├── expenses/                 # 费用组件
│   │   ├── ExpenseList.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── BudgetOverview.tsx
│   │   ├── BudgetChart.tsx
│   │   └── VoiceExpenseInput.tsx
│   ├── map/                      # 地图组件
│   │   ├── TripMap.tsx
│   │   ├── MapMarker.tsx
│   │   └── RouteOverlay.tsx
│   ├── voice/                    # 语音组件
│   │   ├── VoiceInput.tsx
│   │   ├── VoiceRecorder.tsx
│   │   └── WaveformAnimation.tsx
│   └── common/                   # 通用组件
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── Loading.tsx
│       └── ErrorBoundary.tsx
├── lib/                          # 工具库
│   ├── qwen.ts                   # 阿里云通义千问API
│   ├── supabase.ts               # Supabase客户端
│   ├── xunfei.ts                 # 科大讯飞语音API
│   ├── amap.ts                   # 高德地图API
│   ├── utils.ts                  # 通用工具函数
│   └── validations.ts            # Zod验证schemas
├── stores/                       # Zustand状态管理
│   ├── authStore.ts              # 认证状态
│   ├── tripStore.ts              # 行程UI状态
│   └── uiStore.ts                # UI状态（主题、语言等）
├── hooks/                        # 自定义Hooks
│   ├── useAuth.ts
│   ├── useTrips.ts               # React Query hooks
│   ├── useExpenses.ts
│   ├── useVoiceRecognition.ts
│   └── useMap.ts
└── types/                        # TypeScript类型定义
    ├── models.ts                 # 数据模型类型
    ├── api.ts                    # API类型
    └── components.ts             # 组件Props类型
```

### 3.5 状态管理策略

#### Zustand (客户端UI状态)
```typescript
// stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentLanguage: 'zh-CN' | 'en-US';
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setLanguage: (lang: 'zh-CN' | 'en-US') => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  currentLanguage: 'zh-CN',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen
  })),
  setLanguage: (lang) => set({ currentLanguage: lang }),
}));
```

#### React Query (服务端数据)
```typescript
// hooks/useTrips.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await fetch('/api/trips');
      return res.json();
    },
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${id}`);
      return res.json();
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripData) => {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
```

---

## 4. 测试策略

### 4.1 单元测试 (Vitest)
- 工具函数测试
- 数据验证逻辑测试
- API处理函数测试
- 覆盖率目标: > 70%

### 4.2 组件测试 (React Testing Library)
- 关键UI组件测试
- 用户交互测试
- 表单验证测试

### 4.3 集成测试 (Vitest)
- API路由测试
- 数据库操作测试
- 第三方服务集成测试（使用mock）

### 4.4 端到端测试 (Playwright)
**关键用户路径：**
1. 用户注册流程
2. 用户登录流程
3. 创建行程完整流程（输入→生成→保存）
4. 费用记录流程
5. 行程编辑流程

**测试环境：**
- Chrome (桌面端)
- Safari (移动端)
- Firefox (桌面端)

### 4.5 性能测试
- Lighthouse CI集成
- 核心Web Vitals监控
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

---

## 5. 部署策略

### 5.1 环境划分
1. **开发环境 (Development)**
   - 本地开发
   - 使用`.env.local`
   - Supabase本地实例（可选）

2. **预发布环境 (Staging)**
   - Vercel Preview Deployments
   - 每个PR自动部署
   - 使用独立的Supabase项目

3. **生产环境 (Production)**
   - Vercel主部署
   - 生产数据库
   - CDN加速
   - 错误监控

### 5.2 CI/CD流程

#### GitHub Actions工作流
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Unit tests
        run: pnpm test

      - name: Build
        run: pnpm build

  e2e-tests:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    needs: [lint-and-test, e2e-tests]
    steps:
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    needs: [lint-and-test, e2e-tests]
    steps:
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 5.3 部署清单

#### 首次部署前
- [ ] Vercel账号创建
- [ ] 连接GitHub仓库
- [ ] 配置环境变量
- [ ] Supabase生产数据库创建
- [ ] 数据库Schema部署
- [ ] 所有API Key获取和配置
- [ ] 域名配置（可选）
- [ ] SSL证书配置（Vercel自动）

#### 每次发布前
- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 更新CHANGELOG.md
- [ ] 打版本标签（git tag）
- [ ] 数据库迁移执行（如有）
- [ ] 通知团队成员

---

## 6. 监控与维护

### 6.1 错误监控
**Sentry集成：**
- 前端错误捕获
- API错误追踪
- 性能监控
- 用户反馈收集

### 6.2 性能监控
**Vercel Analytics：**
- 页面访问统计
- Core Web Vitals
- 加载性能分析

### 6.3 日志管理
- 结构化日志
- 日志等级（DEBUG, INFO, WARN, ERROR）
- 敏感信息脱敏
- 日志保留策略（30天）

### 6.4 数据库维护
- 定期备份（Supabase自动）
- 索引优化
- 查询性能分析
- 数据清理策略（归档旧数据）

---

## 7. 风险管理

### 7.1 技术风险

#### 风险1：LLM API稳定性和成本
**风险等级**: 高
**影响**: 核心功能不可用，成本超预算
**缓解措施**:
- 实现多LLM提供商切换（通义千问→OpenAI→Claude）
- 设置API调用限流和配额
- 缓存常见目的地推荐结果
- 监控API使用量和费用
- 优化Prompt减少Token消耗
- 使用更便宜的模型处理简单任务（qwen-turbo）

#### 风险2：语音识别准确性
**风险等级**: 中
**影响**: 用户体验下降
**缓解措施**:
- 提供识别结果编辑功能
- 支持文字输入作为替代
- 显示识别置信度
- 多轮对话澄清需求

#### 风险3：第三方服务限制
**风险等级**: 中
**影响**: 功能受限或额外成本
**缓解措施**:
- 监控API调用量
- 实现缓存策略
- 准备替代服务商
- 设计降级方案

### 7.2 业务风险

#### 风险4：用户增长缓慢
**风险等级**: 中
**影响**: 产品价值验证失败
**缓解措施**:
- MVP快速上线，收集反馈
- 数据驱动迭代
- 社交分享功能增加传播
- SEO优化

#### 风险5：数据安全和隐私
**风险等级**: 高
**影响**: 法律风险，用户流失
**缓解措施**:
- 严格的数据加密
- Row Level Security启用
- 隐私政策和服务条款
- 定期安全审计
- GDPR/PIPL合规

### 7.3 资源风险

#### 风险6：开发进度延迟
**风险等级**: 中
**影响**: 发布时间推迟
**缓解措施**:
- 功能优先级明确（P0优先）
- 每周进度回顾
- 及时调整计划
- 必要时削减P1/P2功能

---

## 8. 团队协作

### 8.1 角色分工建议

**全栈开发者 (1-2人)**
- 前端开发
- 后端API开发
- 数据库设计
- 第三方服务集成

**UI/UX设计师 (1人，兼职可选)**
- 界面设计
- 交互设计
- 视觉设计
- 用户体验优化

**测试工程师 (1人，可由开发兼任)**
- 测试用例编写
- 自动化测试
- 性能测试
- Bug跟踪

**产品经理 (1人，可由开发兼任)**
- 需求梳理
- 功能优先级
- 用户反馈收集
- 数据分析

### 8.2 开发规范

#### Git工作流
```
main (保护分支，只接受PR)
  └── develop (开发主分支)
       ├── feature/user-auth
       ├── feature/trip-generation
       ├── feature/expense-management
       └── bugfix/login-error
```

#### Commit规范
```
<type>(<scope>): <subject>

type: feat | fix | docs | style | refactor | test | chore
scope: auth | trips | expenses | map | voice | ui | api
subject: 简短描述（50字符以内）

示例：
feat(trips): add AI itinerary generation
fix(auth): resolve login redirect issue
docs(readme): update API documentation
```

#### 代码审查清单
- [ ] 代码符合项目规范
- [ ] 所有测试通过
- [ ] 无明显性能问题
- [ ] 无安全漏洞
- [ ] 注释清晰
- [ ] TypeScript类型完整
- [ ] 无console.log等调试代码

### 8.3 沟通机制

**每日站会 (15分钟)**
- 昨天完成的工作
- 今天计划的工作
- 遇到的阻碍

**每周回顾 (1小时)**
- 本周进度总结
- 下周计划
- 风险和问题讨论
- 技术分享

**Sprint规划 (每2周)**
- 功能演示
- 用户反馈讨论
- 下个Sprint规划

---

## 9. 质量保证

### 9.1 代码质量标准
- TypeScript严格模式
- ESLint规则全部通过
- 单元测试覆盖率 > 70%
- 关键路径E2E测试覆盖

### 9.2 性能标准
- Lighthouse性能评分 > 90
- 页面加载时间 < 3秒
- AI生成时间 < 10秒
- API响应时间 < 500ms

### 9.3 安全标准
- HTTPS强制
- XSS防护
- CSRF保护
- SQL注入防护
- 敏感数据加密
- 定期依赖更新（Dependabot）

### 9.4 可访问性标准
- WCAG 2.1 AA级别
- 键盘导航支持
- 屏幕阅读器友好
- 色彩对比度符合标准

---

## 10. 上线清单

### 10.1 功能验收
- [ ] 所有P0功能完整实现
- [ ] 关键用户路径测试通过
- [ ] 跨浏览器兼容性测试通过
- [ ] 移动端适配测试通过
- [ ] 性能测试达标
- [ ] 安全测试通过

### 10.2 内容准备
- [ ] 用户使用指南
- [ ] FAQ文档
- [ ] 隐私政策
- [ ] 服务条款
- [ ] 关于我们页面

### 10.3 运营准备
- [ ] 错误监控配置（Sentry）
- [ ] 分析工具配置（Vercel Analytics）
- [ ] 用户反馈渠道（邮件/表单）
- [ ] 客服支持计划
- [ ] 备份恢复流程测试

### 10.4 营销准备
- [ ] 产品官网/落地页
- [ ] 社交媒体账号
- [ ] 发布公告
- [ ] 演示视频
- [ ] 推广计划

---

## 11. 成功指标 (KPI)

### 11.1 开发阶段KPI (MVP)
- [ ] 12周内完成MVP开发
- [ ] 代码质量：0个Critical Bug上线
- [ ] 测试覆盖率 > 70%
- [ ] 性能评分 > 90

### 11.2 产品上线后KPI (第1个月)
- 注册用户数 > 100
- 行程生成成功率 > 95%
- 用户留存率（7日）> 30%
- 平均响应时间 < 500ms
- 系统可用性 > 99.5%

### 11.3 产品成长期KPI (3个月后)
- 月活跃用户 (MAU) > 1000
- 人均创建行程数 > 2
- 行程满意度评分 > 4.0/5.0
- 语音识别准确率 > 90%
- API成本控制在 $150/月以内

---

## 12. 附录

### 12.1 开发资源链接

**官方文档：**
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Supabase: https://supabase.com/docs
- React Query: https://tanstack.com/query/latest

**第三方服务文档：**
- 阿里云通义千问: https://help.aliyun.com/zh/dashscope/
- 科大讯飞: https://www.xfyun.cn/doc/
- 高德地图: https://lbs.amap.com/api/jsapi-v2/summary
- NextAuth.js: https://next-auth.js.org

**工具文档：**
- Zustand: https://zustand-demo.pmnd.rs
- Zod: https://zod.dev
- Vitest: https://vitest.dev
- Playwright: https://playwright.dev

### 12.2 学习资源

**视频教程：**
- Next.js官方教程
- shadcn/ui组件使用
- Supabase入门指南

**代码示例：**
- Next.js Examples: https://github.com/vercel/next.js/tree/canary/examples
- shadcn/ui Examples

### 12.3 版本历史

**v1.0** (2025-11-05)
- 初始版本
- 基于PRD、技术栈文档和README创建
- 包含完整的开发计划、技术实现细节、测试策略

---

## 13. 下一步行动

### 立即行动 (本周)
1. [ ] 团队kickoff会议，明确分工
2. [ ] 创建Supabase项目并配置数据库
3. [ ] 注册所有第三方服务账号
4. [ ] 配置开发环境（所有成员）
5. [ ] 创建GitHub项目看板
6. [ ] 设置CI/CD流程

### 第一个Sprint (Week 1-2)
1. [ ] 完成数据库Schema设计和部署
2. [ ] 实现用户注册登录功能
3. [ ] 集成NextAuth.js
4. [ ] 创建基础UI组件库
5. [ ] 第一次Sprint回顾

### 持续跟进
- 每日站会
- 每周进度汇报
- 每2周Sprint回顾
- 风险监控和调整

---

**文档状态**: ✅ 已完成
**下次更新**: 根据实际开发进度调整

