# AI Chatbot with UI5 & CAP

基于 SAP CAP (Cloud Application Programming Model) 和 UI5 框架开发的聊天机器人应用。

## 功能特点

- 集成 OpenAI/Deepseek/Claude(开发中) 模型
- 实时流式消息响应
- 聊天历史记录持久化
- 自定义 UI5 聊天组件
- 响应式布局设计

## 技术栈

- 后端：SAP CAP Java
- 前端：SAPUI5
- 数据库：SAP HANA/PostgreSQL
- AI：Claude/OpenAI/Deepseek

## 项目结构

```
chatbot/
├── app/                    # 前端应用
│   └── chatbotui/         # UI5应用
│       └── webapp/        
│           ├── controller/ # 控制器
│           ├── view/       # 视图
│           ├── model/      # 数据模型
│           └── service/    # 服务
├── db/                     # 数据库层
│   └── ai.cds             # 数据库模型
├── srv/                    # 服务层
│   ├── ai-service.cds     # 服务定义
│   └── src/
│       └── main/
│           ├── java/customer/chatbot/
│           │   ├── config/           # 配置类
│           │   │   └── AIServicePropertiesConfig.java  
│           │   ├── controller/       # 控制器
│           │   │   └── ChatCompletionWithStreamController.java
│           │   ├── exception/        # 异常处理
│           │   │   └── BusinessException.java
│           │   ├── helper/          # 辅助类
│           │   │   └── ChatHelper.java
│           │   ├── model/           # 数据模型
│           │   │   ├── CommonAIMessage.java
│           │   │   ├── EntityInfo.java
│           │   │   └── StreamChatRequest.java
│           │   └── service/         # 服务层
│           │       ├── AI/          # AI服务
│           │       │   ├── AIServiceI.java        # AI服务接口
│           │       │   └── DeepSeekAIService.java # AI服务实现
│           │       └── EntityService.java         # 实体服务
│           └── resources/           # 资源文件
│               └── application.yaml  # 应用配置
└── package.json
```

## 运行环境

- Node.js 18+
- Java 17+
- SAP UI5 CLI/Fiori Tools Extension

## 快速开始

1. 安装依赖：
- 项目根目录安装npm依赖
```bash
npm install
```

- app目录安装npm以来
```bash
cd app/chatbotui
npm install
```

2. 构建项目：
```bash
mvn clean install
```

3. 启动应用：
- 后端启动应用
```bash
mvn spring-boot:run
```

- 前端启动应用
```bash
cd app/chatbotui
npm run start
```

## 配置说明

1. AI 服务配置 (`srv/src/main/resources/application.yaml`):
```yaml
ai:
  systemPrompt: "You are Claude 3.5 Sonnet..."
  claude:
    apiKey: "your-api-key"
    baseUrl: "https://api.anthropic.com"
```

## 开发指南

### 本地开发


1. 访问应用：`http://localhost:8081`

2. 后端接口：`http://localhost:8080`

### 目录说明

- `app/chatbotui/`: UI5 前端代码
- `srv/src/main/java/`: Java 后端代码
- `db/`: 数据库模型定义

### 主要功能

- 实时对话：支持流式响应
- 历史记录：自动保存对话内容
- 自定义UI：响应式聊天界面

## API 接口

### 对话接口

- `POST /api/chat/completion/streaming`: 流式对话接口
- `GET /odata/v4/ai-service/Chats`: 获取对话列表
- `GET /odata/v4/ai-service/Messages`: 获取消息列表

## 注意事项

1. 确保正确配置 AI 服务密钥
3. 注意消息长度限制
