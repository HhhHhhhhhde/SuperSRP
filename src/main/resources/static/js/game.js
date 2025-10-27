// 超级石头剪刀布 - 点击图例出手版本
(function () {
  const EMOJIS = ['✂', '🪨', '🩹'];
  let currentSide = 'player'; // 当前选中的出手方
  let selectedPair = 1; // 当前选中的组（1-4）
  let gameData = {
    stage1: [], // 第一阶段：4组对战
    stage2: [], // 第二阶段：2组晋级
    final: null, // 最终结果
    started: false,
    finished: false,
    saved: false
  }; // 记录游戏数据
  
  // API配置
  const API_CONFIG = {
    baseURL: 'https://web-production-d61ef.up.railway.app/api/game',
    endpoints: {
      save: '/save'
    }
  };

  function randomChoice() {
    return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  }

  function outcome(a, b) {
    if (a === b) return 0;
    if ((a === '✂' && b === '🩹') || (a === '🪨' && b === '✂') || (a === '🩹' && b === '🪨')) return 1;
    return -1;
  }

  function setBoxEmoji(boxEl, emoji, hideEmoji = false) {
    if (!boxEl) return;
    boxEl.dataset.emoji = emoji || '';
    const emojiEl = boxEl.querySelector('.box__emoji');
    if (emojiEl) {
      if (hideEmoji && emoji && EMOJIS.includes(emoji)) {
        emojiEl.textContent = '已出手';
        emojiEl.style.fontSize = '14px';
        boxEl.classList.add('hidden-move');
      } else {
        emojiEl.textContent = emoji || '—';
        emojiEl.style.fontSize = '';
        boxEl.classList.remove('hidden-move');
      }
    }
  }

  function clearBoxState(boxEl) {
    if (!boxEl) return;
    boxEl.classList.remove('is-winner', 'is-loser', 'is-draw', 'stage--player', 'stage--opponent');
  }

  function renderInitial() {
    // 在重置前保存当前游戏记录（如果游戏已完成）
    if (gameData.finished && !gameData.saved) {
      saveGameToBackend();
    }
    
    document.querySelectorAll('.pair').forEach((pairEl) => {
      const playerBox = pairEl.querySelector('.box--player');
      const opponentBox = pairEl.querySelector('.box--opponent');
      if (playerBox) {
        clearBoxState(playerBox);
        setBoxEmoji(playerBox, '?');
      }
      if (opponentBox) {
        clearBoxState(opponentBox);
        setBoxEmoji(opponentBox, '?');
      }
    });
    document.querySelectorAll('.col--semis .box').forEach((b) => {
      clearBoxState(b);
      setBoxEmoji(b, '—');
    });
    document.querySelectorAll('.col--final .box').forEach((b) => {
      clearBoxState(b);
      setBoxEmoji(b, '🏆');
    });
    
    // 重置游戏数据
    gameData = {
      stage1: [],
      stage2: [],
      final: null,
      started: false,
      finished: false,
      saved: false
    };
  }

  // 更新当前选中方和选中组的高亮
  function updateSelection() {
    const playerChip = document.querySelector('.chip--player');
    const opponentChip = document.querySelector('.chip--opponent');
    
    // 高亮当前选中方
    if (currentSide === 'player') {
      if (playerChip) playerChip.style.outline = '2px solid #2563eb';
      if (opponentChip) opponentChip.style.outline = 'none';
    } else {
      if (opponentChip) opponentChip.style.outline = '2px solid #2563eb';
      if (playerChip) playerChip.style.outline = 'none';
    }

    // 高亮当前选中的组
    document.querySelectorAll('.pair').forEach((pairEl, idx) => {
      if (idx + 1 === selectedPair) {
        pairEl.style.outline = '2px solid #fbbf24';
      } else {
        pairEl.style.outline = 'none';
      }
    });
  }

  // 点击方框选择该组
  function enablePairSelection() {
    document.querySelectorAll('.pair').forEach((pairEl) => {
      pairEl.style.cursor = 'pointer';
      pairEl.addEventListener('click', () => {
        const pairId = parseInt(pairEl.dataset.pair);
        selectedPair = pairId;
        
        // 检查该组双方是否都没出手，如果是则自动切换到玩家（白方）
        checkAndSwitchToPlayer(pairEl);
        
        updateSelection();
      });
    });
  }
  
  // 智能切换出手方：根据小局状态自动切换到未出手的一方
  function checkAndSwitchToPlayer(pairEl) {
    const playerBox = pairEl.querySelector('.box--player');
    const opponentBox = pairEl.querySelector('.box--opponent');
    
    const playerChoice = playerBox?.dataset.emoji;
    const opponentChoice = opponentBox?.dataset.emoji;
    
    const playerHasChosen = EMOJIS.includes(playerChoice);
    const opponentHasChosen = EMOJIS.includes(opponentChoice);
    
    // 情况1：双方都没出手 → 切换到玩家（白方）
    if (!playerHasChosen && !opponentHasChosen) {
      currentSide = 'player';
    }
    // 情况2：玩家已出手，对手未出手 → 切换到对手
    else if (playerHasChosen && !opponentHasChosen) {
      currentSide = 'opponent';
    }
    // 情况3：对手已出手，玩家未出手 → 切换到玩家
    else if (!playerHasChosen && opponentHasChosen) {
      currentSide = 'player';
    }
    // 情况4：双方都已出手 → 保持当前出手方（不切换）
  }

  // 检查某组是否已锁定（已判定胜负）
  function isPairLocked(pairEl) {
    const playerBox = pairEl.querySelector('.box--player');
    const opponentBox = pairEl.querySelector('.box--opponent');
    
    // 如果有胜负标记，说明已锁定
    return playerBox?.classList.contains('is-winner') || 
           playerBox?.classList.contains('is-loser') ||
           opponentBox?.classList.contains('is-winner') ||
           opponentBox?.classList.contains('is-loser');
  }

  // 为当前选中的组和出手方设置emoji
  function setCurrentChoice(emoji) {
    const pairEl = document.getElementById(`pair-${selectedPair}`);
    if (!pairEl) return;
    
    // 检查该组是否已锁定
    if (isPairLocked(pairEl)) {
      alert('该组已完成判定，不能修改！\n如需重赛请等待系统自动清空。');
      return;
    }
    
    const targetBox = currentSide === 'player' 
      ? pairEl.querySelector('.box--player')
      : pairEl.querySelector('.box--opponent');
    
    if (!targetBox) return;
    
    clearBoxState(targetBox);
    
    // 始终隐藏出手的手势，显示"已出手"
    // 等双方都出手后，在checkPairAndJudge中延迟显示真实手势
    setBoxEmoji(targetBox, emoji, true);
    
    // 检查对方是否已出手
    const otherBox = currentSide === 'player'
      ? pairEl.querySelector('.box--opponent')
      : pairEl.querySelector('.box--player');
    
    const otherChoice = otherBox?.dataset.emoji;
    const otherHasChosen = EMOJIS.includes(otherChoice);
    
    // 如果对方还没出手，自动切换到对方
    if (!otherHasChosen) {
      currentSide = currentSide === 'player' ? 'opponent' : 'player';
      updateSelection();
    }
    
    // 检查该组是否双方都已出手
    checkPairAndJudge(pairEl);
  }

  // 检查某一组是否双方都出手了，如果是则判断胜负
  function checkPairAndJudge(pairEl) {
    const playerBox = pairEl.querySelector('.box--player');
    const opponentBox = pairEl.querySelector('.box--opponent');
    if (!playerBox || !opponentBox) return;

    const playerChoice = playerBox.dataset.emoji;
    const opponentChoice = opponentBox.dataset.emoji;

    // 检查是否都选了有效的剪刀石头布
    if (!EMOJIS.includes(playerChoice) || !EMOJIS.includes(opponentChoice)) {
      return; // 还没选完
    }

    // 双方都出手了，显示真实手势
    setTimeout(() => {
      setBoxEmoji(playerBox, playerChoice, false);
      setBoxEmoji(opponentBox, opponentChoice, false);
      
      // 判断胜负
      const result = outcome(playerChoice, opponentChoice);
      
      // 记录第一阶段数据
      const pairId = parseInt(pairEl.dataset.pair);
      const existingIndex = gameData.stage1.findIndex(item => item.pairId === pairId);
      const pairData = {
        pairId: pairId,
        player: playerChoice,
        opponent: opponentChoice,
        result: result === 0 ? 'draw' : result === 1 ? 'win' : 'lose',
        winner: result === 0 ? 'draw' : result === 1 ? 'player' : 'opponent'
      };
      
      if (existingIndex >= 0) {
        gameData.stage1[existingIndex] = pairData;
      } else {
        gameData.stage1.push(pairData);
      }

      if (result === 0) {
        // 平局，清空该组重来
        playerBox.classList.add('is-draw');
        opponentBox.classList.add('is-draw');
        setTimeout(() => {
          clearBoxState(playerBox);
          clearBoxState(opponentBox);
          setBoxEmoji(playerBox, '?');
          setBoxEmoji(opponentBox, '?');
        }, 1200);
      } else if (result === 1) {
        // 玩家赢
        playerBox.classList.add('is-winner');
        opponentBox.classList.add('is-loser');
      } else {
        // 对方赢
        opponentBox.classList.add('is-winner');
        playerBox.classList.add('is-loser');
      }

      // 检查两两配对晋级
      checkPairGroupsComplete();
    }, 300); // 延迟300ms显示，增加悬念
  }

  // 检查1-2组或3-4组是否都完成，如果完成则晋级
  function checkPairGroupsComplete() {
    // 检查1-2组
    checkAndPromoteGroup([1, 2], '#semi-1');
    // 检查3-4组
    checkAndPromoteGroup([3, 4], '#semi-2');
    // 检查二阶段是否都完成
    checkSemisComplete();
  }

  function checkAndPromoteGroup(pairIds, semiSelector) {
    const winners = pairIds.map(id => getPairWinner(id));
    
    // 如果两组都有胜者
    if (winners.every(w => w !== null)) {
      // 检查是否已经晋级过了
      const semiBox = document.querySelector(`${semiSelector} .box`);
      if (semiBox && semiBox.dataset.emoji !== '—') return; // 已经晋级过了
      
      // 进行晋级判定，返回是否需要重赛
      const needRematch = promoteWinners(winners[0], winners[1], semiSelector, pairIds);
      
      // 如果需要重赛，清空这两组
      if (needRematch) {
        setTimeout(() => {
          pairIds.forEach(id => {
            const pairEl = document.getElementById(`pair-${id}`);
            if (pairEl) {
              const playerBox = pairEl.querySelector('.box--player');
              const opponentBox = pairEl.querySelector('.box--opponent');
              if (playerBox) {
                clearBoxState(playerBox);
                setBoxEmoji(playerBox, '?');
              }
              if (opponentBox) {
                clearBoxState(opponentBox);
                setBoxEmoji(opponentBox, '?');
              }
            }
          });
        }, 1000); // 延迟1秒让用户看到平局
      }
    }
  }

  function promoteWinners(winner1, winner2, semiSelector, pairIds) {
    const side1 = winner1.side;
    const side2 = winner2.side;
    const emoji1 = winner1.emoji;
    const emoji2 = winner2.emoji;
    
    let finalSide, finalEmoji, needRematch = false;
    
    if (side1 === side2) {
      // 同一阵营，直接晋级该阵营
      finalSide = side1;
      // 比较手势
      const result = outcome(emoji1, emoji2);
      if (result === 0) {
        // 同一方相同手势，保留
        finalEmoji = emoji1;
      } else if (result === 1) {
        finalEmoji = emoji1;
      } else {
        finalEmoji = emoji2;
      }
    } else {
      // 不同阵营，需要决出哪一方晋级
      const result = outcome(emoji1, emoji2);
      
      // 如果是相同手势（平局），需要重赛两组
      if (result === 0) {
        needRematch = true;
        // 先显示平局状态
        pairIds.forEach(id => {
          const pairEl = document.getElementById(`pair-${id}`);
          if (pairEl) {
            const playerBox = pairEl.querySelector('.box--player');
            const opponentBox = pairEl.querySelector('.box--opponent');
            if (playerBox) playerBox.classList.add('is-draw');
            if (opponentBox) opponentBox.classList.add('is-draw');
          }
        });
        return needRematch; // 返回需要重赛，不进行晋级
      } else {
        finalSide = result === 1 ? side1 : side2;
        finalEmoji = result === 1 ? emoji1 : emoji2;
      }
    }

    const box = document.querySelector(`${semiSelector} .box`);
    if (box) {
      clearBoxState(box);
      setBoxEmoji(box, finalEmoji);
      // 使用胜者对应的背景色
      if (finalSide === 'player') box.classList.add('stage--player');
      else box.classList.add('stage--opponent');
      box.dataset.winnerSide = finalSide;
      
      // 记录第二阶段数据
      const semiId = semiSelector === '#semi-1' ? 1 : 2;
      const semiData = {
        semiId: semiId,
        from: pairIds,
        winner1: { side: side1, emoji: emoji1 },
        winner2: { side: side2, emoji: emoji2 },
        result: finalEmoji,
        resultSide: finalSide
      };
      const existingIndex = gameData.stage2.findIndex(item => item.semiId === semiId);
      if (existingIndex >= 0) {
        gameData.stage2[existingIndex] = semiData;
      } else {
        gameData.stage2.push(semiData);
      }
    }
    
    return needRematch;
  }

  function checkSemisComplete() {
    const semi1Box = document.querySelector('#semi-1 .box');
    const semi2Box = document.querySelector('#semi-2 .box');
    
    if (!semi1Box || !semi2Box) return;
    
    const semi1Emoji = semi1Box.dataset.emoji;
    const semi2Emoji = semi2Box.dataset.emoji;
    
    // 如果两个二阶段都有emoji（不是"—"）
    if (EMOJIS.includes(semi1Emoji) && EMOJIS.includes(semi2Emoji)) {
      const finalBox = document.querySelector('#final .box');
      // 检查是否已经完成最终决战
      if (finalBox && finalBox.dataset.emoji === '🏆') {
        setTimeout(() => {
          const needRematch = promoteFinal(semi1Box, semi2Box);
          // 如果需要重赛，清空两个二阶段
          if (needRematch) {
            setTimeout(() => {
              // 清空semi-1对应的1-2组
              [1, 2].forEach(id => {
                const pairEl = document.getElementById(`pair-${id}`);
                if (pairEl) {
                  const playerBox = pairEl.querySelector('.box--player');
                  const opponentBox = pairEl.querySelector('.box--opponent');
                  if (playerBox) { clearBoxState(playerBox); setBoxEmoji(playerBox, '?'); }
                  if (opponentBox) { clearBoxState(opponentBox); setBoxEmoji(opponentBox, '?'); }
                }
              });
              // 清空semi-2对应的3-4组
              [3, 4].forEach(id => {
                const pairEl = document.getElementById(`pair-${id}`);
                if (pairEl) {
                  const playerBox = pairEl.querySelector('.box--player');
                  const opponentBox = pairEl.querySelector('.box--opponent');
                  if (playerBox) { clearBoxState(playerBox); setBoxEmoji(playerBox, '?'); }
                  if (opponentBox) { clearBoxState(opponentBox); setBoxEmoji(opponentBox, '?'); }
                }
              });
              // 清空两个二阶段
              clearBoxState(semi1Box); setBoxEmoji(semi1Box, '—');
              clearBoxState(semi2Box); setBoxEmoji(semi2Box, '—');
            }, 1000);
          }
        }, 500);
      }
    }
  }

  function promoteFinal(semi1Box, semi2Box) {
    const side1 = semi1Box.dataset.winnerSide;
    const side2 = semi2Box.dataset.winnerSide;
    const emoji1 = semi1Box.dataset.emoji;
    const emoji2 = semi2Box.dataset.emoji;
    
    let finalSide, finalEmoji, needRematch = false;
    
    if (side1 === side2) {
      // 同一阵营，直接晋级该阵营
      finalSide = side1;
      // 比较手势
      const result = outcome(emoji1, emoji2);
      if (result === 0) {
        // 同一方相同手势，保留
        finalEmoji = emoji1;
      } else if (result === 1) {
        finalEmoji = emoji1;
      } else {
        finalEmoji = emoji2;
      }
    } else {
      // 不同阵营，需要决出哪一方晋级
      const result = outcome(emoji1, emoji2);
      
      // 如果是相同手势（平局），需要重赛四组
      if (result === 0) {
        needRematch = true;
        // 先显示平局状态
        semi1Box.classList.add('is-draw');
        semi2Box.classList.add('is-draw');
        return needRematch; // 返回需要重赛，不进行晋级
      } else {
        finalSide = result === 1 ? side1 : side2;
        finalEmoji = result === 1 ? emoji1 : emoji2;
      }
    }

    const finalBox = document.querySelector('#final .box');
    if (finalBox) {
      clearBoxState(finalBox);
      setBoxEmoji(finalBox, finalEmoji);
      // 使用胜者对应的背景色
      if (finalSide === 'player') finalBox.classList.add('stage--player');
      else finalBox.classList.add('stage--opponent');
      
      // 游戏完成，标记并保存
      if (!needRematch) {
        gameData.finished = true;
        gameData.result = finalSide === 'player' ? 'win' : 'lose';
        gameData.final = {
          semi1: { side: side1, emoji: emoji1 },
          semi2: { side: side2, emoji: emoji2 },
          winner: { side: finalSide, emoji: finalEmoji }
        };
        
        // 延迟保存，让用户看到结果
        setTimeout(() => {
          saveGameToBackend();
        }, 2000);
      }
    }
    
    return needRematch;
  }

  function getPairWinner(pairId) {
    const pairEl = document.getElementById(`pair-${pairId}`);
    const playerBox = pairEl?.querySelector('.box--player');
    const opponentBox = pairEl?.querySelector('.box--opponent');
    
    if (!playerBox || !opponentBox) return null;
    
    if (playerBox.classList.contains('is-winner')) {
      return { side: 'player', emoji: playerBox.dataset.emoji };
    } else if (opponentBox.classList.contains('is-winner')) {
      return { side: 'opponent', emoji: opponentBox.dataset.emoji };
    }
    return null;
  }

  function randomizeAllPairs() {
    document.querySelectorAll('.box--player').forEach((box) => {
      clearBoxState(box);
      setBoxEmoji(box, randomChoice());
    });
    document.querySelectorAll('.box--opponent').forEach((box) => {
      clearBoxState(box);
      setBoxEmoji(box, randomChoice());
    });
    
    document.querySelectorAll('.pair').forEach((pairEl) => {
      checkPairAndJudge(pairEl);
    });
  }

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

  function bindEvents() {
    const btnNew = document.getElementById('btn-new');
    const btnRandom = document.getElementById('btn-random');
    const btnClear = document.getElementById('btn-clear');
    const btnTheme = document.getElementById('btn-theme');
    
    if (btnNew) btnNew.addEventListener('click', () => { renderInitial(); });
    if (btnRandom) btnRandom.addEventListener('click', () => { 
      renderInitial();
      setTimeout(() => randomizeAllPairs(), 100);
    });
    if (btnClear) btnClear.addEventListener('click', renderInitial);
    if (btnTheme) btnTheme.addEventListener('click', toggleTheme);
    
    // 键盘快捷键：R=✂（Rock/剪刀）, P=🩹（Paper/布）, S=🪨（Stone/石头）
    document.addEventListener('keydown', (e) => {
      // 忽略在输入框中的按键
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      const key = e.key.toUpperCase();
      let emoji = null;
      
      if (key === 'R') {
        emoji = '✂'; // R for Rock/剪刀
      } else if (key === 'P') {
        emoji = '🩹'; // P for Paper/布
      } else if (key === 'S') {
        emoji = '🪨'; // S for Stone/石头
      } else if (key === '1' || key === '2' || key === '3' || key === '4') {
        // 数字键切换选中的组
        selectedPair = parseInt(key);
        const pairEl = document.getElementById(`pair-${selectedPair}`);
        if (pairEl) {
          // 检查该组双方是否都没出手，如果是则自动切换到玩家（白方）
          checkAndSwitchToPlayer(pairEl);
        }
        updateSelection();
        return;
      } else if (key === 'TAB' || key === 'SPACE') {
        // Tab或空格键切换出手方
        e.preventDefault();
        currentSide = currentSide === 'player' ? 'opponent' : 'player';
        updateSelection();
        return;
      }
      
      if (emoji) {
        e.preventDefault();
        setCurrentChoice(emoji);
      }
    });

    // 点击图例切换当前出手方
    const playerChip = document.querySelector('.chip--player');
    const opponentChip = document.querySelector('.chip--opponent');
    
    if (playerChip) {
      playerChip.style.cursor = 'pointer';
      playerChip.addEventListener('click', () => {
        currentSide = 'player';
        updateSelection();
      });
    }
    
    if (opponentChip) {
      opponentChip.style.cursor = 'pointer';
      opponentChip.addEventListener('click', () => {
        currentSide = 'opponent';
        updateSelection();
      });
    }

    // 点击剪刀石头布图例进行出手
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
          setCurrentChoice(emoji);
        });
      }
    });
  }

  // 侧边栏和顶栏交互
  function bindUIEvents() {
    // 侧边栏切换
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }
    
    // 模式切换
    const modeLinks = document.querySelectorAll('.sidebar__link');
    
    modeLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const mode = link.dataset.mode;
        
        // 闯关模式跳转到专门页面
        if (mode === 'stage') {
          window.location.href = '/stage';
          return;
        }
        
        // 人机对战暂未开发
        if (mode === 'ai') {
          e.preventDefault();
          alert('人机对战模式开发中，敬请期待！');
          return;
        }
      });
    });
    
    // 顶栏按钮（登录按钮由auth.js处理）
    const btnHistory = document.getElementById('btn-history');
    
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
  }

  // 保存游戏记录到后端
  async function saveGameToBackend() {
    // 检查用户是否登录
    const user = window.SuperRPSAuth ? window.SuperRPSAuth.getCurrentUser() : null;
    const token = window.SuperRPSAuth ? window.SuperRPSAuth.getToken() : null;
    
    if (!user || !token) {
      console.log('用户未登录，跳过保存游戏记录');
      return;
    }
    
    // 检查游戏是否完成
    if (!gameData.finished || gameData.saved) {
      return;
    }
    
    try {
      // 收集游戏数据
      const moves = {
        stage1: gameData.stage1 || [],
        stage2: gameData.stage2 || [],
        final: gameData.final || null
      };
      
      const payload = {
        gameType: 'pvp', // 玩家对战
        level: null,     // 非闯关模式
        result: gameData.result, // 'win' 或 'lose'
        moves: JSON.stringify(moves)
      };
      
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.save}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log('游戏记录保存成功');
        gameData.saved = true;
      } else {
        console.error('保存游戏记录失败:', response.status);
      }
    } catch (error) {
      console.error('保存游戏记录时发生错误:', error);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderInitial();
    enablePairSelection();
    bindEvents();
    bindUIEvents();
    updateSelection();
  });
})();
