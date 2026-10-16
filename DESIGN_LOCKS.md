# 设计冻结清单

日期：2026-10-15（Asia/Shanghai）  
阶段：延续 Phase 01 审查；仅最新三项已明确授权进入局部修复，其他问题仍待确认。  
原审查基准：`48886fa39b059a88e01bc75ab99dba7acc935db8`；本次修复前检查点：`b5c0b6c606868954653ec70ff654eec8ea847cd2`。  
当前 QA 分支：`qa/refinements-20261015`；原审查分支保留为历史证据。  
唯一维护根目录：`/Users/dabao/Desktop/艾艾贴官网-首页交付/AAT`

## 适用边界

当前艾艾贴网站是设计基准；寻艾旧工程只供字体比例、响应式逻辑和技术参考。这里的 A 类表示有明确的用户保留要求，并不表示现有实现已经无缺陷。修改前截图是事实基准，不是正确性证明。

锁定按页面、区块、组件和行为生效，不锁死整个文件。必要的无关技术修复可以提出，但必须说明共享影响并按已批准的问题实施。不得因为一个组件有锁定记录而阻止资源路径、语义、状态释放等必要技术修复；同样不得借技术修复改动摄影、文案、构图和品牌色。

## A：当前已确认或明确要求保留

| ID | 页面 / 精确范围 | 锁定的设计或行为 | 源码证据（基准提交） | 允许提案的边界 |
| --- | --- | --- | --- | --- |
| A-01 | 全站现有摄影、Logo、SVG、产品图片和文案 | 保留现有素材、主要版式、视觉节奏、颜色及有意差异；不重新生成页面 | 本轮最高优先级约束 1–6；README.md:3、content/asset-map.json、content/product-catalog-assets.json | 只定位真实错误，不能用“统一”替换已确认素材或内容 |
| A-02 | 全站导航 / 页脚 / 左右阅读边界 | 保留现有共享导航和四业务渠道、企业邮箱、地址；不加章节导览 | website-code/site-navigation.js:1–42；website-code/index.html:154–169；website-code/site-foundations.css:5 | 导航功能、聚焦、回退恢复、局部溢出可提案；不重新编排导航视觉 |
| A-03 | 全站字体气质 | 保留 OPPO Sans 正文、筑紫明朝展示标题及既有字体角色；Crimson 的现有特殊用途单独记录 | website-code/styles.css:1–4；website-code/site-foundations.css:2–5；README.md:3 | 统计实际比例，先说明语义例外；不全局替换 font-family 或字号 |
| A-04 | 首页 #hero-story | 现有上传品牌视频，完整铺满可视屏幕，保持比例裁切；原三维展示留在产品页 | website-code/index.html:63–65；website-code/styles.css:292–300；content/home-video.json | 可检查首帧、LCP、移动端裁切和视口单位，不换视频或构图 |
| A-05 | 全站 video | 静音、自动循环、内联播放；不显示暂停/进度条/原生控件；离屏暂停是资源管理 | website-code/site-experience.js:3–12；README.md:25 | 播放失败反馈、生命周期、减少动态效果需单独报告；不得自行增加可见控件 |
| A-06 | 首页 loading / 产品 #manufacturing 花形 | 共用五圆几何，圆线闭合、中心透明、没有图形文字及鼠标形滚动提示；生产合作标题先居中，再分开、显线、出现花形，再向上覆盖下一屏；由滚动驱动 | website-code/loader.css:10–62；website-code/products-cooperation.js:6–17；website-code/products-cooperation.css:1–100 | 仅修错位、断线、状态不连续；保留动效顺序与文字去除决定 |
| A-07 | 自研产品 #products-hero | 保留迁入的五款三维产品及滚动逻辑；标题“从蕲春艾草，到日常养护”，不恢复已删说明 | website-code/product-hero.js:6–29、54–69 | 检查模型加载、点击定位及响应式；不换三维素材与布局 |
| A-08 | 产品系列 / 详情 | 燃、萃、温、植；6 / 6 / 4 / 3 共19款；图居左、文居右，框向左延伸，产品不镜像；同组件居中等比展示 | content/products-data.js:110–255；website-code/products-page.js:13–24；website-code/products-page.css | 图片裁切、显示尺寸、文字溢出可局部提案；不重写产品说明或变更分类 |
| A-09 | 产品系列 / 详情输入 | 连续拖动、快速反向可中断、阻尼释放、首尾循环；键盘、横向滚轮和相邻图点击；删除可见“左右滑动”提示及计数控件 | website-code/products-showcase.js；website-code/products-page.js:30–83 | 保留横滑交互类型；可修连续性和键盘状态，不恢复已删视觉控件 |
| A-10 | 产品 #product-catalog | 燃至植在本区内向上覆盖翻页；不随每张内屏拖动整页；不恢复顶部灰细线 | website-code/products-catalog-motion.js；website-code/products-page.css | 只修盖屏遮挡、边界和触屏回退 |
| A-11 | 产品代工服务 | 白色底；OEM/ODM 图示化，当前折叠式信息节奏；合作入口通往生产合作意向；不恢复已删独立步骤解释与旧“合作申请”屏 | website-code/products-cooperation-services.js；website-code/products-cooperation-services.css；website-code/products-process-icons.js:3 | 线段对齐、流程可读性、折叠状态和链接可提案；不要再整屏重设计 |
| A-12 | 企业 #business | 新商业范式保留横向文字；点击/Enter/Space展开，再次操作收起；悬停不切换内容 | website-code/company-brand.css:56–87；website-code/xunai/brand-figma.js:25–62 | 保留轻微图片 hover 反馈和“内容不由 hover 切换”的区别；技术状态修复限本组件 |
| A-13 | 企业 #history | 文字清晰不模糊；原生横向滚动、拖动、年份平滑定位；年份同步；时间点与连线对齐 | website-code/company-brand.css:20–38；website-code/xunai/brand-figma.js:64–117 | 允许报告惯性、焦点、收尾和对齐缺陷；不能改成自动播放或重新设计时间线 |
| A-14 | 企业 #intro / #honors | 标题“让蕲春艾草，抵达更多健康生活”；荣誉按所选内容自然高度 | website-code/company.html:44；website-code/company-honors.css:1–7 | 不恢复旧词；修异常空白需先定位内容高度及展开状态 |
| A-15 | 服务 .xs-hero | 视频保留原素材，文字区白底黑字，移除视频色彩遮罩 | website-code/service-annotation.css:3–13；website-code/xunai/stores-page.js:166 | 早期 #965F36 要求已被后来的白底黑字明确替代；不得回改棕色 |
| A-16 | 服务 #service-cooperation .xf-cta | 保留现摄影，移除色彩遮罩；现有文字可读性只作为局部审查对象 | website-code/service-annotation.css:6–18；website-code/service.html:35 | 若对比度不足先提出局部方案，不能自动恢复整图色彩遮罩 |
| A-17 | 服务 #types | 黑金店、标准店两种店型，区块内向上覆盖；保留各自摄影及标准店设计参考标注 | website-code/xunai/stores-page.js:160、170；website-code/section-cover.js | 保留盖屏类型；长内容、移动端自然滚动降级可评审 |
| A-18 | AI 各章节 | 保留现版式与图像；删除区块顶细线，采用向上覆盖；长章节先完整可读；背景全宽，反向滚动恢复 | website-code/xunai/ai-page.js:37–43；website-code/xunai/content.css:2548–2577；website-code/section-cover.js | 不允许再次出现已报告的叠屏大bug；保留原顺序、技术辅助定位，不能重设整页 |
| A-19 | AI 指定已删项 / 图像 | 不恢复章节导览、首屏“了解产品”、能力数据来源说明；合作机构图像保留透明效果；报告仍标为示例 | website-code/xunai/ai-page.js:10–30；README.md:30 | 不从截图推导认证范围，不补写未经核对的准确率 |
| A-20 | 联系页 #/about/culture/news/join | 保留旧寻艾文化大图、四条错落动态、三列合作大图；三个入口为加盟/产品代理、生产合作、合作与招聘；不恢复图卡下重复信息行 | website-code/xunai/about-page.js:1、21–26；website-code/xunai/content.css:2378–2402 | 合作入口路由和表单反馈可修，不能重新排为通用等宽内容卡 |
| A-21 | 联系 / 加盟 / 生产合作意向表单 | 当前仅本地整理，无后台；结果明确“尚未发送”；复制、电话、邮件由用户主动操作；不得伪造提交成功 | website-code/xunai/about-page.js:19、29–57；website-code/xunai/franchise-form.js:1–112；business-content.js:8–20 | 接后台需人工决定接收渠道和处理方式；本轮不连接、不测试发送 |
| A-22 | 种植首屏视频 | 当前 planting-hero.mp4 覆盖文件，小于100MB；保留1080p/30fps及完整时长；压缩结果属于有损，不再声称无损 | content/planting-video.json；notes/资源整理说明.md:11 | 不再次压缩或换视频；可记录加载、首帧与网络性能 |
| A-23 | 站点交付组织 | 只维护 AAT；assets/content/notes/website-code 四大类；不创建旧版本/原图备份 | README.md:5–12；本轮任务要求独立Git检查点 | 本次Git检查点属于用户新授权，不复制旧站包；审查产物位于 notes |

## B：授权修复与待确认提案

2026-10-15 最新三项授权优先于原 Phase 01 限制：

| ID | 已授权问题 | 限定范围与回归保护 |
| --- | --- | --- |
| U-01 | 全部视频自动循环；视频与轮播不显示暂停按钮 | 仅播放属性、暂停 UI 及轮播控制状态；保留静音/内联、减少动态、离屏/后台保护，不修改影片素材 |
| U-02 | 全站 UI 褐色/绿色改白色/米白色 | 褐色 #955F36 → #FFFFFF，绿色 #6F712B → #FBF4E3；必要文字/图标对比度配套；保留 #231815 中性深色和媒体/Logo/包装原色，不改变构图 |
| U-03 | 产品滑动最低成本触发 | 调整共享输入判定的轻拖/轻扫门槛与释放连续性；保留产品6/6/4/3、左图右文、首尾循环和局部盖屏，不恢复已删提示控件 |
| U-04 | 首页loading中间不带底色（后续最新浏览器注释） | 仅去掉中心填充和重复的下层Logo；保留全屏米白背景、单个主Logo、圆线/轨道与原滚动动画。已实施及四尺寸验证见DESIGN_DECISIONS.md的U-04 |

以下仍仅形成问题清单，尚无实施授权：

1. 各指定CSS视口的真实错位、非预期横向滚动、溢出、遮挡、异常空容器与断点回归。
2. 同语义组件状态缺失、键盘与触屏不可操作、导航焦点和返回状态缺失。
3. 现有动效的闪烁、突然停止、快速操作冲突、生命周期或性能缺陷。
4. 上线完整性缺口：metadata、分享信息、404、真实表单接收预期、品牌信息、资源失败反馈。
5. 文件与源码说明不一致、来源信息缺失：先给证据，再由用户确认处理。

每项实施前必须记录问题、页面/视口、预计文件、共享影响、锁定影响；批准后小范围修复，比较前后图和其他断点。不得批量改字、间距、section高度和动效参数。

## C：冲突 / 待确认（当前实现全部保留）

| ID | 证据与冲突 | 暂定处置 / 需要确认 |
| --- | --- | --- |
| C-01 | 历史要求“大屏随屏幕等比例放大”；styles.css:4、303 / site-foundations.css:5、98 / README“桌面按1440等比例放大”。本轮明确“4K不得无条件放大所有文字和图片”。 | 记录现值和4K截图；请确认需要保留比例的特殊构图区块，及正文/导航是否可采用有上限的流体尺度。确认前不改全局 --u、--wide-u、html font-size。 |
| C-02 | README 声称“未配置的…查询、举报…入口暂不展示”；stores-page.js:169 仍mount store-tools.js:5、25的门店查询与投诉预览，投诉明确“接收渠道待补充”。 | 门店查询可用，不能与投诉混为一谈。请确认投诉预览保留并标示、隐藏入口，还是接入正式接收；本轮不删除。 |
| C-03 | 7正文页没有canonical/OG/Twitter分享信息，无sitemap/robots；现有对外品牌链接使用aiaitie.com，但没有本轮确认的最终发布域名与分享图。 | 确认正式域名、公开路径、分享图和索引策略后再实施，不猜域名。 |
| C-04 | 只有OPPO和Three的独立license文件；筑紫明朝/Crimson未找到独立授权说明；源码不能证明权利缺失或合规。 | 请提供/核对已有字体及摄影授权档案与Web嵌入范围；保留字体，不能自动换字体“解决”。 |
| C-05 | 当前无备案/隐私政策展示或文件；意向表单本地整理不上传。正式部署地区和未来后台尚未明确。 | 内容负责人按实际部署、数据处理与资质提供应展示信息；不把“文件缺失”直接断言为违法。 |
| C-06 | site-foundations.css:1要求从homepage源规则同步；现首页与基础文件的heading/body/caption token有差异。页面特殊差异可能是有意设计。 | 字体审查先按语义角色及构图记录，不直接运行同步工具覆盖差异。 |
| C-07 | xunai/responsive-images.js:1称“historical entries are archived in notes”，当前notes中没有明确对应archive目录。 | 仅标注证据不足，不删除旧注释；由资源维护人说明是否为过时迁移说明。 |

## 变更与回归门禁

1. 已授权实施 U-01/U-02/U-03及后续注释U-04；其他第二轮修复须从用户已确认的问题 ID 开始，只改该 ID 涉及范围。
2. shared样式改变必须复查7正文入口、移动与桌面；局部样式复查同组件全部使用页及相邻断点。
3. 固定截图基准不覆盖；修复后的截图单独命名并由人工审阅，不能更新基准掩盖差异。
4. 锁定区有非授权明显差异时，暂停相关改动并报告；不回退用户或其他协作者的改动。
5. 每条已确认方案及复测结论追加到 DESIGN_DECISIONS.md；撤销须用户明确表达。
6. 源码引用标记对应本轮基准，后续行号变化需重新定位，不能把这些行号当自动化代码锁。

## 最新覆盖说明

本轮“褐色/绿色 UI 改白色/米白色”是用户对早期色彩保留锁的明确局部撤销；“轮播不要暂停键”撤销旧动效报告中图片轮播暂停/继续 UI 的保留结论。此撤销不扩展到摄影素材、产品包装、Logo、中性正文颜色、字号与章节比例。图形的结构与动效顺序继续锁定。A-01/A-05/A-09 与最新 U-01/U-02/U-03 不一致的原文，以最新三项为准。

## 本次实施后的核对范围

U-01/U-02/U-03已限定实施。42before+42after、242布局数据、16交互记录、14媒体/DPR记录和八项代码检查见05报告与notes/refinement-qa/data。42组x/w/h无>1px变化，9条y差异仍是动态进度未完全对齐的限制；不据此宣布全部锁定设计像素一致或用户重新视觉确认。未修改素材/文案/字体、全局字号/间距/章节高度、弹簧参数或滚动模型。原审查未完成和C类待确认状态保持。
