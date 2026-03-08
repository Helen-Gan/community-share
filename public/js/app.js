/**
 * 全局JavaScript文件
 * 包含认证、API调用、提示消息等通用功能
 */

// 检查登录状态
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // 更新导航栏
    const navLogin = document.querySelector('.nav-login');
    const navRegister = document.querySelector('.nav-register');
    const navUser = document.querySelector('.nav-user');
    const navLogout = document.querySelector('.nav-logout');
    const navMyItems = document.querySelector('.nav-myitems');
    const navPublish = document.querySelector('.nav-publish');

    if (token && user.id) {
        // 已登录
        if (navLogin) navLogin.style.display = 'none';
        if (navRegister) navRegister.style.display = 'none';
        if (navUser) {
            navUser.textContent = user.nickname;
            navUser.style.display = 'inline';
        }
        if (navLogout) navLogout.style.display = 'inline';
        if (navMyItems) navMyItems.style.display = 'inline';
        if (navPublish) navPublish.style.display = 'inline';
    } else {
        // 未登录
        if (navLogin) navLogin.style.display = 'inline';
        if (navRegister) navRegister.style.display = 'inline';
        if (navUser) navUser.style.display = 'none';
        if (navLogout) navLogout.style.display = 'none';
        if (navMyItems) navMyItems.style.display = 'none';
        if (navPublish) navPublish.style.display = 'none';
    }

    // 退出登录
    if (navLogout) {
        navLogout.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('已退出登录', 'success');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 3秒后自动消失
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// API请求封装
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const result = await response.json();

        // 处理401未授权
        if (response.status === 401) {
            logout();
            return null;
        }

        return result;
    } catch (error) {
        console.error('API请求失败:', error);
        showToast('网络错误，请重试', 'error');
        return null;
    }
}

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

// 格式化价格
function formatPrice(price) {
    if (!price) return '免费/面议';
    return `¥${price}`;
}

// 格式化数量（如浏览量、收藏数）
function formatCount(count) {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
}

// 复制到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板', 'success');
        return true;
    } catch (error) {
        console.error('复制失败:', error);
        showToast('复制失败', 'error');
        return false;
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 图片懒加载
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
});
