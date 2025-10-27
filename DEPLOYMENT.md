# 部署指南

## 重要说明

⚠️ **Vercel不支持Java SpringBoot应用**，因为Vercel主要用于静态网站和Node.js应用。

你有以下几种部署选择：

---

## 方案一：Railway（推荐 - 最简单）

Railway支持Java应用，免费额度足够学习使用。

### 步骤：

1. **准备Git仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到GitHub**
   - 在GitHub创建新仓库
   - 推送代码：
   ```bash
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git branch -M main
   git push -u origin main
   ```

3. **部署到Railway**
   - 访问 https://railway.app
   - 使用GitHub登录
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择你的仓库
   - Railway会自动检测到Java项目并部署

4. **配置环境变量**（如果需要）
   - 在Railway项目设置中添加环境变量
   - `PORT` 会自动设置

5. **访问应用**
   - Railway会自动生成一个域名
   - 点击 "Settings" → "Generate Domain"

### 费用
- 免费额度：$5/月（足够运行小型应用）
- 超出后需付费

---

## 方案二：Render

Render也是很好的选择，界面友好。

### 步骤：

1. **推送代码到GitHub**（同上）

2. **部署到Render**
   - 访问 https://render.com
   - 注册/登录
   - 点击 "New" → "Web Service"
   - 连接GitHub仓库
   - 配置：
     - **Build Command**: `mvn clean package`
     - **Start Command**: `java -jar target/super-rps-0.0.1-SNAPSHOT.jar`
     - **Environment**: Java

3. **访问应用**
   - Render会提供一个`.onrender.com`域名

### 费用
- 免费额度有限制（应用会在不活动时休眠）
- 付费版 $7/月

---

## 方案三：Heroku（经典但现在收费）

Heroku曾经免费，现在需要付费。

### 步骤：

1. **安装Heroku CLI**
   ```bash
   # Windows (使用安装程序)
   下载：https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **登录并创建应用**
   ```bash
   heroku login
   heroku create 你的应用名
   ```

3. **推送代码**
   ```bash
   git push heroku main
   ```

4. **打开应用**
   ```bash
   heroku open
   ```

### 费用
- 最低 $5/月

---

## 方案四：国内平台

### 1. 阿里云/腾讯云 轻量应用服务器
- 费用：约60元/月起
- 需要手动配置环境、上传JAR包

### 2. Gitee + Serverless（华为云）
- 适合国内访问
- 配置较复杂

---

## 方案五：转换为纯静态项目（可用Vercel）

如果你想使用Vercel，需要将项目改造成纯静态HTML。

### 改造步骤：

1. **将Thymeleaf模板转为纯HTML**
   - 移除 `xmlns:th` 和 `th:` 属性
   - 将 `th:href="@{/...}"` 改为 `href="/..."`

2. **创建vercel.json**
   ```json
   {
     "rewrites": [
       { "source": "/", "destination": "/index.html" },
       { "source": "/stage", "destination": "/stage.html" },
       { "source": "/history", "destination": "/history.html" }
     ]
   }
   ```

3. **部署**
   - 只上传 `static/` 和 `templates/` 文件夹内容
   - 但这样会失去SpringBoot的便利性

---

## 推荐方案总结

### 学习/演示用途
✅ **Railway** - 免费额度够用，部署简单

### 正式项目
✅ **Render** - 稳定可靠，免费版有休眠但可接受
✅ **Railway** - 付费后性能好

### 国内访问
✅ **阿里云/腾讯云** - 国内访问速度快，但配置复杂

---

## Railway 详细部署教程（推荐）

### 1. 准备工作

```bash
# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "准备部署到Railway"
```

### 2. 推送到GitHub

在GitHub上创建新仓库后：

```bash
git remote add origin https://github.com/你的用户名/super-rps.git
git branch -M main
git push -u origin main
```

### 3. 部署到Railway

1. 访问 https://railway.app
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. **等待自动部署**（Railway会自动：
   - 检测Java项目
   - 运行 `mvn package`
   - 启动应用）

### 4. 生成访问域名

1. 在Railway项目页面，点击你的服务
2. 进入 "Settings" 标签
3. 点击 "Generate Domain"
4. 复制生成的域名（如：`your-app.up.railway.app`）

### 5. 验证部署

访问生成的域名，应该能看到你的游戏！

---

## 常见问题

### Q: 为什么Vercel不能用？
**A:** Vercel主要支持Node.js、Python（Serverless）和静态网站，不支持长时间运行的Java进程。

### Q: Railway免费额度够用吗？
**A:** Railway提供 $5/月免费额度，对于学习项目足够。如果流量很大可能需要付费。

### Q: 如何查看部署日志？
**A:** 
- Railway：在项目页面的 "Deployments" 标签查看
- Render：在 "Logs" 标签查看

### Q: 应用启动失败怎么办？
**A:** 检查：
1. `pom.xml` 是否正确
2. 端口配置（使用 `${PORT:8080}`）
3. 查看部署日志找错误

### Q: 如何更新部署？
**A:** 
```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push
```
Railway会自动重新部署！

---

## 配置文件说明

本项目已包含以下部署配置文件：

- **`Procfile`**: Heroku/Railway启动命令
- **`system.properties`**: Java版本配置
- **`railway.json`**: Railway特定配置

这些文件确保平台能正确识别并运行你的SpringBoot应用。

---

## 需要帮助？

如果遇到部署问题：
1. 检查平台的部署日志
2. 确认Java版本兼容（JDK 8+）
3. 验证Maven构建成功（`mvn clean package`）

祝部署顺利！🚀

