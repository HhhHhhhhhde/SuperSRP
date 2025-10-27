# 超级石头剪刀布 (Super RPS)

一个基于 SpringBoot + Thymeleaf 的前端项目，实现了一个多模式的石头剪刀布游戏。

## 项目简介

这是一个纯前端项目，使用 SpringBoot 作为服务器来服务静态资源和 Thymeleaf 模板。项目包含三种游戏模式：

- **玩家对战模式**：两人对战，选择手势进行比拼
- **闯关模式**：解谜类游戏，需要推理出正确的手势组合
- **人机对战模式**：与AI对战（前端实现）

## 技术栈

- **SpringBoot 2.7.18**：Web服务器
- **Thymeleaf**：模板引擎
- **HTML5/CSS3/JavaScript**：前端实现
- **Maven**：项目构建工具
- **Java 8+**：运行环境

## 项目结构

```
Front end/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/superrps/
│       │       ├── SuperRpsApplication.java      # 主应用程序
│       │       └── controller/
│       │           └── PageController.java       # 页面路由控制器
│       └── resources/
│           ├── application.properties            # 应用配置
│           ├── static/                          # 静态资源
│           │   ├── css/                         # 样式文件
│           │   ├── js/                          # JavaScript文件
│           │   ├── data/                        # 游戏数据（关卡等）
│           │   ├── favicon.svg                  # 网站图标
│           │   └── logo.svg                     # Logo
│           └── templates/                       # Thymeleaf模板
│               ├── index.html                   # 首页（玩家对战）
│               ├── stage.html                   # 闯关模式
│               └── history.html                 # 历史对局
├── pom.xml                                      # Maven配置
└── README.md                                    # 项目说明
```

## 快速开始

### 前置要求

- JDK 8 或更高版本
- Maven 3.6 或更高版本

### 安装与运行

1. **克隆或下载项目**

2. **编译项目**
   ```bash
   mvn clean compile
   ```

3. **运行项目**
   ```bash
   mvn spring-boot:run
   ```

   或者先打包再运行：
   ```bash
   mvn clean package
   java -jar target/super-rps-0.0.1-SNAPSHOT.jar
   ```

4. **访问应用**
   
   打开浏览器访问：`http://localhost:8081`

### 修改端口

如果需要修改运行端口，可以：

1. 修改 `src/main/resources/application.properties` 文件中的端口配置
2. 或者在启动时指定端口：
   ```bash
   mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8080
   ```

## 游戏模式说明

### 1. 玩家对战模式（首页）
- 两名玩家分别选择手势
- 系统自动判定胜负
- 支持键盘快捷键：S（石头）、P（布）、R（剪刀）

### 2. 闯关模式
- 给定部分已知条件
- 需要推理出空白位置的正确手势
- 确保整个流程逻辑正确

### 3. 人机对战模式
- 与AI进行对战
- AI会使用不同策略

## 开发说明

### 添加新页面

1. 在 `src/main/resources/templates/` 下创建新的 HTML 文件
2. 在 `PageController.java` 中添加对应的路由映射

### 修改样式

所有 CSS 文件位于 `src/main/resources/static/css/` 目录

### 修改功能

所有 JavaScript 文件位于 `src/main/resources/static/js/` 目录

## 功能特性

- ✅ 响应式设计，支持多种屏幕尺寸
- ✅ 暗色/亮色主题切换
- ✅ 游戏历史记录
- ✅ 用户登录系统（前端实现）
- ✅ 多种游戏模式
- ✅ 优雅的UI设计

## 配置说明

### application.properties

```properties
# 关闭Thymeleaf缓存（开发时方便调试）
spring.thymeleaf.cache=false

# 服务器端口（默认8081，可通过环境变量PORT覆盖）
server.port=${PORT:8081}
```

## 浏览器兼容性

- Chrome/Edge（推荐）
- Firefox
- Safari
- Opera

## 许可证

本项目仅供学习使用。

## 作者

课程作业项目 - 服务器端开发

---

如有问题，请检查：
1. JDK版本是否正确（需要Java 8+）
2. Maven是否正确安装
3. 端口8081是否被占用
4. 防火墙是否允许访问

