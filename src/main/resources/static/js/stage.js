// 闯关模式 - 多关卡支持
(function () {
  const EMOJIS = ['✂', '🪨', '🩹'];
  let selectedBox = null;
  let levelsData = null;
  let currentLevelId = 1;
  let currentLevel = null;

  // 石头剪刀布判定
  function outcome(a, b) {
    if (a === b) return 0;
    if ((a === '✂' && b === '🩹') || (a === '🪨' && b === '✂') || (a === '🩹' && b === '🪨')) return 1;
    return -1;
  }

  // 设置方框emoji
  function setBoxEmoji(boxEl, emoji) {
    if (!boxEl) return;
    boxEl.dataset.emoji = emoji || '';
    const emojiEl = boxEl.querySelector('.box__emoji');
    if (emojiEl) emojiEl.textContent = emoji || '?';
  }

  // 清除方框状态
  function clearBoxState(boxEl) {
    if (!boxEl) return;
    boxEl.classList.remove('is-winner', 'is-loser', 'is-draw', 'stage--player', 'stage--opponent', 'box--selected');
  }

  // 加载关卡数据
  async function loadLevels() {
    try {
      const response = await fetch('/data/levels.json');
      levelsData = await response.json();
      return levelsData;
    } catch (error) {
      console.error('加载关卡数据失败:', error);
      alert('加载关卡数据失败，请刷新页面重试！');
      return null;
    }
  }

  // 根据关卡数据初始化界面
  function initLevel(levelId) {
    if (!levelsData) return;
    
    const level = levelsData.levels.find(l => l.id === levelId);
    if (!level) {
      alert('关卡不存在！');
      return;
    }
    
    currentLevel = level;
    currentLevelId = levelId;
    
    // 更新关卡标题
    const levelTitle = document.querySelector('.toolbar h1');
    if (levelTitle) {
      levelTitle.textContent = `闯关模式 - ${level.name}`;
    }
    
    // 重置所有方框
    document.querySelectorAll('.box').forEach(box => {
      box.classList.remove('box--locked');
      clearBoxState(box);
    });
    
    // 设置第一阶段
    level.initial.forEach((data) => {
      const pairEl = document.getElementById(`pair-${data.pair}`);
      if (!pairEl) return;
      
      const playerBox = pairEl.querySelector('.box--player');
      const opponentBox = pairEl.querySelector('.box--opponent');
      
      if (playerBox) {
        if (data.player) {
          setBoxEmoji(playerBox, data.player);
          playerBox.classList.add('box--locked');
          playerBox.style.cursor = 'not-allowed';
        } else {
          setBoxEmoji(playerBox, '');
          playerBox.classList.remove('box--locked');
          playerBox.style.cursor = 'pointer';
        }
      }
      
      if (opponentBox) {
        if (data.opponent) {
          setBoxEmoji(opponentBox, data.opponent);
          opponentBox.classList.add('box--locked');
          opponentBox.style.cursor = 'not-allowed';
        } else {
          setBoxEmoji(opponentBox, '');
          opponentBox.classList.remove('box--locked');
          opponentBox.style.cursor = 'pointer';
        }
      }
    });
    
    // 设置第二阶段提示
    level.hints.forEach((hint) => {
      if (hint.stage === 'semi') {
        const semiBox = document.querySelector(`#semi-${hint.box} .box`);
        if (!semiBox) return;
        
        if (hint.emoji) {
          setBoxEmoji(semiBox, hint.emoji);
          if (hint.side) {
            semiBox.classList.add(`stage--${hint.side}`);
          }
          semiBox.classList.add('box--locked');
          semiBox.style.cursor = 'not-allowed';
        } else {
          setBoxEmoji(semiBox, '');
          semiBox.classList.remove('box--locked');
          semiBox.style.cursor = 'pointer';
        }
      }
    });
    
    // 设置最终阶段
    const finalBox = document.querySelector('#final .box');
    if (finalBox) {
      setBoxEmoji(finalBox, level.finalWinner.emoji);
      finalBox.classList.add(`stage--${level.finalWinner.side}`);
      finalBox.classList.add('box--locked');
      finalBox.style.cursor = 'not-allowed';
    }
  }

  // 选择方框
  function enableBoxSelection() {
    document.querySelectorAll('.box').forEach((box) => {
      box.addEventListener('click', () => {
        // 跳过已锁定的方框
        if (box.classList.contains('box--locked')) {
          return;
        }
        
        // 移除之前的选中状态
        document.querySelectorAll('.box').forEach(b => b.classList.remove('box--selected'));
        
        // 选中当前方框
        box.classList.add('box--selected');
        selectedBox = box;
      });
    });
  }

  // 点击图例设置emoji
  function enableEmojiSelection() {
    const allChips = document.querySelectorAll('.legend .chip');
    allChips.forEach((chip) => {
      const text = chip.textContent.trim();
      let emoji = null;
      
      if (text.includes('✂')) emoji = '✂';
      else if (text.includes('🪨')) emoji = '🪨';
      else if (text.includes('🩹')) emoji = '🩹';
      
      if (emoji) {
        chip.style.cursor = 'pointer';
        chip.addEventListener('click', () => {
          if (selectedBox && !selectedBox.classList.contains('box--locked')) {
            clearBoxState(selectedBox);
            setBoxEmoji(selectedBox, emoji);
          }
        });
      }
    });
  }

  // 检查答案
  function checkAnswer() {
    if (!currentLevel || !currentLevel.solution) {
      alert('当前关卡没有答案检查！');
      return;
    }
    
    let isCorrect = true;
    const errors = [];

    // 检查第一阶段
    currentLevel.solution.forEach((data, index) => {
      const pairEl = document.getElementById(`pair-${data.pair}`);
      if (!pairEl) return;
      
      const playerBox = pairEl.querySelector('.box--player');
      const opponentBox = pairEl.querySelector('.box--opponent');
      
      if (playerBox && playerBox.dataset.emoji !== data.player) {
        isCorrect = false;
        errors.push(`第${data.pair}组白方`);
      }
      if (opponentBox && opponentBox.dataset.emoji !== data.opponent) {
        isCorrect = false;
        errors.push(`第${data.pair}组黑方`);
      }
    });

    // 检查第二阶段（如果有需要填写的）
    if (currentLevel.solutionSemis) {
      currentLevel.solutionSemis.forEach((data) => {
        const semiBox = document.querySelector(`#semi-${data.box} .box`);
        if (!semiBox) return;
        
        // 只检查未锁定的
        if (!semiBox.classList.contains('box--locked')) {
          if (semiBox.dataset.emoji !== data.emoji) {
            isCorrect = false;
            errors.push(`第二阶段${data.box === 1 ? '左侧' : '右侧'}`);
          }
        }
      });
    }

    if (isCorrect) {
      // 答对了！计算并显示结果
      calculateResults();
      setTimeout(() => {
        const nextLevelId = currentLevelId + 1;
        const hasNext = levelsData.levels.find(l => l.id === nextLevelId);
        
        if (hasNext) {
          const goNext = confirm(`🎉 恭喜通关${currentLevel.name}！\n\n是否继续挑战${hasNext.name}？`);
          if (goNext) {
            initLevel(nextLevelId);
            resetUI();
          }
        } else {
          alert(`🎉 恭喜通关${currentLevel.name}！\n\n你已完成所有关卡！`);
        }
      }, 1000);
    } else {
      alert('❌ 答案不正确\n\n错误位置：' + errors.join('、') + '\n\n请重新思考！');
    }
  }

  // 计算并显示结果（验证逻辑）
  function calculateResults() {
    if (!currentLevel || !currentLevel.solution) return;
    
    // 第一阶段判定
    currentLevel.solution.forEach((data) => {
      const pairEl = document.getElementById(`pair-${data.pair}`);
      if (!pairEl) return;
      
      const playerBox = pairEl.querySelector('.box--player');
      const opponentBox = pairEl.querySelector('.box--opponent');
      
      if (!playerBox || !opponentBox) return;
      
      const playerEmoji = playerBox.dataset.emoji;
      const opponentEmoji = opponentBox.dataset.emoji;
      
      if (!EMOJIS.includes(playerEmoji) || !EMOJIS.includes(opponentEmoji)) return;
      
      const result = outcome(playerEmoji, opponentEmoji);
      clearBoxState(playerBox);
      clearBoxState(opponentBox);
      
      if (result === 1) {
        playerBox.classList.add('is-winner');
        opponentBox.classList.add('is-loser');
      } else if (result === -1) {
        opponentBox.classList.add('is-winner');
        playerBox.classList.add('is-loser');
      }
    });

    // 第二阶段显示胜者背景色
    if (currentLevel.solutionSemis) {
      currentLevel.solutionSemis.forEach((data) => {
        const semiBox = document.querySelector(`#semi-${data.box} .box`);
        if (!semiBox) return;
        
        clearBoxState(semiBox);
        setBoxEmoji(semiBox, data.emoji);
        if (data.side) {
          semiBox.classList.add(`stage--${data.side}`);
        }
      });
    }
  }

  // 重置UI（清除选择状态）
  function resetUI() {
    document.querySelectorAll('.box').forEach(b => {
      if (!b.classList.contains('box--locked')) {
        clearBoxState(b);
      }
      b.classList.remove('box--selected');
    });
    selectedBox = null;
  }

  // 重置关卡
  function reset() {
    initLevel(currentLevelId);
    resetUI();
  }

  // 主题切换
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    localStorage.setItem('superrps-theme', theme);
    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
      btnTheme.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btnTheme.textContent = theme === 'dark' ? '☀️ 白天' : '🌙 黑夜';
    }
  }

  function initTheme() {
    const saved = localStorage.getItem('superrps-theme');
    const theme = (saved === 'dark' || saved === 'light') ? saved : 'light';
    applyTheme(theme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  // 绑定事件
  function bindEvents() {
    const btnCheck = document.getElementById('btn-check');
    const btnReset = document.getElementById('btn-reset');
    const btnTheme = document.getElementById('btn-theme');
    const btnLogin = document.getElementById('btn-login');
    const btnHistory = document.getElementById('btn-history');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (btnCheck) btnCheck.addEventListener('click', checkAnswer);
    if (btnReset) btnReset.addEventListener('click', reset);
    if (btnTheme) btnTheme.addEventListener('click', toggleTheme);
    
    // 登录按钮由auth.js处理
    if (btnHistory) {
      btnHistory.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 检查用户登录状态
        const user = window.SuperRPSAuth ? window.SuperRPSAuth.getCurrentUser() : null;
        
        if (!user) {
          alert('请先登录后再查看历史对局！');
          // 打开登录弹窗
          if (window.SuperRPSAuth) {
            window.SuperRPSAuth.openModal();
          }
        } else {
          // 已登录，跳转到历史对局页面
          window.location.href = '/history';
        }
      });
    }

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // 侧边栏导航
    const navLinks = document.querySelectorAll('.sidebar__nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '/stage' || href === '#stage') {
          e.preventDefault(); // 已经在闯关模式页面
        }
      });
    });
  }

  // 主初始化
  async function init() {
    initTheme();
    
    // 加载关卡数据
    await loadLevels();
    
    if (!levelsData) {
      alert('无法加载关卡数据！');
      return;
    }
    
    // 初始化第一关
    initLevel(1);
    
    // 绑定交互
    enableBoxSelection();
    enableEmojiSelection();
    bindEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
