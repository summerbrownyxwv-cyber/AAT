# 审查与局部修复前基准

原 Phase 01 权限：审查、基准采集、问题定位和修复方案。2026-10-15 最新用户补充仅授权 U-01 无暂停控件自动循环、U-02 UI 白/米白色面、U-03 低成本产品横滑三项实施。截图记录现状，不代表每个画面均为正确设计。

## 本次修复检查点

- 唯一维护目录：`/Users/dabao/Desktop/艾艾贴官网-首页交付/AAT`。
- 当前分支：`qa/refinements-20261015`。
- 修改前提交：`b5c0b6c606868954653ec70ff654eec8ea847cd2`。
- 可恢复标签：`qa-refinements-baseline-20261015`，解引用指向上述提交。
- 对照原基准 `48886fa39b059a88e01bc75ab99dba7acc935db8`，`website-code/` 与 `content/` 无差异；原源码库存可追溯使用，但本次改动后的计算样式和行为仍须重测。
- 本次修改前截图：`notes/refinement-qa/before/`；修改后截图：`notes/refinement-qa/after/`。前后分开保存，不覆盖已采集基准。
- 本次截图、实际 CSS 视口、DPR、浏览器/字体环境及结果以 `05_REGRESSION_TEST_REPORT.md` 与本次JSON记录为准；尚未产生的记录不得写成通过。

## 本次已采集证据

- `notes/refinement-qa/data/before-layouts.json`与`after-layouts.json`各42组，文件各42张已核对存在。390×844、1440×900、3840×2160、DPR1；每阶段七正文完整页21张、产品六状态18张、首页collections3张。
- `layout-matrix.json`为22路由×11CSS视口的242组布局数据；不是242张全页截图。110条document、132条same-document-hash，hash HTTP状态继承已实测所在文档。0检测横溢出、已加载破图、pageerror、暂停UI、视频属性错误、匹配褐绿computed UI背景；检测并非全部动态状态的视觉证明。
- `geometry-comparison.json`对照42组，x/w/h无>1px变化；9条y差异为loader时序7项、种植sticky进度1项、AI hero滚动采样1项。未完全对齐动态进度，不声称像素全同。
- `interaction-results.json`共16条passed：12产品详情+3系列+首页4500ms自动继续。详情手机另含20px CDP触屏切换与64px纵向不误切。
- `media-zoom-results.json`：七个视频位置×390×844 DPR3及1920×1080 DPR2，共14条通过。未由测试调用play，观察1.2s媒体自然推进约1.2s；测试运行态seek片尾后观察一次循环回1.23–1.43s并继续。此证明本地Chrome可见播放/一次循环，不证明所有网络与长时间运行。
- `code-checks.json`：八项检查exit0、diff检查通过；独立只读源码审查未见明确回归。
- 本次环境macOS15.7.1（24G231）arm64、Chrome154.0.8037.99、Node v26.1.0。代表页fonts.ready后OPPO100–700与Mincho400 loaded，Crimson400因未用未载；桌面1920根字号21.3333px、移动16px。高DPR设备模拟不是浏览器缩放，真实200%浏览器缩放未测，TYP-01策略仍待确认。
- 原181/242截图采集未完成事实保留；Safari、实体设备、读屏和正式部署性能验收未由本次替代。planting/1440x900/factory-color-review.jpg为after全页裁取的QA拼图，并非独立截图基准。

## 原 Phase 01 基准记录

- 网站根目录：`/Users/dabao/Desktop/艾艾贴官网-首页交付/AAT`
- 分支：`qa/prelaunch-20261015-phase01`
- 修改前提交：`48886fa39b059a88e01bc75ab99dba7acc935db8`
- 可恢复标签：`qa-prelaunch-baseline-20261015`，指向该完整提交。开始时工作区干净，944 份文件已在 Git 跟踪范围内。
- 预览：`http://127.0.0.1:4196/website-code/index.html`；服务根目录为 AAT。
- 截图目录：`notes/prelaunch-qa/baseline/<slug>/<宽>x<高>/full-page.jpg`
- 交互状态：`notes/prelaunch-qa/states/<slug>/<宽>x<高>/`
- 每份截图的实际环境、字体、媒体时间、布局、错误、截取时间见同目录 `metadata.json`，总索引为 `notes/prelaunch-qa/data/browser-layouts.json`。
- 路由、视口和环境清单：`data/motion-routes.json`、`data/browser-environment.json`。采集脚本位于 `notes/prelaunch-qa/scripts/capture-baseline.mjs`。

## 采集范围与状态

计划完整采集 22 个入口或 hash 路由 × 11 个 CSS 视口，共 242 组。8 个 HTML 入口包含会跳转的 franchise 兼容入口；14 个 hash 路由保留各自地址记录，即使内容复用也不推断为相同状态。

视口：320×640、360×800、390×844、430×932、768×1024、1024×768、1280×800、1440×900、1920×1080、2560×1440、3840×2160。基准 DPR=1；移动与平板使用触屏模拟。高 DPR 与缩放另行记录，不与物理显示器分辨率混同。

原 Phase 01 被中断。历史分支保存的总索引为 181 条 captured，完整页截图和 metadata 也各 181 份，未达到计划的 242 组。不能把计划数量当作通过数量，更不能把 captured 自动当作设计验收通过。

恢复文档时，本工作树仅发现 7 份原 full-page 截图及其 metadata；其余历史证据仍可从 `qa/prelaunch-20261015-phase01` 检索。本次只恢复审查 Markdown 与源码库存，未复制运行缓存、浏览器资料或旧站包。报告中列出的原截图路径若当前不存在，表示历史引用/待恢复证据，不能冒充当前文件。新一轮实际数量由主审报告更新。

原环境：macOS 15.7.1 / arm64，Chrome 154.0.8037.99，Playwright 1.62.1；DPR 1 为原基准，locale zh-CN、时区 Asia/Shanghai。该环境是历史实测记录，本次环境须重新记录。

## 可重复性和限制

- 当前确认的摄影、字体、布局和动效参数保留；品牌色仅有本次U-02对应UI褐/绿色面改白/米白的明确授权例外。不会通过修改页面高度、字体、间距或关闭动效来使截图“正确”。
- 先自然遍历页面加载懒加载内容，再返回顶部截取完整文档；固定叠屏仅能展示当前层，因此另保存滚动关键状态。
- 影片、3D 和入场动画具有时间差异。元数据记录媒体播放时间；后续比较须区分动态区域和非预期差异，不能以自动更新基准掩盖回归。
- 使用独立 Playwright / Chrome 环境，不复用用户的浏览记录或登录资料。截图是 Chromium 模拟结果，不替代实体设备、Safari 或正式部署环境验收。
- 回到基准需人工选择恢复范围；标签保留可恢复历史，不执行破坏性的自动重置。

## 变更范围保护

每项后续修复先登记问题、路由、视口、拟改文件、共享组件影响和锁定设计影响，再按用户确认的优先级执行。修改前后的截图存放不同位置；未经人工审阅不得覆盖或重生成既有基准以消除差异。
