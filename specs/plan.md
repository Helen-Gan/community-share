# 社区闲置物品交换平台 - 技术方案文档

**文档版本**：v1.0  
**创建日期**：2026-02-22  
**基于文档**：
- 项目宪章：`.specify/memory/constitution.md`
- 产品规格：`specs/spec.md`

---

## 目录
1. [技术栈选择](#1-技术栈选择)
2. [系统架构](#2-系统架构)
3. [数据模型设计](#3-数据模型设计)
4. [API接口设计](#4-api接口设计)
5. [部署方案](#5-部署方案)

---

## 1. 技术栈选择

### 1.1 技术选型原则
根据项目宪章和快速上线MVP的目标，技术选型遵循以下原则：
- ✅ **成熟稳定**：选择广泛使用、文档完善的技术栈
- ✅ **快速开发**：优先选择开发效率高的框架和工具
- ✅ **团队熟悉**：考虑技术团队的学习成本
- ✅ **避免过度设计**：保持架构简洁，满足MVP需求即可
- ✅ **易于部署**：使用云服务降低运维复杂度

### 1.2 前端技术栈

#### 核心框架
**选择：React 18 + TypeScript**

**理由：**
- React生态成熟，组件化开发模式适合快速迭代
- TypeScript提供类型安全，减少运行时错误
- 丰富的第三方组件库和工具支持
- 良好的性能和开发体验

#### UI组件库
**选择：TDesign React**

**理由：**
- 腾讯开源的企业级设计系统，文档完善
- 提供完整的组件体系，覆盖常见业务场景
- 支持响应式设计，移动端和PC端适配良好
- 中文文档，便于团队理解和使用
- 符合项目宪章中"使用主流UI组件库"的要求

#### 状态管理
**选择：Zustand**

**理由：**
- 轻量级（仅1KB），学习曲线平缓
- API简洁直观，代码量少
- 无需Provider包裹，使用方便
- 支持TypeScript，类型推导完善
- 适合中小型项目，避免过度设计

#### 路由管理
**选择：React Router v6**

**理由：**
- React生态最成熟的路由方案
- 支持动态路由、嵌套路由等特性
- 提供完善的导航API
- 社区活跃，问题易于解决

#### HTTP客户端
**选择：Axios**

**理由：**
- 拦截器机制完善，便于统一处理请求/响应
- 支持请求/响应转换
- 并发请求支持
- 超时处理和取消请求机制

#### 其他工具
- **表单处理**：React Hook Form（性能优秀，API简洁）
- **数据校验**：Zod（类型安全的校验库）
- **图片处理**：react-image-crop（图片裁剪）
- **时间处理**：dayjs（轻量级，替代moment）
- **图标**：TDesign Icons 或 @ant-design/icons

#### 前端依赖清单
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.47.0",
    "zod": "^3.22.0",
    "tdesign-react": "^1.5.0",
    "dayjs": "^1.11.10",
    "react-image-crop": "^11.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 1.3 后端技术栈

#### 核心框架
**选择：Node.js + Express + TypeScript**

**理由：**
- Node.js生态成熟，适合快速开发RESTful API
- 前后端统一使用JavaScript/TypeScript，降低技术栈复杂度
- 异步非阻塞I/O，适合处理并发请求
- npm生态丰富，第三方库完善
- 开发效率高，便于快速迭代

#### 数据库
**选择：MySQL 8.0+**

**理由：**
- 关系型数据库，适合存储结构化数据
- ACID事务支持，保证数据一致性
- 成熟稳定，社区活跃
- 支持索引优化，查询性能优秀
- 符合项目数据模型的复杂查询需求

#### ORM
**选择：Prisma**

**理由：**
- 类型安全的ORM，自动生成TypeScript类型
- 提供直观的数据模型定义方式
- 迁移系统完善，便于数据库版本管理
- 支持查询构建和关系查询
- 开发体验优秀，减少SQL错误

#### 认证授权
**选择：JWT + bcrypt**

**理由：**
- JWT无状态，适合分布式系统
- 前后端分离架构的标准认证方案
- bcrypt加密密码，安全性高
- 实现简单，无需额外的认证服务器

#### 缓存
**选择：Redis**

**理由：**
- 用于存储验证码、临时数据等
- 支持过期策略，自动清理过期数据
- 性能优秀，读写速度快
- 可用于缓存热点数据（如分类列表）

#### 文件存储
**选择：本地存储（MVP阶段）→ 云存储（后续升级）**

**理由：**
- MVP阶段使用本地存储，简化开发流程
- 后续可无缝迁移到腾讯云COS或阿里云OSS
- 支持图片缩略图生成

#### 后端依赖清单
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.0",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "multer": "^1.4.0",
    "sharp": "^0.33.0",
    "redis": "^4.6.0",
    "dotenv": "^16.3.0",
    "zod": "^3.22.0",
    "express-rate-limit": "^7.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/express": "^4.17.0",
    "@types/node": "^20.10.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0"
  }
}
```

### 1.4 开发工具
- **包管理器**：pnpm（快速、节省磁盘空间）
- **代码规范**：ESLint + Prettier
- **Git Hooks**：husky + lint-staged
- **API测试**：Postman 或 Thunder Client
- **版本控制**：Git

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
├─────────────────────────────────────────────────────────────┤
│  移动端浏览器  │  PC端浏览器  │  管理后台（预留）            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────────┐
│                   CDN（可选）                                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   前端应用层                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 页面组件 │  │ 状态管理 │  │ 路由管理 │  │ HTTP请求 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  TDesign组件库 | Zustand | React Router | Axios           │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                   后端服务层                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 控制器层 │  │ 服务层   │  │ 数据访问 │  │ 中间件   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  Express      │ Business    │ Prisma ORM  │ JWT Auth     │
│  Controllers  │ Services     │             │ CORS         │
│               │              │             │ Rate Limit   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼─────┐ ┌───▼──────┐ ┌───▼──────┐
│   MySQL     │ │  Redis   │ │ 文件存储 │
│   数据库    │ │   缓存   │ │   系统   │
└─────────────┘ └──────────┘ └──────────┘
```

### 2.2 前端架构

#### 2.2.1 目录结构
```
client/
├── public/                 # 静态资源
│   └── favicon.ico
├── src/
│   ├── api/               # API请求封装
│   │   ├── auth.ts
│   │   ├── items.ts
│   │   └── upload.ts
│   ├── assets/            # 静态资源（图片、字体等）
│   │   ├── images/
│   │   └── icons/
│   ├── components/        # 通用组件
│   │   ├── common/        # 基础组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   └── layout/        # 布局组件
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   ├── pages/             # 页面组件
│   │   ├── Home/          # 首页（物品列表）
│   │   ├── Login/         # 登录页
│   │   ├── Register/      # 注册页
│   │   ├── ItemDetail/    # 物品详情
│   │   ├── PublishItem/   # 发布物品
│   │   ├── EditItem/      # 编辑物品
│   │   └── MyItems/       # 我的物品
│   ├── stores/            # 状态管理
│   │   ├── authStore.ts
│   │   ├── itemStore.ts
│   │   └── userStore.ts
│   ├── hooks/             # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useItems.ts
│   │   └── usePagination.ts
│   ├── types/             # TypeScript类型定义
│   │   ├── auth.types.ts
│   │   ├── item.types.ts
│   │   └── api.types.ts
│   ├── utils/             # 工具函数
│   │   ├── request.ts     # Axios封装
│   │   ├── format.ts      # 格式化函数
│   │   ├── storage.ts     # 本地存储
│   │   └── validate.ts    # 验证函数
│   ├── constants/         # 常量定义
│   │   ├── api.ts         # API端点
│   │   └── config.ts      # 配置项
│   ├── router/            # 路由配置
│   │   └── index.tsx
│   ├── App.tsx            # 根组件
│   └── main.tsx           # 入口文件
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

#### 2.2.2 核心模块说明

**API模块**
- 封装所有HTTP请求
- 统一处理请求拦截和响应拦截
- 自动添加token到请求头
- 统一错误处理和提示

**状态管理**
- authStore：用户登录状态、用户信息
- itemStore：物品列表、当前物品、筛选条件
- userStore：用户统计、我的物品

**页面组件**
- 采用路由懒加载，提升首屏加载速度
- 每个页面独立管理自己的状态
- 复杂逻辑提取为自定义Hooks

**工具函数**
- request.ts：Axios封装，统一请求处理
- format.ts：时间、价格等格式化函数
- storage.ts：localStorage封装
- validate.ts：表单验证逻辑

### 2.3 后端架构

#### 2.3.1 目录结构
```
server/
├── prisma/                # Prisma配置
│   ├── schema.prisma      # 数据模型定义
│   └── migrations/        # 数据库迁移文件
├── src/
│   ├── config/            # 配置文件
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── index.ts
│   ├── middleware/        # 中间件
│   │   ├── auth.middleware.ts    # JWT认证
│   │   ├── error.middleware.ts   # 错误处理
│   │   ├── logger.middleware.ts  # 日志记录
│   │   └── rateLimit.middleware.ts # 限流
│   ├── controllers/       # 控制器（路由处理）
│   │   ├── auth.controller.ts
│   │   ├── items.controller.ts
│   │   ├── upload.controller.ts
│   │   └── contacts.controller.ts
│   ├── services/          # 服务层（业务逻辑）
│   │   ├── auth.service.ts
│   │   ├── items.service.ts
│   │   ├── upload.service.ts
│   │   └── contacts.service.ts
│   ├── models/            # 数据模型（Prisma自动生成）
│   │   └── types.ts
│   ├── validators/        # 请求验证
│   │   ├── auth.validator.ts
│   │   ├── items.validator.ts
│   │   └── upload.validator.ts
│   ├── utils/            # 工具函数
│   │   ├── jwt.ts
│   │   ├── crypto.ts
│   │   ├── image.ts
│   │   └── pagination.ts
│   ├── types/            # TypeScript类型
│   │   ├── express.d.ts
│   │   └── index.ts
│   ├── routes/           # 路由定义
│   │   ├── auth.routes.ts
│   │   ├── items.routes.ts
│   │   ├── upload.routes.ts
│   │   └── contacts.routes.ts
│   ├── app.ts            # Express应用配置
│   └── server.ts         # 服务器入口
├── uploads/              # 文件上传目录
│   ├── images/
│   └── temp/
├── .env                  # 环境变量
├── package.json
└── tsconfig.json
```

#### 2.3.2 核心模块说明

**中间件层**
- auth.middleware：JWT token验证，提取用户信息
- error.middleware：统一错误处理，返回标准错误响应
- logger.middleware：记录请求日志（ Morgan ）
- rateLimit.middleware：API限流，防止滥用

**控制器层**
- 接收HTTP请求
- 参数验证
- 调用服务层
- 返回响应

**服务层**
- 实现核心业务逻辑
- 数据库操作
- 数据组装和格式化
- 事务管理

**数据访问层**
- 使用Prisma ORM
- 自动生成类型安全的查询API
- 支持事务和关系查询

### 2.4 前后端交互流程

```
用户操作
  ↓
前端页面组件
  ↓
调用API（Axios）
  ↓
【请求拦截器】添加token
  ↓
发送HTTP请求到后端
  ↓
【后端】接收请求
  ↓
【中间件】验证token、记录日志
  ↓
【控制器】验证参数
  ↓
【服务层】处理业务逻辑
  ↓
【Prisma】查询/更新数据库
  ↓
【服务层】格式化数据
  ↓
【控制器】返回响应
  ↓
【后端】发送HTTP响应
  ↓
【响应拦截器】统一处理错误
  ↓
前端接收响应
  ↓
更新UI状态
  ↓
用户看到结果
```

---

## 3. 数据模型设计

### 3.1 数据库选择
- **数据库**：MySQL 8.0+
- **字符集**：utf8mb4（支持emoji）
- **排序规则**：utf8mb4_unicode_ci
- **引擎**：InnoDB（支持事务）

### 3.2 核心数据表

#### 3.2.1 用户表 (users)
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT '用户ID（UUID）',
  phone VARCHAR(11) UNIQUE NOT NULL COMMENT '手机号',
  email VARCHAR(100) UNIQUE COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希（bcrypt）',
  nickname VARCHAR(50) DEFAULT '' COMMENT '昵称',
  avatar TEXT COMMENT '头像URL',
  reputation INT DEFAULT 100 COMMENT '信誉值',
  item_count INT DEFAULT 0 COMMENT '发布物品数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后登录时间',
  INDEX idx_phone (phone),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明：**
- `id`：用户唯一标识，使用UUID
- `phone`：手机号，用于登录，11位数字
- `email`：邮箱，备用登录方式
- `password_hash`：bcrypt加密后的密码
- `nickname`：用户昵称，默认基于手机号生成
- `avatar`：头像URL，存储在云存储
- `reputation`：信誉值，初始100，根据交易情况增减
- `item_count`：用户发布的物品数量，冗余字段便于统计
- `created_at`：注册时间
- `last_login`：最后登录时间

#### 3.2.2 物品表 (items)
```sql
CREATE TABLE items (
  id VARCHAR(36) PRIMARY KEY COMMENT '物品ID（UUID）',
  user_id VARCHAR(36) NOT NULL COMMENT '发布者ID',
  title VARCHAR(100) NOT NULL COMMENT '物品标题',
  category_id INT NOT NULL COMMENT '分类ID',
  description TEXT NOT NULL COMMENT '物品描述',
  price DECIMAL(10, 2) COMMENT '价格（NULL表示免费或面议）',
  condition ENUM('全新', '99新', '9成新', '8成新', '7成新及以下') NOT NULL COMMENT '新旧程度',
  contact_method ENUM('微信', '手机号', 'QQ') NOT NULL COMMENT '联系方式',
  contact_value VARCHAR(100) NOT NULL COMMENT '联系方式值',
  contact_visibility ENUM('public', 'login_required', 'transaction') DEFAULT 'login_required' COMMENT '联系方式可见性',
  status ENUM('available', 'reserved', 'sold', 'deleted') DEFAULT 'available' COMMENT '物品状态',
  view_count INT DEFAULT 0 COMMENT '浏览量',
  reserved_by VARCHAR(36) COMMENT '预留者ID',
  reserved_at TIMESTAMP NULL COMMENT '预留时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明：**
- `id`：物品唯一标识，UUID
- `user_id`：发布者ID，关联用户表
- `title`：物品标题，5-50字
- `category_id`：分类ID，关联分类表
- `description`：详细描述，10-500字
- `price`：价格，NULL表示"免费"或"面议"
- `condition`：新旧程度枚举
- `contact_method`：联系方式类型
- `contact_value`：联系方式值（如微信号、手机号）
- `contact_visibility`：联系方式可见性
  - `public`：所有人可见
  - `login_required`：仅登录用户可见（默认）
  - `transaction`：仅交易后可见
- `status`：物品状态
  - `available`：可交易
  - `reserved`：已预留
  - `sold`：已售出
  - `deleted`：已删除（软删除）
- `view_count`：浏览量统计
- `reserved_by`、`reserved_at`：预留相关信息

#### 3.2.3 分类表 (categories)
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  name VARCHAR(50) NOT NULL COMMENT '分类名称',
  icon VARCHAR(100) COMMENT '分类图标',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初始化分类数据
INSERT INTO categories (id, name, icon, sort_order) VALUES
(1, '数码电子', 'icon-electronic', 1),
(2, '家居用品', 'icon-home', 2),
(3, '服装鞋帽', 'icon-clothing', 3),
(4, '图书音像', 'icon-book', 4),
(5, '运动户外', 'icon-sport', 5),
(6, '母婴用品', 'icon-baby', 6),
(7, '乐器', 'icon-music', 7),
(8, '其他', 'icon-other', 99);
```

**字段说明：**
- `id`：分类ID，自增主键
- `name`：分类名称
- `icon`：图标类名或URL
- `sort_order`：排序值，越小越靠前

#### 3.2.4 图片表 (images)
```sql
CREATE TABLE images (
  id VARCHAR(36) PRIMARY KEY COMMENT '图片ID（UUID）',
  filename VARCHAR(255) NOT NULL COMMENT '文件名',
  url TEXT NOT NULL COMMENT '原图URL',
  thumbnail_url TEXT COMMENT '缩略图URL（300x300）',
  medium_url TEXT COMMENT '中等尺寸图URL（800x800）',
  width INT COMMENT '图片宽度',
  height INT COMMENT '图片高度',
  size INT COMMENT '文件大小（字节）',
  uploader_id VARCHAR(36) COMMENT '上传者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_uploader_id (uploader_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明：**
- `url`：原图URL，用于详情页展示
- `thumbnail_url`：缩略图，用于列表页展示
- `medium_url`：中等尺寸图，用于快速预览
- `width`、`height`：图片尺寸
- `size`：文件大小

#### 3.2.5 物品图片关联表 (item_images)
```sql
CREATE TABLE item_images (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
  item_id VARCHAR(36) NOT NULL COMMENT '物品ID',
  image_id VARCHAR(36) NOT NULL COMMENT '图片ID',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE KEY uk_item_image (item_id, image_id),
  INDEX idx_sort_order (item_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明：**
- `item_id`、`image_id`：联合唯一索引
- `sort_order`：排序，用于控制图片展示顺序

#### 3.2.6 联系记录表 (contacts)
```sql
CREATE TABLE contacts (
  id VARCHAR(36) PRIMARY KEY COMMENT '联系ID（UUID）',
  item_id VARCHAR(36) NOT NULL COMMENT '物品ID',
  from_user_id VARCHAR(36) NOT NULL COMMENT '发起者ID',
  to_user_id VARCHAR(36) NOT NULL COMMENT '接收者ID',
  message TEXT COMMENT '留言信息',
  status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending' COMMENT '联系状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_item_id (item_id),
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明：**
- `from_user_id`：发起联系的用户
- `to_user_id`：物品发布者
- `status`：联系状态
  - `pending`：待处理
  - `accepted`：已接受
  - `rejected`：已拒绝
  - `completed`：已完成交易

#### 3.2.7 用户统计表（可选，用于性能优化）
```sql
CREATE TABLE user_stats (
  id VARCHAR(36) PRIMARY KEY COMMENT '用户ID',
  item_count INT DEFAULT 0 COMMENT '发布的物品数',
  sold_count INT DEFAULT 0 COMMENT '已售出的物品数',
  contact_count INT DEFAULT 0 COMMENT '联系次数',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 数据库关系图

```
users (用户表)
  ├─ items (物品表) [一对多]
  │   └─ item_images (物品图片关联表) [一对多]
  │       └─ images (图片表) [多对一]
  │   └─ contacts (联系记录表) [一对多，作为接收者]
  │
  └─ contacts (联系记录表) [一对多，作为发起者]

categories (分类表)
  └─ items (物品表) [一对多]
```

### 3.4 Prisma Schema定义

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  phone        String   @unique
  email        String?  @unique
  passwordHash String   @map("password_hash")
  nickname     String   @default("")
  avatar       String?
  reputation   Int      @default(100)
  itemCount    Int      @default(0) @map("item_count")
  createdAt    DateTime @default(now()) @map("created_at")
  lastLogin    DateTime @default(now()) @map("last_login")

  items           Item[]           @relation("UserItems")
  sentContacts    Contact[]        @relation("SentContacts")
  receivedContacts Contact[]        @relation("ReceivedContacts")
  images          Image[]

  @@map("users")
}

model Item {
  id                  String             @id @default(uuid())
  userId              String             @map("user_id")
  title               String
  categoryId          Int                @map("category_id")
  description         String             @db.Text
  price               Decimal?           @db.Decimal(10, 2)
  condition           ItemCondition
  contactMethod       ContactMethod      @map("contact_method")
  contactValue        String             @map("contact_value")
  contactVisibility   ContactVisibility  @default(LOGIN_REQUIRED) @map("contact_visibility")
  status              ItemStatus         @default(AVAILABLE)
  viewCount           Int                @default(0) @map("view_count")
  reservedBy          String?            @map("reserved_by")
  reservedAt          DateTime?          @map("reserved_at")
  createdAt           DateTime           @default(now()) @map("created_at")
  updatedAt           DateTime           @updatedAt @map("updated_at")

  user        User        @relation("UserItems", fields: [userId], references: [id], onDelete: Cascade)
  category    Category    @relation(fields: [categoryId], references: [id])
  images      ItemImage[]
  contacts    Contact[]

  @@index([userId])
  @@index([categoryId])
  @@index([status])
  @@index([createdAt])
  @@index([price])
  @@map("items")
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String
  icon      String?
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  items Item[]

  @@map("categories")
}

model Image {
  id            String    @id @default(uuid())
  filename      String
  url           String    @db.Text
  thumbnailUrl  String?   @db.Text @map("thumbnail_url")
  mediumUrl     String?   @db.Text @map("medium_url")
  width         Int?
  height        Int?
  size          Int?
  uploaderId    String?   @map("uploader_id")
  createdAt     DateTime  @default(now()) @map("created_at")

  uploader User?  @relation(fields: [uploaderId], references: [id], onDelete: SetNull)
  items    ItemImage[]

  @@index([uploaderId])
  @@map("images")
}

model ItemImage {
  id        Int      @id @default(autoincrement())
  itemId    String   @map("item_id")
  imageId   String   @map("image_id")
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  item  Item  @relation(fields: [itemId], references: [id], onDelete: Cascade)
  image Image @relation(fields: [imageId], references: [id], onDelete: Cascade)

  @@unique([itemId, imageId])
  @@index([itemId, sortOrder])
  @@map("item_images")
}

model Contact {
  id        String      @id @default(uuid())
  itemId    String      @map("item_id")
  fromUserId String    @map("from_user_id")
  toUserId   String    @map("to_user_id")
  message   String?    @db.Text
  status    ContactStatus @default(PENDING)
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  item     Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  fromUser User @relation("SentContacts", fields: [fromUserId], references: [id], onDelete: Cascade)
  toUser   User @relation("ReceivedContacts", fields: [toUserId], references: [id], onDelete: Cascade)

  @@index([itemId])
  @@index([fromUserId])
  @@index([toUserId])
  @@index([status])
  @@map("contacts")
}

enum ItemCondition {
  BRAND_NEW
  LIKE_NEW_99
  GOOD_90
  FAIR_80
  POOR_70_BELOW
}

enum ContactMethod {
  WECHAT
  PHONE
  QQ
}

enum ContactVisibility {
  PUBLIC
  LOGIN_REQUIRED
  TRANSACTION
}

enum ItemStatus {
  AVAILABLE
  RESERVED
  SOLD
  DELETED
}

enum ContactStatus {
  PENDING
  ACCEPTED
  REJECTED
  COMPLETED
}
```

---

## 4. API接口设计

### 4.1 接口设计原则
- 遵循RESTful风格
- 使用HTTPS加密传输
- 统一响应格式
- 版本控制：`/api/v1`
- 认证方式：JWT Bearer Token

### 4.2 统一响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息描述",
    "details": {}
  }
}
```

#### 分页响应
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 4.3 认证接口

#### 4.3.1 用户注册
**接口地址**：`POST /api/v1/auth/register`

**请求参数**：
```json
{
  "phone": "13800138000",
  "password": "password123",
  "code": "123456"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "nickname": "用户138****8000",
      "avatar": "https://...",
      "phone": "138****8000"
    }
  },
  "message": "注册成功"
}
```

#### 4.3.2 用户登录
**接口地址**：`POST /api/v1/auth/login`

**请求参数**：
```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "nickname": "张三",
      "avatar": "https://...",
      "reputation": 120,
      "phone": "138****8000"
    }
  }
}
```

#### 4.3.3 获取当前用户信息
**接口地址**：`GET /api/v1/auth/me`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "13800138000",
    "nickname": "张三",
    "avatar": "https://...",
    "reputation": 120,
    "itemCount": 5,
    "createdAt": "2026-02-20T10:00:00Z"
  }
}
```

#### 4.3.4 发送验证码
**接口地址**：`POST /api/v1/auth/send-code`

**请求参数**：
```json
{
  "phone": "13800138000"
}
```

**响应**：
```json
{
  "success": true,
  "message": "验证码已发送"
}
```

#### 4.3.5 退出登录
**接口地址**：`POST /api/v1/auth/logout`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "success": true,
  "message": "退出成功"
}
```

### 4.4 物品接口

#### 4.4.1 获取物品列表
**接口地址**：`GET /api/v1/items`

**查询参数**：
```
page: number          // 页码，默认1
pageSize: number      // 每页数量，默认20
category: number      // 分类ID
keyword: string       // 搜索关键词
sort: string         // 排序方式：newest, price_asc, price_desc
```

**示例请求**：
```
GET /api/v1/items?page=1&pageSize=20&category=1&keyword=iPhone&sort=newest
```

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "九成新iPhone 13",
      "price": 3000,
      "priceDisplay": "¥3000",
      "condition": "9成新",
      "thumbnailUrl": "https://...",
      "user": {
        "id": "uuid",
        "nickname": "张三",
        "avatar": "https://..."
      },
      "category": {
        "id": 1,
        "name": "数码电子"
      },
      "status": "available",
      "viewCount": 15,
      "createdAt": "2小时前"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### 4.4.2 获取物品详情
**接口地址**：`GET /api/v1/items/:id`

**请求头**（可选）：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "九成新iPhone 13",
    "description": "使用一年，无划痕，配件齐全...",
    "price": 3000,
    "priceDisplay": "¥3000",
    "condition": "9成新",
    "category": {
      "id": 1,
      "name": "数码电子"
    },
    "status": "available",
    "viewCount": 16,
    "createdAt": "2026-02-22T10:30:00Z",
    "images": [
      {
        "id": "uuid",
        "url": "https://...",
        "thumbnailUrl": "https://...",
        "mediumUrl": "https://...",
        "width": 1920,
        "height": 1080
      }
    ],
    "user": {
      "id": "uuid",
      "nickname": "张三",
      "avatar": "https://...",
      "reputation": 120,
      "itemCount": 5
    },
    "contact": {
      "method": "微信",
      "value": "wx***5678",
      "visibility": "login_required",
      "visible": false
    }
  }
}
```

#### 4.4.3 发布物品
**接口地址**：`POST /api/v1/items`

**请求头**：
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**：
```json
{
  "title": "九成新iPhone 13",
  "categoryId": 1,
  "description": "使用一年，无划痕，配件齐全",
  "price": 3000,
  "condition": "GOOD_90",
  "contactMethod": "WECHAT",
  "contactValue": "wx123456",
  "contactVisibility": "LOGIN_REQUIRED",
  "imageIds": ["uuid1", "uuid2"]
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "九成新iPhone 13",
    "url": "/items/uuid",
    "createdAt": "2026-02-22T10:30:00Z"
  },
  "message": "物品发布成功"
}
```

#### 4.4.4 更新物品
**接口地址**：`PUT /api/v1/items/:id`

**请求头**：
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**：
```json
{
  "title": "九成新iPhone 13 Pro",
  "categoryId": 1,
  "description": "使用一年，无划痕，配件齐全，包含充电器",
  "price": 2800,
  "condition": "GOOD_90",
  "contactMethod": "WECHAT",
  "contactValue": "wx123456",
  "contactVisibility": "LOGIN_REQUIRED",
  "imageIds": ["uuid1", "uuid2", "uuid3"]
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "九成新iPhone 13 Pro",
    "updatedAt": "2026-02-22T11:00:00Z"
  },
  "message": "物品更新成功"
}
```

#### 4.4.5 删除物品
**接口地址**：`DELETE /api/v1/items/:id`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "success": true,
  "message": "物品已删除"
}
```

#### 4.4.6 获取我的物品
**接口地址**：`GET /api/v1/items/mine`

**请求头**：
```
Authorization: Bearer {token}
```

**查询参数**：
```
page: number          // 页码，默认1
pageSize: number      // 每页数量，默认10
status: string        // 状态：all, available, reserved, sold, deleted
```

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "九成新iPhone 13",
      "price": 3000,
      "priceDisplay": "¥3000",
      "status": "available",
      "viewCount": 15,
      "contactCount": 2,
      "createdAt": "2小时前"
    }
  ],
  "stats": {
    "available": 3,
    "reserved": 1,
    "sold": 2,
    "deleted": 0
  },
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 6
  }
}
```

### 4.5 图片上传接口

#### 4.5.1 上传图片
**接口地址**：`POST /api/v1/upload/image`

**请求头**：
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**：
```
file: File        // 图片文件
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "image_123456.jpg",
    "url": "https://...",
    "thumbnailUrl": "https://...",
    "mediumUrl": "https://...",
    "width": 1920,
    "height": 1080,
    "size": 524288
  },
  "message": "上传成功"
}
```

### 4.6 分类接口

#### 4.6.1 获取所有分类
**接口地址**：`GET /api/v1/categories`

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "数码电子",
      "icon": "icon-electronic",
      "sortOrder": 1
    },
    {
      "id": 2,
      "name": "家居用品",
      "icon": "icon-home",
      "sortOrder": 2
    }
  ]
}
```

### 4.7 联系接口

#### 4.7.1 联系发布者
**接口地址**：`POST /api/v1/items/:id/contact`

**请求头**：
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**：
```json
{
  "message": "我对这个物品感兴趣"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemTitle": "九成新iPhone 13",
    "toUser": {
      "id": "uuid",
      "nickname": "张三",
      "contactMethod": "微信",
      "contactValue": "wx12345678"
    },
    "status": "PENDING",
    "createdAt": "2026-02-22T11:00:00Z"
  },
  "message": "联系请求已发送，请等待对方回复"
}
```

#### 4.7.2 获取联系记录
**接口地址**：`GET /api/v1/contacts`

**请求头**：
```
Authorization: Bearer {token}
```

**查询参数**：
```
page: number          // 页码，默认1
pageSize: number      // 每页数量，默认10
status: string        // 状态：all, pending, accepted, rejected, completed
type: string         // 类型：sent, received
```

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "item": {
        "id": "uuid",
        "title": "九成新iPhone 13",
        "thumbnailUrl": "https://..."
      },
      "fromUser": {
        "id": "uuid",
        "nickname": "李四"
      },
      "toUser": {
        "id": "uuid",
        "nickname": "张三"
      },
      "message": "我对这个物品感兴趣",
      "status": "PENDING",
      "createdAt": "1小时前"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 15
  }
}
```

#### 4.7.3 更新联系状态
**接口地址**：`PUT /api/v1/contacts/:id/status`

**请求头**：
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**：
```json
{
  "status": "ACCEPTED"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ACCEPTED",
    "updatedAt": "2026-02-22T12:00:00Z"
  },
  "message": "状态更新成功"
}
```

### 4.8 错误码定义

| 错误码 | 说明 |
|--------|------|
| 1001 | 参数错误 |
| 1002 | 参数缺失 |
| 2001 | 用户不存在 |
| 2002 | 密码错误 |
| 2003 | 手机号已注册 |
| 2004 | 验证码错误 |
| 2005 | 验证码已过期 |
| 3001 | 物品不存在 |
| 3002 | 物品已删除 |
| 3003 | 无权操作此物品 |
| 4001 | 未登录 |
| 4002 | token无效 |
| 4003 | token已过期 |
| 5001 | 文件上传失败 |
| 5002 | 文件类型不支持 |
| 5003 | 文件大小超限 |
| 9999 | 服务器内部错误 |

---

## 5. 部署方案

### 5.1 本地开发环境

#### 5.1.1 环境要求
- **Node.js**：v18+ (推荐 v20)
- **pnpm**：v8+
- **MySQL**：8.0+
- **Redis**：7.0+（可选，MVP阶段可暂不使用）

#### 5.1.2 后端本地运行

**步骤1：安装依赖**
```bash
cd server
pnpm install
```

**步骤2：配置环境变量**
创建 `.env` 文件：
```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/community_share?schema=public"

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Redis配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# 验证码配置
SMS_ENABLED=false  # MVP阶段关闭短信功能
```

**步骤3：初始化数据库**
```bash
# 生成Prisma客户端
pnpm prisma generate

# 执行数据库迁移
pnpm prisma migrate dev --name init

# 填充初始数据
pnpm prisma db seed
```

**步骤4：启动开发服务器**
```bash
# 使用ts-node运行
pnpm dev

# 或者先编译再运行
pnpm build
pnpm start
```

**步骤5：测试API**
```bash
# 健康检查
curl http://localhost:3000/api/v1/health

# 注册用户
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"password123","code":"123456"}'
```

#### 5.1.3 前端本地运行

**步骤1：安装依赖**
```bash
cd client
pnpm install
```

**步骤2：配置环境变量**
创建 `.env.development` 文件：
```env
# API地址
VITE_API_BASE_URL=http://localhost:3000/api/v1

# 其他配置
VITE_APP_TITLE=社区闲置物品交换平台
VITE_APP_VERSION=1.0.0
```

**步骤3：启动开发服务器**
```bash
pnpm dev
```

访问 `http://localhost:5173`

**步骤4：构建生产版本**
```bash
pnpm build
```

构建产物在 `dist/` 目录

### 5.2 生产环境部署（建议）

#### 5.2.1 云服务推荐

**方案1：腾讯云部署（推荐）**
- **云服务器（CVM）**：2核4GB，5M带宽
- **云数据库（MySQL）**：基础版2核4GB
- **云存储（COS）**：用于图片存储
- **CDN**：加速静态资源访问

**方案2：阿里云部署**
- **云服务器（ECS）**：2核4GB，5M带宽
- **云数据库（RDS MySQL）**：基础版2核4GB
- **对象存储（OSS）**：用于图片存储
- **CDN**：加速静态资源访问

**方案3：简化部署（适合MVP）**
- **Heroku**：一键部署Node.js应用
- **Vercel**：一键部署React应用
- **PlanetScale**：MySQL托管服务
- **Cloudflare R2**：图片存储（免费额度大）

#### 5.2.2 部署流程

**后端部署**

```bash
# 1. 登录服务器
ssh user@your-server-ip

# 2. 克隆代码
git clone https://github.com/your-repo/CommunityShare.git
cd CommunityShare/server

# 3. 安装依赖
pnpm install --prod

# 4. 构建项目
pnpm build

# 5. 配置环境变量
cp .env.example .env
# 编辑.env文件，填入生产环境配置

# 6. 初始化数据库
pnpm prisma migrate deploy

# 7. 使用PM2启动服务
pnpm add -g pm2
pm2 start npm --name "community-share-api" -- start
pm2 save
pm2 startup

# 8. 配置Nginx反向代理
sudo nano /etc/nginx/sites-available/community-share
```

Nginx配置示例：
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**前端部署**

```bash
# 1. 构建生产版本
cd client
pnpm build

# 2. 上传dist目录到服务器
# 方式1：使用scp
scp -r dist/* user@your-server-ip:/var/www/community-share

# 方式2：使用rsync
rsync -avz --delete dist/ user@your-server-ip:/var/www/community-share

# 3. 配置Nginx
sudo nano /etc/nginx/sites-available/community-share-web
```

Nginx配置示例：
```nginx
server {
    listen 80;
    server_name www.yourdomain.com yourdomain.com;

    root /var/www/community-share;
    index index.html;

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

**SSL证书配置（HTTPS）**

```bash
# 使用Let's Encrypt免费SSL证书
sudo apt-get install certbot python3-certbot-nginx

# 获取证书并自动配置Nginx
sudo certbot --nginx -d www.yourdomain.com -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

#### 5.2.3 Docker部署（可选）

**后端Dockerfile**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

**前端Dockerfile**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: community_share
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  backend:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://root:rootpassword@mysql:3306/community_share
      REDIS_HOST: redis
    depends_on:
      - mysql
      - redis

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql-data:
  redis-data:
```

**启动Docker服务**
```bash
docker-compose up -d
```

### 5.3 监控和日志

#### 5.3.1 日志管理
- 使用PM2管理应用日志
- 日志文件位置：`~/.pm2/logs/`
- 定期清理日志：`pm2 flush`

#### 5.3.2 性能监控（可选）
- **应用监控**：New Relic / DataDog
- **服务器监控**：云服务商提供的监控工具
- **错误追踪**：Sentry

#### 5.3.3 备份策略
- **数据库备份**：每日自动备份
- **文件备份**：定期备份上传的文件
- **代码备份**：Git版本控制

### 5.4 域名和DNS配置
1. 购买域名（如阿里云、腾讯云）
2. 配置DNS解析：
   - `api.yourdomain.com` → 后端服务器IP
   - `www.yourdomain.com` → 前端服务器IP
3. 等待DNS生效（通常5-10分钟）

### 5.5 安全建议
- ✅ 启用HTTPS（SSL证书）
- ✅ 配置防火墙，仅开放必要端口
- ✅ 定期更新系统和依赖
- ✅ 使用环境变量存储敏感信息
- ✅ 配置API限流，防止滥用
- ✅ 定期备份数据库
- ✅ 使用强密码
- ✅ 启用日志监控

---

## 附录

### A. 技术栈版本清单

#### 前端依赖
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "zustand": "^4.4.0",
  "axios": "^1.6.0",
  "react-hook-form": "^7.47.0",
  "zod": "^3.22.0",
  "tdesign-react": "^1.5.0",
  "dayjs": "^1.11.10",
  "vite": "^5.0.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.3.0"
}
```

#### 后端依赖
```json
{
  "express": "^4.18.0",
  "cors": "^2.8.0",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "prisma": "^5.6.0",
  "@prisma/client": "^5.6.0",
  "multer": "^1.4.0",
  "sharp": "^0.33.0",
  "redis": "^4.6.0",
  "dotenv": "^16.3.0",
  "zod": "^3.22.0",
  "typescript": "^5.3.0"
}
```

### B. 开发时间估算

| 功能模块 | 预估工时 |
|---------|---------|
| 项目搭建 | 0.5天 |
| 数据库设计 | 0.5天 |
| 用户注册/登录 | 1.5天 |
| 物品发布 | 2天 |
| 物品浏览列表 | 2天 |
| 物品详情 | 1.5天 |
| 联系发布者 | 1.5天 |
| 我的物品管理 | 1天 |
| UI/UX优化 | 1天 |
| 测试和Bug修复 | 1.5天 |
| 部署上线 | 0.5天 |
| **总计** | **13天（约2周）** |

### C. 参考资源
- React官方文档：https://react.dev
- TDesign文档：https://tdesign.tencent.com/react
- Express官方文档：https://expressjs.com
- Prisma文档：https://www.prisma.io/docs
- MySQL官方文档：https://dev.mysql.com/doc/

---

**文档结束**
