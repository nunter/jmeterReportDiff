#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== JMeter报告对比工具部署脚本 =====${NC}"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker未安装，请先安装Docker${NC}"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}未检测到Docker Compose，将尝试使用Docker命令部署${NC}"
    COMPOSE_INSTALLED=false
else
    COMPOSE_INSTALLED=true
fi

# 创建上传目录
mkdir -p uploads
echo -e "${GREEN}创建上传目录成功${NC}"

# 根据是否安装Docker Compose选择部署方式
if [ "$COMPOSE_INSTALLED" = true ]; then
    echo -e "${GREEN}使用Docker Compose部署...${NC}"
    
    # 停止之前的容器（如果存在）
    docker-compose down
    
    # 使用Docker Compose部署
    docker-compose build
    
    # 启动容器
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}部署成功，服务已启动${NC}"
        echo -e "${GREEN}请访问 http://localhost:5001 使用工具${NC}"
    else
        echo -e "${RED}部署失败，请检查日志${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}使用Docker命令部署...${NC}"
    
    # 停止并删除之前的容器（如果存在）
    docker stop jmeter-report-diff 2>/dev/null || true
    docker rm jmeter-report-diff 2>/dev/null || true
    
    # 构建Docker镜像
    docker build -t jmeter-report-diff .
    
    # 运行Docker容器
    docker run -d --dns 8.8.8.8 --dns 114.114.114.114 -p 5001:5001 -v $(pwd)/uploads:/app/uploads --name jmeter-report-diff jmeter-report-diff
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}部署成功，服务已启动${NC}"
        echo -e "${GREEN}请访问 http://localhost:5001 使用工具${NC}"
    else
        echo -e "${RED}部署失败，请检查日志${NC}"
        exit 1
    fi
fi

# 显示容器状态
echo -e "${GREEN}容器状态:${NC}"
if [ "$COMPOSE_INSTALLED" = true ]; then
    docker-compose ps
else
    docker ps | grep jmeter-report-diff
fi

echo -e "${YELLOW}如需查看日志，请运行:${NC}"
if [ "$COMPOSE_INSTALLED" = true ]; then
    echo -e "${YELLOW}docker-compose logs -f${NC}"
else
    echo -e "${YELLOW}docker logs -f jmeter-report-diff${NC}"
fi

echo -e "${YELLOW}如需停止服务，请运行:${NC}"
if [ "$COMPOSE_INSTALLED" = true ]; then
    echo -e "${YELLOW}docker-compose down${NC}"
else
    echo -e "${YELLOW}docker stop jmeter-report-diff${NC}"
    echo -e "${YELLOW}docker rm jmeter-report-diff${NC}"
fi 