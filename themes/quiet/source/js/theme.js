/* quiet theme — 深浅色切换、目录高亮、代码复制。无依赖，约 2KB。 */
(function () {
  'use strict';

  var root = document.documentElement;

  // ---- 深浅色切换 ---------------------------------------------------------
  var toggle = document.querySelector('.scheme-toggle');
  if (toggle) {
    var media = window.matchMedia('(prefers-color-scheme: dark)');

    toggle.addEventListener('click', function () {
      var next = root.dataset.scheme === 'dark' ? 'light' : 'dark';
      root.dataset.scheme = next;
      // 手动选过之后就不再跟随系统
      delete root.dataset.schemeAuto;
      try { localStorage.setItem('quiet:scheme', next); } catch (e) {}
    });

    // 没手动选过时，系统切换要跟着走
    media.addEventListener('change', function (e) {
      if (root.dataset.schemeAuto) {
        root.dataset.scheme = e.matches ? 'dark' : 'light';
      }
    });
  }

  // ---- Giscus 评论主题跟随博客切换 ---------------------------------------
  // giscus 在独立 iframe 里，改不了它的 CSS 变量，只能通过 postMessage 让它
  // 换用内置主题。这里把博客当前的深/浅色映射到配置里的两个 giscus 主题名。
  (function () {
    var section = document.querySelector('.post-comments[data-giscus-light]');
    if (!section) return;

    var names = {
      light: section.dataset.giscusLight || 'light',
      dark: section.dataset.giscusDark || 'transparent_dark'
    };

    function currentTheme() {
      return names[root.dataset.scheme === 'dark' ? 'dark' : 'light'];
    }

    function sync() {
      var frame = document.querySelector('iframe.giscus-frame');
      if (!frame || !frame.contentWindow) return;
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: currentTheme() } } },
        'https://giscus.app'
      );
    }

    // giscus 加载完成后会往父窗口发消息，收到后立即校正成博客当前的主题
    window.addEventListener('message', function (e) {
      if (e.origin === 'https://giscus.app' && e.data && e.data.giscus) sync();
    });

    // 手动点切换按钮：主 toggle 处理器已先更新 root.dataset.scheme，这里再同步
    var toggle = document.querySelector('.scheme-toggle');
    if (toggle) toggle.addEventListener('click', sync);

    // 没手动选过时，跟随系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (root.dataset.schemeAuto) sync();
    });
  })();

  // ---- 目录滚动高亮 -------------------------------------------------------
  var tocLinks = document.querySelectorAll('.post-toc .toc-link');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    var headings = [];

    tocLinks.forEach(function (link) {
      var id = decodeURIComponent((link.getAttribute('href') || '').slice(1));
      var el = id && document.getElementById(id);
      if (!el) return;
      byId[id] = link;
      headings.push(el);
    });

    var visible = new Set();

    var setActive = function (id) {
      tocLinks.forEach(function (l) { l.classList.remove('is-active'); });
      if (byId[id]) byId[id].classList.add('is-active');
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      // 取当前视口内最靠上的标题；一个都不在视口内时，保留最后一个已滚过的
      var current = null;
      for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        if (visible.has(h.id)) { current = h.id; break; }
        if (h.getBoundingClientRect().top < 0) current = h.id;
      }
      if (current) setActive(current);
    }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });

    headings.forEach(function (h) { observer.observe(h); });
  }

  // ---- 代码复制 -----------------------------------------------------------
  if (document.body.dataset.copyCode !== 'off' && navigator.clipboard) {
    var labels = {
      copy: document.body.dataset.copyLabel || 'Copy',
      done: document.body.dataset.copiedLabel || 'Copied'
    };

    var blocks = document.querySelectorAll(
      '.markdown figure.highlight, .markdown pre'
    );

    blocks.forEach(function (block) {
      // figure.highlight 里面的 pre 由 figure 统一处理，不要装两个按钮
      if (block.tagName === 'PRE' && block.closest('figure.highlight')) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = labels.copy;

      btn.addEventListener('click', function () {
        // 有行号时只取 .code 那一列，避免把行号一起复制走
        var source = block.querySelector('td.code') || block.querySelector('code') || block;
        var text = source.innerText.replace(/\n$/, '');

        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = labels.done;
          btn.classList.add('is-done');
          setTimeout(function () {
            btn.textContent = labels.copy;
            btn.classList.remove('is-done');
          }, 1600);
        });
      });

      block.appendChild(btn);
    });
  }

  // ---- 图片：包成 figure，把 alt 变成图注 ----------------------------------
  // 必须在运行时做而不是构建期改模板：加密文章的正文是解密后才由
  // hbe.js 塞进 DOM 的，构建期的过滤器根本看不到里面的图。
  function enhanceImages(scope) {
    var imgs = scope.querySelectorAll('.markdown img');

    Array.prototype.forEach.call(imgs, function (img) {
      if (img.parentNode && img.parentNode.classList.contains('post-figure')) return;

      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');

      var p = img.parentNode;
      // marked 会把独占一行的图片包进 <p>；几张图写在相邻行（中间不空行）
      // 时会进同一个 <p>，里面只有 <img>（可能夹着 <br>）。这两种「整段
      // 只有图」的情况才替换成 figure，每张图各自一个；夹在文字里的行内
      // 图片保持原样，免得把段落拆断。
      if (!p || p.tagName !== 'P' || p.textContent.trim() !== '') return;
      var onlyImages = Array.prototype.every.call(p.children, function (el) {
        return el.tagName === 'IMG' || el.tagName === 'BR';
      });
      if (!onlyImages) return;

      var figs = Array.prototype.map.call(p.querySelectorAll('img'), function (im) {
        var fig = document.createElement('figure');
        fig.className = 'post-figure';
        fig.appendChild(im);

        var alt = (im.getAttribute('alt') || '').trim();
        if (alt) {
          var cap = document.createElement('figcaption');
          cap.textContent = alt;
          fig.appendChild(cap);
        }
        return fig;
      });

      figs.forEach(function (fig) { p.parentNode.insertBefore(fig, p); });
      p.parentNode.removeChild(p);
    });
  }

  enhanceImages(document);

  // 加密文章解密完成时 hbe.js 会抛这个事件，正文这时才真正进 DOM
  window.addEventListener('hexo-blog-decrypt', function () {
    enhanceImages(document);
  });

  // ---- 加密文章的密码框 ---------------------------------------------------
  // hexo-blog-encrypt 自带的表单只认回车，手机上既没有按钮也看不清输入框。
  // 这里不碰它的解密逻辑，只把界面补齐：标题、可见的输入框、解锁按钮、
  // 明文切换。提交时向它原本监听的容器补发一个回车事件。
  (function enhanceEncryptForm() {
    var container = document.getElementById('hexo-blog-encrypt');
    if (!container) return;

    var d = document.body.dataset;
    var t = {
      hint: d.encHint || 'password',
      unlock: d.encUnlock || 'Submit',
      show: d.encShow || 'Show',
      hide: d.encHide || 'Hide',
      relock: d.encRelock || 'Lock again'
    };

    function build() {
      var input = document.getElementById('hbePass');
      if (!input || container.classList.contains('is-enhanced')) return;
      container.classList.add('is-enhanced');

      // 手机键盘友好：回车键显示成「前往」，不自动大写/纠错，
      // 字号 16px 由 CSS 保证 —— 小于 16px 时 iOS Safari 会自动放大整页。
      input.setAttribute('enterkeyhint', 'go');
      input.setAttribute('autocomplete', 'current-password');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('placeholder', ' ');

      var head = document.createElement('div');
      head.className = 'hbe-head';
      head.innerHTML =
        '<svg class="hbe-lock" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
        '<rect x="4" y="10.5" width="16" height="10.5" rx="2"/>' +
        '<path d="M8 10.5V7.2a4 4 0 0 1 8 0v3.3"/></svg>' +
        '<p class="hbe-hint"></p>';
      head.querySelector('.hbe-hint').textContent = t.hint;
      container.insertBefore(head, container.firstChild);

      // 把输入框包一层，好把「显示」按钮定位在框内
      var row = document.createElement('div');
      row.className = 'hbe-row';
      input.parentNode.insertBefore(row, input);
      row.appendChild(input);

      var peek = document.createElement('button');
      peek.type = 'button';
      peek.className = 'hbe-peek';
      peek.textContent = t.show;
      peek.addEventListener('click', function () {
        var masked = input.type === 'password';
        input.type = masked ? 'text' : 'password';
        peek.textContent = masked ? t.hide : t.show;
        input.focus();
      });
      row.appendChild(peek);

      var submit = document.createElement('button');
      submit.type = 'button';
      submit.className = 'hbe-submit';
      submit.textContent = t.unlock;
      submit.addEventListener('click', function () {
        // 插件监听的是容器上的 keydown（keyCode 13），照着补一个即可，
        // 不用把 PBKDF2 / AES 那套再实现一遍。
        var ev = new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter' });
        Object.defineProperty(ev, 'keyCode', { get: function () { return 13; } });
        Object.defineProperty(ev, 'which', { get: function () { return 13; } });
        input.dispatchEvent(ev);
        input.blur(); // 收起手机软键盘，好让人看见解密后的正文
      });
      input.parentNode.parentNode.appendChild(submit);
    }

    // 解密成功后插件会清空容器并塞进正文 + 一个英文的 "Encrypt again" 按钮。
    // 认准这个按钮，把它翻译过来，并让密码卡片的样式退场。
    function markUnlocked() {
      var again = container.querySelector('.hbe-button');
      if (!again || again.dataset.quiet) return;
      again.dataset.quiet = '1';
      again.textContent = t.relock;
      container.classList.remove('is-enhanced');
      container.classList.add('is-unlocked');
    }

    build();
    // 之前存过密码时，插件会在 localStorage 里直接解密 —— 那有可能发生在
    // 本脚本执行之前，此时不会有任何 DOM 变动可供观察，所以先主动查一次状态。
    markUnlocked();

    new MutationObserver(function () {
      markUnlocked();
      build();
      enhanceImages(container);
    }).observe(container, { childList: true, subtree: true });
  })();
})();
