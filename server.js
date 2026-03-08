/**
 * 社区闲置物品交换平台 - 后端服务器
 * 技术栈：Node.js + Express + SQLite
 * 功能：用户认证、物品管理、图片上传、联系功能
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'community-share-secret-key-2024';

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 允许跨域（开发用）
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 创建uploads目录
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件（jpeg, jpg, png, webp）'));
        }
    }
});

// 初始化数据库
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('已连接到SQLite数据库');
        initDatabase();
    }
});

// 初始化数据库表（使用 serialize 保证顺序执行）
function initDatabase() {
    db.serialize(() => {
        // 用户表
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            nickname TEXT DEFAULT '',
            avatar TEXT DEFAULT '',
            reputation INTEGER DEFAULT 100,
            item_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('创建 users 表失败:', err.message);
        });

        // 分类表
        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT DEFAULT '',
            sort_order INTEGER DEFAULT 0
        )`, (err) => {
            if (err) console.error('创建 categories 表失败:', err.message);
        });

        // 物品表
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            price REAL,
            condition TEXT NOT NULL,
            contact_method TEXT NOT NULL,
            contact_value TEXT NOT NULL,
            contact_visibility TEXT DEFAULT 'login_required',
            status TEXT DEFAULT 'available',
            view_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )`, (err) => {
            if (err) console.error('创建 items 表失败:', err.message);
        });

        // 物品图片表
        db.run(`CREATE TABLE IF NOT EXISTS item_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error('创建 item_images 表失败:', err.message);
        });

        // 联系记录表
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            from_user_id INTEGER NOT NULL,
            to_user_id INTEGER NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
            FOREIGN KEY (from_user_id) REFERENCES users(id),
            FOREIGN KEY (to_user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error('创建 contacts 表失败:', err.message);
        });

        // 用户浏览记录表（用于个性化推荐）
        db.run(`CREATE TABLE IF NOT EXISTS user_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
            UNIQUE(user_id, item_id)
        )`, (err) => {
            if (err) console.error('创建 user_views 表失败:', err.message);
        });

        // 初始化分类数据（确保表已创建）
        const categories = [
            ['数码电子', '📱', 1],
            ['家居用品', '🏠', 2],
            ['服装鞋帽', '👕', 3],
            ['图书音像', '📚', 4],
            ['运动户外', '⚽', 5],
            ['母婴用品', '👶', 6],
            ['乐器', '🎸', 7],
            ['其他', '📦', 99]
        ];

        const stmt = db.prepare('INSERT OR IGNORE INTO categories (name, icon, sort_order) VALUES (?, ?, ?)');
        categories.forEach(cat => {
            stmt.run(cat, function(err) {
                if (err) {
                    console.error('插入分类数据失败:', err.message);
                }
            });
        });
        stmt.finalize((err) => {
            if (err) console.error('finalize 失败:', err.message);
        });

        console.log('数据库表初始化完成');
    });
}

// JWT认证中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: { code: 4001, message: '未登录' } });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: { code: 4002, message: 'token无效或已过期' } });
        }
        req.user = user;
        next();
    });
}

// 统一响应格式
function successResponse(data, message = '操作成功') {
    return { success: true, data, message };
}

function errorResponse(code, message, details = {}) {
    return { success: false, error: { code, message, details } };
}

// ==================== 认证接口 ====================

// 用户注册
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { phone, password, nickname } = req.body;

        // 参数验证
        if (!phone || !password) {
            return res.status(400).json(errorResponse(1002, '手机号和密码不能为空'));
        }

        if (!/^1\d{10}$/.test(phone)) {
            return res.status(400).json(errorResponse(1001, '手机号格式不正确'));
        }

        if (password.length < 6) {
            return res.status(400).json(errorResponse(1001, '密码长度不能少于6位'));
        }

        // 检查手机号是否已注册
        db.get('SELECT id FROM users WHERE phone = ?', [phone], async (err, user) => {
            if (err) {
                return res.status(500).json(errorResponse(9999, '服务器错误'));
            }

            if (user) {
                return res.status(409).json(errorResponse(2003, '该手机号已注册'));
            }

            // 加密密码
            const hashedPassword = await bcrypt.hash(password, 10);

            // 创建用户
            const defaultNickname = nickname || `用户${phone.slice(-4)}`;
            db.run(
                'INSERT INTO users (phone, password, nickname) VALUES (?, ?, ?)',
                [phone, hashedPassword, defaultNickname],
                function(err) {
                    if (err) {
                        return res.status(500).json(errorResponse(9999, '注册失败'));
                    }

                    // 生成token
                    const token = jwt.sign(
                        { id: this.lastID, phone, nickname: defaultNickname },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    res.json(successResponse({
                        token,
                        user: {
                            id: this.lastID,
                            phone,
                            nickname: defaultNickname,
                            avatar: ''
                        }
                    }, '注册成功'));
                }
            );
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json(errorResponse(9999, '服务器错误'));
    }
});

// 用户登录
app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // 参数验证
        if (!phone || !password) {
            return res.status(400).json(errorResponse(1002, '手机号和密码不能为空'));
        }

        // 查询用户
        db.get('SELECT * FROM users WHERE phone = ?', [phone], async (err, user) => {
            if (err) {
                return res.status(500).json(errorResponse(9999, '服务器错误'));
            }

            if (!user) {
                return res.status(404).json(errorResponse(2001, '用户不存在'));
            }

            // 验证密码
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json(errorResponse(2002, '密码错误'));
            }

            // 更新最后登录时间
            db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

            // 生成token
            const token = jwt.sign(
                { id: user.id, phone: user.phone, nickname: user.nickname },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json(successResponse({
                token,
                user: {
                    id: user.id,
                    phone: user.phone,
                    nickname: user.nickname,
                    avatar: user.avatar,
                    reputation: user.reputation,
                    itemCount: user.item_count
                }
            }, '登录成功'));
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json(errorResponse(9999, '服务器错误'));
    }
});

// 获取当前用户信息
app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
    db.get(
        'SELECT id, phone, nickname, avatar, reputation, item_count, created_at FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
            if (err) {
                return res.status(500).json(errorResponse(9999, '服务器错误'));
            }

            if (!user) {
                return res.status(404).json(errorResponse(2001, '用户不存在'));
            }

            res.json(successResponse(user));
        }
    );
});

// ==================== 分类接口 ====================

// 获取所有分类
app.get('/api/v1/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY sort_order', [], (err, rows) => {
        if (err) {
            return res.status(500).json(errorResponse(9999, '服务器错误'));
        }
        res.json(successResponse(rows));
    });
});

// ==================== 物品接口 ====================

// 获取我的物品（必须先于 /:id）
app.get('/api/v1/items/mine', authenticateToken, (req, res) => {
    const { page = 1, pageSize = 10, status = 'all' } = req.query;
    const offset = (page - 1) * pageSize;

    let query = `
        SELECT 
            i.id, i.title, i.price, i.status, i.view_count, i.created_at,
            (SELECT image_url FROM item_images WHERE item_id = i.id ORDER BY sort_order LIMIT 1) as thumbnail_url,
            (SELECT COUNT(*) FROM contacts WHERE item_id = i.id) as contact_count
        FROM items i
        WHERE i.user_id = ?
    `;

    const params = [req.user.id];

    if (status !== 'all') {
        query += ' AND i.status = ?';
        params.push(status);
    }

    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    db.all(query, params, (err, items) => {
        if (err) {
            return res.status(500).json(errorResponse(9999, '服务器错误'));
        }

        // 获取统计数据
        db.all(`
            SELECT status, COUNT(*) as count 
            FROM items 
            WHERE user_id = ? 
            GROUP BY status
        `, [req.user.id], (err, stats) => {
            if (err) {
                return res.status(500).json(errorResponse(9999, '服务器错误'));
            }

            const statsMap = {
                available: 0,
                reserved: 0,
                sold: 0,
                deleted: 0
            };

            stats.forEach(stat => {
                statsMap[stat.status] = stat.count;
            });

            const formattedItems = items.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                priceDisplay: item.price ? `¥${item.price}` : '免费/面议',
                status: item.status,
                viewCount: item.view_count,
                contactCount: item.contact_count,
                thumbnailUrl: item.thumbnail_url ? `/uploads/${item.thumbnail_url}` : '/images/placeholder.png',
                createdAt: formatDate(item.created_at)
            }));

            res.json(successResponse(formattedItems, null, {
                stats: statsMap,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: items.length
                }
            }));
        });
    });
});

// 获取物品列表
app.get('/api/v1/items', (req, res) => {
    const { page = 1, pageSize = 20, category, keyword, sort = 'newest' } = req.query;
    const offset = (page - 1) * pageSize;

    let query = `
        SELECT 
            i.id, i.title, i.price, i.condition, i.status, i.view_count, i.created_at,
            c.name as category_name,
            u.id as user_id, u.nickname as user_nickname, u.avatar as user_avatar,
            (SELECT image_url FROM item_images WHERE item_id = i.id ORDER BY sort_order LIMIT 1) as thumbnail_url
        FROM items i
        JOIN categories c ON i.category_id = c.id
        JOIN users u ON i.user_id = u.id
        WHERE i.status = 'available'
    `;

    const params = [];

    // 分类筛选
    if (category) {
        query += ' AND i.category_id = ?';
        params.push(category);
    }

    // 关键词搜索
    if (keyword) {
        query += ' AND (i.title LIKE ? OR i.description LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 排序
    if (sort === 'newest') {
        query += ' ORDER BY i.created_at DESC';
    } else if (sort === 'price_asc') {
        query += ' ORDER BY i.price ASC NULLS LAST';
    } else if (sort === 'price_desc') {
        query += ' ORDER BY i.price DESC NULLS LAST';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    db.all(query, params, (err, items) => {
        if (err) {
            return res.status(500).json(errorResponse(9999, '服务器错误'));
        }

        // 获取总数
        let countQuery = 'SELECT COUNT(*) as total FROM items i WHERE i.status = "available"';
        const countParams = [];

        if (category) {
            countQuery += ' AND i.category_id = ?';
            countParams.push(category);
        }

        if (keyword) {
            countQuery += ' AND (i.title LIKE ? OR i.description LIKE ?)';
            countParams.push(`%${keyword}%`, `%${keyword}%`);
        }

        db.get(countQuery, countParams, (err, countResult) => {
            if (err) {
                return res.status(500).json(errorResponse(9999, '服务器错误'));
            }

            const total = countResult.total;
            const totalPages = Math.ceil(total / pageSize);

            // 格式化数据
            const formattedItems = items.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                priceDisplay: item.price ? `¥${item.price}` : '免费/面议',
                condition: item.condition,
                thumbnailUrl: item.thumbnail_url ? `/uploads/${item.thumbnail_url}` : '/images/placeholder.png',
                user: {
                    id: item.user_id,
                    nickname: item.user_nickname,
                    avatar: item.avatar || '/images/default-avatar.png'
                },
                category: {
                    id: 1,
                    name: item.category_name
                },
                status: item.status,
                viewCount: item.view_count,
                createdAt: formatDate(item.created_at)
            }));

            res.json(successResponse(formattedItems, '获取成功', {
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                total,
                totalPages
            }));
        });
    });
});

// 记录用户浏览行为（用于个性化推荐）
app.post('/api/v1/items/:id/view', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // 验证物品是否存在
    db.get('SELECT id FROM items WHERE id = ?', [id], (err, item) => {
        if (err) {
            return res.status(500).json(errorResponse(9999, '服务器错误'));
        }
        if (!item) {
            return res.status(404).json(errorResponse(3001, '物品不存在'));
        }

        // 插入或更新浏览记录（使用 INSERT OR REPLACE 处理唯一约束）
        db.run(
            `INSERT OR REPLACE INTO user_views (user_id, item_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [userId, id],
            (err) => {
                if (err) {
                    console.error('记录浏览行为失败:', err);
                    return res.status(500).json(errorResponse(9999, '记录浏览行为失败'));
                }
                res.json(successResponse(null, '浏览记录已保存'));
            }
        );
    });
});

// 获取个性化推荐物品
app.get('/api/v1/items/recommendations', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // 查询用户最近浏览的3个物品的分类和关键词
    const recentViewsQuery = `
        SELECT i.id, i.category_id, i.title, i.description
        FROM user_views uv
        JOIN items i ON uv.item_id = i.id
        WHERE uv.user_id = ?
        ORDER BY uv.created_at DESC
        LIMIT 3
    `;

    db.all(recentViewsQuery, [userId], (err, recentItems) => {
        if (err) {
            console.error('查询浏览记录失败:', err);
            return res.status(500).json(errorResponse(9999, '服务器错误'));
        }

        // 如果没有浏览记录，返回空数组
        if (!recentItems || recentItems.length === 0) {
            return res.json(successResponse([], '暂无推荐'));
        }

        // 提取分类ID和关键词
        const categoryIds = [...new Set(recentItems.map(item => item.category_id))];
        const keywords = [];
        recentItems.forEach(item => {
            // 从标题中提取关键词（长度大于2的中文词）
            const titleWords = item.title.match(/[\u4e00-\u9fa5]{2,}/g) || [];
            keywords.push(...titleWords);
        });
        const uniqueKeywords = [...new Set(keywords)].slice(0, 5); // 最多取5个关键词

        // 构建推荐查询
        let recommendQuery = `
            SELECT 
                i.id, i.title, i.price, i.condition, i.status, i.view_count, i.created_at,
                c.name as category_name,
                u.id as user_id, u.nickname as user_nickname, u.avatar as user_avatar,
                (SELECT image_url FROM item_images WHERE item_id = i.id ORDER BY sort_order LIMIT 1) as thumbnail_url
            FROM items i
            JOIN categories c ON i.category_id = c.id
            JOIN users u ON i.user_id = u.id
            WHERE i.status = 'available'
            AND i.user_id != ?
            AND i.id NOT IN (
                SELECT item_id FROM user_views WHERE user_id = ?
            )
        `;

        const params = [userId, userId];

        // 添加分类筛选条件
        if (categoryIds.length > 0) {
            const placeholders = categoryIds.map(() => '?').join(',');
            recommendQuery += ` AND (i.category_id IN (${placeholders})`;
            params.push(...categoryIds);

            // 添加关键词筛选条件
            if (uniqueKeywords.length > 0) {
                recommendQuery += ` OR (`;
                const keywordConditions = uniqueKeywords.map(() => `i.title LIKE ?`).join(' OR ');
                recommendQuery += keywordConditions + `)`;
                params.push(...uniqueKeywords.map(kw => `%${kw}%`));
            }
            recommendQuery += `)`;
        }

        // 排序：分类匹配优先，然后是最新发布
        recommendQuery += ` ORDER BY 
            CASE WHEN i.category_id IN (${categoryIds.map(() => '?').join(',')}) THEN 0 ELSE 1 END,
            i.created_at DESC
            LIMIT ?`;
        params.push(...categoryIds, parseInt(limit));

        db.all(recommendQuery, params, (err, items) => {
            if (err) {
                console.error('查询推荐物品失败:', err);
                return res.status(500).json(errorResponse(9999, '服务器错误'));
            }

            // 格式化数据
            const formattedItems = items.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                priceDisplay: item.price ? `¥${item.price}` : '免费/面议',
                condition: item.condition,
                thumbnailUrl: item.thumbnail_url ? `/uploads/${item.thumbnail_url}` : '/images/placeholder.png',
                user: {
                    id: item.user_id,
                    nickname: item.user_nickname,
                    avatar: item.avatar || '/images/default-avatar.png'
                },
                category: {
                    id: 1,
                    name: item.category_name
                },
                status: item.status,
                viewCount: item.view_count,
                createdAt: formatDate(item.created_at)
            }));

            res.json(successResponse(formattedItems, '获取推荐成功'));
        });
    });
});

// 获取物品详情
app.get('/api/v1/items/:id', (req, res) => {
    const { id } = req.params;

    // 增加浏览量
    db.run('UPDATE items SET view_count = view_count + 1 WHERE id = ?', [id]);

    // 查询物品信息
    const query = `
        SELECT 
            i.*,
            c.name as category_name,
            u.id as user_id, u.nickname as user_nickname, u.avatar as user_avatar, u.reputation
        FROM items i
        JOIN categories c ON i.category_id = c.id
        JOIN users u ON i.user_id = u.id
        WHERE i.id = ?
    `;

    db.get(query, [id], (err, item) => {
        if (err) {
            return res.status(500).json(errorResponse(9999, '服务器错误'));
        }

        if (!item) {
            return res.status(404).json(errorResponse(3001, '物品不存在'));
        }

        // 查询图片
        db.all(
            'SELECT image_url FROM item_images WHERE item_id = ? ORDER BY sort_order',
            [id],
            (err, images) => {
                if (err) {
                    return res.status(500).json(errorResponse(9999, '服务器错误'));
                }

                // 判断联系方式是否可见
                const isVisible = req.user && (
                    item.contact_visibility === 'public' ||
                    item.contact_visibility === 'login_required' ||
                    (req.user.id === item.user_id)
                );

                const formattedItem = {
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    priceDisplay: item.price ? `¥${item.price}` : '免费/面议',
                    condition: item.condition,
                    category: {
                        id: item.category_id,
                        name: item.category_name
                    },
                    status: item.status,
                    viewCount: item.view_count,
                    createdAt: formatDate(item.created_at),
                    images: images.map(img => ({
                        url: `/uploads/${img.image_url}`
                    })),
                    user: {
                        id: item.user_id,
                        nickname: item.user_nickname,
                        avatar: item.avatar || '/images/default-avatar.png',
                        reputation: item.reputation
                    },
                    contact: {
                        method: item.contact_method,
                        value: isVisible ? item.contact_value : '***',
                        visibility: item.contact_visibility,
                        visible: isVisible
                    },
                    isOwner: req.user && req.user.id === item.user_id
                };

                res.json(successResponse(formattedItem));
            }
        );
    });
});

// 发布物品
app.post('/api/v1/items', authenticateToken, upload.array('images', 5), (req, res) => {
    const { title, categoryId, description, price, condition, contactMethod, contactValue, contactVisibility } = req.body;

    // 参数验证
    if (!title || !categoryId || !description || !condition || !contactMethod || !contactValue) {
        return res.status(400).json(errorResponse(1002, '请填写完整信息'));
    }

    // 验证分类是否存在
    db.get('SELECT id FROM categories WHERE id = ?', [categoryId], (err, category) => {
        if (err || !category) {
            return res.status(400).json(errorResponse(1001, '分类不存在'));
        }

        // 创建物品
        db.run(
            `INSERT INTO items (user_id, title, category_id, description, price, condition, contact_method, contact_value, contact_visibility)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                title,
                categoryId,
                description,
                price || null,
                condition,
                contactMethod,
                contactValue,
                contactVisibility || 'login_required'
            ],
            function(err) {
                if (err) {
                    console.error('创建物品错误:', err);
                    return res.status(500).json(errorResponse(9999, '发布失败'));
                }

                // 保存图片
                if (req.files && req.files.length > 0) {
                    const stmt = db.prepare('INSERT INTO item_images (item_id, image_url, sort_order) VALUES (?, ?, ?)');
                    req.files.forEach((file, index) => {
                        stmt.run([this.lastID, file.filename, index]);
                    });
                    stmt.finalize();
                }

                // 更新用户物品数量
                db.run('UPDATE users SET item_count = item_count + 1 WHERE id = ?', [req.user.id]);

                res.json(successResponse({
                    id: this.lastID,
                    title,
                    url: `/detail.html?id=${this.lastID}`
                }, '物品发布成功'));
            }
        );
    });
});

// 更新物品
app.put('/api/v1/items/:id', authenticateToken, upload.array('images', 5), (req, res) => {
    const { id } = req.params;
    const { title, categoryId, description, price, condition, contactMethod, contactValue, contactVisibility } = req.body;

    // 验证权限
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
        if (err || !item) {
            return res.status(404).json(errorResponse(3001, '物品不存在'));
        }

        if (item.user_id !== req.user.id) {
            return res.status(403).json(errorResponse(3003, '无权操作此物品'));
        }

        // 更新物品
        db.run(
            `UPDATE items SET 
                title = ?, category_id = ?, description = ?, price = ?, 
                condition = ?, contact_method = ?, contact_value = ?, contact_visibility = ?,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                title,
                categoryId,
                description,
                price || null,
                condition,
                contactMethod,
                contactValue,
                contactVisibility || 'login_required',
                id
            ],
            (err) => {
                if (err) {
                    return res.status(500).json(errorResponse(9999, '更新失败'));
                }

                // 更新图片
                if (req.files && req.files.length > 0) {
                    // 删除旧图片
                    db.run('DELETE FROM item_images WHERE item_id = ?', [id], () => {
                        // 添加新图片
                        const stmt = db.prepare('INSERT INTO item_images (item_id, image_url, sort_order) VALUES (?, ?, ?)');
                        req.files.forEach((file, index) => {
                            stmt.run([id, file.filename, index]);
                        });
                        stmt.finalize();
                    });
                }

                res.json(successResponse({ id, title }, '物品更新成功'));
            }
        );
    });
});

// 删除物品
app.delete('/api/v1/items/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    // 验证权限
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
        if (err || !item) {
            return res.status(404).json(errorResponse(3001, '物品不存在'));
        }

        if (item.user_id !== req.user.id) {
            return res.status(403).json(errorResponse(3003, '无权操作此物品'));
        }

        // 软删除
        db.run('UPDATE items SET status = "deleted" WHERE id = ?', [id], (err) => {
            if (err) {
                return res.status(500).json(errorResponse(9999, '删除失败'));
            }

            // 更新用户物品数量
            db.run('UPDATE users SET item_count = item_count - 1 WHERE id = ?', [req.user.id]);

            res.json(successResponse(null, '物品已删除'));
        });
    });
});

// ==================== 联系接口 ====================

// 联系发布者
app.post('/api/v1/items/:id/contact', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    // 查询物品
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
        if (err || !item) {
            return res.status(404).json(errorResponse(3001, '物品不存在'));
        }

        if (item.user_id === req.user.id) {
            return res.status(400).json(errorResponse(1001, '不能联系自己的物品'));
        }

        // 检查是否已经联系过
        db.get(
            'SELECT * FROM contacts WHERE item_id = ? AND from_user_id = ?',
            [id, req.user.id],
            (err, contact) => {
                if (contact) {
                    return res.status(400).json(errorResponse(1001, '您已经联系过这个物品了'));
                }

                // 创建联系记录
                db.run(
                    'INSERT INTO contacts (item_id, from_user_id, to_user_id, message) VALUES (?, ?, ?, ?)',
                    [id, req.user.id, item.user_id, message || ''],
                    function(err) {
                        if (err) {
                            return res.status(500).json(errorResponse(9999, '联系失败'));
                        }

                        // 更新物品状态
                        db.run('UPDATE items SET status = "reserved" WHERE id = ?', [id]);

                        // 返回发布者信息
                        db.get(
                            'SELECT * FROM users WHERE id = ?',
                            [item.user_id],
                            (err, user) => {
                                if (err || !user) {
                                    return res.status(500).json(errorResponse(9999, '获取信息失败'));
                                }

                                const contactMethodNames = {
                                    '微信': 'WECHAT',
                                    '手机号': 'PHONE',
                                    'QQ': 'QQ'
                                };

                                res.json(successResponse({
                                    id: this.lastID,
                                    itemTitle: item.title,
                                    toUser: {
                                        id: user.id,
                                        nickname: user.nickname,
                                        contactMethod: item.contact_method,
                                        contactValue: item.contact_value
                                    },
                                    status: 'pending',
                                    createdAt: new Date().toISOString()
                                }, '联系请求已发送，请等待对方回复'));
                            }
                        );
                    }
                );
            }
        );
    });
});

// 获取联系记录
app.get('/api/v1/contacts', authenticateToken, (req, res) => {
    const { page = 1, pageSize = 10, status = 'all', type = 'all' } = req.query;
    const offset = (page - 1) * pageSize;

    let query = `
        SELECT 
            c.id, c.message, c.status, c.created_at,
            i.id as item_id, i.title as item_title,
            i.price as item_price,
            (SELECT image_url FROM item_images WHERE item_id = i.id ORDER BY sort_order LIMIT 1) as item_thumbnail,
            u_from.id as from_user_id, u_from.nickname as from_user_nickname,
            u_to.id as to_user_id, u_to.nickname as to_user_nickname
        FROM contacts c
        JOIN items i ON c.item_id = i.id
        JOIN users u_from ON c.from_user_id = u_from.id
        JOIN users u_to ON c.to_user_id = u_to.id
        WHERE c.from_user_id = ? OR c.to_user_id = ?
    `;

    const params = [req.user.id, req.user.id];

    if (type === 'sent') {
        query = query.replace('WHERE c.from_user_id = ? OR c.to_user_id = ?', 'WHERE c.from_user_id = ?');
        params.pop();
    } else if (type === 'received') {
        query = query.replace('WHERE c.from_user_id = ? OR c.to_user_id = ?', 'WHERE c.to_user_id = ?');
        params.shift();
    }

    if (status !== 'all') {
        query += ' AND c.status = ?';
        params.push(status);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    db.all(query, params, (err, contacts) => {
        if (err) {
            return res.status(500).json(errorResponse(9999, '服务器错误'));
        }

        const formattedContacts = contacts.map(contact => ({
            id: contact.id,
            item: {
                id: contact.item_id,
                title: contact.item_title,
                price: contact.item_price,
                thumbnailUrl: contact.item_thumbnail ? `/uploads/${contact.item_thumbnail}` : '/images/placeholder.png'
            },
            fromUser: {
                id: contact.from_user_id,
                nickname: contact.from_user_nickname
            },
            toUser: {
                id: contact.to_user_id,
                nickname: contact.to_user_nickname
            },
            message: contact.message,
            status: contact.status,
            createdAt: formatDate(contact.created_at)
        }));

        res.json(successResponse(formattedContacts, null, {
            pagination: {
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                total: contacts.length
            }
        }));
    });
});

// 更新联系状态
app.put('/api/v1/contacts/:id/status', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // 验证权限
    db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, contact) => {
        if (err || !contact) {
            return res.status(404).json(errorResponse(1001, '联系记录不存在'));
        }

        if (contact.to_user_id !== req.user.id) {
            return res.status(403).json(errorResponse(3003, '无权操作此联系记录'));
        }

        // 更新状态
        db.run(
            'UPDATE contacts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id],
            (err) => {
                if (err) {
                    return res.status(500).json(errorResponse(9999, '更新失败'));
                }

                res.json(successResponse({ id, status }, '状态更新成功'));
            }
        );
    });
});

// ==================== 工具函数 ====================

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;

    return date.toLocaleDateString('zh-CN');
}

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 404处理
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json(errorResponse(9999, 'API不存在'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json(errorResponse(9999, '服务器错误', { details: err.message }));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 服务器已启动`);
    console.log(`📡 地址: http://localhost:${PORT}`);
    console.log(`========================================\n`);
});