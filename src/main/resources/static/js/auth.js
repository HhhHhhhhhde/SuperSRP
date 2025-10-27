// 登录/注册模块 - 连接后端API
(function () {
  let authModal = null;
  let currentUser = null;

  // API配置
  const API_CONFIG = {
    baseURL: 'https://web-production-d61ef.up.railway.app/api/auth', // 后端API基础路径（指向后端服务器）
    endpoints: {
      login: '/login',      // POST /api/auth/login
      register: '/register', // POST /api/auth/register
      logout: '/logout',     // POST /api/auth/logout
      checkAuth: '/check'    // GET /api/auth/check
    }
  };

  // 从localStorage获取token
  function getToken() {
    return localStorage.getItem('superrps-token');
  }

  // 保存token
  function saveToken(token) {
    localStorage.setItem('superrps-token', token);
  }

  // 删除token
  function removeToken() {
    localStorage.removeItem('superrps-token');
  }

  // 从localStorage获取当前用户
  function loadCurrentUser() {
    const userStr = localStorage.getItem('superrps-user');
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
        updateLoginButton();
        // 验证token是否有效
        checkAuthStatus();
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }
    }
  }

  // 保存用户信息
  function saveUser(user, token) {
    currentUser = user;
    localStorage.setItem('superrps-user', JSON.stringify(user));
    if (token) {
      saveToken(token);
    }
    updateLoginButton();
  }

  // 更新登录按钮状态
  function updateLoginButton() {
    const btnLogin = document.getElementById('btn-login');
    if (!btnLogin) return;

    if (currentUser) {
      btnLogin.textContent = `👤 ${currentUser.username}`;
      btnLogin.title = '点击查看用户信息';
    } else {
      btnLogin.textContent = '登录';
      btnLogin.title = '点击登录';
    }
  }

  // 创建模态框HTML
  function createModalHTML() {
    return `
      <div class="auth-modal" id="auth-modal">
        <div class="auth-modal__content">
          <button class="auth-modal__close" id="auth-modal-close" aria-label="关闭">×</button>
          
          <div class="auth-modal__header">
            <h2 class="auth-modal__title">登录 / 注册</h2>
            <p class="auth-modal__subtitle">输入用户名和密码即可登录<br>未注册用户将自动注册</p>
          </div>

          <div class="auth-modal__error" id="auth-error"></div>
          <div class="auth-modal__success" id="auth-success"></div>

          <form class="auth-modal__form" id="auth-form">
            <div class="auth-modal__field">
              <label class="auth-modal__label" for="auth-username">用户名</label>
              <input 
                type="text" 
                id="auth-username" 
                class="auth-modal__input" 
                placeholder="请输入用户名" 
                required 
                minlength="3"
                maxlength="20"
                autocomplete="username"
              />
              <span class="auth-modal__hint">用户名长度为 3-20 个字符</span>
            </div>

            <div class="auth-modal__field">
              <label class="auth-modal__label" for="auth-password">密码</label>
              <input 
                type="password" 
                id="auth-password" 
                class="auth-modal__input" 
                placeholder="请输入密码" 
                required 
                minlength="6"
                autocomplete="current-password"
              />
              <span class="auth-modal__hint">密码长度至少 6 个字符</span>
            </div>

            <div class="auth-modal__actions">
              <button type="submit" class="auth-modal__button auth-modal__button--primary" id="auth-submit">
                <span id="auth-submit-text">登录 / 注册</span>
              </button>
              <button type="button" class="auth-modal__button auth-modal__button--secondary" id="auth-cancel">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // 显示错误消息
  function showError(message) {
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
    if (successEl) {
      successEl.classList.remove('show');
    }
  }

  // 显示成功消息
  function showSuccess(message) {
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    if (successEl) {
      successEl.textContent = message;
      successEl.classList.add('show');
    }
    if (errorEl) {
      errorEl.classList.remove('show');
    }
  }

  // 清除消息
  function clearMessages() {
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    if (errorEl) errorEl.classList.remove('show');
    if (successEl) successEl.classList.remove('show');
  }

  // 显示加载状态
  function setLoading(isLoading) {
    const submitBtn = document.getElementById('auth-submit');
    const submitText = document.getElementById('auth-submit-text');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');

    if (submitBtn) submitBtn.disabled = isLoading;
    if (usernameInput) usernameInput.disabled = isLoading;
    if (passwordInput) passwordInput.disabled = isLoading;

    if (submitText) {
      if (isLoading) {
        submitText.innerHTML = '<span class="auth-modal__loading"></span> 处理中...';
      } else {
        submitText.textContent = '登录 / 注册';
      }
    }
  }

  // ==================== 后端API通信 ====================

  /**
   * 调用登录API
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 返回格式: { success: boolean, message: string, data: { user, token }, isNewUser: boolean }
   */
  async function callLoginAPI(username, password) {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '登录失败');
    }

    return await response.json();
  }

  /**
   * 调用注册API
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 返回格式: { success: boolean, message: string, data: { user, token } }
   */
  async function callRegisterAPI(username, password) {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.register}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '注册失败');
    }

    return await response.json();
  }

  /**
   * 调用登出API
   * @returns {Promise<Object>}
   */
  async function callLogoutAPI() {
    const token = getToken();
    
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.logout}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '登出失败');
    }

    return await response.json();
  }

  /**
   * 检查认证状态
   * @returns {Promise<Object>}
   */
  async function checkAuthStatus() {
    const token = getToken();
    
    if (!token) {
      return { authenticated: false };
    }

    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.checkAuth}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Token无效，清除本地数据
        logout(false);
        return { authenticated: false };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('检查认证状态失败:', error);
      return { authenticated: false };
    }
  }

  /**
   * 统一的认证处理函数（先尝试登录，失败则注册）
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>}
   */
  async function authenticate(username, password) {
    try {
      // 先尝试登录
      const loginResult = await callLoginAPI(username, password);
      
      if (loginResult.success) {
        return {
          success: true,
          message: loginResult.message || `欢迎回来，${username}！`,
          data: loginResult.data,
          isNewUser: false
        };
      }
      
      // 如果返回用户不存在的错误码，则尝试注册
      if (loginResult.code === 'USER_NOT_FOUND') {
        const registerResult = await callRegisterAPI(username, password);
        
        if (registerResult.success) {
          return {
            success: true,
            message: registerResult.message || `注册成功！欢迎加入，${username}！`,
            data: registerResult.data,
            isNewUser: true
          };
        }
      }
      
      return {
        success: false,
        message: loginResult.message || '登录失败'
      };
      
    } catch (error) {
      // 如果登录API返回404或用户不存在，尝试注册
      if (error.message.includes('不存在') || error.message.includes('not found')) {
        try {
          const registerResult = await callRegisterAPI(username, password);
          
          if (registerResult.success) {
            return {
              success: true,
              message: registerResult.message || `注册成功！欢迎加入，${username}！`,
              data: registerResult.data,
              isNewUser: true
            };
          }
        } catch (registerError) {
          return {
            success: false,
            message: registerError.message
          };
        }
      }
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ==================== 表单处理 ====================

  // 处理登录表单提交
  async function handleSubmit(event) {
    event.preventDefault();
    clearMessages();

    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;

    // 前端验证
    if (username.length < 3 || username.length > 20) {
      showError('用户名长度必须为 3-20 个字符');
      return;
    }

    if (password.length < 6) {
      showError('密码长度至少为 6 个字符');
      return;
    }

    setLoading(true);

    try {
      const result = await authenticate(username, password);
      
      if (result.success && result.data) {
        showSuccess(result.message);
        saveUser(result.data.user, result.data.token);
        
        // 1秒后关闭弹窗
        setTimeout(() => {
          closeModal();
        }, 1000);
      } else {
        showError(result.message || '登录失败，请重试');
      }
    } catch (error) {
      console.error('登录失败:', error);
      showError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  // 打开模态框
  function openModal() {
    if (currentUser) {
      // 已登录，显示用户信息
      showUserInfo();
      return;
    }

    if (!authModal) {
      // 创建模态框
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = createModalHTML();
      document.body.appendChild(modalContainer.firstElementChild);
      authModal = document.getElementById('auth-modal');

      // 绑定事件
      const form = document.getElementById('auth-form');
      const closeBtn = document.getElementById('auth-modal-close');
      const cancelBtn = document.getElementById('auth-cancel');

      if (form) form.addEventListener('submit', handleSubmit);
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

      // 点击背景关闭
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
          closeModal();
        }
      });

      // ESC键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal && authModal.classList.contains('show')) {
          closeModal();
        }
      });
    }

    // 清空表单和消息
    const form = document.getElementById('auth-form');
    if (form) form.reset();
    clearMessages();

    // 显示模态框
    authModal.classList.add('show');
    
    // 聚焦到用户名输入框
    setTimeout(() => {
      const usernameInput = document.getElementById('auth-username');
      if (usernameInput) usernameInput.focus();
    }, 100);
  }

  // 关闭模态框
  function closeModal() {
    if (authModal) {
      authModal.classList.remove('show');
    }
  }

  // 显示用户信息
  function showUserInfo() {
    const loginTimeStr = currentUser.loginTime 
      ? new Date(currentUser.loginTime).toLocaleString()
      : '未知';
    
    const message = `当前用户：${currentUser.username}\n登录时间：${loginTimeStr}\n\n是否退出登录？`;
    
    if (confirm(message)) {
      logout(true);
    }
  }

  // 退出登录
  async function logout(callAPI = true) {
    if (callAPI) {
      try {
        await callLogoutAPI();
      } catch (error) {
        console.error('调用登出API失败:', error);
        // 即使API失败也继续本地登出
      }
    }
    
    currentUser = null;
    localStorage.removeItem('superrps-user');
    removeToken();
    updateLoginButton();
    alert('已退出登录');
  }

  // 初始化
  function init() {
    loadCurrentUser();

    // 绑定登录按钮
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
      btnLogin.addEventListener('click', openModal);
    }
  }

  // 导出API
  window.SuperRPSAuth = {
    init: init,
    openModal: openModal,
    closeModal: closeModal,
    getCurrentUser: () => currentUser,
    getToken: getToken,
    logout: logout,
    checkAuth: checkAuthStatus
  };

  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
