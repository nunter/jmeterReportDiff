# JMeter报告对比工具

这是一个用于对比两个JMeter性能测试报告的Web工具，可以通过Docker微服务方式部署。

## 功能特点

- 上传两个JMeter统计数据JSON文件进行对比
- 自动计算性能指标差异
- 生成对比报告页面
- 支持导出PDF报告

## Docker部署方式

### 使用Docker Compose（推荐）

1. 确保已安装Docker和Docker Compose

2. 在项目根目录下运行：

```bash
docker-compose up -d
```

3. 访问 http://localhost:5001 使用工具

### 使用Docker直接部署

1. 构建Docker镜像：

```bash
docker build -t jmeter-report-diff .
```

2. 运行Docker容器：

```bash
docker run -d -p 5001:5001 -v $(pwd)/uploads:/app/uploads --name jmeter-report-diff jmeter-report-diff
```

3. 访问 http://localhost:5001 使用工具

## 停止服务

如果使用Docker Compose：

```bash
docker-compose down
```

如果直接使用Docker：

```bash
docker stop jmeter-report-diff
docker rm jmeter-report-diff
``` 