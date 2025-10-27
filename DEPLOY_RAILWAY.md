# Railway 快速部署指南

Railway是最简单的Java应用部署方案，**强烈推荐**！

## 🚀 5分钟部署步骤

### 步骤1：推送代码到GitHub

```bash
# 1. 初始化Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "部署到Railway"

# 4. 创建GitHub仓库
# 在 https://github.com/new 创建新仓库

# 5. 推送代码
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

### 步骤2：部署到Railway

1. **打开Railway**
   - 访问：https://railway.app
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权Railway访问你的GitHub
   - 选择刚才创建的仓库

3. **等待部署**
   - Railway会自动：
     - 检测到这是Java Maven项目
     - 运行 `mvn package`
     - 启动SpringBoot应用
   - 等待3-5分钟

4. **生成访问域名**
   - 点击你的服务（service）
   - 进入 "Settings" 标签
   - 点击 "Generate Domain"
   - 会得到类似 `your-app.up.railway.app` 的域名

5. **访问应用**
   - 点击生成的域名
   - 🎉 成功！你的游戏已经在线了！

## 💰 费用说明

- **免费额度**：$5/月
- **使用量**：
  - 这个小项目大约消耗 $1-2/月
  - 免费额度完全够用

## 🔄 更新部署

修改代码后：

```bash
git add .
git commit -m "更新内容"
git push
```

Railway会**自动重新部署**！无需任何手动操作。

## 📊 查看状态

在Railway项目页面可以看到：
- 📈 部署日志
- 💻 资源使用情况
- 🌐 访问统计
- ⚙️ 环境变量配置

## ❓ 常见问题

### Q1: 部署失败怎么办？

查看 "Deployments" → 点击失败的部署 → 查看日志

常见原因：
- Maven构建失败 → 检查 `pom.xml`
- 端口配置错误 → 已配置为 `${PORT:8081}`，应该没问题

### Q2: 如何查看日志？

点击你的服务 → "Logs" 标签 → 实时查看应用日志

### Q3: 如何自定义域名？

在 Settings → Domains → Add Custom Domain

需要先购买域名并配置DNS。

### Q4: 免费额度用完了怎么办？

1. 添加信用卡后，超出部分按实际使用计费
2. 或者暂停服务，下月继续使用免费额度

## 📝 项目已包含的配置文件

本项目已配置好以下文件，无需修改：

- ✅ `Procfile` - 启动命令
- ✅ `system.properties` - Java版本
- ✅ `railway.json` - Railway配置
- ✅ `application.properties` - 支持动态端口

直接部署即可！

## 🎯 下一步

部署成功后，你可以：

1. **分享链接**给同学/老师
2. **继续开发**：推送代码自动部署
3. **监控应用**：查看访问日志和性能
4. **自定义域名**（可选）

---

## 完整示例

假设你的GitHub用户名是 `zhangsan`，仓库名是 `super-rps-game`：

```bash
# 推送到GitHub
git remote add origin https://github.com/zhangsan/super-rps-game.git
git branch -M main
git push -u origin main

# Railway会自动部署
# 得到域名：super-rps-game.up.railway.app
```

访问 `https://super-rps-game.up.railway.app` 即可！

---

**祝部署顺利！** 🚀

如有问题，可以查看 Railway 文档：https://docs.railway.app

