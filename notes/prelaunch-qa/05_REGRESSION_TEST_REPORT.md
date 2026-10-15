# 05 · 视觉与交互回归记录

日期：2026-10-15。当前分支 `qa/refinements-20261015`，修改前提交 `b5c0b6c606868954653ec70ff654eec8ea847cd2`，可恢复标签 `qa-refinements-baseline-20261015`。

状态：U-01/U-02/U-03限定修改、本轮布局矩阵、前后截图、产品输入及媒体/DPR检查已完成。以下只对列明范围报告结果，不构成全站正式上线通过。没有覆盖before或重录旧基准以消除差异。

## 证据边界

| 来源 | 实际状态 | 能支持的结论 |
| --- | --- | --- |
| 原 Phase 01 基准 | 历史Git分支181组captured；计划242组，采集未完成 | 只证明所列画面已采集，不等于设计正确或全量验收 |
| 原交互记录 | 42条，含collected、observed、passed及harness-error | 不能写42项全部通过；hash路由焦点和BFCache两条harness-error需重新验证 |
| 原源码库存与替身复现 | 9份恢复到data目录，依赖原基准 | 支持代码作用域、M01/M02/M04边界分析；不代替真实浏览器和实体机 |
| 本次修改前截图 | `notes/refinement-qa/before/`，42组已存在 | 390×844、1440×900、3840×2160，DPR1；before-layouts.json记录实际CSS视口和几何 |
| 本次修改后截图 | `notes/refinement-qa/after/`，42组已存在 | 与before同样的页面/状态/尺寸，after-layouts.json记录；动态时序存在下述9条y差异 |
| 本次布局矩阵 | 22路由×11CSS视口=242条 | HTTP200；0横向溢出、已加载破图、pageerror、暂停UI、媒体属性错误、检测到的匹配褐绿UI背景；不是242份完整页截图 |
| 本次交互 | interaction-results.json共16条passed | 12详情+3系列+首页自动继续；另记录390四组20px触屏和64px纵向不误切；不替代实体机 |
| 本次代码检查 | 8项通过、git diff --check通过 | 见下述清单；不等同全站设计审查/实际媒体循环/读屏/Safari验收 |
| 本次实际媒体/DPR | media-zoom-results.json共14条passed | 七视频位置×390×844 DPR3 / 1920×1080 DPR2；自然播放推进与一次片尾循环通过，非物理设备或真实浏览器缩放 |

## 本次环境与截图清单

macOS15.7.1（24G231）arm64、Chrome154.0.8037.99、Node v26.1.0；基础截图与布局矩阵DPR1，媒体另有DPR2/3模拟。CSS视口与物理显示器分辨率分别记录。字体未替换：代表页fonts.ready后OPPO100–700、Mincho400 loaded，Crimson400未使用所以未载；不宣称重新验证授权。1920根字号21.3333px、移动16px，保留TYP-01待确认。

每一阶段42组包含：七正文入口×三尺寸=21张full-page；产品六状态（series、ran、cui、wen、zhi、cooperation-oem）×三尺寸=18张状态图；首页collections×三尺寸=3张。42张before+42张after，不是84个不同路由或242张完整页面。

索引：[before-layouts.json](../refinement-qa/data/before-layouts.json)、[after-layouts.json](../refinement-qa/data/after-layouts.json)、[layout-matrix.json](../refinement-qa/data/layout-matrix.json)、[geometry-comparison.json](../refinement-qa/data/geometry-comparison.json)、[interaction-results.json](../refinement-qa/data/interaction-results.json)、[media-zoom-results.json](../refinement-qa/data/media-zoom-results.json)、[code-checks.json](../refinement-qa/data/code-checks.json)。

242条布局数据中110条document导航、132条same-document-hash；hash条目的HTTP状态沿用所在文档实测结果，不表示其发出了独立文档请求。颜色检查只检查采样时computed UI背景，没有覆盖全部hover、展开、动画进度及品牌媒体像素。

## 本次回归矩阵

| 修复ID | 当前页与共享页 | 需要验证的状态 | 前后证据及结论 |
| --- | --- | --- | --- |
| U-01 | 首页及各带视频/图片轮播页 | 无可见暂停UI；视频属性正确；手动后hover仍自动继续；资源/减少动态保护 | 242记录无暂停控件/视频属性错误；首页从温切到植，4500ms后自动继续通过。七视频位置×两个DPR环境14条自然播放及一次循环通过。例[修改前](../refinement-qa/before/index/1440x900/collections.jpg) / [修改后](../refinement-qa/after/index/1440x900/collections.jpg) |
| U-02 | 全站七正文入口及对应子路由 | 白/米白UI配色、必要对比度配套，媒体及中性文字色保留 | 242记录未匹配到褐绿UI背景；42几何对比x/w/h均无>1px变化，9条动态y差异保留。例服务[修改前](../refinement-qa/before/service/1440x900/full-page.jpg) / [修改后](../refinement-qa/after/service/1440x900/full-page.jpg)；图像/字体无修改 |
| U-03 | 产品系列 + 燃/萃/温/植详情 | 低成本触发；不误抢纵向，保持循环与键盘 | 12详情（4组×3尺寸）通过16px慢鼠标/16pxwheel/键盘反向/2px抖动；3系列仅浏览器实测16px鼠标及键盘反向，其他条件由共享单元检查覆盖；390四组额外20px CDP触屏通过，64px纵向不误切。例燃[修改前](../refinement-qa/before/products/390x844/products-ran.jpg) / [修改后](../refinement-qa/after/products/390x844/products-ran.jpg) |
| 共享保护 | 导航、页脚、服务店型覆盖、AI长章节、企业点击与历程 | 保持版式、交互类型和共享内容；局部验证不扩大为全验收 | package、company、cover、cooperation、hero等检查通过；242布局无上述可检测异常。导航历史/真实BFCache/读屏旧风险仍待后续，未写全通过 |

## 几何差异与回归判定

42组对照没有x、宽或高超过1px的变化。保留9条y差异：390首页collections状态的七区块均差1308.19px（loader时序）、390种植sticky区差247.81px、1440 AI hero差-21px（滚动采样）。这些来自动态进度未完全对齐；不是静态像素完全一致的证据。未因此更新基准或调整页面高度，不宣称“全站像素回归通过”。

独立只读代码审查未发现明确回归；这是源码审查结论，不替代动态视觉逐帧证明。未经授权的明显差异仍按回归风险处理。

## 已执行的八项检查

1. check-package：1167引用、19产品、566位图hash核对。
2. check-home-motion：无暂停UI、手动后自动继续与既有生命周期保护。
3. check-product-carousel-motion：共享低门槛输入、连续性、循环及pointer capture边界。
4. check-site-experience。
5. check-honors-cooperation。
6. check-company-interactions。
7. check-section-cover。
8. check-hero-migration。

上述均通过；git diff --check通过。产品弹簧参数、字号、布局高度和全局间距没有为本轮改变。所有路径位于AAT。

## 实际播放及高DPR检查

七个视频位置分别在390×844 DPR3及1920×1080 DPR2采样，共14条passed。测试没有调用video.play强行制造自动播放；依靠原页面自动播放和现有可见性管理，1.2秒观察期currentTime自然推进约1.2秒。仅在测试运行态seek到片尾，然后观察一次自然循环回1.23–1.43秒并继续。全部autoplay/muted/loop/playsInline为true、controls为false、媒体error0；实际CSS视口/DPR符合设置且overflow0。测试未修改源视频或网站运行源码。

该数据支持本地Chrome可见播放及一次循环，不支持每种网络、长期播放、Safari或实体机保证；高DPR不是浏览器zoom。真实200%浏览器缩放未测，没有用CSS zoom、pageScale或DPR伪装该项。planting/1440x900/factory-color-review.jpg是after全页裁取的QA拼图，经目视正常，不计为额外独立截图基准。

## 回归判定

已锁定区域出现本次三项授权以外的明显差异，标为回归风险并暂停对应改动。动态影片/3D/滚动动画应记录时间与进度，不能把不同帧当静态布局回归；也不能以动态区域为由忽略错位。高DPR、CSS视口、浏览器缩放分别记录。

本报告不声称Safari、实体触屏、读屏、200%真实浏览器缩放或正式公网环境通过。CDP触屏与DPR属于浏览器模拟；媒体推进与一次循环的有限实测不代替这些项目。原181/242全量截图审查未完成事实继续保留。
