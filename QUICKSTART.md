# 快速开始指南

## 最快启动方式

### Windows用户
双击运行 `start.bat` 文件

### Mac/Linux用户
```bash
chmod +x start.sh
./start.sh
```

或者直接执行：
```bash
mvn spring-boot:run
```

## 访问应用

启动成功后，在浏览器中打开：
```
http://localhost:8081
```

## 常用命令

### 1. 编译项目
```bash
mvn clean compile
```
或双击 `build.bat`

### 2. 运行项目
```bash
mvn spring-boot:run
```
或双击 `start.bat`

### 3. 打包项目
```bash
mvn clean package
```
或双击 `package.bat`

打包后运行：
```bash
java -jar target/super-rps-0.0.1-SNAPSHOT.jar
```

### 4. 修改端口
如果8081端口被占用，可以修改端口：

**方式一：修改配置文件**
编辑 `src/main/resources/application.properties`
```properties
server.port=8080
```

**方式二：启动时指定**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8080
```

或
```bash
java -jar target/super-rps-0.0.1-SNAPSHOT.jar --server.port=8080
```

## 页面访问

- 首页（玩家对战）：http://localhost:8081/
- 闯关模式：http://localhost:8081/stage
- 历史对局：http://localhost:8081/history

## 项目结构

```
前端项目
├── src/main/
│   ├── java/                           # Java源代码
│   │   └── com/example/superrps/
│   │       ├── SuperRpsApplication.java    # 主程序
│   │       └── controller/
│   │           └── PageController.java     # 页面控制器
│   └── resources/                      # 资源文件
│       ├── static/                     # 静态资源（CSS、JS、图片等）
│       └── templates/                  # Thymeleaf HTML模板
├── start.bat                           # Windows启动脚本
├── start.sh                            # Linux/Mac启动脚本
├── build.bat                           # 编译脚本
├── package.bat                         # 打包脚本
└── pom.xml                             # Maven配置
```

## 常见问题

### Q: 端口被占用
**A:** 修改端口（见上文）或停止占用8081端口的程序

### Q: 找不到mvn命令
**A:** 请先安装Maven并配置环境变量

### Q: Java版本错误
**A:** 需要JDK 8或更高版本

### Q: 页面404
**A:** 确保访问的URL正确：
- `/` - 首页
- `/stage` - 闯关模式
- `/history` - 历史对局

### Q: 修改代码后不生效
**A:** 
1. HTML/CSS/JS修改：刷新浏览器（Ctrl+F5强制刷新）
2. Java代码修改：需要重启应用

## 开发模式

项目已配置开发模式，Thymeleaf缓存已关闭（`spring.thymeleaf.cache=false`），修改模板后刷新浏览器即可看到效果。

## 生产部署

1. 打包项目：
```bash
mvn clean package
```

2. 将 `target/super-rps-0.0.1-SNAPSHOT.jar` 上传到服务器

3. 运行：
```bash
java -jar super-rps-0.0.1-SNAPSHOT.jar
```

4. 后台运行（Linux）：
```bash
nohup java -jar super-rps-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

## 技术支持

如有问题，请检查：
1. JDK版本（java -version）
2. Maven版本（mvn -version）
3. 端口占用情况
4. 控制台错误信息

---

祝您使用愉快！🎮

