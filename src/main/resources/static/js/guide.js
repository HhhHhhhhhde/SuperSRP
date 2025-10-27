// 游戏介绍模块
(function () {
  let guideModal = null;

  // 创建游戏介绍弹窗HTML
  function createGuideHTML() {
    return `
      <div class="guide-modal" id="guide-modal">
        <div class="guide-modal__content">
          <button class="guide-modal__close" id="guide-modal-close" aria-label="关闭">×</button>
          
          <div class="guide-modal__header">
            <h1 class="guide-modal__title">超级石头剪刀布</h1>
            <p class="guide-modal__subtitle">全新玩法，策略对决</p>
          </div>

          <div class="guide-modal__body">
            <!-- 游戏概述 -->
            <section class="guide-section">
              <h2 class="guide-section__title">游戏概述</h2>
              <div class="guide-section__content">
                <p><strong>超级石头剪刀布</strong>是基于经典石头剪刀布的淘汰赛玩法。通过多轮对决，最终产生唯一的冠军。</p>
                <div class="guide-emoji-row">
                  <div class="guide-emoji-item">
                    <div class="guide-emoji-item__icon">✂</div>
                    <div class="guide-emoji-item__label">剪刀</div>
                  </div>
                  <div class="guide-emoji-item">
                    <div class="guide-emoji-item__icon">🪨</div>
                    <div class="guide-emoji-item__label">石头</div>
                  </div>
                  <div class="guide-emoji-item">
                    <div class="guide-emoji-item__icon">🩹</div>
                    <div class="guide-emoji-item__label">布</div>
                  </div>
                </div>

                <div class="guide-rules">
                  <div class="guide-rules__title">克制关系</div>
                  <div class="guide-rules__grid">
                    <div class="guide-rules__item">✂ 胜 🩹</div>
                    <div class="guide-rules__item">🪨 胜 ✂</div>
                    <div class="guide-rules__item">🩹 胜 🪨</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- 核心规则 -->
            <section class="guide-section">
              <h2 class="guide-section__title">核心规则</h2>
              <div class="guide-section__content">
                <p><strong>1. 方框队列设置</strong></p>
                <ul class="guide-list">
                  <li>准备一个两个方框一组的队列，队列初始有<strong>四组方框</strong></li>
                  <li>每组包含两个方框：<strong>左方框为白色底</strong>（玩家），<strong>右方框为深灰色底</strong>（对手）</li>
                  <li>用 <strong>✂</strong>、<strong>🪨</strong>、<strong>🩹</strong> 指代剪刀、石头、布</li>
                </ul>

                <p><strong>2. 对决与晋级</strong></p>
                <ul class="guide-list">
                  <li>每组方框内的玩家（白）和对手（深灰）选择一个手势进行对决</li>
                  <li><strong>例如：</strong>某一组方框为 🪨（玩家）vs 🩹（对手），根据克制关系，布胜石头</li>
                  <li>这一组的胜者是对手的🩹，该组<strong>进化为一个二阶段的深灰方框🩹</strong></li>
                  <li>同理，如果是 🪨（玩家）vs ✂（对手），石头胜剪刀，<strong>进化为二阶段的白方框🪨</strong></li>
                </ul>

                <p><strong>3. 平局处理</strong></p>
                <ul class="guide-list">
                  <li>如果某一组出现<strong>相同手势</strong>（如 ✂ vs ✂），则为平局</li>
                  <li>系统会<strong>清空双方的选择</strong>，该组需要<strong>重新比赛</strong></li>
                </ul>
              </div>
            </section>

            <!-- 晋级机制 -->
            <section class="guide-section">
              <h2 class="guide-section__title">晋级机制</h2>
              <div class="guide-section__content">
                <p><strong>第一阶段 → 第二阶段（4组→2组）</strong></p>
                <ul class="guide-list">
                  <li>四组初始对决完成后，产生4个胜者</li>
                  <li>将这4个胜者<strong>两两配对</strong>，形成2组新的对决</li>
                  <li>每组对决的规则与初始阶段相同，比较手势克制关系</li>
                  <li><strong>特殊情况：</strong>如果两个胜者来自<strong>同一方</strong>（都是白色或都是深灰色），则直接比较他们的手势</li>
                  <li>例如：白🪨 vs 白✂ → 石头胜剪刀 → 晋级者为白🪨</li>
                </ul>

                <p><strong>第二阶段 → 最终阶段（2组→1组）</strong></p>
                <ul class="guide-list">
                  <li>两组二阶段对决完成后，产生2个胜者</li>
                  <li>这2个胜者进行<strong>最终对决</strong>，规则相同</li>
                  <li>如果都来自同一方，比较手势；如果来自不同方，按克制关系判定</li>
                  <li><strong>最终胜者</strong>即为本局游戏的冠军🏆</li>
                </ul>

                <p><strong>跨阶段平局处理</strong></p>
                <ul class="guide-list">
                  <li>如果第二阶段或最终阶段出现平局（<strong>不同方但相同手势</strong>）</li>
                  <li>需要<strong>清空涉及的初始对决组</strong>，重新从头开始比赛</li>
                  <li>例如：二阶段出现 白✂ vs 深灰✂（平局），则清空产生这两个胜者的初始组，重新对决</li>
                </ul>
              </div>
            </section>

            <!-- 游戏示例 -->
            <section class="guide-section">
              <h2 class="guide-section__title">游戏示例</h2>
              <div class="guide-section__content">
                <div class="guide-mode-card">
                  <div class="guide-mode-card__title">📋 完整对局流程</div>
                  <div class="guide-mode-card__desc">
                    <p><strong>第一阶段（初始4组）：</strong></p>
                    <ul class="guide-list">
                      <li>第1组：白🪨 vs 深灰✂ → 石头胜剪刀 → <strong>白🪨晋级</strong></li>
                      <li>第2组：白✂ vs 深灰🩹 → 剪刀胜布 → <strong>白✂晋级</strong></li>
                      <li>第3组：白🩹 vs 深灰🪨 → 布胜石头 → <strong>白🩹晋级</strong></li>
                      <li>第4组：白🪨 vs 深灰✂ → 石头胜剪刀 → <strong>白🪨晋级</strong></li>
                    </ul>
                    
                    <p><strong>第二阶段（2组）：</strong></p>
                    <ul class="guide-list">
                      <li>半决赛1：白🪨 vs 白✂（同方对决）→ 石头胜剪刀 → <strong>白🪨晋级</strong></li>
                      <li>半决赛2：白🩹 vs 白🪨（同方对决）→ 布胜石头 → <strong>白🩹晋级</strong></li>
                    </ul>
                    
                    <p><strong>最终阶段（1组）：</strong></p>
                    <ul class="guide-list">
                      <li>决赛：白🪨 vs 白🩹（同方对决）→ 布胜石头 → <strong>白🩹获胜 🏆</strong></li>
                    </ul>
                  </div>
                </div>

                <div class="guide-mode-card">
                  <div class="guide-mode-card__title">⚠️ 平局处理示例</div>
                  <div class="guide-mode-card__desc">
                    <p><strong>初始阶段平局：</strong></p>
                    <ul class="guide-list">
                      <li>第1组：白✂ vs 深灰✂ → <strong>平局！</strong>清空该组，重新选择手势</li>
                    </ul>
                    
                    <p><strong>跨阶段平局（需要重赛）：</strong></p>
                    <ul class="guide-list">
                      <li>假设半决赛出现：白🪨（来自第1组）vs 深灰🪨（来自第2组）→ <strong>平局！</strong></li>
                      <li>此时需要<strong>清空第1组和第2组</strong>，这两组重新进行对决</li>
                      <li>重新对决后产生新的胜者，继续半决赛</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <!-- 游戏模式 -->
            <section class="guide-section">
              <h2 class="guide-section__title">游戏模式</h2>
              <div class="guide-section__content">
                <div class="guide-mode-card">
                  <div class="guide-mode-card__title">👥 玩家对战</div>
                  <div class="guide-mode-card__desc">
                    自由设定每组对决的手势，观察淘汰赛的进程。可以模拟玩家与对手的策略对决。
                  </div>
                </div>

                <div class="guide-mode-card">
                  <div class="guide-mode-card__title">🎯 闯关模式</div>
                  <div class="guide-mode-card__desc">
                    根据已知的提示和最终结果，逆向推理出正确的手势组合。考验你的逻辑思维能力！
                  </div>
                </div>

                <div class="guide-mode-card">
                  <div class="guide-mode-card__title">🤖 人机对战</div>
                  <div class="guide-mode-card__desc">
                    <strong>开发中：</strong>挑战AI对手，测试你的策略和运气！
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="guide-footer">
            <p class="guide-footer__text">准备好开始游戏了吗？</p>
            <button class="guide-footer__button" id="guide-start-button">开始游戏</button>
          </div>
        </div>
      </div>
    `;
  }

  // 打开游戏介绍弹窗
  function openGuide() {
    if (!guideModal) {
      // 创建弹窗
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = createGuideHTML();
      document.body.appendChild(modalContainer.firstElementChild);
      guideModal = document.getElementById('guide-modal');

      // 绑定事件
      const closeBtn = document.getElementById('guide-modal-close');
      const startBtn = document.getElementById('guide-start-button');

      if (closeBtn) closeBtn.addEventListener('click', closeGuide);
      if (startBtn) startBtn.addEventListener('click', closeGuide);

      // 点击背景关闭
      guideModal.addEventListener('click', (e) => {
        if (e.target === guideModal) {
          closeGuide();
        }
      });

      // ESC键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && guideModal && guideModal.classList.contains('show')) {
          closeGuide();
        }
      });
    }

    // 显示弹窗
    guideModal.classList.add('show');
    
    // 滚动到顶部
    setTimeout(() => {
      const content = document.querySelector('.guide-modal__content');
      if (content) content.scrollTop = 0;
    }, 100);
  }

  // 关闭游戏介绍弹窗
  function closeGuide() {
    if (guideModal) {
      guideModal.classList.remove('show');
    }
  }

  // 初始化
  function init() {
    // 绑定游戏介绍按钮
    const btnGuide = document.getElementById('btn-guide');
    if (btnGuide) {
      btnGuide.addEventListener('click', openGuide);
    }
  }

  // 导出API
  window.SuperRPSGuide = {
    init: init,
    openGuide: openGuide,
    closeGuide: closeGuide
  };

  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

