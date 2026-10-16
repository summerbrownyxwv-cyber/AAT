# 02 · 字体与组件审查（Phase 01，审查版）

> 延续说明：本报告的声明统计及方案来自原 Phase 01 基准。当前 `qa/refinements-20261015` 仅对 U-01/U-02/U-03 实施。UI 褐色/绿色替换为白色/米白色、移除轮播暂停 UI 已获最新用户授权；这不授权修改字体、字号、章节比例或其他特殊组件。旧截图是否在当前工作树与已采集数量见根目录 `QA_BASELINE.md`，不能把本文路径都视为现存截图。

## 本轮实际变更与保护核对

U-02已将UI褐色映射为白色、绿色映射为既有米白色 #FBF4E3，并只作必要的文字/图标对比度配套；中性深色 #231815与照片、视频、Logo、产品包装原色保留。涉及八份CSS：`company.css`、`planting-factory.css`、`products-page.css`、`products-showcase.css`、`site-foundations.css`、`site-navigation.css`、`styles.css`、`xunai/content.css`；产品卡配色在`content/products-data.js`。没有统一字号、字体族、section高度或全局间距，没有建立第二套冲突Tokens。

242组布局数据（22路由×11CSS视口）未检出检测器匹配的褐绿computed UI背景；该检测不覆盖全部hover/展开/动画状态，不检测摄影像素。42组before+42组after中x/w/h无>1px变化；9条动态y差异仍记录，不能写像素全同。八项检查和位图hash核对通过；具体记录见05及`notes/refinement-qa/data/`。TYP-01/02/03仍是原审查待确认/维护风险，本轮未借配色修改处理字体比例或删除旧CSS。

日期：2026-10-15。网站目录：`/Users/dabao/Desktop/艾艾贴官网-首页交付/AAT`。审查分支：`qa/prelaunch-20261015-phase01`；冻结前提交：`48886fa39b059a88e01bc75ab99dba7acc935db8`。

本文件仅列出现状、证据、待验证风险和最小修复方案。没有修改字体、色彩、图片、文案、组件样式或交互实现。当前已经确认的艾艾贴页面是视觉基准；旧寻艾只提供可追溯的字体与断点参考。源码统计不能替代浏览器计算样式或视觉判断。

## 1. 方法、范围与产物

- 扫描 `website-code` 全部 19 个非第三方 CSS 文件；保留每一条声明的文件、行号、选择器、媒体条件与值，包含层叠覆盖以及导入但未必挂载的旧规则。
- 排版原始库存：`data/typography-inventory.json`。扫描 `font` 简写、font-family、font-size、font-weight、font-synthesis、line-height、letter-spacing、text-transform、text-align、text-wrap、white-space、overflow-wrap、max-width、数字变体。`font` 简写完整保留，未用不可靠的正则把复杂 clamp/calc 拆错。
- HTML 与非第三方 JS 补扫发现 3 条字体相关内联声明，都位于产品 WebGL 失败提示/重试按钮（`website-code/product-scene.js:146`、`:154`），已单列，避免误算为常态界面字号。
- 旧寻艾参考提取：`data/typography-xunai-reference.json`，包含绝对来源路径、文件 SHA-256 与原文行号；只读，未复制到运行目录、未修改旧站。
- 组件库存：`data/component-inventory.json`，按语义分为 12 组，记录路由、实现、状态与应保留的差异。
- 浏览器计算字号与实际 CSS 视口、DPR 由主审统一写入 `data/browser-layouts.json`。本子审不操作浏览器；本文件不将静态声明冒充实时生效字号。
- 修改前截图统一为 `baseline/<slug>/<width>x<height>/full-page.jpg`；交互状态为 `states/<slug>/<width>x<height>/<state>.jpg`。Phase 01 不产生修改后截图，也不会以重新采样替代审批。

### 1.1 原始统计

| 项目 | 声明数 | 不同原始值/表达式 | 解释 |
| --- | ---: | ---: | --- |
| font-size | 648 | 228 | 包含响应式、层叠覆盖、未挂载旧选择器；不是 228 档生效字号 |
| font 简写 | 90 | 见 JSON | 字号、行高、字重可能在简写内，不能只统计 font-size |
| font-family | 112 | 12 | 含字体声明、变量别名及回退族 |
| font-weight | 57 | 6 | 400：32；500：13；100–700 字体面范围：4；300：4；900：3；600：1；简写中的字重另存于 font |
| line-height | 192 | 31 | 常见 1.4、1.5、1.75、1.8；保留正文/标签/展示文字不同角色 |
| letter-spacing | 52 | 21 | 含 `0` 与 `0px` 语义相同但未强行归并 |
| text-align | 98 | 5 | left、center、right、变量、revert |
| text-transform | 11 | 2 | uppercase、none；部分是旧英文展示规则 |
| 全部排版/换行/文本宽度声明 | 1518 | — | 详见原始库存 |
| 自定义属性定义 | 374 | — | 其中 67 条与字体、字号、行高、字距有关；含覆盖定义 |
| @media 声明 | 170 | — | 同一查询重复出现，完整列表保留在 JSON |

明确：声明多不等于当前设计错误，也不构成本轮删除或重构旧样式的授权。当前没有凭该统计判定 P0 视觉问题。

## 2. 现有字体资产与生效角色

| 角色 | 当前基础族 | 已有资产与限制 | 证据 |
| --- | --- | --- | --- |
| 标准正文、界面与数字 | `XunAi OPPO` → PingFang SC → sans-serif | `assets/fonts/oppo-sans.woff2`；字体面范围 100–700；约 13.65 MB | `site-foundations.css:2`、`styles.css:1` |
| 品牌展示与中文标题 | `XunAi Mincho` → Songti SC → serif | `assets/fonts/tsukushi-mincho-r.woff2`；400；约 2.25 MB | `site-foundations.css:3`、`styles.css:2` |
| 特殊英文/数字装饰 | `XunAi Crimson`；局部还使用 Optima 回退 | `assets/fonts/crimson-regular.woff2`；400；约 0.043 MB | `site-foundations.css:4`；全部位置见库存 |

三份当前字体均与旧寻艾 `assets/fonts/` 同名文件逐字节 SHA-256 相同。当前 OPPO/筑紫明朝气质有确切资产来源，不需要换字库。

`xunai/content.css:2` 仍包含早期 Noto/Arial Black token，`:235` 已明确覆盖为 OPPO/Mincho，`--x-font-mono` 也改为 OPPO；`company-brand.css:2` 再绑定艾艾贴 `--sans/--display`。因此不能根据文件开头认定当前内页在使用 Noto 或 Arial Black。900 字重的 3 条规则属于旧品牌/首页/页脚选择器；在没有浏览器匹配证据前，不判定当前中文标题被错误加粗，更不删除它们。

`body` 与导入主容器有 `font-synthesis:none`，避免浏览器随意合成字重。若后续截图发现某局部要求粗 Mincho，应先核对语义，不能把全站 serif 换成 sans。

## 3. 旧寻艾实际比例与断点（只作参考）

来源：`/Users/dabao/Desktop/寻艾官网/website-code/`。

### 3.1 已有语义比例

`design-system/tokens.css:70–87` 的真实定义如下（计算示例以 root 16px、1440 CSS px 为前提；不是对当前 AAT 的改动建议）：

| 旧站角色 | 原始定义 | 1440 时示例 |
| --- | --- | ---: |
| Display | `clamp(2.5rem,1.3rem + 4.5vw,5.5rem)` | 85.6px |
| H1 | `clamp(2rem,1.5rem + 1.95vw,3.25rem)` | 52px |
| H2 | `clamp(1.625rem,1.25rem + 1.2vw,2.25rem)` | 36px |
| H3 | `clamp(1.25rem,1rem + 1vw,1.75rem)` | 28px |
| Body Large | `clamp(1rem,.95rem + .2vw,1.125rem)` | 18px |
| Body | `clamp(.9375rem,.9rem + .15vw,1rem)` | 16px |
| Caption / Label | `clamp(.75rem,.7rem + .2vw,.875rem)` | 14px |
| Nav | `clamp(.9375rem,.9rem + .15vw,1rem)` | 16px |
| Button | `clamp(.875rem,.8rem + .3vw,1rem)` | 16px |

真实行高：标题 1.4、展示 1.3、正文 1.75、标签 1.5；标题与正文 tracking 0，标签 .02em。原始离散字体 token 为 .75/.875/1/1.125/1.5/2/3/4.5rem（`:60–67`），并非等比数学公比，需要按语义使用。

### 3.2 响应式规则来源

- `mobile-responsive.css:1–30`：注释明确“1024px 属于已确认 Desktop”；移动层为 max-width 1023.98px，Display `clamp(2.25rem,9vw,2.625rem)`、H1 2rem、H2 `clamp(1.625rem,6.8vw,1.875rem)`、H3 1.25rem、Body 1rem、Caption .8125rem。
- `design-system/tokens.css:158`：48rem 起调整 gutter/章节间距；`:168` 为 64.0625rem 起的另一层空间规则。该文件注释写 `<768 / 768–1024 / 1025–1439 / >=1440`，但实际还要结合 mobile-responsive 的 1023.98px 覆盖，不能仅依注释推导 1024 的最终样式。
- `brand-refinement.css:11–18`：OPPO 正文、Mincho 标题，400 字重、标题1.4行高；这是最终品牌字体覆盖依据，不采用 tokens 开头的早期 Arial Black 族。
- `wide-desktop.css:2–38` 与 `:61–68`：1920/2560 起主要扩展视觉集合、列数、间距、阅读最大宽度；并非把所有字图无条件放大。阅读列 max-width640px、AI图形960/1120px等是旧站做法，不能机械覆盖到当前已确认的艾艾贴比例构图。

当前 `xunai/content.css` 已带入旧站语义字号与移动逻辑（`:2`、`:2112`）。再建第二套冲突的全局 token 没有必要。

## 4. 当前艾艾贴语义映射提案（文档映射，不改CSS）

| 建议语义名 | 当前可复用来源 | 保留规则/例外 |
| --- | --- | --- |
| Typography / Display | 原有页面专用展示选择器 | 首页视频无可视大标题；产品系列 `products-showcase.css:10` 大字与生产合作两侧标题是构图元素，不套通用 H1 |
| Typography / H1 | 导入页 `--x-type-h1`，原生页自身 H1 | 产品开屏 `product-hero.css:5` 使用较克制标题；AI首屏 `site-experience.css:13` 独立双栏构图；不能强制同绝对字号 |
| Typography / H2 | 原生页 `--heading`；导入页 `--x-type-h2/--x-heading-lg` | 首页 `styles.css:4` 的26.076设计单位与内页 `site-foundations.css:5` 的28设计单位有意保留到确认；不要让一次统一覆盖两者 |
| Typography / H3 | `--x-type-h3`、产品说明 `products-page.css:16` | 企业业务展开轨道字号缩小为18设计单位，横向排字已确认；不按H3默认扩大 |
| Typography / Body Large | `--x-type-body-large` 或现有引导正文局部clamp | 语义先映射，不把所有段落提升成引导正文 |
| Typography / Body | 原生 `--body`；导入 `--x-type-body`；Sans400 | 桌面当前随1440单位增长；移动保持原生/导入各自既有断点，缩放风险见TYP-01 |
| Typography / Caption | 原生 `--caption`；导入 `--x-type-caption` | 产品图卡名称可能是品牌展示而不是说明小字，例如公司产品图题已在移动局部指定1.25rem；应列例外 |
| Typography / Label | 导航/正文链接各自当前角色 | 保留CTA与返回链接不同意图，不按类名pill强制胶囊形 |
| Typography / Micro | 当前序号/图形刻度局部规则 | 只限辅助信息；关键信息是否过小必须结合真实匹配、CSS像素与截图判断 |

先用库存建立语义索引，第二轮只在确认“同一角色、同一场景、同样视觉”的组件上做别名复用；不要批量替换228种字号表达式。当前品牌色 `--cream/#fbf4e3`、`--ink/#231815`、`--muted/#6d6a64` 与导入区 `--x-*` 的局部色值差异也不自动视为错误。

## 5. Component Inventory

完整来源、路由和状态要求见 `data/component-inventory.json`。

| 编号 | 语义组件 | 现状/复用判断 | 冻结与最小范围原则 |
| --- | --- | --- | --- |
| C01 | 全站导航/移动抽屉 | `site-navigation.css/.js` 已共享；current、hover、focus、open/reduced有规则 | 保留原位置、字号气质与1023.98折叠点，不引入新导航样式 |
| C02 | 页脚/业务渠道 | 首页与内页有相同CSS副本，体验补丁共享 | 联系方式与入口已确认；样式源问题见TYP-02，不趁机改版 |
| C03 | 了解更多/文字链接/返回 | more-link、text-link、xu-detail-link等，经基础层部分统一 | 只在语义一致时复用；品牌展示、返回、表单动作不是完全同种组件 |
| C04 | 主次表单动作 | pill-button/filter-button在兼容层共享下划线样式，两套业务表单 | 是否要强化主次差异属C类待确认，不能审查时改成新按钮系统 |
| C05 | 生产合作申请CTA | 独立白底描边、品牌圆角、hover反色 | 用户明确要求入口；保留该特殊组件，不强制改成文字链 |
| C06 | 原生折叠/展开 | 荣誉、门店、流程均details/summary，各有语义布局 | 保留日期、层级、数量、加减图标；不同信息密度不整体合并 |
| C07 | 图片卡片 | 摄影框、错落动态图卡、产品透明分层组件用途不同 | 已确认构图、素材、圆角比例及产品不反转为锁定项 |
| C08 | 轮播/画廊 | 产品阻尼循环、企业原生时间线、服务卡项分页等 | 保留主要方式；已删除提示/计数/导航不得“补可用性”时擅自加回 |
| C09 | 数字序号/指标 | Sans/Crimson/图形序号混用，部分tabular-nums | 年份、指标、产品编号不同语义；不得仅为同字号强行统一 |
| C10 | 输入/错误/意向摘要 | 可见label、required、错误关联、状态live区域，未接收数据 | 保留“尚未发送”与手动动作；不把前端意向整理改称成功提交 |
| C11 | 业务选择/标签 | 点击商业范式、产品选择、荣誉筛选 | 商业范式只由点击/键盘切换；保留悬停图片微动与当前选中反馈 |
| C12 | 视频/章节叠屏 | 全屏影片、AI章节、服务店型覆盖、花形滚动各有目的 | 保留循环无控件视频、全宽遮盖和局部固定范围；不接管全站原生滚动 |

已检查导航current/焦点、链接hover/focus、表单错误/未发送反馈、服务分页disabled源码规则；这些是源码具备能力的证据，浏览器键盘/触屏实测结果以主审交互报告为准。当前未出现面包屑或通用徽标不构成缺陷，不擅自增加。

## 6. 问题与风险清单

### TYP-01 · P1待验证：桌面按视口缩放可能抵消浏览器放大

- **页面/路由**：所有正文入口；最易隔离于 `/website-code/planting.html` 的普通正文，以及 `/website-code/contact.html#/about/business` 的表单说明。
- **视口**：3840×2160 @100% 与同物理窗口200%（CSS视口通常降为1920×1080）；另检查1440→720及root字体默认值改变。必须记录实测CSS像素，不能把DPR当页面缩放。
- **当前表现**：源码证明 `--u=100vw/1440`、`--wide-u=max(1px,var(--u))`，且桌面root font-size随视口同比变化。由公式推导，4K→200%时42.667CSSpx正文可能降为21.333CSSpx，乘浏览器放大后物理字号接近原值。**这仍是风险推导，尚不宣称浏览器已经失败。**
- **原因/证据**：`site-foundations.css:5`、`:98`；首页 `styles.css:4`、`:303`。原设计决策要求大屏同比放大，本轮新增要求保留缩放可访问性，二者在此处可能冲突。
- **方案**：第二轮先用计算样式与截图验证；若复现，只针对阅读文字与控件的字号来源讨论下限/rem边界，保留插画/框架几何比例。不得一次改root或全站所有clamp。
- **涉及文件**：预计 `site-foundations.css` / `styles.css` 及实际受影响的页面文字规则；会涉及共享基础，需独立审批范围。
- **锁定设计影响**：有；可能改变超宽屏已确认比例。暂停此项实施，需人工确认后选择可访问性与大屏阅读比例的具体策略。
- **修改前截图**：`baseline/planting/3840x2160/full-page.jpg`；放大交互态另入 `states/planting/.../zoom-200.jpg`（以QA_BASELINE实际索引为准）。
- **修改后截图**：不适用，Phase01未修复。
- **测试状态**：公式与作用范围静态核对完成；浏览器100/200%对照由主审补充；未通过/未失败不得写为已通过。
- **人工确认**：需要，仅在复现后提出局部策略；保持当前视觉基准不变。

### TYP-02 · P2：共享样式“由首页生成”的维护说明与实际来源不一致

- **页面/路由**：首页与所有使用 `site-foundations.css` 的内页。
- **视口**：全部；属于后续维护/视觉回归风险，不声称当前截图必有错误。
- **当前表现**：`site-foundations.css:1` 指示修改首页源规则后运行 `sync-site-chrome`，但 `package.json:9` 的脚本与 `website-code/scripts/` 内均无该命令/脚本。首页与基础层存在近似CSS副本，且root字号不完全一致。
- **原因/证据**：`styles.css:4` 的 `--heading` 为21/26.076/35设计单位，基础层 `site-foundations.css:5` 为26/28/38；`--body/--caption`边界也不同。`.more-link` 与页脚则存在重复规则（`styles.css:39`、`:158`；`site-foundations.css:29`、`:33`）。生成说明不足以判断这些差异是否刻意。
- **方案**：第二轮先把当前首页/内页差异列为命名变体/锁定例外，明确现有维护源。若只修过时说明，可仅改注释；若要去重代码，需先逐条证明计算值相同，再单项变更和视觉回归。不要运行不存在的生成工具，也不要按首页值覆盖内页。
- **涉及文件**：至少 `site-foundations.css:1`、维护说明；可视实现去重目前无授权方案。
- **锁定设计影响**：仅更新准确维护说明无视觉影响；强行同步有影响，禁止直接做。
- **修改前截图**：`baseline/index/1440x900/full-page.jpg` 与 `baseline/planting/1440x900/full-page.jpg`；问题主要证据为源码和脚本清单。
- **修改后截图**：不适用。
- **测试状态**：静态证据确认；未做样式变更，因此无需把截图无差异当修复通过。
- **人工确认**：当前字号差异按已完成设计保留；若统一数值或生成机制，需确认。过时说明先保留证据，未删除。

### TYP-03 · P2：导入排版规则多层覆盖，未来“同字号统一”易触发回归

- **页面/路由**：`ai.html`、`service.html`及子路由、`contact.html`及子路由；公司导入区使用自己的容器和样式优先级，不等同上述主容器。
- **视口**：移动767/1023.98附近、桌面1440起、1920/2560/3840；具体缺陷需计算样式验证。
- **当前表现**：同一语义字号经旧tokens、品牌覆盖、语义层、mobile层、wide层及页面补丁确定。648条font-size声明中大部分集中于 `xunai/content.css`；不能通过全文件“改14px/改h2”安全统一。
- **原因/证据**：`xunai/content.css:2`（早期token）、`:235`（品牌族）、`:1941–1949`（语义层）、`:2016–2022`（共享主内容字号）、`:2112–2118`（移动）、`:2403`起（1440比例），`site-experience.css:13`（AI首屏例外），`service-annotation.css:3–18`（服务已确认白底/无罩）。
- **方案**：先使用本轮语义映射与组件清单约束改动；只将浏览器证明重复、同语义且不改变计算值的规则登记为可复用候选。每次修复前列出真实匹配规则和受影响路由。**不建议在本轮以清理为由删除旧CSS或压扁页面差异。**
- **涉及文件**：审查索引及未来具体局部样式；本轮不改运行文件。
- **锁定设计影响**：源代码去重可能有；通过索引和锁定说明降低风险本身无视觉影响。
- **修改前截图**：`baseline/ai/390x844/full-page.jpg`、`baseline/service/1440x900/full-page.jpg`、`baseline/contact/3840x2160/full-page.jpg`，与对应计算字体JSON交叉使用。
- **修改后截图**：不适用。
- **测试状态**：库存与HTML加载顺序已核对；不是已复现的文字溢出或字号错乱结论。
- **人工确认**：需确认任一视觉标准化改动；仅文档索引无需额外确认。

## 7. C类待确认选择与明确保护项

1. **首页/内页字号的有意差异**：保留。源文件确实不同；在没有确认前不得以“生成副本漂移”推断哪一个错。
2. **4K同比例构图与文字缩放可访问性**：先测试TYP-01，再提出具体可比较方案；不能擅自改变本轮已冻结比例。
3. **主次按钮是否需要更强区别**：现在部分 `.pill-button` 与 `.filter-button` 被统一成下划线文字入口，服务大图CTA与生产申请CTA另有样式；视觉层级是否要调整需截图/业务语义判断，不能按类名强制统一。
4. **摄影图上的白字无色彩罩**：服务页是用户最新明确选择。可以测对比度和易读性；未经确认不得恢复黑/棕/黄色遮罩或换图。
5. **刻度、编号、Crimson、特殊H1/展示大字**：作为构图例外登记，不能套普通正文建议。
6. **品牌字体**：保留OPPO+筑紫明朝；不因旧token开头含Arial/Noto重新换字体。
7. **没有“重复实现=必须合并”结论**：原生details、阻尼轮播、品牌时间线、错落图卡与透明产品分层各有用途；没有拟议大重构。

## 8. 第二轮允许的最小验证顺序（需先确认问题清单）

1. 先确认浏览器缩放是否真实复现；若没有，关闭TYP-01风险，不为了改而改。
2. 对已证实的阅读溢出/控件问题逐一列出计算样式和影响页面；不全局减小字号/间距。
3. 优先补充准确的维护源与例外说明；无需新建第二套CSS token系统。
4. 若批准同语义复用，一次只处理一组组件，保留default/hover/focus/active/disabled和明暗变体；至少回归390、768、1440、3840以及原问题视口。
5. 修改后截图必须与本轮原始基准对照；不能更新基准来掩盖回归。

本报告不将未实测的字体过小、色彩对比、文本溢出或组件差异写作已确认缺陷。全部结论与主审的布局/交互/性能/最终上线报告共同使用。
