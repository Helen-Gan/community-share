# 社区闲置物品交换平台 - 产品需求规格文档

**文档版本**：v1.0  
**创建日期**：2026-02-22  
**基于宪章**：`.specify/memory/constitution.md`

---

## 文档说明
本文档以"打开黑盒"的方式详细描述MVP阶段的核心功能实现，包括用户操作流程和系统内部逻辑。

---

## 1. 用户注册/登录

### 1.1 功能描述
支持新用户注册和现有用户登录，确保用户身份验证和权限控制。

### 1.2 用户操作流程
**步骤1：用户进入登录页**
- 输入手机号/邮箱
- 输入密码
- 点击"登录"按钮

**步骤2（可选）：新用户注册**
- 点击"注册新账号"
- 输入手机号/邮箱
- 设置密码
- 输入验证码
- 点击"注册"

**步骤3：登录成功**
- 系统自动跳转到首页
- 顶部显示用户头像和昵称

### 1.3 系统内部逻辑（黑盒）

#### 1.3.1 登录请求处理
```
接收参数：{ phone/email, password }
         ↓
【前端验证层】
- 检查必填字段是否为空
- 验证手机号格式（11位数字）或邮箱格式
- 验证密码长度（6-20位）
         ↓
    通过验证
         ↓
【API请求】POST /api/auth/login
- 传输数据：{ phone, password_hash }
         ↓
【后端 - 控制器层】
- 接收登录请求
- 转发至服务层处理
         ↓
【后端 - 服务层】
- 调用用户仓库查询用户
         ↓
【后端 - 数据访问层】
- SQL查询：SELECT * FROM users WHERE phone = ?
- 从数据库获取用户记录
         ↓
【后端 - 服务层】
- 验证用户是否存在
- 比对密码哈希值（使用bcrypt）
         ↓
    密码匹配
         ↓
- 生成JWT令牌（有效期7天）
         ↓
【后端 - 数据库更新】
- SQL更新：UPDATE users SET last_login = NOW() WHERE id = ?
- 更新用户最后登录时间
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: {
      id: 1,
      nickname: "张三",
      avatar: "https://...",
      phone: "138****5678"
    }
  }
         ↓
【前端 - 响应处理】
- 存储token到localStorage
- 存储用户信息到state
- 设置Authorization请求头
- 路由跳转至首页
         ↓
    ✅ 登录完成
```

#### 1.3.2 注册请求处理
```
接收参数：{ phone, password, code }
         ↓
【前端验证层】
- 检查必填字段
- 验证手机号格式
- 验证密码复杂度（字母+数字，6-20位）
- 验证验证码格式（6位数字）
         ↓
    通过验证
         ↓
【API请求】POST /api/auth/register
- 传输数据：{ phone, password_hash, code }
         ↓
【后端 - 控制器层】
- 接收注册请求
- 转发至服务层
         ↓
【后端 - 服务层】
- 检查手机号是否已注册
- 验证验证码是否有效（从Redis缓存读取）
- 验证验证码是否过期（有效期5分钟）
         ↓
    验证通过
         ↓
- 生成用户唯一ID（使用UUID）
- 密码哈希处理（bcrypt加密）
- 设置默认昵称（如"用户138xxxx5678"）
- 设置默认头像
         ↓
【后端 - 数据访问层】
- SQL插入：
  INSERT INTO users (
    id, phone, password_hash, nickname, 
    avatar, created_at, last_login
  ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
         ↓
    数据库插入成功
         ↓
【后端 - 服务层】
- 清除已使用的验证码（Redis删除）
- 生成JWT令牌
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: {
      id: 1,
      nickname: "用户138xxxx5678",
      avatar: "https://...",
      phone: "138****5678"
    }
  }
         ↓
【前端 - 响应处理】
- 存储token和用户信息
- 跳转至首页
- 显示"注册成功，欢迎加入"提示
         ↓
    ✅ 注册完成
```

#### 1.3.3 权限验证中间件
```
每次API请求携带token
         ↓
【后端 - 中间件层】
- 从请求头获取Authorization
- 提取token（Bearer xxx）
- 验证token格式
         ↓
【后端 - JWT验证】
- 验证token签名
- 检查token是否过期
- 解析payload获取user_id
         ↓
    验证通过
         ↓
【后端 - 数据访问层】
- SQL查询：SELECT * FROM users WHERE id = ?
- 验证用户是否仍然存在（未被删除）
         ↓
    用户有效
         ↓
【后端 - 上下文注入】
- 将user信息注入到请求上下文
- req.user = { id, phone, nickname, ... }
         ↓
    继续处理业务逻辑
```

### 1.4 数据表结构
```sql
-- 用户表
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(11) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) DEFAULT '',
  avatar TEXT DEFAULT '',
  reputation INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
);
```

### 1.5 接口定义
```
POST /api/auth/login
请求体：{ phone, password }
响应：{ success, token, user }

POST /api/auth/register
请求体：{ phone, password, code }
响应：{ success, token, user }

GET /api/auth/logout
响应：{ success, message }

GET /api/auth/me
请求头：Authorization: Bearer {token}
响应：{ success, user }
```

---

## 2. 发布物品

### 2.1 功能描述
用户可以上传闲置物品信息，包括图片、描述、联系方式等，发布后供其他用户浏览和联系。

### 2.2 用户操作流程
**步骤1：点击"发布物品"按钮**
- 跳转到发布页面
- 显示发布表单

**步骤2：上传图片**
- 点击上传区域或拖拽图片
- 支持多图上传（最多5张）
- 图片预览显示

**步骤3：填写物品信息**
- 输入物品标题（必填，5-50字）
- 选择物品分类（必填，如家具、电子产品、衣物等）
- 输入物品描述（必填，10-500字）
- 输入物品价格（选填，支持"免费"、"面议"或具体金额）
- 选择新旧程度（必填，全新、99新、9成新等）
- 输入联系方式（微信、手机号等，必填）
- 选择联系方式可见性（仅登录用户/有交易意向后可见）

**步骤4：点击"发布"按钮**
- 表单验证
- 提交数据
- 显示发布成功提示
- 跳转到物品详情页

### 2.3 系统内部逻辑（黑盒）

#### 2.3.1 图片上传处理
```
用户选择图片文件
         ↓
【前端 - 图片处理】
- 检查文件类型（仅允许jpg, jpeg, png, webp）
- 检查文件大小（单张≤5MB）
- 限制上传数量（≤5张）
- 压缩图片（前端压缩，最大宽高1920px）
         ↓
    通过检查
         ↓
【前端 - 分片上传】（如果文件较大）
- 将图片分成多个分片
- 依次上传每个分片
         ↓
【API请求】POST /api/upload/image
- 传输数据：FormData { file, chunkIndex, totalChunks }
         ↓
【后端 - 文件服务】
- 接收文件分片
- 保存到临时目录
- 合并分片（如果是分片上传）
- 生成唯一文件名（UUID + 时间戳）
- 存储到云存储（如OSS/COS）
         ↓
【后端 - 图片处理】
- 生成缩略图（300x300）
- 生成中等尺寸图（800x800）
- 获取图片尺寸、格式等元信息
         ↓
【后端 - 数据库存储】
- SQL插入图片记录：
  INSERT INTO images (
    id, filename, url, thumbnail_url, 
    medium_url, width, height, size, 
    uploader_id, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    image: {
      id: "img_xxx",
      url: "https://...",
      thumbnailUrl: "https://...",
      mediumUrl: "https://..."
    }
  }
         ↓
【前端 - 状态管理】
- 将image.id存储到表单数据
- 更新预览列表
         ↓
    ✅ 图片上传完成
```

#### 2.3.2 物品发布请求处理
```
用户点击"发布"按钮
         ↓
【前端 - 表单验证】
- 验证必填字段：标题、分类、描述、联系方式
- 验证字段长度限制
- 验证至少上传一张图片
- 验证联系方式格式
         ↓
    验证通过
         ↓
【前端 - 提交数据】
- 收集表单数据：{
    title: "九成新iPhone 13",
    category: "电子产品",
    description: "使用一年，无划痕...",
    price: 3000,
    condition: "9成新",
    contactMethod: "微信",
    contactValue: "wx123456",
    contactVisibility: "login_required",
    imageIds: ["img_xxx", "img_yyy"]
  }
         ↓
【API请求】POST /api/items
- 请求头：Authorization: Bearer {token}
- 请求体：{ ...formData }
         ↓
【后端 - 权限验证】
- JWT验证token
- 提取user_id
- 验证用户登录状态
         ↓
【后端 - 控制器层】
- 接收物品发布请求
- 转发至服务层
         ↓
【后端 - 服务层】
- 验证category是否有效（查询分类表）
- 验证imageIds是否属于当前用户
- 验证物品信息完整性
- 生成物品ID（UUID）
- 设置默认状态为"available"
         ↓
【后端 - 数据库事务】
BEGIN TRANSACTION
         ↓
【步骤1：插入物品记录】
INSERT INTO items (
  id, user_id, title, category_id, description,
  price, condition, contact_method, contact_value,
  contact_visibility, status, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', NOW())
         ↓
【步骤2：关联图片】
INSERT INTO item_images (item_id, image_id, sort_order)
VALUES 
  (?, "img_xxx", 1),
  (?, "img_yyy", 2)
         ↓
【步骤3：更新用户统计】
UPDATE users SET item_count = item_count + 1 WHERE id = ?
         ↓
COMMIT
         ↓
    数据库事务成功
         ↓
【后端 - 服务层】
- 生成物品详情页URL
- 记录操作日志
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    item: {
      id: "item_xxx",
      title: "九成新iPhone 13",
      url: "/items/item_xxx",
      createdAt: "2026-02-22 10:30:00"
    },
    message: "物品发布成功"
  }
         ↓
【前端 - 响应处理】
- 显示成功提示（Toast/弹窗）
- 更新本地状态（如用户物品列表）
- 路由跳转到物品详情页
         ↓
    ✅ 物品发布完成
```

### 2.4 数据表结构
```sql
-- 物品表
CREATE TABLE items (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(100) NOT NULL,
  category_id INT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2),
  condition ENUM('全新', '99新', '9成新', '8成新', '7成新及以下') NOT NULL,
  contact_method ENUM('微信', '手机号', 'QQ') NOT NULL,
  contact_value VARCHAR(100) NOT NULL,
  contact_visibility ENUM('public', 'login_required', 'transaction') DEFAULT 'login_required',
  status ENUM('available', 'reserved', 'sold', 'deleted') DEFAULT 'available',
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- 物品图片关联表
CREATE TABLE item_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id VARCHAR(36) NOT NULL,
  image_id VARCHAR(36) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE KEY uk_item_image (item_id, image_id)
);

-- 图片表
CREATE TABLE images (
  id VARCHAR(36) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  medium_url TEXT,
  width INT,
  height INT,
  size INT,
  uploader_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(100),
  sort_order INT DEFAULT 0
);
```

### 2.5 接口定义
```
POST /api/items
请求头：Authorization: Bearer {token}
请求体：{ title, categoryId, description, price, condition, contactMethod, contactValue, contactVisibility, imageIds }
响应：{ success, item, message }

GET /api/items/mine
请求头：Authorization: Bearer {token}
响应：{ success, items: [], total }

PUT /api/items/:id
请求头：Authorization: Bearer {token}
请求体：{ ...updates }
响应：{ success, item }

DELETE /api/items/:id
请求头：Authorization: Bearer {token}
响应：{ success, message }
```

---

## 3. 浏览物品列表

### 3.1 功能描述
用户可以浏览所有发布的物品列表，支持按分类筛选、搜索关键词、排序等功能。

### 3.2 用户操作流程
**步骤1：进入首页/物品列表页**
- 显示物品网格列表
- 每个物品卡片显示：缩略图、标题、价格、发布时间、状态

**步骤2：筛选和搜索**
- 点击分类标签（如"全部"、"家具"、"电子产品"）
- 输入搜索关键词
- 选择排序方式（最新、价格从低到高、价格从高到低）

**步骤3：浏览列表**
- 滚动浏览物品
- 点击物品卡片查看详情
- 触底加载更多（分页）

### 3.3 系统内部逻辑（黑盒）

#### 3.3.1 物品列表加载
```
用户访问物品列表页
         ↓
【前端 - 初始化】
- 设置默认参数：{
    page: 1,
    pageSize: 20,
    category: null,
    keyword: '',
    sort: 'newest'
  }
- 显示加载骨架屏
         ↓
【API请求】GET /api/items
- 查询参数：?page=1&pageSize=20&category=null&sort=newest
         ↓
【后端 - 控制器层】
- 接收查询参数
- 验证参数有效性
- 转发至服务层
         ↓
【后端 - 服务层】
- 构建查询条件
- 解析排序规则
         ↓
【后端 - 数据访问层】
- SQL查询（分页）：
  SELECT 
    i.id, i.title, i.price, i.condition, i.status,
    i.created_at, i.view_count,
    u.nickname as user_nickname,
    u.avatar as user_avatar,
    c.name as category_name,
    (SELECT url FROM images WHERE id = 
      (SELECT image_id FROM item_images 
       WHERE item_id = i.id ORDER BY sort_order LIMIT 1)
    ) as thumbnail_url
  FROM items i
  JOIN users u ON i.user_id = u.id
  JOIN categories c ON i.category_id = c.id
  WHERE i.status = 'available'
    AND (i.category_id = ? OR ? IS NULL)
    AND (i.title LIKE ? OR i.description LIKE ?)
  ORDER BY 
    CASE WHEN ? = 'newest' THEN i.created_at END DESC,
    CASE WHEN ? = 'price_asc' THEN i.price END ASC,
    CASE WHEN ? = 'price_desc' THEN i.price END DESC
  LIMIT ? OFFSET ?
         ↓
【后端 - 数据访问层】
- 执行分页查询
- 统计总记录数：
  SELECT COUNT(*) as total FROM items WHERE ...
         ↓
【后端 - 服务层】
- 格式化物品数据
- 格式化价格（添加"元"、"免费"等标签）
- 格式化时间（"刚刚"、"2小时前"等）
- 对用户信息脱敏（手机号中间4位）
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    items: [
      {
        id: "item_xxx",
        title: "九成新iPhone 13",
        price: 3000,
        priceDisplay: "¥3000",
        condition: "9成新",
        status: "available",
        thumbnailUrl: "https://...",
        user: {
          nickname: "张三",
          avatar: "https://..."
        },
        category: "电子产品",
        createdAt: "2小时前",
        viewCount: 15
      },
      ...
    ],
    pagination: {
      page: 1,
      pageSize: 20,
      total: 150,
      totalPages: 8
    }
  }
         ↓
【前端 - 渲染列表】
- 隐藏加载骨架
- 渲染物品卡片
- 绑定点击事件
         ↓
    ✅ 列表加载完成
```

#### 3.3.2 分类筛选
```
用户点击分类标签"电子产品"
         ↓
【前端 - 状态更新】
- 更新筛选条件：category = 2（电子产品ID）
- 重置页码：page = 1
- 显示加载中状态
         ↓
【API请求】GET /api/items
- 查询参数：?page=1&pageSize=20&category=2&sort=newest
         ↓
【后端 - 控制器层】
- 接收分类ID参数
- 转发至服务层
         ↓
【后端 - 服务层】
- 验证分类ID是否存在
- 添加WHERE条件：category_id = 2
         ↓
【后端 - 数据访问层】
- SQL查询：
  SELECT ... FROM items i
  WHERE i.status = 'available' AND i.category_id = 2
  ORDER BY i.created_at DESC
  LIMIT ? OFFSET ?
         ↓
【后端 - 响应层】
- 返回筛选后的物品列表
         ↓
【前端 - 渲染更新】
- 替换当前列表
- 更新分类标签高亮状态
- 更新总数显示
         ↓
    ✅ 筛选完成
```

#### 3.3.3 搜索功能
```
用户输入搜索关键词"iPhone"
         ↓
【前端 - 防抖处理】
- 500ms内不再输入才触发搜索
- 显示搜索中状态
         ↓
【API请求】GET /api/items
- 查询参数：?keyword=iPhone&page=1&pageSize=20
         ↓
【后端 - 服务层】
- 构建搜索条件：
  WHERE (title LIKE '%iPhone%' OR description LIKE '%iPhone%')
- 使用全文索引优化查询（如果数据库支持）
         ↓
【后端 - 数据访问层】
- SQL查询：
  SELECT ... FROM items i
  WHERE i.status = 'available'
    AND (i.title LIKE ? OR i.description LIKE ?)
  ORDER BY i.created_at DESC
  LIMIT ? OFFSET ?
         ↓
【后端 - 响应层】
- 返回搜索结果
- 高亮匹配关键词（前端处理）
         ↓
【前端 - 渲染结果】
- 显示搜索结果
- 显示"找到X个相关物品"
         ↓
    ✅ 搜索完成
```

#### 3.3.4 无限滚动/分页加载
```
用户滚动到页面底部
         ↓
【前端 - 触发加载】
- 检测滚动位置接近底部（距离<200px）
- 检查是否还有更多数据
- 避免重复触发（loading状态）
         ↓
【前端 - 发起请求】
- page = page + 1
- API请求：GET /api/items?page=2&...
         ↓
【后端 - 处理请求】
- OFFSET = (page - 1) * pageSize
- 返回下一页数据
         ↓
【前端 - 追加数据】
- 将新数据追加到现有列表
- 更新分页信息
- 继续监听滚动
         ↓
    ✅ 加载更多完成
```

### 3.4 接口定义
```
GET /api/items
查询参数：page, pageSize, category, keyword, sort
响应：{ success, items: [], pagination: {} }

GET /api/categories
响应：{ success, categories: [] }

GET /api/items/search
查询参数：keyword, page, pageSize
响应：{ success, items: [], total }
```

---

## 4. 查看物品详情

### 4.1 功能描述
用户可以查看物品的详细信息，包括多图轮播、完整描述、发布者信息、联系方式等。

### 4.2 用户操作流程
**步骤1：点击物品卡片**
- 从列表页跳转到详情页
- 显示加载中状态

**步骤2：浏览详情信息**
- 查看物品大图（可左右滑动/点击放大）
- 阅读物品描述
- 查看新旧程度、价格等信息
- 查看发布者信息（昵称、信誉值、历史发布数）

**步骤3：查看联系方式**
- 根据隐私设置，可能需要先登录
- 点击"查看联系方式"按钮
- 显示联系方式（微信、手机号等）

**步骤4：联系发布者**
- 复制联系方式
- 或跳转到外部应用（如微信）

### 4.3 系统内部逻辑（黑盒）

#### 4.3.1 物品详情加载
```
用户访问物品详情页：/items/item_xxx
         ↓
【前端 - 初始化】
- 从URL参数提取物品ID：item_xxx
- 显示加载骨架屏
         ↓
【API请求】GET /api/items/item_xxx
         ↓
【后端 - 权限验证】（可选）
- 检查是否需要登录（某些隐私设置）
         ↓
【后端 - 控制器层】
- 接收物品ID
- 转发至服务层
         ↓
【后端 - 服务层】
- 验证物品ID格式
- 检查物品状态（已删除的物品不返回）
         ↓
【后端 - 数据访问层】
- SQL查询物品详情：
  SELECT 
    i.*,
    u.nickname as user_nickname,
    u.avatar as user_avatar,
    u.reputation as user_reputation,
    u.item_count as user_item_count,
    c.name as category_name,
    (SELECT COUNT(*) FROM items WHERE user_id = i.user_id) as user_total_items
  FROM items i
  JOIN users u ON i.user_id = u.id
  JOIN categories c ON i.category_id = c.id
  WHERE i.id = ? AND i.status != 'deleted'
         ↓
【后端 - 数据访问层】
- SQL查询物品图片：
  SELECT 
    img.id, img.url, img.thumbnail_url, img.medium_url,
    img.width, img.height, ii.sort_order
  FROM item_images ii
  JOIN images img ON ii.image_id = img.id
  WHERE ii.item_id = ?
  ORDER BY ii.sort_order
         ↓
【后端 - 服务层】
- 组装物品数据
- 格式化价格、时间等字段
- 对联系方式进行隐私处理（根据设置）
- 判断当前用户是否可见联系方式
         ↓
【后端 - 数据库更新】
- 增加浏览量：
  UPDATE items SET view_count = view_count + 1 WHERE id = ?
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    item: {
      id: "item_xxx",
      title: "九成新iPhone 13",
      description: "使用一年，无划痕...",
      price: 3000,
      priceDisplay: "¥3000",
      condition: "9成新",
      category: "电子产品",
      status: "available",
      viewCount: 16,
      createdAt: "2026-02-22 10:30:00",
      images: [
        {
          id: "img_xxx",
          url: "https://...",
          thumbnailUrl: "https://...",
          mediumUrl: "https://...",
          width: 1920,
          height: 1080
        },
        ...
      ],
      user: {
        id: "user_xxx",
        nickname: "张三",
        avatar: "https://...",
        reputation: 120,
        itemCount: 5
      },
      contact: {
        method: "微信",
        value: "wx***5678",  // 部分隐藏
        visibility: "login_required",
        visible: true  // 当前用户是否可见
      }
    }
  }
         ↓
【前端 - 渲染详情】
- 隐藏加载骨架
- 渲染图片轮播组件
- 渲染物品信息卡片
- 渲染发布者信息卡片
- 初始化图片放大功能
         ↓
    ✅ 详情加载完成
```

#### 4.3.2 联系方式隐私控制
```
用户点击"查看联系方式"
         ↓
【前端 - 检查权限】
- 检查是否已登录（localStorage是否有token）
- 检查联系方式可见性设置
         ↓
    情况1：public（公开）
         ↓
    直接显示完整联系方式
         ↓
    情况2：login_required（需登录）
         ↓
    如果已登录 → 显示完整联系方式
    如果未登录 → 弹出登录提示 → 跳转登录页
         ↓
    情况3：transaction（交易后可见）
         ↓
    检查当前用户是否已与发布者有过交易/互动
    如果有 → 显示完整联系方式
    如果没有 → 提示"联系发布者后可查看"
         ↓
【前端 - 显示联系方式】
- 显示完整联系方式
- 提供"复制"按钮
- 提供"打开微信"按钮（如果是微信）
         ↓
    ✅ 联系方式显示完成
```

#### 4.3.3 图片放大查看
```
用户点击物品图片
         ↓
【前端 - 图片查看器】
- 打开全屏图片查看器
- 加载原图URL
- 支持手势缩放（双击、捏合）
- 支持左右滑动切换图片
- 显示当前图片索引（1/5）
         ↓
【前端 - 图片预加载】
- 预加载当前图片的前后图片
- 提升切换流畅度
         ↓
【用户操作】
- 关闭查看器或点击空白处
         ↓
    ✅ 图片查看完成
```

### 4.4 接口定义
```
GET /api/items/:id
查询参数：（可选）token（用于判断联系方式可见性）
响应：{ success, item: {} }

GET /api/items/:id/images
响应：{ success, images: [] }

POST /api/items/:id/contact
请求头：Authorization: Bearer {token}
请求体：{ message }（可选，附加留言）
响应：{ success, contactInfo, message }
```

---

## 5. 联系发布者

### 5.1 功能描述
用户可以联系物品发布者，获取联系方式并发起交易意向。

### 5.2 用户操作流程
**步骤1：在物品详情页点击"联系发布者"**
- 检查登录状态
- 未登录则跳转登录页

**步骤2：选择联系方式**
- 查看发布者提供的联系方式（微信、手机号等）
- 根据隐私设置，可能需要先发送联系请求

**步骤3：联系发布者**
- 复制联系方式
- 或直接跳转到外部应用（微信拨号等）
- 或填写简短留言后提交（平台内消息）

**步骤4：记录联系行为**
- 系统记录此次联系
- 更新联系方式可见性（如果是"交易后可见"）

### 5.3 系统内部逻辑（黑盒）

#### 5.3.1 发起联系请求
```
用户点击"联系发布者"按钮
         ↓
【前端 - 检查登录】
- 检查localStorage是否有token
         ↓
    未登录
         ↓
    弹出提示："请先登录"
    跳转到登录页
         ↓
    已登录
         ↓
【API请求】POST /api/items/item_xxx/contact
- 请求头：Authorization: Bearer {token}
- 请求体：{ message: "我对这个物品感兴趣" }（可选）
         ↓
【后端 - 权限验证】
- 验证token有效性
- 提取user_id
         ↓
【后端 - 服务层】
- 检查物品是否存在且有效
- 检查是否为自己的物品（不能联系自己）
- 检查是否已经联系过（防重复）
         ↓
【后端 - 数据访问层】
- SQL查询：
  SELECT * FROM items WHERE id = ? AND status = 'available'
- 检查user_id != 当前用户ID
         ↓
【后端 - 数据库操作】
BEGIN TRANSACTION
         ↓
【步骤1：创建联系记录】
INSERT INTO contacts (
  id, item_id, from_user_id, to_user_id, 
  message, status, created_at
) VALUES (?, ?, ?, ?, ?, 'pending', NOW())
         ↓
【步骤2：更新物品状态】
UPDATE items SET 
  status = 'reserved',  // 预留
  reserved_by = ?,
  reserved_at = NOW()
WHERE id = ?
         ↓
【步骤3：发送通知】（简化版）
- 向发布者发送通知（如推送、站内信）
         ↓
COMMIT
         ↓
【后端 - 服务层】
- 如果联系方式设置为"transaction"，更新可见性
- 联系成功的用户可以查看完整联系方式
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    contact: {
      id: "contact_xxx",
      itemTitle: "九成新iPhone 13",
      toUser: {
        nickname: "张三",
        contactMethod: "微信",
        contactValue: "wx12345678"  // 现在可见了
      },
      status: "pending",
      createdAt: "2026-02-22 11:00:00"
    },
    message: "联系请求已发送，请等待对方回复"
  }
         ↓
【前端 - 显示成功提示】
- 显示"已成功联系发布者"提示
- 显示完整联系方式
- 提供"复制"和"打开应用"按钮
         ↓
    ✅ 联系完成
```

#### 5.3.2 复制联系方式
```
用户点击"复制微信"按钮
         ↓
【前端 - 剪贴板操作】
- 调用 navigator.clipboard.writeText("wx12345678")
- 捕获成功/失败
         ↓
    成功
         ↓
    显示"已复制到剪贴板"提示
         ↓
    失败
         ↓
    显示"复制失败，请手动复制"提示
         ↓
    ✅ 复制完成
```

#### 5.3.3 打开外部应用
```
用户点击"打开微信"按钮
         ↓
【前端 - 跳转URL】
- 尝试打开微信协议：weixin://dl/chat?wx12345678
- 如果失败，提示用户手动打开
         ↓
【代码实现】
```javascript
const openWeChat = (wechatId) => {
  const wechatUrl = `weixin://dl/chat?${wechatId}`;
  window.open(wechatUrl, '_blank');
  
  // 降级方案：提示用户手动打开
  setTimeout(() => {
    alert(`请在微信中搜索: ${wechatId}`);
  }, 1000);
}
```
         ↓
    ✅ 外部跳转完成
```

### 5.4 数据表结构
```sql
-- 联系记录表
CREATE TABLE contacts (
  id VARCHAR(36) PRIMARY KEY,
  item_id VARCHAR(36) NOT NULL,
  from_user_id VARCHAR(36) NOT NULL,
  to_user_id VARCHAR(36) NOT NULL,
  message TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (from_user_id) REFERENCES users(id),
  FOREIGN KEY (to_user_id) REFERENCES users(id),
  INDEX idx_item_id (item_id),
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id)
);

-- 更新物品表，添加预留字段
ALTER TABLE items ADD COLUMN reserved_by VARCHAR(36);
ALTER TABLE items ADD COLUMN reserved_at TIMESTAMP;
```

### 5.5 接口定义
```
POST /api/items/:id/contact
请求头：Authorization: Bearer {token}
请求体：{ message }
响应：{ success, contact, message }

GET /api/contacts
请求头：Authorization: Bearer {token}
查询参数：status, type（sent/received）
响应：{ success, contacts: [], total }

PUT /api/contacts/:id/status
请求头：Authorization: Bearer {token}
请求体：{ status }（accepted/rejected/completed）
响应：{ success, contact, message }
```

---

## 6. 物品管理（编辑/删除）

### 6.1 功能描述
用户可以管理自己发布的物品，包括编辑物品信息和删除物品。

### 6.2 用户操作流程
**编辑物品：**
- 进入"我的物品"页面
- 点击物品的"编辑"按钮
- 修改物品信息
- 保存更改

**删除物品：**
- 进入"我的物品"页面
- 点击物品的"删除"按钮
- 确认删除
- 物品被标记为删除（软删除）

### 6.3 系统内部逻辑（黑盒）

#### 6.3.1 编辑物品
```
用户点击"编辑物品"按钮
         ↓
【前端 - 跳转编辑页】
- 跳转到 /items/item_xxx/edit
- 显示编辑表单（预填充当前数据）
         ↓
用户修改信息并点击"保存"
         ↓
【前端 - 表单验证】
- 验证必填字段
- 验证字段长度限制
         ↓
【API请求】PUT /api/items/item_xxx
- 请求头：Authorization: Bearer {token}
- 请求体：{ title, categoryId, description, price, condition, contactMethod, contactValue, contactVisibility, imageIds }
         ↓
【后端 - 权限验证】
- 验证token
- 提取user_id
         ↓
【后端 - 服务层】
- 检查物品是否存在
- 检查物品是否属于当前用户
- 检查物品状态（已售出的物品不能编辑）
         ↓
【后端 - 数据库操作】
BEGIN TRANSACTION
         ↓
【步骤1：更新物品信息】
UPDATE items SET
  title = ?,
  category_id = ?,
  description = ?,
  price = ?,
  condition = ?,
  contact_method = ?,
  contact_value = ?,
  contact_visibility = ?,
  updated_at = NOW()
WHERE id = ? AND user_id = ?
         ↓
【步骤2：更新图片关联】（如果图片有变化）
- 删除旧的图片关联：DELETE FROM item_images WHERE item_id = ?
- 插入新的图片关联：INSERT INTO item_images ...
         ↓
COMMIT
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    item: {
      id: "item_xxx",
      title: "九成新iPhone 13 Pro",  // 更新后的标题
      ...
    },
    message: "物品更新成功"
  }
         ↓
【前端 - 显示成功提示】
- 显示"保存成功"提示
- 跳转回物品详情页
         ↓
    ✅ 编辑完成
```

#### 6.3.2 删除物品
```
用户点击"删除物品"按钮
         ↓
【前端 - 确认对话框】
- 显示"确定要删除这个物品吗？"确认框
- 确认后执行删除
         ↓
【API请求】DELETE /api/items/item_xxx
- 请求头：Authorization: Bearer {token}
         ↓
【后端 - 权限验证】
- 验证token
- 提取user_id
         ↓
【后端 - 服务层】
- 检查物品是否存在
- 检查物品是否属于当前用户
         ↓
【后端 - 数据库操作】
- 软删除：UPDATE items SET status = 'deleted' WHERE id = ? AND user_id = ?
- （不物理删除，保留数据用于统计、纠纷处理等）
         ↓
【后端 - 服务层】
- 更新用户统计：UPDATE users SET item_count = item_count - 1 WHERE id = ?
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    message: "物品已删除"
  }
         ↓
【前端 - 响应处理】
- 显示"删除成功"提示
- 从列表中移除该物品
- 如果是详情页，跳转回"我的物品"页
         ↓
    ✅ 删除完成
```

### 6.4 接口定义
```
PUT /api/items/:id
请求头：Authorization: Bearer {token}
请求体：{ ...updates }
响应：{ success, item, message }

DELETE /api/items/:id
请求头：Authorization: Bearer {token}
响应：{ success, message }
```

---

## 7. 我的物品页面

### 7.1 功能描述
用户可以查看自己发布的所有物品，并进行管理操作。

### 7.2 用户操作流程
**步骤1：进入"我的物品"页面**
- 显示物品列表（已发布、已售出、已删除等）

**步骤2：筛选物品**
- 按状态筛选：全部、可交易、已预留、已售出

**步骤3：管理物品**
- 点击"编辑"修改物品
- 点击"删除"删除物品
- 查看每个物品的浏览量、联系次数等数据

### 7.3 系统内部逻辑（黑盒）

```
用户访问"我的物品"页面
         ↓
【前端 - 初始化】
- 显示加载中
         ↓
【API请求】GET /api/items/mine
- 请求头：Authorization: Bearer {token}
- 查询参数：status=all&page=1&pageSize=10
         ↓
【后端 - 权限验证】
- 验证token
- 提取user_id
         ↓
【后端 - 数据访问层】
- SQL查询：
  SELECT 
    i.*,
    c.name as category_name,
    (SELECT COUNT(*) FROM contacts WHERE item_id = i.id) as contact_count
  FROM items i
  LEFT JOIN categories c ON i.category_id = c.id
  WHERE i.user_id = ?
    AND (i.status = ? OR ? = 'all')
  ORDER BY i.created_at DESC
  LIMIT ? OFFSET ?
         ↓
【后端 - 服务层】
- 统计各状态数量：
  SELECT status, COUNT(*) as count FROM items WHERE user_id = ? GROUP BY status
         ↓
【后端 - 响应层】
- 返回数据：{
    success: true,
    items: [...],
    stats: {
      available: 3,
      reserved: 1,
      sold: 2,
      deleted: 0
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 6
    }
  }
         ↓
【前端 - 渲染列表】
- 显示物品卡片
- 显示状态标签
- 显示操作按钮（编辑/删除）
- 显示统计数据
         ↓
    ✅ 页面加载完成
```

### 7.4 接口定义
```
GET /api/items/mine
请求头：Authorization: Bearer {token}
查询参数：status, page, pageSize
响应：{ success, items: [], stats: {}, pagination: {} }
```

---

## 8. 通用功能

### 8.1 图片上传
已在"发布物品"章节详细描述。

### 8.2 验证码发送
```
用户点击"发送验证码"
         ↓
【前端 - 手机号验证】
- 验证手机号格式
- 检查是否在倒计时中
         ↓
【API请求】POST /api/auth/send-code
- 请求体：{ phone }
         ↓
【后端 - 服务层】
- 检查手机号格式
- 检查发送频率（60秒内只能发送一次）
- 生成6位随机验证码
         ↓
【后端 - 缓存存储】
- 存储到Redis：key=code:phone:xxx, value=123456, ttl=300秒
         ↓
【后端 - 短信发送】
- 调用短信服务API
- 发送验证码到用户手机
         ↓
【后端 - 响应层】
- 返回数据：{ success: true, message: "验证码已发送" }
         ↓
【前端 - 开始倒计时】
- 60秒倒计时
- 显示"60秒后重新发送"
- 倒计时结束后恢复"发送验证码"按钮
         ↓
    ✅ 验证码发送完成
```

### 8.3 错误处理
```
【前端 - 统一错误处理】
- HTTP 401: 未授权 → 跳转登录页
- HTTP 403: 禁止访问 → 提示权限不足
- HTTP 404: 资源不存在 → 提示"内容不存在"
- HTTP 422: 参数错误 → 提示具体错误信息
- HTTP 500: 服务器错误 → 提示"系统错误，请稍后重试"

【后端 - 错误日志】
- 记录错误堆栈
- 记录请求信息
- 发送告警（如需）
```

---

## 9. 数据统计

### 9.1 用户统计
```sql
-- 用户注册数
SELECT COUNT(*) FROM users WHERE created_at >= ?

-- 活跃用户数（最近7天有登录）
SELECT COUNT(*) FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)
```

### 9.2 物品统计
```sql
-- 总物品数
SELECT COUNT(*) FROM items WHERE status = 'available'

-- 今日新增物品
SELECT COUNT(*) FROM items WHERE DATE(created_at) = CURDATE()

-- 已售出物品
SELECT COUNT(*) FROM items WHERE status = 'sold'
```

### 9.3 联系统计
```sql
-- 总联系次数
SELECT COUNT(*) FROM contacts

-- 成功交易数
SELECT COUNT(*) FROM contacts WHERE status = 'completed'
```

---

## 10. 性能优化建议

### 10.1 数据库优化
- 为常用查询字段添加索引
- 使用读写分离（如有高并发需求）
- 考虑使用缓存热点数据

### 10.2 前端优化
- 图片懒加载
- 列表虚拟滚动（如果列表很长）
- CDN加速静态资源

### 10.3 API优化
- 接口响应压缩（gzip）
- 分页查询限制返回数据量
- 缓存热门物品列表

---

## 附录

### A. 技术栈建议
- **前端**：React/Vue + TDesign/Vant
- **后端**：Node.js (Express/Koa) 或 Python (FastAPI)
- **数据库**：MySQL 8.0+
- **缓存**：Redis
- **存储**：阿里云OSS / 腾讯云COS
- **部署**：云服务（腾讯云/阿里云）

### B. 安全考虑
- HTTPS加密传输
- 密码bcrypt加密存储
- SQL注入防护（使用参数化查询）
- XSS防护（前端转义、CSP）
- CSRF防护（Token验证）
- 文件上传类型和大小限制
- API限流（防刷）

### C. 开发计划
**第1周：**
- Day 1-2: 用户注册/登录
- Day 3-4: 物品发布功能
- Day 5-6: 物品浏览列表
- Day 7: 联系发布者

**第2周：**
- Day 1-2: 物品详情页
- Day 3: 我的物品管理
- Day 4: UI/UX优化
- Day 5: 测试和Bug修复
- Day 6-7: 部署上线

---

**文档结束**
