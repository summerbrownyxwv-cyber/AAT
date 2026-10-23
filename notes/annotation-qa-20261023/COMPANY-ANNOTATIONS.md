# 企业页五条注释 · 2026-10-23

修改前main：5fbdd0782d334e0d05dae613d5612713b6c63fb7。用户注释986×909；后续明确回复“先补2026，内容待补充”。

| 注释 | 页面问题与拟改范围 | 共享影响 / 保护边界 |
| --- | --- | --- |
| 1 | company.html介绍标题按“让蕲春艾草 / 抵达更多健康生活”分两行，移除逗号 | 仅该标题，保留字体、字号及正文 |
| 2 | 下游按钮封面替换为上传_E4A9942.jpg的WebP | 新company-downstream-cover图及响应式副本；保留原图原色/比例，不动其他业务照片 |
| 3 | 下游展开服务背景替换为上传_E4A9913.jpg的WebP | 新company-service-detail图及响应式副本；原服务文字、展开交互与其他背景保持 |
| 4 | 历程补2026及轨道下方滑动提示 | brand-figma.js timeline/events与必要局部CSS；新年份内容明确待补充，不虚构事件/图片；保留年份联动、键盘及拖动 |
| 5 | 自研产品改上传KHP00465.jpg全家福横图+燃温萃植四列竖图，点击图片跳转 | products函数、company.js旧产品标题预处理、company-brand.css本区；四系列沿用原imgFrame21/68/70/69，移除旧独立艾灸器/精华贴两卡；全家福到products.html，四系列到各实际anchor |

源文件仍只在AAT维护，main开发，不建分支。新增图像单独记录于content/company-annotation-images.json，不改历史asset-map的像素无损断言或旧资产。源码/图片验证后构建同步dist。

浏览器本地访问仍受已记录策略限制，不绕过；本轮采用源码、模板/Node、实际字体/图像测量及本地图片视觉核对，未取得的实屏结果不写成通过。

## 实施及验证

- 五条已完成。2026严格按用户回复使用“内容待补充”，主图区域为HTML年份面板；11个年份与11卡一一对应，提示在整个轨道之后。
- 三张照片各有原尺寸和960/1920/3840四个WebP，共12个；q95/method6，有损编码，原尺寸主图不缩放、各图保留sRGB ICC与构图。三张1920宽文件为682,206、1,814,024、157,212字节；主图默认引用该档，srcset涵盖其他档。不能把有损WebP称为像素无损。
- 已查看原图、编码图及招牌/纹理/壁画/包装等局部；四系列本地2:3裁切图已查看，燃系列改10%横向取景，完整全家福用于总览。此为图片核对，不是页面截图。
- 模板渲染验证全部新src/srcset资源存在，w描述与真实宽度相符；12文件字节/hash/尺寸/ICC一致。五张图片链接目标有效，四系列素材及顺序为燃温萃植，旧两张独立产品卡已移除。
- check-company-interactions、check-site-experience、check-site-link-arrows、check-annotation-layout-controls及npm run check通过。公司介绍新两行标题、四列卡片在16组320–3840px含986×909尺寸/字体计算中均可容纳；数据见company-planting-offline-checks.json。CSS仅作源码/分隔结构核对，未运行浏览器计算样式。
- npm run build与dist包检查通过（1217条资源引用），本轮六个运行文件、12个WebP及图像清单与dist逐字节一致；JS语法和git diff --check通过。Safari、实体设备、实际DPR请求及页面视觉验收未测。
