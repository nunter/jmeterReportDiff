# 性能测试报告系统

这是一个用于生成和展示性能测试对比报告的Web应用系统。

## 功能特点

- 上传两个性能测试报告进行对比分析
- 生成可视化的对比报告
- 支持导出PDF格式的报告
- 历史报告查看

## 部署指南

### 前提条件

- 安装 [Docker](https://www.docker.com/get-started)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

### 部署步骤

1. 克隆或下载代码到本地

2. 进入项目目录
   ```
   cd path/to/web_report
   ```

3. 给部署脚本添加执行权限
   ```
   chmod +x deploy.sh
   ```

4. 启动服务
   ```
   ./deploy.sh start
   ```

5. 访问应用
   打开浏览器，访问 http://localhost:5001

### 部署脚本使用说明

```
./deploy.sh [命令]
```

可用命令:
- `start`: 构建并启动服务
- `stop`: 停止服务
- `restart`: 重启服务
- `logs`: 查看服务日志
- `build`: 重新构建服务
- `help`: 显示帮助信息

## 使用说明

1. 访问首页，上传两个性能测试报告JSON文件
2. 系统会自动生成对比报告并显示
3. 可以点击「导出PDF」按钮将报告导出为PDF文件

## 目录结构

- `app.py`: Flask应用主程序
- `index.html`: 报告展示页面
- `upload.html`: 文件上传页面
- `script.js`: 前端JavaScript脚本
- `pdf-export.js`: PDF导出功能脚本
- `requirements.txt`: Python依赖列表
- `Dockerfile`: Docker镜像构建文件
- `docker-compose.yml`: Docker Compose配置文件
- `deploy.sh`: 部署脚本
- `uploads/`: 上传文件存储目录
- `web_report/`: 生成的报告存储目录

## 技术栈

- 后端: Python, Flask
- 前端: HTML, CSS, JavaScript
- PDF生成: html2pdf.js
- 容器化: Docker, Docker Compose