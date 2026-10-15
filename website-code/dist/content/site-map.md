# 页面与内容索引

当前维护目录：`/Users/dabao/Desktop/艾艾贴官网-首页交付/AAT`。以下路径均相对此目录。

| 页面 | 文件 | 当前内容 |
| --- | --- | --- |
| 首页 | website-code/index.html | 全屏品牌影片、品牌介绍、种植、产品系列、终端服务、AI 与联系入口 |
| 企业介绍 | website-code/company.html | 全产业链、自研产品、终端业务、历程与荣誉 |
| 种植生产 | website-code/planting.html | 基地、蕲优一号、品种特性、植株数据、产业园区与生产 |
| 自研产品 | website-code/products.html | 原首页 5 款三维产品开屏、产品影片、燃萃温植系列、19 款独立产品说明与生产合作 |
| 终端服务 | website-code/service.html | 寻艾艾灸馆、门店名录、标准店、黑金店、服务卡项与加盟介绍 |
| AI中医师 | website-code/ai.html | 辅助体质辨识、现有能力数据、合作资料、报告示例与场景 |
| 联系我们 | website-code/contact.html | 寻艾原有文化大图、4 条错落品牌动态、三列合作图卡与联系意向整理子页 |
| 加盟兼容入口 | website-code/franchise.html | 转入终端服务的加盟介绍或联系页的加盟意向整理 |

## 终端服务子路由

在 `website-code/service.html` 后添加：

- `#/stores/standard`：门店、店型与服务概览
- `#/stores/black-gold`：门店、店型与服务概览
- `#/stores/services`：服务卡项
- `#/stores/standard/detail`：标准店详情
- `#/stores/black-gold/detail`：黑金店详情
- `#/franchise`：加盟介绍，包含标准店、黑金店和意向整理入口

`#locations` 可直接定位门店信息；`#/stores/standard?anchor=types` 可定位店型对比。

## 联系与申请子路由

联系页默认保留文化大图 → 品牌动态 → 三列合作图卡的原设计结构。图卡分别进入加盟 / 产品代理、生产合作、合作与招聘；图卡下方附加信息与重复企业邮箱、地址行已删除，业务渠道保留在统一页脚和意向子页。在 `website-code/contact.html` 后添加：

- `#/about/culture`：文化大图、品牌动态与合作入口，兼容原路由
- `#/about/news`：定位 4 条现有品牌动态
- `#/about/join`：定位加盟 / 产品代理、生产合作、合作与招聘三列图卡
- `#/about/careers`：招聘意向整理，可通过企业邮箱咨询
- `#/about/business`：商务合作意向整理
- `#/about/overseas`：海外合作意向整理
- `#/franchise/apply`：加盟意向整理，店型为标准店 / 黑金店 / 暂不确定
- `#/production/apply`：生产合作意向整理

所有表单均无数据接收服务。填写检查通过后只生成“尚未发送”摘要；复制操作由用户点击触发，邮件入口只打开用户自己的邮件应用，需要用户确认后发送。

四个业务渠道为生产合作 `13476850503 严总`、商务合作 `0755-22664794`、海外业务 `Ijh1@aiaitie.com`（大写 I）、加盟 / 产品销售代理 `4009-315-728`。企业邮箱为 `aat@dongyuanjt.com`。

## 内容文件与维护位置

- `content/products-data.js`：5 款明星产品、燃萃温植简介与 19 款独立产品卡片说明（燃 6、萃 6、温 4、植 3）。
- `content/planting-asset-manifest.js`：种植页面原图与响应式图片映射。
- `content/asset-map.json`：资源对应、体积、像素与文件校验记录。
- `content/product-catalog-assets.json`：20 份新增产品透明 WebP 的来源、裁切边界和无损校验记录。
- `content/home-video.json`：上传首页影片的分辨率、帧率、文件体积及视频码流一致性校验。
- `website-code/product-hero.js`、`website-code/product-hero.css`：从首页移至产品页的三维产品开屏与滚动交互。
- `website-code/products-showcase.js`、`website-code/products-page.js`：系列与详情轮播，连续拖动、阻尼吸附、横向滚轮、键盘与首尾循环。
- `website-code/xunai/brand-figma.js`、`website-code/company-brand.css`：企业业务组件点击展开及原生横向历程；支持拖动、年份平滑定位，历程文字不模糊。
- `website-code/section-cover.js`、`website-code/xunai/content.css`：AI 全宽章节和服务页店型对比的向上覆盖切换；桌面长章节先完整阅读再固定底部，移动端长内容与减少动态效果模式自然滚动。
- `website-code/service-annotation.css`：服务首屏白底黑字，移除影片与合作大图的色彩遮罩。
- `website-code/xunai/about-page.js`：原文化大图与品牌动态版式、三列合作入口、官方渠道及招聘 / 商务 / 海外意向整理。
- `website-code/xunai/franchise-page.js`、`website-code/xunai/franchise-form.js`、`website-code/business-content.js`：加盟介绍及加盟 / 生产合作意向整理。
- `website-code/site-experience.js`、`website-code/site-experience.css`：视频静音自动循环配置与当前通用阅读样式，不生成章节导览或视频播放控件。

首页影片以 `100svh` 和等比裁切方式铺满视口，全站视频静音自动循环、无暂停按钮或进度条。离屏或后台时自动暂停，重新可见后自动续播。桌面布局按 1440 宽度的设计单位随屏幕放大并共用左右边界，移动端保留独立排版。

种植页保留植株形态数据，删除数据说明段落；AI 页删除能力数据下的来源说明和首屏“了解产品”入口，报告界面仍标为示例。缺少可核对检测条件的成分、出绒率范围数值及 AI 92% 准确率继续隐藏。恢复隐藏数值前需补充可核对原始报告、样本、日期、方法与适用范围，不从现有图片或页面标题推导认证范围。

## 当前检查入口

网站完整性：`npm run check`。体验回归：`node website-code/scripts/check-site-experience.mjs`。首页图片轮播：`node website-code/scripts/check-home-motion.mjs`。首屏迁移：`node website-code/scripts/check-hero-migration.mjs`。荣誉与生产合作：`node website-code/scripts/check-honors-cooperation.mjs`。产品资源：`node website-code/scripts/check-product-catalog.mjs`。轮播连续性：`node website-code/scripts/check-product-carousel-motion.mjs`。企业组件：`node website-code/scripts/check-company-interactions.mjs`。叠屏：`node website-code/scripts/check-section-cover.mjs`。

浏览器布局与交互的实际复测范围、当前截图和记录统一位于 `notes/responsive-check`，以该目录的当前记录为准。
