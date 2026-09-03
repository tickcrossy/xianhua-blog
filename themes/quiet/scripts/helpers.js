/* global hexo */
'use strict';

// ---------------------------------------------------------------------------
// quiet theme — 模板辅助函数
// ---------------------------------------------------------------------------

const CJK = /[㐀-龿豈-﫿぀-ヿ가-힯]/g;
const LATIN = /[A-Za-z0-9À-ɏ]+(?:['’][A-Za-z]+)?/g;

function toText(html) {
  if (!html) return '';
  return String(html)
    // KaTeX 会同时输出 MathML 和 HTML 两份内容，去掉 MathML 那份避免公式被数两遍
    .replace(/<span class="katex-mathml">[\s\S]*?<\/span>/g, '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// 中日韩按字算，拉丁语按词算 —— 混排文章里这样得出的数字最接近直觉
function countWords(html) {
  const text = toText(html);
  const cjk = (text.match(CJK) || []).length;
  const latin = (text.replace(CJK, ' ').match(LATIN) || []).length;
  return cjk + latin;
}

hexo.extend.helper.register('quiet_text', toText);
hexo.extend.helper.register('quiet_word_count', countWords);

// 文章页正文。
// Hexo 会把 <!-- more --> 之前的部分放进 excerpt、之后的部分放进 more；
// 没写 more 标记时 more 就等于全文。所以取 more 正好等于「不重复显示摘要」。
//
// 加密文章要特判：hexo-blog-encrypt 把 content 换成了密码框，
// 同时把 excerpt 和 more 都改写成了摘要文案。这里若取 more，
// 密码框就会被摘要顶掉、文章直接打不开。
hexo.extend.helper.register('quiet_body', function(post) {
  if (post.encrypt) return post.content;
  if ((this.theme.post || {}).hide_excerpt === false) return post.content;
  return post.more || post.content;
});

// 列表页摘要：优先 <!-- more --> 之前的内容，没有就退回正文开头
hexo.extend.helper.register('quiet_excerpt', function(post) {
  const opts = (this.theme.index || {});
  const raw = post.excerpt || post.content || '';
  let text = toText(raw);

  for (const prefix of (opts.excerpt_strip_prefix || [])) {
    if (text.startsWith(prefix)) {
      text = text.slice(prefix.length).trim();
      break;
    }
  }

  const limit = opts.excerpt_length || 90;
  if (text.length > limit) text = text.slice(0, limit).trim() + '…';
  return text;
});

// 难度标签 → CSS 修饰类
hexo.extend.helper.register('quiet_difficulty', function(name) {
  const map = (this.theme.difficulty || {});
  return map[name] || '';
});

// 页脚年份区间
hexo.extend.helper.register('quiet_years', function() {
  const now = new Date().getFullYear();
  const since = (this.theme.footer || {}).since;
  return since && Number(since) < now ? `${since}–${now}` : String(now);
});
