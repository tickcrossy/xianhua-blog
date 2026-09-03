# quiet

一个极简排版风的 Hexo 主题，为中文技术博客写的——大量公式、行内代码、长文。

内容是唯一的主角：暖白/暖黑的纸面底色、单一克制的强调色、没有卡片阴影和装饰性图形。
所有会分散注意力的东西（锚点、目录、复制按钮）默认隐形，指过去才出现。

## 特性

- **Markdown 全覆盖**：标题、列表、嵌套列表、任务列表、引用、表格、脚注、`<details>`、图片配文、`<kbd>`、删除线、高亮。
- **KaTeX**：行内与展示公式都按正文节奏调过。超出栏宽的展示公式自己横向滚动，页面永远不出现横向滚动条；窄屏上过长的行内公式自动换行。
- **代码块**：兼容 Hexo 内建 highlight.js（含行号表格），深浅色各一套克制的语法配色，悬停出现「复制」按钮（只复制代码、不含行号）。
- **深浅色**：默认跟随系统，右上角可手动切换并记住选择；首屏渲染前定色，不闪白底。
- **悬浮目录**：屏幕够宽时出现在正文右侧，随滚动高亮当前小节；窄屏不渲染。
- **图片**：独占一段的图片自动包成 `figure`，`![文字](url)` 里的文字变成图下方一行淡色小字的图注（留空则不显示）。
  同时限宽也限高（`max-height: 26rem`），手机拍的竖图不会把整页压垮，横图竖图的视觉体量接近。
- **侧边栏**：宽屏时左侧固定一栏（头像 / 站名 / 导航 / 深浅色切换 / 社交链接），窄屏自动塌成页面顶部的一条，
  头像与站名同排、导航横向换行。
- **摘要不重复**：`<!-- more -->` 之前的内容只出现在首页列表，文章页从正文开头显示，不再念一遍摘要。
- **加密文章**：为 `hexo-blog-encrypt` 重做了密码页——带锁图标的卡片、常显的输入框（插件默认是 `opacity:0` 的隐形框）、
  明文切换、整宽的提交按钮；输入框 16px 起，iOS Safari 聚焦时不会自动放大整页。
- **置顶**：front-matter 写 `top: true` 的文章置顶到首页，并从正常时间流里移除，不会出现两次。
- **难度标签**：`Easy` / `Medium` / `Hard`（含 `+` `-` 变体）自动配色，其余标签用中性灰。
- 归档按年分组、标签索引页、上一篇/下一篇、分页、打印样式、跳转到正文的无障碍链接。

## 安装

把这个目录放进站点的 `themes/`，然后在站点根目录的 `_config.yml` 里：

```yml
theme: quiet
```

开发时也可以用软链，改主题不用来回复制：

```bash
ln -s /path/to/blog_new /path/to/my-blog/themes/quiet
```

导航栏的「标签」需要一个索引页，仓库里 `extras/source/tags/index.md` 已经备好：

```bash
cp -R extras/source/tags /path/to/my-blog/source/
```

（想要分类页就再拷 `extras/source/categories`，并把 `_config.yml` 的 `menu` 加上一行。）

## 配置

全部在本目录的 `_config.yml` 里，注释写在每一项上方。最常改的几个：

| 项 | 说明 |
|---|---|
| `avatar` | 侧边栏头像，指向主题 `source/` 下的图片。留空则不显示 |
| `menu` | 侧边栏导航，`显示文案: 路径` |
| `tagline` | 站名下的一行副标题，留空则不显示 |
| `color_scheme` | `auto` / `light` / `dark`。非 `auto` 会隐藏切换按钮 |
| `index.excerpt_strip_prefix` | 列表页摘要开头要去掉的前缀，默认去掉「摘要：」 |
| `post.hide_excerpt` | 文章页是否跳过摘要，默认 `true`。设成 `false` 则从头显示全文 |
| `post.toc` | 关掉右侧悬浮目录 |
| `social` / `footer.custom` | 页脚链接与自定义 HTML（如备案号） |

改配色只需要动 `source/css/_tokens.styl`，浅色在 `:root`，深色在 `[data-scheme='dark']`，
两边是同一组变量名，规则本身不用重写。

**改字号**：动 `_base.styl` 里 `html` 的 `font-size`（窄屏 17px / 宽屏 18px）。版面尺寸几乎都是 rem，
所以从根节点缩放能让标题、间距一起等比变化；只改 `body` 会让 px 的正文和 rem 的标题比例跑掉。
字号动了之后，`_tokens.styl` 里的栏宽 `$measure` 通常要反向微调，否则一行的字数会跟着变多。

## 结构

```
_config.yml              主题配置
layout/                  EJS 模板
  layout.ejs             页面骨架
  index.ejs              首页（含置顶区）
  post.ejs               文章页（含悬浮目录）
  page.ejs               独立页面
  archive.ejs            归档，同时兜底 tag / category 单页
  tags.ejs               标签索引（需要 layout: tags 的页面）
  categories.ejs         分类索引
  _partial/              head / sidebar / footer / 列表项 / 分页
scripts/helpers.js       正文取用、字数、摘要、难度标签等辅助函数
source/css/              Stylus，入口 style.styl
source/images/avatar.png 侧边栏头像，换图直接替换这个文件
source/js/theme.js       深浅色切换、目录高亮、代码复制、加密文章密码框（无依赖）
languages/               zh-Hans 与 default
extras/                  需要拷进站点 source/ 的页面
```

## 侧边栏的分类链接

`随笔` 和 `OI/XCPC` 指向 Hexo 的分类页，需要文章 front-matter 里写了 `categories` 才有内容：

```yml
---
title: ...
categories: OI/XCPC     # 或 随笔
---
```

`OI/XCPC` 里的斜杠会被 Hexo 转成短横线，所以页面地址是 `/categories/OI-XCPC/`——
主题 `_config.yml` 的 `menu` 里已经按这个地址配好了。在给文章加上分类之前，这两个链接是 404。

## 已知取舍

- 窄屏（< 736px）上，比正文栏还长的**行内**公式会换行而不是滚动。KaTeX 的行内输出无法横向滚动，
  相比撑破页面，换行是更好的一侧。展示公式不受影响，始终滚动。
- 行号列末尾会多出一个空行号，这是 Hexo 高亮器的输出，不是样式问题。
- 加密文章不显示字数，也不显示目录——两者都会从密文里泄露文章结构。
- 图注只作用于「整段就是一张图」的写法。夹在文字中间的行内图片保持原样，不加图注，
  免得把段落拆断。加密文章的正文是解密后才进 DOM 的，所以图注由 `theme.js` 在运行时处理，
  构建期的过滤器看不到那些图。
- 密码错误时弹的仍是浏览器原生 `alert`，来自 `hexo-blog-encrypt` 内部，主题改不到。
  文案可以在**站点** `_config.yml` 的 `encrypt.wrong_pass_message` 里改。

## 评论系统（Giscus）

评论用 [Giscus](https://giscus.app)——把评论存进一个 GitHub 仓库的 Discussions 里，
纯静态、无后端、免费。读者留言需要用 GitHub 账号登录。

主题 `_config.yml` 的 `comments` 段没填 `repo` / `repo_id` / `category_id` 时，评论区
不渲染，博客照常运行。要启用，按下面四步拿到参数再填进去：

1. **准备仓库**：随便选一个 **public** 仓库承载评论（用博客源码仓库或 `你的用户名.github.io`
   都行）。在仓库 Settings → General → Features 里勾上 **Discussions**。
2. **装 App**：到 <https://github.com/apps/giscus> 点 Install，授权给那个仓库。
3. **生成参数**：打开 <https://giscus.app>，在「仓库」填 `用户名/仓库名`，页面会校验它是否满足
   条件；「页面 ↔ discussion 映射」选 **pathname**；「Discussion 分类」选 **Announcements**。
   往下滚到「启用 giscus」，那段 `<script>` 里有 `data-repo-id` 和 `data-category-id`。
4. **填配置**：把 `repo`、`repo_id`、`category`、`category_id` 四项填进 `_config.yml` 的
   `comments` 段，`hexo clean && hexo g` 后文章页底部就会出现评论区。

深浅色主题会自动跟随博客切换，对应 `comments.theme_light` / `theme_dark` 两个 giscus 主题名。

**按篇开关评论**：全局默认由 `comments.default` 控制（`true` 默认每篇都开）。
想单独关掉某篇，在它的 front-matter 里加 `comments: false`；想在默认关闭时单独打开某篇，写 `comments: true`。
