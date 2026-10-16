# 03｜动效、交互与导航审查（Phase 01）

> 最新授权覆盖：2026-10-15 用户要求全部视频自动循环，视频及图片轮播均不要暂停键；产品横滑降低触发成本。原报告把图片轮播“暂停/继续”UI作为保留要求的结论已撤回。以下参数与测试记录属于旧基准现状，不是继续保留该UI的授权。离屏/后台和减少动态效果保护保留；本次修改与复测另入 `05_REGRESSION_TEST_REPORT.md`。其余 M01–M06 等问题仍属审查方案，未因最新三点被一并授权修复。

## 本轮实际修复与输入验证

**U-01**：删除首页图片轮播暂停/继续UI，手动切换后保持自动轮播，不再因hover形成可见暂停体验；减少动态效果、离屏与后台保护保留。涉及`index.html`、`motion.js`、`check-home-motion.mjs`。首页手动到温系列后保持hover，4500ms自动继续到植系列实测通过；242布局记录无可见暂停控件、无视频属性错误。七视频位置×390×844 DPR3/1920×1080 DPR2共14条实际播放/一次循环通过；未由测试调用play，1.2s观察自然推进，运行态seek片尾后循环回1.23–1.43s并继续。media-zoom-results.json记录实际视口和DPR，真实200%浏览器缩放未测。

**U-03**：低成本横滑的触发门槛为mouse12px、touch18px、wheel累计12px；横向识别为4px且横向占1.15优势，保留普通纵向滚动。触屏根因是子卡片隐式pointer capture转移到gallery时，冒泡的lostpointercapture被误判为当前gallery结束；仅处理`event.target===element`修复该路径。共享弹簧参数、卡片构图、循环模型、键盘和相邻产品点击保留。涉及`products-showcase.js`及`check-product-carousel-motion.mjs`。

Chrome154、DPR1的390×844/1440×900/3840×2160：四组详情×三尺寸12组通过16px慢鼠标、16px横向wheel、键盘反向及2px抖动；系列三尺寸3组仅浏览器实测16px鼠标及键盘反向通过，其他条件由共享单元检查覆盖，不冒称系列真实浏览器全测。390四组另用20px CDP触屏切换和64px纵向不误切检查通过。加首页自动继续共16条passed，见`notes/refinement-qa/data/interaction-results.json`。CDP触屏不等于实体触屏，未宣称Safari、读屏、BFCache或200%浏览器缩放通过。

本轮八项代码/行为检查通过，包括产品输入、首页轮播、公司、cover、合作花形、hero迁移、站点体验和包完整性；独立只读代码审查未见明确回归。M01–M06原有证据和限制保留，下面的旧参数库存不得当作本次重新验证全部动效的结论。

- 日期：2026-10-15（Asia/Shanghai）。
- 当前基准：`48886fa39b059a88e01bc75ab99dba7acc935db8`；分支：`qa/prelaunch-20261015-phase01`。
- 范围：AAT 内 35 份业务 JavaScript、19 份 CSS；第三方 Three.js 不作为品牌动效实现调整对象。扫描清单、源代码位置在 `data/motion-inventory.json`。
- 本阶段只审查、记录、生成方案；**没有修改网站实现或参数，没有新增全站滚动接管、转场或动画库**。
- 代码检查与浏览器证据分开：本报告的可执行复现采用当前源码加最小 DOM/时钟替身，不能代替真实浏览器 BFCache、触屏或性能测试。完整截图以 `QA_BASELINE.md` 和截图清单为准；尚未取得的交互证据明确标为待采集。
- 截图是修改前状态，不能自动成为“已确认正确设计”。Phase 01 不存在修改后截图。

## 1. 保留边界与设计冻结

以下属于用户已明确要求的交互，不将其存在本身列为缺陷：

| 页面／组件 | 当前确认行为 | 冻结的视觉和交互边界 |
| --- | --- | --- |
| 首页开场／生产合作花形 | 原生滚动驱动，阻尼旋转、缩放、闭合五圆；开场完成后交接首页 | 不改为自动播放，不恢复文字、鼠标提示或断开的圆线；保留透明中心和当前矢量几何 |
| 自研产品／燃萃温植 | 横滑跟手，释放后吸附，首尾循环；产品图片正向 | 不恢复拖动提示和翻页进度 UI；不镜像包装；保留燃6／萃6／温4／植3、左图右文及框体向左出画构图 |
| 自研产品／系列覆盖 | 仅在产品目录范围内向上覆盖，阻尼跟随 | 不把四组重新变为普通页面平移，不引入全站滚动库 |
| AI 章节／服务页店型比较 | 向上覆盖；桌面长章节完整阅读后固定底部；长移动章节自然滚动 | 不恢复章节顶细线；不因统一组件改变各自摄影、色彩或章节顺序 |
| 企业商业范式 | 点击展开与收起；方向键移动焦点；Escape收起 | 不恢复悬停自动选择 |
| 企业历程 | 原生横向滚动、鼠标拖动、年份定位；文字清晰 | 不恢复正文模糊，不替换年份和图片 |
| 全站影片 | 静音自动循环、无可见暂停／进度控件；离屏或后台暂停以节约资源 | 不把视频控件作为本轮“优化”；首页影片保持全屏铺满 |
| 服务／联系／合作 | 服务首屏白底黑字，影片和合作摄影无色彩遮罩；联系页原文化大图、错落四图、三列入口 | 不为动效一致性重做布局，不改变文案、摄影或官方联系渠道 |

源代码保护信息包括 `xunai/ai-page.js:3` 的 shared shell 保留说明、`xunai/ai-orbit.js:1` 的 Figma 617×599 坐标保护、`xunai/stores-page.js:44-45` 的门店来源保护、`product-scene.js:180` 的产品原图材质，以及 `planting-page.js:44` 的原生滚动说明。未发现一条允许在本轮重新设计全站的注释。未删除任何旧注释或旧选择器。

注意：旧名字 `company-business-hover` 仍存在，实际事件已是点击。**类名不是行为证据，也不作为本轮删除或重命名理由**。旧 `.xm-*` 动效 CSS 的可达性需要逐一验证，不能因名字像旧版就批量清理。

## 2. 当前动效参数库存

完整的 24 类参数、触发、重复条件及源位置见 `data/motion-parameters.json`。CSS 共扫描到 258 条动效声明／变量声明；统计包括源层叠与后来覆盖，**不是 258 个正在运行的动画**。同一规则的多个属性会分别出现时长。

### 2.1 时间、缓动与重复方式

| 类型 | 当前值与机制 | 触发／终止 | 判断 |
| --- | --- | --- | --- |
| 全站链接反馈 | 主要220ms，`--ease:cubic-bezier(.22,1,.36,1)`；导航下划线180ms、`.2,0,0,1` | hover／focus／current | 有明确场景差异，不宜强行同值 |
| 全站正文显现 | `site-experience.css` 320ms透明度；首页正文360ms | IntersectionObserver，通常每次挂载一次 | 当前阅读优化已取消正文通用模糊，应保留 |
| 摄影显现 | 透明度760ms，裁切／滤镜980ms，最多275ms媒体错峰 | 可视阈值.14、底部-10% | 属品牌摄影节奏，保留为场景参数 |
| 移动菜单 | 进入／关闭400ms，`.16,1,.3,1` | 点击／Escape；减少动态模式立即关闭 | 保留原对话框机制与焦点圈 |
| 首页系列摄影（旧基准） | 4200ms自动轮播；换图透明度180ms、90ms交换延迟 | 旧实现包含离屏、后台、hover、焦点、手动暂停、reduced条件 | 旧“暂停/继续应保留”判断已撤回；按U-01移除可见暂停控制，保留资源与减少动态保护；可见连续轮播逻辑由本次复测记录 |
| 数字 | 首页／通用1600ms、企业1300ms，三次减速 | 可视阈值后播放 | 不是正文层级问题；不可批量改为同一个长时长 |
| 首页／合作花形 | scroll progress；临界阻尼110ms时间常数，帧间隔上限64ms | 原生滚动；合作可逆，首页完成移除 | 已确认设计；不建议改变参数 |
| 开场刻度光纹 | 7600ms光带周期；hover跟随120ms时间常数 | 开场可见且progress<.94；后台停止RAF | 装饰例外，保留；仍需低端设备采样 |
| 产品横滑 | 临界弹簧`ω=14/s`，时间步.001–.032s；轮滚静默100ms后释放 | pointer、横向wheel、方向键、点击邻卡 | 连续输入可打断；没有旧620ms排队锁 |
| 产品说明切换 | 320ms，`.22,1,.36,1`，6px位移 | 最近卡片改变，取消前一说明动画 | 保留局部反馈 |
| 产品四系列叠屏 | 原生滚动；溢出阅读距离＋至少96px／.22屏停留＋.85屏覆盖；110ms跟随 | scroll、锚点、resize | 保留，长内容可读性需各断点浏览器验证 |
| 3D产品首屏 | 原生滚动映射0–4.98，每段模型一周旋转 | scroll／按钮；按需渲染 | 不应被通用CSS动画替代 |
| 种植场景 | 土地1.35段、科研.55段、品种4.6段；55ms内容跟随／110ms覆盖跟随 | 原生scroll；短屏与reduced有降级 | 有意叙事，与异常空白要分别判断 |
| 规范管理切换 | 原布局过渡；800ms备用结束；数据行55ms错峰 | 点击，transitionend；reduced立即结束 | 保留预留最大内容高度，避免切换跳动 |
| 企业业务 | 布局620ms；详情220／340／440／620ms与100ms进入延迟 | click／Enter／Space；Escape关闭 | 点击行为已正确实现 |
| 企业历程 | UA原生平滑定位，拖动直接跟随；reduced使用instant | 年份、卡片、按键、原生touch／wheel | 不重新自造惯性滚动 |
| AI／店型覆盖 | 原生sticky，无wheel接管；桌面长屏底部固定 | scroll；reverse恢复；reduced自然流 | 数学检查通过，图形断点仍需截图 |
| AI图形 |150／180／210秒轨道，90／120／160秒星轨，linear、infinite | CSS，reduced停动画 | 线性用于持续旋转合理；离屏暂停缺口见M06 |
| AI合作与资质 | 指针550ms、透明度350ms；3个tab循环 | 点击、方向键、Home／End、40px滑动 | 键盘／触屏均有替代 |
| 服务竞争力／卡项说明 | 550ms，`.22,1,.36,1` | 点击、方向键、分页、滑动 | 不因与产品说明320ms不同就认定错误 |
| 加盟流程 | 透明度400ms；局部滚轮450ms节流 | 完全可见流程区域的wheel、点击、键盘、touch | 仅局部接管，见风险确认项，不擅自删除 |
| OEM／ODM折叠 | 图标220ms；展开260ms | 原生details；reduced取消 | 可用性基础合适，保留原生交互 |

CSS字面时长出现最多：220ms×35，980ms×19，180ms×19，550ms×17，760ms×13。0s、0.01ms主要来自显隐／reduced覆盖。变量引用不在字面统计中，完整源清单保存于JSON。现有`--x-motion-counter:2200ms`、`--x-motion-route:250ms`等旧token不能直接认定为当前计数器／路由实际时长；实际业务模块分别使用1600／1300ms与即时导航。

### 2.2 语义Motion Tokens方案（仅映射，未写入网站）

| 建议语义 | 当前可复用来源 | 适用界限 |
| --- | --- | --- |
| `motion-duration-fast` | `--motion-quick:180ms` | 快速界面反馈；保留220ms链接变体 |
| `motion-duration-normal` | `--motion-standard:320ms` | 正文／产品说明；不能覆盖550ms图像迁移 |
| `motion-duration-slow` | `--motion-scene:620ms` | 已有企业场景；保留摄影760／980ms例外 |
| `motion-easing-standard` | 已有`--ease:.22,1,.36,1` | 主体品牌减速曲线 |
| `motion-easing-emphasized` | 菜单`.16,1,.3,1` | 只作为导航进入变体，不替换所有曲线 |
| 物理交互参数 | 横滑14/s；花形110ms | 单独命名的行为参数，不能转成一个固定CSSduration |

数值多本身不构成缺陷。先给相同语义和同场景建立别名，再逐处检查可达性；本轮不批量替换硬编码、不统一所有动画。

## 3. 导航协议与可访问性盘点

| 路径类型 | 当前实现 | 当前优点／缺口 |
| --- | --- | --- |
| 7个正文HTML之间 | 原生文档导航 | 无额外全屏遮罩、无延迟导航；浏览器负责文档焦点和正常历史。不能为了“统一”加白屏 |
| 加盟兼容入口 | `franchise-redirect.js`根据兼容hash跳转服务／联系 | 沿用有效入口；应在完整路由检查核对最终落点 |
| 服务6个hash子路由、联系8个hash子路由 | `transplanted.js`动态import；revision序号丢弃过期render结果 | 快速切路由有保护；缺BFCache恢复、历史滚动区分、路由焦点迁移 |
| AI章节hash | 同一个hash渲染入口；锚点instant | 现有覆盖保留；焦点与历史回退仍走共享入口 |
| 产品目录锚点 | 重新计算叠屏timeline并定位；同hash重复点击也处理 | 已保留滚动叙事；非当前产品组inert，避免隐藏内容聚焦 |
| 企业荣誉 | hash选中、replaceState；原生details | 支持分类深链接；单证书展开不新增长转场 |
| 种植章节 | `dataset.chapterScroll`映射 | 对齐场景进度；保留原生scroll，不拦截wheel |

路由精确字符串、主要章节锚点、截图slug及11个CSS视口见 `data/motion-routes.json`。同类导航应先统一焦点和历史协议；当前没有证据支持为了视觉过渡引入View Transition API。本轮只评估，建议暂不引入新视觉转场。

键盘／触屏已存在：菜单Tab循环与Escape、企业业务方向键与Escape、历程方向键／Home／End、产品gallery方向键、资质tab方向键／Home／End、报告图册原生横向滚动与方向键、服务卡方向键与触屏分页、原生details与表单校验焦点。未把摄影hover当成必须点击才能理解的内容。

## 4. 可执行问题清单

### M01｜P1｜跨文档返回时，BFCache页面恢复后交互清理无法恢复

- **页面与路由**：`/website-code/ai.html`、`/website-code/service.html`及其6个子路由、`/website-code/contact.html`及其8个子路由；全视口。优先1920×1080和390×844，浏览器启用BFCache。
- **当前表现**：只要浏览器将这些文档保存在BFCache，离开时即执行unmount。返回缓存文档时脚本不重新执行，又无pageshow重挂载。AI／店型覆盖监听器和observer已移除；内容动效与影片可视性监听已移除且影片已pause。
- **原因与证据**：`transplanted.js:54`无条件pagehide清理；文件无pageshow；`content-motion.js:76-95`的清理明确暂停影片、断开observer；`section-cover.js:48-60`清理移除覆盖class、inert和监听。对照`app.js:6`、`products-page.js:86`均只在`!event.persisted`清理。
- **验证**：当前源码执行替身触发`pagehide({persisted:true})`后，disposal=true，pageshow listener=false。见 `data/motion-router-reproduction.json`。尚不能由此声称当前浏览器一定采用BFCache；浏览器恢复资格与真实返回路径另测。
- **最小修复方案**：在共享入口先对齐现有`event.persisted`保护；只有真实卸载才dispose。需要时用pageshow同步可见性，不重复挂载仍存在的监听器。
- **涉及文件／共享范围**：`website-code/transplanted.js`；服务、联系、AI。不要修改各页布局或cover参数。
- **锁定设计影响**：视觉零预期变化；恢复已确认行为。必须回归普通导航、BFCache返回与多次前进后退，防重复observer。
- **修改前截图／交互证据**：`baseline/ai/1920x1080/full-page.jpg`；待采集`states/ai/1920x1080/back-forward-restored.jpg`及视频play状态、cover class证据。
- **修改后截图**：不适用（Phase 01未修复）。
- **测试结果**：源码缺口可执行确认；真实浏览器BFCache复现待归档；现有五项检查未覆盖本条件。
- **需要人工确认**：需确认进入第二轮的P1清单；技术根因无视觉设计选择。

### M02｜P1｜hash子路由回退未区分前进导航，阅读位置被重置

- **页面与路由**：例`service.html#/stores/standard`→`#/stores/standard/detail`→浏览器返回；联系图卡→意向页→返回；全部11个视口。
- **当前表现**：同文档hashchange一律render后`scrollTo({top:0})`或重新定位锚点，不保存每条历史记录的阅读位置。已阅读到店型／卡项／三列合作入口的用户回退，可能被带回页面头部，而不是离开点。
- **原因与证据**：`transplanted.js:36-54`同一render处理所有hashchange，50-51无条件重新滚动；没有历史记录key或hash子路由scroll缓存。精确源码替身的前进和返回均记录top0，见 `motion-router-reproduction.json`。
- **最小修复方案**：只在hash路由入口区分新点击、锚点和历史遍历；保留新页面正常从顶读取，回退恢复同一历史条目的位置；等待挂载与必要布局测量后恢复。不要改用全站manual scrollRestoration或增加延迟遮罩。已有产品／种植场景hash映射保留。
- **涉及文件／共享范围**：`transplanted.js`；需回归service、contact、AI锚点，兼容`?anchor=types`。
- **锁定设计影响**：预期不改变版式、照片和转场节奏；可能与现有scroll锚点竞争，需独立验证。
- **修改前截图／交互证据**：`baseline/service-standard/1920x1080/full-page.jpg`与`states/service-standard/1920x1080/back-to-types.jpg`（状态图待采集）；移动对应390×844。单张截图不能证明历史恢复，必须记录离开与返回scrollY。
- **修改后截图**：不适用（Phase 01）。
- **测试结果**：源码执行确认强制top0分支；实际浏览器历史恢复时序待测。暂不据此批量修改所有锚点。
- **需要人工确认**：需确认第二轮执行；“后退回到原阅读处”符合本轮目标，无新视觉构图。

### M03｜P1｜hash路由替换main后，未把键盘焦点转到新内容

- **页面与路由**：服务店型详情、服务卡项、加盟；联系招聘／商务／海外／加盟／生产意向；全部11个视口，优先键盘与读屏。
- **当前表现**：在main内点击链接后旧DOM被替换，旧焦点节点被删除；新内容标题没有路由入口统一聚焦。浏览器滚动位置虽变化，读屏未获得明确的新页入口，下一次Tab可能从文档较前位置重新开始。
- **原因与证据**：`transplanted.js:47-51`只替换innerHTML、挂载和scroll；该文件无focus调用。`about-page.js:49,52`及`franchise-form.js`的focus只处理表单步骤，不是路由进入，不能覆盖此缺口。
- **最小修复方案**：只在真实子页面变化后聚焦该页h1／main，`tabindex=-1`、`preventScroll:true`；锚点导航则聚焦对应标题／目标。不要每次scroll或同页tab切换都夺焦点；历史回退优先恢复合理的前焦点。
- **涉及文件／共享范围**：`transplanted.js`与必要的目标标记；共享范围与M02一致，可在同一有限补丁中实现，但验收分别记录。
- **锁定设计影响**：无静态视觉差异；键盘focus轮廓属于功能状态。不能去掉现有focus-visible样式来掩盖焦点变化。
- **修改前截图／交互证据**：`baseline/contact-business/390x844/full-page.jpg`与`states/contact-business/390x844/route-entry-focus.jpg`（后者待采集），另记录activeElement与读屏播报。
- **修改后截图**：不适用（Phase 01）。
- **测试结果**：静态调用链确认缺少统一入口；真实键盘／读屏仍需验证。没有声称已通过读屏测试。
- **需要人工确认**：需确认第二轮P1范围；技术可访问性修复，不重新设计。

### M04｜P2｜产品弹簧运行中切换“减少动态效果”，当前帧循环仍继续

- **页面与路由**：`/website-code/products.html#products-series`、四组`#products-ran/cui/wen/zhi`；所有视口；条件是在释放吸附尚未结束时更改系统／浏览器减少动态偏好。
- **当前表现**：初始reduced模式正确立即吸附；已经运行的spring只在下一次end／step才检查偏好，当前tick会继续变换位置直到自然结束。
- **原因与证据**：`products-showcase.js:30-63`，`settle()`有reduced检查，`tick()`没有；series和detail调用共享函数，没有媒介change取消此spring。当前源码确定性RAF复现：偏好改变前位置0.22605，改变后一帧仍变至0.30829且仍有1帧排队。见 `data/motion-reduced-live-change.json`。
- **最小修复方案**：在共享spring当前tick／refresh路径检查实时偏好并立即落定现有target，清除velocity／RAF。保持普通模式14/s、拖动与循环逻辑不变；不要统一改小正常动画时长。
- **涉及文件／共享范围**：`products-showcase.js`；产品series和19款detail共同受影响。
- **锁定设计影响**：普通模式零预期视觉变化；仅尊重已请求reduced行为。
- **修改前截图／交互证据**：`baseline/products/390x844/full-page.jpg`、待采集`states/products/390x844/reduced-during-settle.jpg`；核心证据为连续帧数值，不能由静态截图代替。
- **修改后截图**：不适用（Phase 01）。
- **测试结果**：初始reduced与一般连续操作测试通过，新增边界由源码执行确认未满足；本轮未改现有测试或业务源码。
- **需要人工确认**：需确认P2纳入第二轮；不涉及新视觉选择。

### M05｜P2｜产品3D构造失败缺少降级与可读恢复

- **页面与路由**：`/website-code/products.html#products-hero`；所有视口，尤其WebGL不可用、GPU上下文失败的环境。
- **当前表现**：模型网络加载已有“重新加载”反馈；WebGLRenderer构造发生在该反馈机制之前。若构造抛错，mountProductHero拒绝，五款按钮监听也未绑定；mountShowcase调用只有then无catch。用户可能得到空3D区与无法响应的首屏选择。
- **原因与证据**：`product-scene.js:60-73`直接new WebGLRenderer；网络加载反馈在142-206；`product-hero.js:39`等待构造后才在61绑定按钮；`products-showcase.js:147`无拒绝处理。对照`planting-page.js:61-69`已有catch并保留原图fallback。
- **最小修复方案**：先记录真实WebGL失败，再局部捕获构造错误；使用已确认的对应现有素材或保留可读信息与重试入口，避免引入新摄影。降级素材／布局如有新选择，须先确认。不要牵涉正常WebGL版式和模型材质。
- **涉及文件／共享范围**：`product-scene.js`、`product-hero.js`或其挂载调用点，限产品首屏；不改种植已存在的降级。
- **锁定设计影响**：正常GPU环境应无差异；降级状态是未确认选择C，需要确认展示方式。
- **修改前截图／交互证据**：`baseline/products/1920x1080/full-page.jpg`；待采集`states/products/1920x1080/webgl-unavailable.jpg`。尚未通过关闭GPU的浏览器实测，不能声称当前用户机器已遇到该错误。
- **修改后截图**：不适用（Phase 01）。
- **测试结果**：调用链确认无构造异常处理；特定失败环境待测；正常模型检查通过不覆盖此分支。
- **需要人工确认**：是；确认降级使用哪些已确认素材和最小状态UI。

### M06｜P2｜AI轨道在离屏／被覆盖后没有有效暂停接入

- **页面与路由**：`/website-code/ai.html`的hero，滚至`#how-it-works`／后续章节；所有视口，优先390×844与高DPR。
- **当前表现**：6层90–210秒无限旋转在CSS中定义，减少动态模式可禁用。现有离屏暂停选择器依赖`.xm-scroll-scene:not(.xm-in-view)`，AI实际markup和挂载逻辑没有加这组class，因此该暂停路径不可达。被覆盖后不代表CSS animation自动pause。
- **原因与证据**：`xunai/content.css:1432-1443`与1917；`xunai/ai-page.js:16-38`结构／挂载；全业务源码搜索只有CSS出现`.xm-scroll-scene/.xm-in-view`，`content-motion.js`只管影片可见性。浏览器可能自行节省不可见合成，不能据此声称已测得GPU损耗或卡顿。
- **最小修复方案**：在AI现有挂载内对hero可见性和document.hidden切换其装饰动画的play-state，清理observer；重新可见后续播。不改变可见轨道速度、几何或AI叠屏。
- **涉及文件／共享范围**：优先`xunai/ai-page.js`及局部CSS暂停状态；不为所有页面建立新的动画管理框架。
- **锁定设计影响**：仅不可见／后台状态；可见画面应保持当前设计。
- **修改前截图／交互证据**：`baseline/ai/390x844/full-page.jpg`；待采集`states/ai/390x844/orbit-offscreen-state.jpg`并记录getAnimations() playState和document.hidden；截图本身不能证明性能。
- **修改后截图**：不适用（Phase 01）。
- **测试结果**：无有效暂停接入由源码确认；实际能耗、帧时间及暂停状态仍待浏览器证据。
- **需要人工确认**：需确认P2执行；可见状态不新增设计。

## 5. 待测风险与未明确选择（不能当作已复现缺陷）

| ID／级别 | 页面、视口 | 证据与可能原因 | 最小方案／涉及文件 | 锁定设计、截图、测试和确认 |
| --- | --- | --- | --- | --- |
| R-M01／P2待测 | 种植页，390×844、高DPR、3840×2160 | `planting-page.js:136-208`一帧中读getBoundingClientRect／offsetHeight后写left/top/width/height/filter，且在所有滚动阶段更新全部story；存在布局／绘制负担风险，尚无Performance trace | 先采轨迹；只有证实超预算才缓存稳定geometry、批量读写或跳过离屏场景，不改变构图。涉及planting-page.js | 原生滚动叙事锁定；修改前`baseline/planting/<viewport>/full-page.jpg`；after不适用；需人工确认后按测量决定，无“已卡顿”结论 |
| R-M02／P2待测 | 产品目录和AI长屏，320×640／1024×768／3840×2160 | `products-catalog-motion.js:3-14`提供长内容read距离；`section-cover.js:1-6`提供长屏底pin；数学成立不保证字体加载、200%缩放、屏幕旋转时每个长段均可读 | root逐状态截图、正反向滚动；只有看到具体截断再定点修复。源范围catalog／section-cover及对应局部CSS | 覆盖逻辑锁定，不能仅因长section就压缩高度。修改前states/products／ai各视口；after不适用；数学测试PASS，真实逐状态验证见总表；需确认具体缺陷 |
| C-M01／P2待确认 | `service.html#/franchise`，1280×800以上 | `franchise-page.js:55-63`仅流程完整可见时拦截局部wheel并450ms节流，有按钮／键盘／触屏替代。源码不是全站惯性库；reduced时仍处理局部wheel | 先测试触控板、读屏、reduced及边界退出，不擅自删除既有滚轮切步。是否reduced取消wheel切步为待确认选择 | 流程现有节奏保留；baseline/service-franchise对应图；after不适用；源码审查完成、实体触控板待测；需要确认行为偏好 |
| C-M02／P2待确认 | 全站导航 | 原生全页即时导航与hash内容切换无统一视觉转场；没有证据表明需要增加遮罩或延迟 | 先修焦点／历史一致性；暂不增加View Transition API | 保留当前页面节奏；全部baseline；after不适用；无需“为了统一”新设计，若想新增转场必须另确认 |

## 6. 已执行验证及其边界

本次直接运行现有检查，均PASS：

1. `check-home-motion.mjs`（原基准）：图片自动轮播、循环、旧手动暂停、hover／focus／visibility／reduced。其中旧手动暂停控件的测试预期已被U-01撤销，不能继续要求UI保留；本轮应更新该具体检查并复测。
2. `check-product-carousel-motion.mjs`：准确偏移释放、spring中断、快速重定向、首尾连续、pointer、横向wheel、纵向页面滚动。
3. `check-company-interactions.mjs`：点击业务组件、键盘收起／焦点、原生历程拖动、年份同步、边界与清理。
4. `check-section-cover.mjs`：桌面长内容底部固定、移动长屏／reduced自然流、全宽覆盖及清理源码。
5. `check-honors-cooperation.mjs`：闭合花形、荣誉分类、details、hash、清理。

此外：源码执行确认M01、M02的共享路由行为；确定性RAF源码执行确认M04。结果文件分别为`motion-router-reproduction.json`与`motion-reduced-live-change.json`。

这些检查不等于真实浏览器帧率测量、BFCache资格测试、读屏验收、触屏实体机测试或Lighthouse。未把老`notes/responsive-check`的72组历史记录当作本轮11种视口的验收。浏览器截图和逐状态结果由本轮baseline／states清单记录；**不会通过更新基准来让错误“通过”**。

## 7. 第二轮建议顺序与回归门槛

1. 用户确认后先处理M01，再验证service／contact／AI前进后退和影片循环；通过后记录决策，不触碰布局。
2. M02、M03可共用一个有限路由补丁；分别验收历史scroll、焦点、普通新导航、同页锚点与快速连点；检查8个入口链接落点。
3. M04单独调整共享spring的reduced边界；复跑产品连续性及320／390／1440／1920／3840宽度的既有卡片位置截图，确认普通模式零回归。
4. M05先取得失败环境证据与降级设计确认；M06先取得离屏playState／性能证据。每类独立修复和记录。
5. R-M01／R-M02／C-M01只按实际证据推进，禁止提前批量压缩section、改字体、替换摄影或统一全站弹簧。

本报告没有P0结论。P1是导航生命周期和阅读可达性；P2区分已确认源缺口、条件兼容风险与未测性能风险，不能混称“全站严重卡顿”。
