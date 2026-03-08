#!/bin/bash

echo "========================================"
echo "社区闲置物品交换平台 - 启动脚本"
echo "========================================"
echo ""

echo "正在检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到Node.js，请先安装Node.js"
    echo "下载地址：https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js已安装"
echo ""

echo "正在检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖，请稍候..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        exit 1
    fi
    echo "[OK] 依赖安装完成"
else
    echo "[OK] 依赖已存在"
fi

echo ""
echo "========================================"
echo "正在启动服务器..."
echo "========================================"
echo ""
echo "服务器地址：http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo ""

node server.js
