@echo off
echo ========================================
echo 社区闲置物品交换平台 - 启动脚本
echo ========================================
echo.

echo 正在检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js已安装
echo.

echo 正在检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖，请稍候...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo [OK] 依赖安装完成
) else (
    echo [OK] 依赖已存在
)

echo.
echo ========================================
echo 正在启动服务器...
echo ========================================
echo.
echo 服务器地址：http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo.

node server.js

pause
