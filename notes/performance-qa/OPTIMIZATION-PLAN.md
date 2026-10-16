# 优化计划与实施边界 · 2026-10-16

| 优先级 | 项目/原因 | 实施方式 | 收益口径 | 视觉影响与回滚 |
|---|---|---|---|---|
| P1，已实施 | 相同字体双URL | xunai/content.css仅3条src归一到assets/fonts | service/ai/contact的重复内容URL减少15,900,056 B；本轮实际传输差值未测 | 字节SHA相同，family/weight/display不改；还原3条URL即可回滚，源重复文件保留 |
| P1，已实施 | 产品切屏截断 | products-catalog-motion.js/css复用现成自然高度cover，去固定舞台overflow和synthetic runway | 消除内部图片裁断机制，减少专用滚动/布局读取循环 | 最新截图明确授权；110ms、有限横滑、图片/文案保持；原实现可从87fdb492恢复 |
| P2，已实施 | 非首屏四图eager | lazy+fetchpriority低，进入上下200%视口预热全部四张，离开销毁observer | 改变请求时机与优先级；不降低完整浏览32,257,258 B内容成本 | 保留所有原像素；真低速快速跳转仍需浏览器复核；还原loading及IO小段即可 |
| P2，已实施 | 同值WebGL重复绘制 | product-scene/planting-model setter仅夹紧值变化时更新 | Node验证相同值不重复update；无实测CPU/帧率百分比 | resize、加载完成、偏好更新独立保留，模型/材质/DPR不变；移除两处短路即可 |
| P2，已实施 | 开发工具进入生产包 | build.mjs仅排除website-code/scripts复制 | 本轮构建总字节实际下降85,395 B，含同批源码体积变化；不是网络首屏收益 | 源脚本与校验保留；还原该walk条件即可 |
| P2，已修复交付一致性 | license换行被Git改写 | 精确两路径-text保留canonical CRLF，许可原内容/hash不改 | clean checkout与构建资源校验可重复 | 不修改授权正文或manifest；原版权文本中的既有尾空格保留 |
| 高收益，待对比 | 五模型并发 | 先活跃模型再邻近模型；约17.54MB非第一款可分级调度 | 需要真实网络和快滚/快速点击测量 | 不自动实施，防止空模型/切换等待 |
| 高收益，待对比 | 非首屏视频提前下载 | 接近视口才赋source，提前buffer与poster协调 | 视频大，但移除离屏下载不等于完整浏览少下载 | 涉及首帧时机，先候选方案与视觉/网络对照；不自动更换资源 |
| 不自动执行 | 图片/视频有损再压、字体子集 | 先生成独立候选、逐画面/字形及版权核查 | 当前不宣称可节省的画质等效字节 | 不修改现有媒体、资源hash或pixelsIdentical |

回滚基准为main 87fdb492与qa-performance-baseline-20261016-annotations标签。过程中检测到用户并发提交623152dd（标题11），已保留，未重置或改写历史；后续提交补齐同一main的工作及构建产物。

原审核采集曾中断；目前浏览器访问策略限制阻止真实后测。没有用新基准截图掩盖差异，没有用目录体积替代页面传输，没有更改未版本化文件的immutable策略。现有Vercel流程仍为npm run build → website-code/dist。
