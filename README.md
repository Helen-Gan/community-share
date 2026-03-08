# 社区闲置物品交换平台 (CommunityShare)

让小区居民方便地发布和获取闲置物品，减少浪费。

## ✨ 功能特点

- 🔐 **用户认证**：手机号注册/登录，JWT令牌认证
- 📦 **物品发布**：支持多图上传、详细描述、价格设置
- 🔍 **物品浏览**：分类筛选、关键词搜索、多维度排序
- 👁️ **物品详情**：图片轮播、浏览量统计、联系方式显示
- 🤝 **联系发布者**：登录后查看联系方式，记录联系历史
- 📱 **我的物品**：查看自己发布的物品，管理物品状态
- 🎨 **响应式设计**：完美适配移动端和PC端
- 🔒 **隐私保护**：联系方式可选可见性设置

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm 或 pnpm

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd CommunityShare
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动项目**
   ```bash
   npm start
   ```

4. **访问应用**
   打开浏览器访问：http://localhost:3000

## 📁 项目结构

```
CommunityShare/
├── server.js                 # 后端服务器入口
├── package.json              # 项目依赖配置
├── database.db              # SQLite数据库文件（自动生成）
├── uploads/                  # 上传文件目录（自动生成）
├── public/                   # 前端静态文件
│   ├── index.html           # 首页（物品列表）
│   ├── login.html           # 登录页
│   ├── register.html        # 注册页
│   ├── publish.html         # 发布物品页
│   ├── detail.html          # 物品详情页
│   ├── myitems.html         # 我的物品页
│   ├── css/
│   │   └── style.css        # 全局样式
│   ├── js/
│   │   └── app.js           # 前端JavaScript
│   └── images/              # 图片目录
│       ├── placeholder.png  # 物品占位图
│       └── default-avatar.png # 默认头像
├── specs/                   # 规范文档
│   ├── spec.md             # 产品需求规格
│   ├── plan.md             # 技术方案
│   └── tasks.md            # 任务拆解
├── .specify/                # SpecKit框架目录
│   └── memory/
│       └── constitution.md  # 项目宪章
└── SPECKIT.md               # SpecKit框架说明
```

## 🔧 技术栈

### 后端
- **框架**：Node.js + Express
- **数据库**：SQLite（文件数据库，无需单独安装）
- **认证**：JWT + bcrypt
- **文件上传**：multer

### 前端
- **技术**：原生 HTML/CSS/JavaScript
- **样式**：自定义CSS（响应式设计）
- **无框架依赖**：轻量级，快速加载

## 📚 API文档

### 认证接口

#### 用户注册
```
POST /api/v1/auth/register
Body: { phone, password, nickname }
Response: { success, data: { token, user } }
```

#### 用户登录
```
POST /api/v1/auth/login
Body: { phone, password }
Response: { success, data: { token, user } }
```

#### 获取当前用户
```
GET /api/v1/auth/me
Headers: Authorization: Bearer {token}
Response: { success, data: user }
```

### 物品接口

#### 获取物品列表
```
GET /api/v1/items?page=1&pageSize=20&category=1&keyword=iPhone&sort=newest
Response: { success, data: [], pagination: {} }
```

#### 获取物品详情
```
GET /api/v1/items/:id
Response: { success, data: item }
```

#### 发布物品
```
POST /api/v1/items
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
Body: FormData { title, categoryId, description, price, condition, contactMethod, contactValue, contactVisibility, images[] }
Response: { success, data: { id, title, url } }
```

#### 更新物品
```
PUT /api/v1/items/:id
Headers: Authorization: Bearer {token}
Response: { success, data: { id, title } }
```

#### 删除物品
```
DELETE /api/v1/items/:id
Headers: Authorization: Bearer {token}
Response: { success, message }
```

#### 获取我的物品
```
GET /api/v1/items/mine?status=all
Headers: Authorization: Bearer {token}
Response: { success, data: [], stats: {} }
```

### 分类接口

#### 获取所有分类
```
GET /api/v1/categories
Response: { success, data: [] }
```

### 联系接口

#### 联系发布者
```
POST /api/v1/items/:id/contact
Headers: Authorization: Bearer {token}
Body: { message }
Response: { success, data: { id, toUser, contactValue } }
```

#### 获取联系记录
```
GET /api/v1/contacts?status=all&type=sent
Headers: Authorization: Bearer {token}
Response: { success, data: [] }
```

#### 更新联系状态
```
PUT /api/v1/contacts/:id/status
Headers: Authorization: Bearer {token}
Body: { status }
Response: { success, data: { id, status } }
```

## 🎯 核心功能演示

### 1. 注册/登录
1. 访问 http://localhost:3000/register.html
2. 输入手机号、密码，点击注册
3. 注册成功后自动跳转到首页

### 2. 发布物品
1. 登录后点击"发布物品"
2. 填写物品信息（标题、分类、描述、价格等）
3. 上传图片（最多5张）
4. 设置联系方式和可见性
5. 点击"发布物品"

### 3. 浏览物品
1. 在首页查看物品列表
2. 使用搜索框搜索关键词
3. 点击分类标签筛选
4. 使用排序功能排序（最新、价格等）

### 4. 查看详情和联系
1. 点击任意物品卡片查看详情
2. 登录后点击"联系发布者"
3. 查看完整联系方式
4. 复制联系方式或打开应用

### 5. 管理我的物品
1. 点击导航栏"我的物品"
2. 查看所有发布的物品
3. 筛选不同状态的物品
4. 编辑或删除物品

## 🛠️ 开发说明

### 环境配置

项目使用SQLite作为数据库，无需额外安装数据库服务。数据库文件`database.db`会在首次运行时自动创建。

### 启动开发服务器

```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 服务器运行在 http://localhost:3000
```

### 数据库重置

如需清空数据，删除`database.db`文件后重启服务器即可：

```bash
# Windows
del database.db

# Mac/Linux
rm database.db

# 重启服务器
npm start
```

## 📝 项目说明

本项目基于SpecKit规范驱动开发框架创建，包含以下核心文档：

- **项目宪章** (.specify/memory/constitution.md) - 明确项目目标和原则
- **产品规格** (specs/spec.md) - 详细的需求规格说明
- **技术方案** (specs/plan.md) - 技术选型和架构设计
- **任务拆解** (specs/tasks.md) - 开发任务分解和工时估算

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发送邮件
- 加入讨论群

---

**让闲置物品重新焕发生机！** ♻️
