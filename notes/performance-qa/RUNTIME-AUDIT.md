# 运行、构建与缓存专项审查

审查时间：2026-10-15T22:36:38.938340+08:00。范围：源码调用链、静态文件大小、生产 HTTP 头和资源同一性；未启动第二套浏览器压测，以免干扰主审基准。此文为审计，不是已实施优化清单。

## 诊断结论

最先验证字体 URL 重复：三个字体在 `assets/fonts` 与 `assets/xunai/fonts` 中逐字节一致。service / ai / contact 的 HTML 预加载前者，后加载的 `xunai/content.css` 为相同字体 family 指向后者。若基准网络日志确认两份都下载，只归一 URL 可避免最多 15,900,056 字节的两份预载字体重复传输，且不会改变字形。这个数字是可避免资源的文件字节上限，不是当前实测首屏传输收益。

产品与植株 Three 场景已采用按需渲染，没有发现无条件永久 `setAnimationLoop`。但全页滚动会把已经夹紧为相同数值的进度继续传给 setter，仍触发一次渲染。建议在真实 draw-call / trace 证明之后增加相同进度短路；不改 DPR、模型、材质、动画路径或速度。

线上已提供 Brotli、视频 Range 和 ETag；无需“新增 Brotli”来宣称收益。线上仍是旧版本，不能拿它和当前本地版本直接计算优化前后成绩。

## 实际部署与构建

- `package.json`：Node `>=22`，自定义原生 Node ESM；无运行依赖安装要求。
- Build Command：`npm run build`。Output Directory：`website-code/dist`。
- `build.mjs` 保留 `/website-code/*.html`，根目录 8 个兼容入口跳转到相同路径，并保留 search/hash。
- 当前会复制全部 assets、content，以及 website-code 下除 dist / .DS_Store 以外的全部文件；notes 和 Git 元数据不复制。
- 本次读取时 dist 不存在；不能把源码总体积称为已生成构建体积。
- `website-code/scripts` 共 12 文件、45,812 字节，会进入生产包。纯构建/检查/预览/转换工具没有页面入口引用；排除它们收益较小，但可安全避免发布开发工具。进一步资源排除必须走真实引用图，不能靠文件名或只搜 HTML。
- 未发现本地 vercel.json；本轮不触发部署。

## 路由静态入口成本

以下是 HTML 直接引用的 CSS 源文件字节，既不是 Brotli 传输字节，也不包含动态导入的 JS。

| 页面 | 阻塞 CSS 文件数 | CSS 原始字节 | 两份 HTML preload 字体字节 |
|---|---:|---:|---:|
| index | 4 | 41,905 | 15,900,056 |
| company | 7 | 359,409 | 15,900,056 |
| planting | 6 | 49,628 | 15,900,056 |
| products | 8 | 47,244 | 15,900,056 |
| service | 6 | 315,803 | 15,900,056 |
| ai | 4 | 314,746 | 15,900,056 |
| contact | 4 | 314,746 | 15,900,056 |
| franchise | 0 | 0 | 0 |

`xunai/content.css` 原始 294,676 字节；离线 gzip9 估算 43,287 字节。线上实际 Brotli 不同，不能把估算代替真实网络。产品页需加载 Three 模块，但此处不凭文件大就删除/延后首屏必需 3D。

## 字体同一性

| 文件 | 每份字节 | 两路径 SHA-256 相同 |
|---|---:|---|
| oppo-sans.woff2 | 13,645,776 | True |
| tsukushi-mincho-r.woff2 | 2,254,280 | True |
| crimson-regular.woff2 | 43,084 | True |

只归一 `@font-face src`，保留字体名称、权重区间、font-display 与规则顺序。子集化会改变字形覆盖及校验要求，需另交候选及授权核对，不在本次自动改动范围。

## 逐项定位与最小方案

### RT-01 · P1

页面：service, ai, contact。证据等级：source-and-hash-confirmed; actual double request to verify in baseline network。

当前表现：HTML preloads root fonts, then later xunai/content.css redefines the same family using identical font files at different URLs. Browser URLs cannot share the same cache entry even though file hashes match.

证据：`website-code/service.html:10-13`; `website-code/ai.html:10-13`; `website-code/contact.html:10-13`; `website-code/xunai/content.css:232-234`; `website-code/site-foundations.css:2-4`。

最小方案：Canonicalize only three xunai @font-face source URLs to ../../assets/fonts/*.woff2; retain font names, ranges, display strategy and cascade order. Do not delete source fonts.

收益：Up to 15,900,056 cold bytes avoided on affected routes if both preloaded fonts are otherwise downloaded twice; measured benefit must come from browser network comparison.

设计影响与验证：Very low: decoded font bytes have identical SHA256; verify text wrapping and computed fonts at six viewports.

### RT-02 · P2

页面：products, planting。证据等级：call-chain-confirmed; frame/CPU counts pending browser profile。

当前表现：Scene setters always schedule WebGL render even when clamped progress or rotation is unchanged. Full-page scroll listeners keep calling them after their visual segment has finished.

证据：`website-code/product-hero.js:43-60`; `website-code/product-scene.js:232-234`; `website-code/planting-page.js:208`; `website-code/planting-model.js:40-44`。

最小方案：Guard equal clamped progress/rotation in scene setters. Keep original requestRender on resize, model load and motion preference changes, all animation parameters unchanged.

收益：Avoid redundant offscreen WebGL renders and model/DOM updates after progress clamps; not a claim of continuous idle rendering.

设计影响与验证：Low only after equal-state behavior and resize/model readiness regression; profile real draw calls before implementation.

### RT-03 · P2

页面：planting。证据等级：layout-read-after-write confirmed in source; cost not measured。

当前表现：The same animation callback writes section positions/widths/heights then reads trait figure offsetHeight. This may flush style/layout during active scroll and settling.

证据：`website-code/planting-page.js:141-208`。

最小方案：Profile Layout/RecalculateStyle first. If material, read geometry once before writes or cache invariant figure height in existing measure(), validated against resize/font/image changes.

收益：Unknown until trace; no blanket scroll throttling.

设计影响与验证：Medium: moving geometry reads can change responsive timing; leave as proposal pending trace.

### RT-04 · P2

页面：production build。证据等级：build-code-confirmed。

当前表现：Build recursively copies assets/content and all website-code files except dist/.DS_Store. It also publishes local build/check/serve and a product conversion script.

证据：`website-code/scripts/build.mjs:5-25`; `website-code/scripts/*.mjs`; `website-code/scripts/convert-product-assets.py`。

最小方案：Exclude only website-code/scripts from deployment after confirming all imports in runtime graph stay outside scripts; retain source scripts and verification rules. Use asset graph for further asset filtering.

收益：45,812 bytes / 12 tool files excluded from current deployment (small vs media; request cost unchanged unless these URLs are explicitly fetched).

设计影响与验证：None if runtime graph verified; no source deletion.

### RT-05 · P2

页面：company, service, ai, contact。证据等级：size-and-route-link-confirmed; coverage not measured。

当前表现：Shared xunai/content.css is 294,676 raw bytes, includes old/home/brand/store/AI/contact/franchise styles. All four routes load it as blocking CSS.

证据：`website-code/xunai/content.css`; `website-code/company.html:11-19`; `website-code/service.html:12-17`; `website-code/ai.html:12-15`; `website-code/contact.html:12-15`。

最小方案：Do not purge by static selector grep because subroutes/dynamic states share it. First measure CSS coverage across all states; evaluate output-only parse-safe minification while preserving source comments.

收益：gzip9 estimate 43,287 bytes, deployed Brotli already active. Benefit from whitespace alone is likely far smaller than media/font work.

设计影响与验证：High for unused-CSS removal; no implementation authorized without states/visual proof.

### RT-06 · P2

页面：all sampled deployment resources。证据等级：actual-production-HTTP-confirmed。

当前表现：Vercel browser cache max-age=0,must-revalidate for HTML/CSS/JS/font/video; edge cache HIT works and text Brotli already works. There are no content hashes in filenames or local vercel.json.

证据：`data/runtime-audit.json#productionHTTP`; `website-code/scripts/build.mjs`; `README.md`。

最小方案：Keep HTML revalidation. Do not add immutable to mutable names. Consider versioned assets in a separately validated plan; no need to add Brotli as it is already served by Vercel.

收益：Hot-navigation validation RTT potentially reducible; cannot quantify from HEAD only.

设计影响与验证：Stale asset risk if long caching applied without versioning; proposal only.

### RT-07 · P2

页面：service, ai, contact。证据等级：source-confirmed-lifecycle-risk; not new performance fix。

当前表现：transplanted.js unmounts on every pagehide including persisted BFCache navigation, without pageshow re-mount; site-experience MutationObserver also disconnects once.

证据：`website-code/transplanted.js:54-56`; `website-code/site-experience.js:20`。

最小方案：Existing design QA lifecycle finding; test back/forward and only repair under specific verified failure.

收益：Correct lifecycle, not proven speed improvement.

设计影响与验证：Can change restored interactions; not included in automatic performance edits.

## 线上 HTTP 实测

URL：`https://aat-website-nine.vercel.app/`。只读取 HEAD、文本源码和视频最前 4KB；未下载长视频。

| 路径 | 状态 | 浏览器缓存 | 文本编码 | ETag / 边缘缓存 | 与本地源码 |
|---|---:|---|---|---|---|
| website-code/index.html | 200 | public, max-age=0, must-revalidate | br | W/"b0451667ab82c070aae76d2d7961374a" / HIT | False |
| website-code/products.html | 200 | public, max-age=0, must-revalidate | br | W/"2564bf8d7e838f17580b956badc38a9a" / MISS | True |
| website-code/styles.css | 200 | public, max-age=0, must-revalidate | br | W/"4cc2914166431b7531dfa64722807d1a" / MISS | False |
| website-code/product-scene.js | 200 | public, max-age=0, must-revalidate | br | W/"53ad5aaf5896ed663110ffd458bd02af" / MISS | True |
| website-code/planting-model.js | 200 | public, max-age=0, must-revalidate | br | W/"97a0ab4c7429348772ab9341456e9cb5" / MISS | True |
| assets/fonts/oppo-sans.woff2 | 200 | public, max-age=0, must-revalidate | 无 | "84622ee494d418c5a1eba000bb1e34c2" / HIT | 未取完整媒体比对 |
| assets/planting/planting-hero.mp4 | 200 | public, max-age=0, must-revalidate | 无 | "efd7864901fcc6feed010ad216fd18e9" / MISS | 未取完整媒体比对 |

视频 `planting-hero.mp4` 的 Range `bytes=0-4095`：返回 206，4,096 字节，`Content-Range: bytes 0-4095/91317434`、`Accept-Ranges: bytes`。与本地当前 91,317,434 字节大小一致；本审计没有读取整段媒体计算线上哈希。

部署版本差异的明确证据：首页线上 HTML 仍包含 `.series-playback` 暂停按钮、loader-welcome 米白 fill；本地已移除按钮且 fill 为 none。线上 styles.css 也仍有旧绿焦点与褐色占位。products.html / product-scene.js / planting-model.js 的本次取回源码与本地 SHA-256 相同。保留此区别，不能把线上旧内容回写本地。

## 已有资源保护与待验证项

- 视频由 mountContentMotion / company.js 的 IntersectionObserver 和 visibilitychange 管理离屏/后台暂停；全站属性由 site-experience.js 归一到自动、静音、循环、内联、无控件。保留这种资源管理，不恢复可见暂停 UI。
- 动效多已采用 rAF 合帧、settle 后停止、AbortController/cleanup；不能将相同 scroll 监听数量等同于重复初始化。
- loader 的 180 条轨道线逐帧变化、产品 blur/mask、盖屏、种植 width/height 叙事均是已确认画面。只凭存在 filter 或写 layout 属性不足以删除；须看 trace。
- planting render 内布局写入后读取 `offsetHeight` 是强制布局候选，当前没有持续时间证据，暂不宣称真实主瓶颈。
- 路由 pagehide / BFCache 释放问题是既有 QA 风险，属于需复现后单独修复的行为问题，不混入“性能优化”批量改动。
- 本报告不提供虚构 INP、内存、帧率或 Lighthouse 分数。浏览器同条件数据由主审测试记录归档。

原始数据：[data/runtime-audit.json](data/runtime-audit.json)。
