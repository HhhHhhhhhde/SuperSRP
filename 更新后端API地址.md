# 更新前端API地址

## ⚠️ 重要：部署后端后必须执行此步骤

当你将后端部署到Railway并获得域名后（如：`https://super-rps-backend-production.up.railway.app`），需要更新前端的API配置。

---

## 📝 需要修改的文件（共3个）

### 1️⃣ 文件：`src/main/resources/static/js/auth.js`

**位置：** 第8行

**修改前：**
```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:8080/api/auth', // 👈 本地开发地址
  endpoints: {
    login: '/login',
    register: '/register',
    logout: '/logout',
    checkAuth: '/check'
  }
};
```

**修改后：**
```javascript
const API_CONFIG = {
  baseURL: 'https://your-backend.up.railway.app/api/auth', // 👈 改为你的Railway后端域名
  endpoints: {
    login: '/login',
    register: '/register',
    logout: '/logout',
    checkAuth: '/check'
  }
};
```

---

### 2️⃣ 文件：`src/main/resources/static/js/game.js`

**位置：** 第17行

**修改前：**
```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:8080/api/game', // 👈 本地开发地址
  endpoints: {
    save: '/save'
  }
};
```

**修改后：**
```javascript
const API_CONFIG = {
  baseURL: 'https://your-backend.up.railway.app/api/game', // 👈 改为你的Railway后端域名
  endpoints: {
    save: '/save'
  }
};
```

---

### 3️⃣ 文件：`src/main/resources/static/js/history.js`

**位置：** 第5行

**修改前：**
```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:8080/api/game', // 👈 本地开发地址
  endpoints: {
    history: '/history'
  }
};
```

**修改后：**
```javascript
const API_CONFIG = {
  baseURL: 'https://your-backend.up.railway.app/api/game', // 👈 改为你的Railway后端域名
  endpoints: {
    history: '/history'
  }
};
```

---

## 🚀 修改完成后部署

### 步骤1：提交更改

```bash
# 进入前端项目目录
cd "d:\学习资料\哈基米哟大三上多\Server-side Development\Front end"

# 添加修改的文件
git add src/main/resources/static/js/auth.js
git add src/main/resources/static/js/game.js
git add src/main/resources/static/js/history.js

# 提交
git commit -m "更新后端API地址为Railway部署域名"

# 推送到GitHub
git push
```

### 步骤2：等待自动部署

- Railway会检测到推送
- 自动重新部署前端（约2分钟）
- 部署完成后刷新 https://supersrp-production.up.railway.app/

---

## ✅ 验证连接

### 测试步骤：

1. **打开前端**
   - 访问：https://supersrp-production.up.railway.app/

2. **点击"登录"按钮**
   - 应该弹出登录/注册弹窗

3. **注册新用户**
   - 用户名：testuser
   - 密码：123456
   - 点击"登录/注册"

4. **如果成功**
   - 显示"注册成功！欢迎加入，testuser！"
   - 按钮变为"👤 testuser"
   - ✅ 说明前后端连接成功！

5. **测试游戏保存**
   - 玩一局游戏（点击剪刀石头布）
   - 完成后会自动保存到数据库
   - 点击"历史对局"查看记录

---

## 🔍 故障排查

### 问题1：前端显示"未登录"或无法注册

**可能原因：**
- API地址配置错误
- 后端服务未启动
- CORS配置问题

**检查步骤：**

1. **打开浏览器开发者工具**（F12）
2. **切换到"Network"（网络）标签**
3. **尝试注册/登录**
4. **查看请求**
   - 请求URL是否正确指向Railway后端域名
   - 响应状态码是否为200
   - 响应内容是否正确

### 问题2：CORS错误

**症状：** 控制台显示类似：
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**解决：**
后端已配置CORS，如果仍有问题：
1. 检查后端 `WebConfig.java` 中的CORS配置
2. 确认后端服务正常运行
3. 重新部署后端

### 问题3：API请求返回404

**可能原因：**
- API路径拼写错误
- 后端路由配置问题

**检查：**
- 确认后端域名正确
- 路径应该是 `/api/auth/...` 和 `/api/game/...`

---

## 📋 快速对照表

| API功能 | 完整URL示例 |
|---------|------------|
| 用户注册 | `https://your-backend.up.railway.app/api/auth/register` |
| 用户登录 | `https://your-backend.up.railway.app/api/auth/login` |
| 检查认证 | `https://your-backend.up.railway.app/api/auth/check` |
| 用户登出 | `https://your-backend.up.railway.app/api/auth/logout` |
| 保存游戏 | `https://your-backend.up.railway.app/api/game/save` |
| 游戏历史 | `https://your-backend.up.railway.app/api/game/history` |
| AI出招 | `https://your-backend.up.railway.app/api/game/ai-move` |
| 判断结果 | `https://your-backend.up.railway.app/api/game/judge` |

---

## 💡 小技巧

### 使用环境变量（可选）

如果需要在本地开发和线上部署之间快速切换，可以这样修改：

```javascript
// 检测当前环境
const isDevelopment = window.location.hostname === 'localhost';

const API_CONFIG = {
  baseURL: isDevelopment 
    ? 'http://localhost:8080/api/auth'  // 本地开发
    : 'https://your-backend.up.railway.app/api/auth', // 线上部署
  endpoints: {
    // ...
  }
};
```

这样本地开发时会自动使用 `localhost:8080`，部署后会使用Railway域名。

---

## ✅ 部署检查清单

修改完成后，检查：

- [ ] 3个JS文件的API地址都已更新
- [ ] 所有 `http://localhost:8080` 都改为 `https://your-backend.up.railway.app`
- [ ] 代码已提交并推送到GitHub
- [ ] Railway前端已自动重新部署
- [ ] 浏览器测试注册/登录成功

---

**完成后，你的前后端就完全连通了！** 🎉

可以在任何地方访问：https://supersrp-production.up.railway.app/

