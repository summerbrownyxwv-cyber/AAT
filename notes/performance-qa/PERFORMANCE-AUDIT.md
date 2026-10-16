# 性能审计 · 2026-10-16

基准：main 87fdb492；恢复标签 qa-performance-baseline-20261016-annotations。Node v26.1.0 / macOS本地，自定义Node构建，兼容声明>=22。构建命令npm run build，输出website-code/dist；当前生产域名沿用用户提供的Vercel项目，未擅自更改缓存策略。

## 诊断结论

1. 字体重复URL：service/ai/contact预载assets/fonts，xunai/content.css又定义到assets/xunai/fonts，同字节不能共享URL缓存。两字体合计15,900,056 B；旧隔离字体实验已观察双份，见MEDIA-PROPOSALS.md，历史整页采样受分支切换干扰，不作为本轮性能分数基准。
2. 产品页非首屏四系列图eager合计32,257,258 B，与首屏字体、模型和视频竞争；先调整延迟/优先级及接近视口预热。完整浏览仍需相同图片字节。
3. 首屏五个模型合计19,565,240 B，其中第一款2,024,140 B；请求顺序候选需防止快速切换空模型，暂不改。
4. 七视频328,306,589 B，均已faststart。planting-hero仍91,317,434 B、1080p30、完整291.7667秒；未再编码。AI演示89,964,461 B、品种视频64,487,852 B，离屏暂停不等于停止下载；source延后会改变首帧时机，需另行比对确认。
5. Three setter在进度夹紧后仍重复update/render。仅相同数值短路，加载/resize/减少动态偏好仍独立更新。
6. 产品卡屏：固定且overflow:clip的合成舞台在盖屏过程中裁掉卡片下半，人工合成runway又与自然滚动叠加。最新注释授权改用现成自然高度盖屏+原110ms跟随，移除合成舞台，保留有限横滑。
7. 构建复制开发检查脚本，属于部署体积而非实际页面请求问题。仅排除生产复制，源工具保留。
8. 额外一致性缺陷：Git把OPPO许可CRLF转换LF，但manifest按原3304字节校验。精确文件使用-text与CR行尾声明，保留原许可字节/校验，不改字体或校验规则。

## 资源规模（文件字节，非页面流量）

| 口径 | 当前值 | 含义 |
|---|---:|---|
| assets/content/website-code源资源 | 1077945092 B / 927文件 | 不含notes、.git、dist |
| 生产输出 | 1077862020 B / 917文件 | 不代表首屏下载 |
| Git仓库总大小 | 本轮未全量重新量测 | 含历史及QA运行依赖，不能用资源目录替代 |
| 页面首次/完整浏览传输 | 本轮未测 | 浏览器受策略限制 |
| 解码/运行内存 | 本轮未测 | 媒体文件字节不能替代内存 |

| 类型 | 数量 | 字节 |
|---|---:|---:|
| webp | 520 | 691841804 |
| mp4 | 7 | 328306589 |
| svg | 288 | 632699 |
| txt | 2 | 4385 |
| woff2 | 6 | 31886280 |
| glb | 6 | 21603648 |
| json | 4 | 475349 |
| js | 44 | 2590946 |
| md | 1 | 6533 |
| css | 22 | 455843 |
| html | 8 | 55823 |
| mjs | 18 | 82622 |
| py | 1 | 2571 |

## 大文件排行榜

| 路径 | 文件字节 |
|---|---:|
| assets/planting/planting-hero.mp4 | 91317434 |
| assets/xunai/ai/ai-demo.mp4 | 89964461 |
| assets/planting/qiyou-one.mp4 | 64487852 |
| assets/xunai/stores/黑金店体验流程.mp4 | 41704236 |
| assets/xunai/brand/imgFrame71.webp | 18415194 |
| assets/homepage/home-hero.mp4 | 17516809 |
| assets/company/company-hero.mp4 | 16128344 |
| assets/homepage/28470.webp | 15396722 |
| assets/homepage/9f5c0.webp | 14989126 |
| assets/xunai/brand/imgFrame72.webp | 14988644 |
| assets/planting/d8707.webp | 14284258 |
| assets/xunai/brand/imgFrame73.webp | 14283776 |
| assets/fonts/oppo-sans.woff2 | 13645776 |
| assets/xunai/fonts/oppo-sans.woff2 | 13645776 |
| assets/xunai/brand/imgFrame74.webp | 13164498 |
| assets/planting/d8707-2560.webp | 12322048 |
| assets/company/imgRectangle3.webp | 11186258 |
| assets/company/figma/a1cd4.webp | 11106194 |
| assets/planting/f80d1.webp | 9739900 |
| assets/products/figma/e126f.webp | 9707094 |
| assets/xunai/brand/imgFrame70.webp | 8808580 |
| assets/company/imgRectangle53.webp | 8613400 |
| assets/models/moxibustion-device.glb | 8418188 |
| assets/xunai/brand/imgFrame22.webp | 8258622 |
| assets/homepage/817f2.webp | 7734998 |
| assets/products/catalog/flower-patch.webp | 7699128 |
| assets/company/figma/52b10.webp | 7514810 |
| assets/xunai/brand/imgRectangle6.webp | 7465348 |
| assets/homepage/a8c81.webp | 7436594 |
| assets/xunai/brand/imgFrame68.webp | 7424270 |

完整逐文件尺寸/引用/优先级旧审计见data/resource-inventory.json、reference-audit.json、media-audit.json；本轮新统计见data/20261016-resource-snapshot.json。媒体未改，旧元数据仍仅反映当时采集。

## 页面性能基准的可用性

| 页面 | Lighthouse / FCP / LCP / CLS / TTFB / 请求数 / 实际传输 / 长任务 | INP |
|---|---|---|
| index | 本轮未测 | 无真实用户交互数据 |
| company | 本轮未测 | 同左 |
| planting | 本轮未测 | 同左 |
| products | 本轮未测 | 同左 |
| service及店型/加盟子路由 | 本轮未测 | 同左 |
| ai | 本轮未测 | 同左 |
| contact及意向子路由 | 本轮未测 | 同左 |

本地浏览器访问遭安全策略拒绝，未用其他浏览器/CDP/headless绕过。data/before-page-metrics*.json为中断的旧采样，含资源/分支切换与测试环境错误，不将其与当前源码计算同比。生产HTTP头此前已查到Brotli、ETag与Range；本轮未重新测量线上TTFB、CDN或网络地域差异。无版本hash静态文件未设置immutable。
