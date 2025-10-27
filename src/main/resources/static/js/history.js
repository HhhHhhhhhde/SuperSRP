// 历史对局页面逻辑
(function () {
  // API配置
  const API_CONFIG = {
    baseURL: 'https://web-production-d61ef.up.railway.app/api/game', // 后端API基础路径
    endpoints: {
      history: '/history' // GET /api/game/history
    }
  };

  // 状态管理
  let currentPage = 1;
  let pageLimit = 10;
  let totalPages = 1;
  let allHistory = []; // 存储所有历史记录用于前端筛选
  let filteredHistory = []; // 筛选后的记录
  let currentFilters = {
    type: 'all', // all, pvp, ai
    result: 'all' // all, win, draw, lose
  };

  // 游戏类型映射
  const GAME_TYPE_MAP = {
    pvp: {
      name: '玩家对战',
      icon: '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>'
    },
    ai: {
      name: '人机对战',
      icon: '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"/></svg>'
    },
    stage: {
      name: '闯关模式',
      icon: '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v13A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-13z"/></svg>'
    }
  };

  // 结果映射
  const RESULT_MAP = {
    win: { text: '胜', class: 'win' },
    draw: { text: '平', class: 'draw' },
    lose: { text: '败', class: 'lose' }
  };

  /**
   * 从后端获取历史对局
   */
  async function fetchHistory() {
    const token = window.SuperRPSAuth ? window.SuperRPSAuth.getToken() : null;

    if (!token) {
      showLoginPrompt();
      return;
    }

    showLoading();

    try {
      const response = await fetch(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.history}?page=1&limit=1000`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          showLoginPrompt();
          return;
        }
        throw new Error('获取历史记录失败');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // 过滤掉闯关模式
        allHistory = result.data.list.filter(item => item.gameType !== 'stage');
        filteredHistory = [...allHistory];
        renderHistory();
        updateStats();
      } else {
        showEmpty();
      }
    } catch (error) {
      console.error('获取历史记录失败:', error);
      showError(error.message);
    }
  }

  /**
   * 应用筛选
   */
  function applyFilters() {
    filteredHistory = allHistory.filter(item => {
      // 筛选游戏类型
      if (currentFilters.type !== 'all' && item.gameType !== currentFilters.type) {
        return false;
      }
      // 筛选结果
      if (currentFilters.result !== 'all' && item.result !== currentFilters.result) {
        return false;
      }
      return true;
    });

    // 重置分页
    currentPage = 1;
    renderHistory();
    updateStats();
  }

  /**
   * 渲染历史记录
   */
  function renderHistory() {
    const container = document.getElementById('history-items');
    const loadingEl = document.getElementById('loading-state');
    const emptyEl = document.getElementById('empty-state');
    const paginationEl = document.getElementById('history-pagination');

    if (loadingEl) loadingEl.style.display = 'none';

    if (filteredHistory.length === 0) {
      container.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (paginationEl) paginationEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    // 计算分页
    const startIndex = (currentPage - 1) * pageLimit;
    const endIndex = Math.min(startIndex + pageLimit, filteredHistory.length);
    const pageData = filteredHistory.slice(startIndex, endIndex);
    totalPages = Math.ceil(filteredHistory.length / pageLimit);

    // 渲染列表项
    container.innerHTML = pageData.map(item => createHistoryItemHTML(item)).join('');

    // 绑定查看详情按钮事件
    bindDetailButtons();

    // 显示分页控件
    if (filteredHistory.length > pageLimit) {
      if (paginationEl) paginationEl.style.display = 'flex';
      updatePagination();
    } else {
      if (paginationEl) paginationEl.style.display = 'none';
    }
  }

  /**
   * 创建历史记录项HTML
   */
  function createHistoryItemHTML(item) {
    const gameType = GAME_TYPE_MAP[item.gameType] || { name: '未知', icon: '' };
    const result = RESULT_MAP[item.result] || { text: '?', class: '' };
    const playedAt = new Date(item.playedAt);
    const dateStr = playedAt.toLocaleDateString('zh-CN');
    const timeStr = playedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    // 解析moves信息
    let movesInfo = '';
    if (item.moves) {
      try {
        const moves = JSON.parse(item.moves);
        if (moves.rounds && moves.rounds.length > 0) {
          movesInfo = `<span class="history-item__detail">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
            </svg>
            ${moves.rounds.length} 回合
          </span>`;
        }
      } catch (e) {
        console.error('解析moves失败:', e);
      }
    }

    return `
      <div class="history-item" data-id="${item.id}" data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
        <div class="history-item__left">
          <div class="history-item__result history-item__result--${result.class}">
            ${result.text}
          </div>
          <div class="history-item__info">
            <div class="history-item__header">
              <span class="history-item__type">
                ${gameType.icon}
                ${gameType.name}
              </span>
              ${item.level ? `<span class="history-item__level">关卡 ${item.level}</span>` : ''}
            </div>
            <div class="history-item__details">
              ${movesInfo}
              <span class="history-item__detail">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                </svg>
                ${dateStr} ${timeStr}
              </span>
            </div>
          </div>
        </div>
        <div class="history-item__right">
          <div class="history-item__date">${dateStr}</div>
          <div class="history-item__time">${timeStr}</div>
          <div class="history-item__actions">
            <button class="history-item__btn btn-view-detail" data-id="${item.id}">查看详情</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 更新统计信息
   */
  function updateStats() {
    const total = filteredHistory.length;
    const wins = filteredHistory.filter(item => item.result === 'win').length;
    const draws = filteredHistory.filter(item => item.result === 'draw').length;
    const losses = filteredHistory.filter(item => item.result === 'lose').length;
    const winrate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-wins').textContent = wins;
    document.getElementById('stat-draws').textContent = draws;
    document.getElementById('stat-losses').textContent = losses;
    document.getElementById('stat-winrate').textContent = `${winrate}%`;
  }

  /**
   * 更新分页控件
   */
  function updatePagination() {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const infoEl = document.getElementById('pagination-info');

    if (prevBtn) {
      prevBtn.disabled = currentPage === 1;
    }

    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages;
    }

    if (infoEl) {
      infoEl.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    }
  }

  /**
   * 显示加载状态
   */
  function showLoading() {
    const loadingEl = document.getElementById('loading-state');
    const emptyEl = document.getElementById('empty-state');
    const loginEl = document.getElementById('login-prompt');
    const container = document.getElementById('history-items');

    if (loadingEl) loadingEl.style.display = 'flex';
    if (emptyEl) emptyEl.style.display = 'none';
    if (loginEl) loginEl.style.display = 'none';
    if (container) container.innerHTML = '';
  }

  /**
   * 显示空状态
   */
  function showEmpty() {
    const loadingEl = document.getElementById('loading-state');
    const emptyEl = document.getElementById('empty-state');
    const loginEl = document.getElementById('login-prompt');

    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'flex';
    if (loginEl) loginEl.style.display = 'none';
  }

  /**
   * 显示登录提示
   */
  function showLoginPrompt() {
    const loadingEl = document.getElementById('loading-state');
    const emptyEl = document.getElementById('empty-state');
    const loginEl = document.getElementById('login-prompt');
    const container = document.getElementById('history-items');

    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (loginEl) loginEl.style.display = 'flex';
    if (container) container.innerHTML = '';
  }

  /**
   * 显示错误
   */
  function showError(message) {
    const container = document.getElementById('history-items');
    const loadingEl = document.getElementById('loading-state');

    if (loadingEl) loadingEl.style.display = 'none';
    if (container) {
      container.innerHTML = `
        <div class="empty-state" style="display: flex;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>加载失败</h3>
          <p>${message}</p>
          <button class="btn-primary" onclick="location.reload()">重新加载</button>
        </div>
      `;
    }
  }

  /**
   * 绑定事件监听器
   */
  function bindEventListeners() {
    // 游戏类型筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilters.type = this.dataset.type;
        applyFilters();
      });
    });

    // 结果筛选按钮
    document.querySelectorAll('.result-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.result-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilters.result = this.dataset.result;
        applyFilters();
      });
    });

    // 分页按钮
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderHistory();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderHistory();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // 登录提示按钮
    const loginPromptBtn = document.getElementById('btn-login-prompt');
    if (loginPromptBtn) {
      loginPromptBtn.addEventListener('click', () => {
        if (window.SuperRPSAuth) {
          window.SuperRPSAuth.openModal();
        }
      });
    }

    // 弹窗关闭按钮
    const closeModalBtn = document.getElementById('close-detail-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeDetailModal);
    }

    // 点击遮罩关闭弹窗
    const modal = document.getElementById('game-detail-modal');
    if (modal) {
      const overlay = modal.querySelector('.game-detail-modal__overlay');
      if (overlay) {
        overlay.addEventListener('click', closeDetailModal);
      }
    }

    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetailModal();
      }
    });
  }

  /**
   * 绑定查看详情按钮事件（在每次渲染后调用）
   */
  function bindDetailButtons() {
    document.querySelectorAll('.btn-view-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemEl = btn.closest('.history-item');
        if (itemEl) {
          const itemData = itemEl.dataset.item;
          if (itemData) {
            try {
              const item = JSON.parse(itemData);
              showDetailModal(item);
            } catch (e) {
              console.error('解析游戏数据失败:', e);
            }
          }
        }
      });
    });
  }

  /**
   * 显示详情弹窗
   */
  function showDetailModal(item) {
    const modal = document.getElementById('game-detail-modal');
    const modalBody = document.getElementById('detail-modal-body');
    
    if (!modal || !modalBody) return;

    // 渲染弹窗内容
    modalBody.innerHTML = renderDetailContent(item);

    // 显示弹窗
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
  }

  /**
   * 关闭详情弹窗
   */
  function closeDetailModal() {
    const modal = document.getElementById('game-detail-modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = ''; // 恢复滚动
    }
  }

  /**
   * 渲染详情内容
   */
  function renderDetailContent(item) {
    const gameType = GAME_TYPE_MAP[item.gameType] || { name: '未知', icon: '' };
    const result = RESULT_MAP[item.result] || { text: '未知', class: '' };
    const playedAt = new Date(item.playedAt);
    const dateStr = playedAt.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let movesData = null;
    if (item.moves) {
      try {
        movesData = JSON.parse(item.moves);
      } catch (e) {
        console.error('解析moves数据失败:', e);
      }
    }

    // 基本信息
    let html = `
      <div class="detail-info">
        <div class="detail-info__row">
          <span class="detail-info__label">游戏类型</span>
          <span class="detail-info__value">${gameType.name}</span>
        </div>
        <div class="detail-info__row">
          <span class="detail-info__label">对局结果</span>
          <span class="detail-info__badge detail-info__badge--${result.class}">${result.text === '胜' ? '胜利' : result.text === '平' ? '平局' : '失败'}</span>
        </div>
        ${item.level ? `
        <div class="detail-info__row">
          <span class="detail-info__label">关卡</span>
          <span class="detail-info__value">第 ${item.level} 关</span>
        </div>
        ` : ''}
        <div class="detail-info__row">
          <span class="detail-info__label">对局时间</span>
          <span class="detail-info__value">${dateStr}</span>
        </div>
      </div>
    `;

    // 如果有moves数据，显示详细信息（棋盘式布局）
    if (movesData && movesData.stage1 && movesData.stage2 && movesData.final) {
      html += `<div class="game-board">`;
      
      // 第一列：第一阶段 1-2组
      html += `
        <div class="game-board__column">
          <div class="game-board__column-title">第一阶段 (1-2组)</div>
      `;
      
      [1, 2].forEach(pairId => {
        const pair = movesData.stage1.find(p => p.pairId === pairId);
        if (pair) {
          const playerClass = pair.winner === 'player' ? 'game-board__box--win' : pair.winner === 'draw' ? '' : 'game-board__box--lose';
          const opponentClass = pair.winner === 'opponent' ? 'game-board__box--win' : pair.winner === 'draw' ? '' : 'game-board__box--lose';
          
          html += `
            <div class="game-board__pair">
              <div class="game-board__box game-board__box--player ${playerClass}">
                <div class="game-board__label">玩家 (${pairId}组)</div>
                <div class="game-board__emoji">${pair.player}</div>
                ${pair.winner === 'player' ? '<div class="game-board__result game-board__result--win">胜</div>' : pair.winner === 'draw' ? '<div class="game-board__result game-board__result--draw">平</div>' : '<div class="game-board__result game-board__result--lose">败</div>'}
              </div>
              <div class="game-board__box game-board__box--opponent ${opponentClass}">
                <div class="game-board__label">对手 (${pairId}组)</div>
                <div class="game-board__emoji">${pair.opponent}</div>
                ${pair.winner === 'opponent' ? '<div class="game-board__result game-board__result--win">胜</div>' : pair.winner === 'draw' ? '<div class="game-board__result game-board__result--draw">平</div>' : '<div class="game-board__result game-board__result--lose">败</div>'}
              </div>
            </div>
          `;
        }
      });
      
      html += `</div>`;
      
      // 第二列：第一阶段 3-4组
      html += `
        <div class="game-board__column">
          <div class="game-board__column-title">第一阶段 (3-4组)</div>
      `;
      
      [3, 4].forEach(pairId => {
        const pair = movesData.stage1.find(p => p.pairId === pairId);
        if (pair) {
          const playerClass = pair.winner === 'player' ? 'game-board__box--win' : pair.winner === 'draw' ? '' : 'game-board__box--lose';
          const opponentClass = pair.winner === 'opponent' ? 'game-board__box--win' : pair.winner === 'draw' ? '' : 'game-board__box--lose';
          
          html += `
            <div class="game-board__pair">
              <div class="game-board__box game-board__box--player ${playerClass}">
                <div class="game-board__label">玩家 (${pairId}组)</div>
                <div class="game-board__emoji">${pair.player}</div>
                ${pair.winner === 'player' ? '<div class="game-board__result game-board__result--win">胜</div>' : pair.winner === 'draw' ? '<div class="game-board__result game-board__result--draw">平</div>' : '<div class="game-board__result game-board__result--lose">败</div>'}
              </div>
              <div class="game-board__box game-board__box--opponent ${opponentClass}">
                <div class="game-board__label">对手 (${pairId}组)</div>
                <div class="game-board__emoji">${pair.opponent}</div>
                ${pair.winner === 'opponent' ? '<div class="game-board__result game-board__result--win">胜</div>' : pair.winner === 'draw' ? '<div class="game-board__result game-board__result--draw">平</div>' : '<div class="game-board__result game-board__result--lose">败</div>'}
              </div>
            </div>
          `;
        }
      });
      
      html += `</div>`;
      
      // 第三列：第二阶段
      html += `
        <div class="game-board__column">
          <div class="game-board__column-title">第二阶段</div>
      `;
      
      movesData.stage2.forEach((semi, index) => {
        const resultClass = semi.resultSide === 'player' ? 'game-board__box--win' : 'game-board__box--lose';
        const fromGroups = semi.from.join(',');
        html += `
          <div class="game-board__pair">
            <div class="game-board__box game-board__box--stage ${resultClass}">
              <div class="game-board__label">晋级${index + 1} (${fromGroups}组)</div>
              <div class="game-board__emoji">${semi.result}</div>
              <div class="game-board__result game-board__result--${semi.resultSide === 'player' ? 'win' : 'lose'}">${semi.resultSide === 'player' ? '玩家晋级' : '对手晋级'}</div>
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
      
      // 第四列：最终
      const winner = movesData.final.winner;
      const finalClass = winner.side === 'player' ? 'game-board__box--win' : 'game-board__box--lose';
      
      html += `
        <div class="game-board__column">
          <div class="game-board__column-title">最终</div>
          <div class="game-board__pair">
            <div class="game-board__box game-board__box--final ${finalClass}">
              <div class="game-board__label">🏆 获胜者</div>
              <div class="game-board__emoji">${winner.emoji}</div>
              <div class="game-board__result game-board__result--${winner.side === 'player' ? 'win' : 'lose'}">${winner.side === 'player' ? '玩家（你）' : '对手'}</div>
            </div>
          </div>
        </div>
      `;
      
      html += `</div>`;
    } else {
      // 没有详细数据
      html += `
        <div class="detail-empty">
          <div class="detail-empty__icon">📊</div>
          <div class="detail-empty__text">暂无详细对局数据</div>
        </div>
      `;
    }

    return html;
  }

  /**
   * 初始化
   */
  function init() {
    // 检查认证状态
    const user = window.SuperRPSAuth ? window.SuperRPSAuth.getCurrentUser() : null;

    if (!user) {
      showLoginPrompt();
    } else {
      // 获取历史记录
      fetchHistory();
    }

    // 绑定事件
    bindEventListeners();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 导出API（供其他模块使用）
  window.SuperRPSHistory = {
    refresh: fetchHistory,
    applyFilters: applyFilters
  };
})();

