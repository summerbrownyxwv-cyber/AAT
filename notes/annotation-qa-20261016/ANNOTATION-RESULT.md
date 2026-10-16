# 2026-10-16 注释修改与空白排查

## 范围与基准

- 唯一工程：AAT；分支 main；修改前提交 `138ab68b00588e317b595a94ca336181accefef4`；恢复标签 `qa-annotations-baseline-20261016`。
- 授权：首页/种植8条、产品15条、服务/AI8条、联系页2条，共33条，以及随后全站翻页空白、多屏幕和上下间距补充。2026-10-16用户进一步明确要求完成后上传GitHub main。
- 修改前视觉证据：对话内用户浏览器注释截图，主要1189×1263、联系页1488×1307及移动菜单截图。没有将这些截屏认定为正确设计。
- 本轮未获取修改后浏览器截图：此前本地浏览器访问被安全策略拒绝，未绕过；使用源码、实际渲染模板、Node输入/动效模拟和几何计算验证。下述“通过”只表示列明检查通过，不等于全部设备视觉验收。

## 注释对应结果

| 范围 | 问题及原因 | 最小修改/涉及文件 | 锁定变化及结果 |
|---|---|---|---|
| 首页1–4 | 指定正文及图片被scroll-hold/parallax持续移动 | index.html、motion.js：公司正文、生长期图文、服务图文、AI图片保持原布局内自然滚动；依赖原hold的内容仍能显示 | 最新注释覆盖这些对象的旧位移动效；不设为viewport fixed，不改素材/裁切/文字；home motion检查通过 |
| 种植5–6 | 侧栏缩略图使用整列剩余空间，温室状态正文随整组消失，窄屏硬编码漏算gap | planting-page.css/js：以实际标题正文和gap计算侧图起点；基地说明跨温室状态保留；温室两张与基地单张同高，主图终态原裁切保留 | 10视口数学、正常/reduced模式通过；非真实字体测量证明 |
| 种植7 | 研发下方两图没有沿左正文起点 | planting-page.css：桌面left 0/30.5%，窄屏0/51% | 原图比例与两图关系保留，检查通过 |
| 种植8 | 品种段滚动占位过长 | planting-page.js：总高从5.6个stage缩至其2/3，composition和hash锚点同一映射 | 原归一化状态顺序保留；检查通过 |
| 产品1 | 3D首屏高屏上下空余和滚动占位过长 | product-hero.css：只从多余空高扣1/3，travel120→80svh，模型已有尺寸限制保留 | 五模型全可达与七尺寸数学检查通过 |
| 产品2 | hover/active灰色描边不符合新注释 | products-page.css/js：移除box-shadow描边，只整体图层轻放大1.025；键盘outline保留 | 图片/框等比共同缩放，不镜像产品；检查通过 |
| 产品3 | sheet min-height强制整视口，timeline每组再等待22%，导致仅部分视口显著空白 | products-page.css、products-catalog-motion.js：stage上限由实际内容最大高决定，取消空等，runway随compact高度计算 | 110ms跟随与向上覆盖保留；长内容先读完；检查通过 |
| 产品4–7 | 未完全贴顶或翻页途中被inert/pointer-events阻断；7槽wrap产生重复/循环 | products-page.js、products-showcase.js、products-catalog-motion.js：实际可见部分可输入，每产品仅一个节点，详情边界0..count-1 | 四组6/6/4/3；详情停止首尾，概览原循环保留；轻扫/反向/键盘/横向滚轮检查通过 |
| 产品8 | 花形页固定满屏与长runway带来大段上下空余 | products-cooperation.css：stage与travel同步缩为原2/3，花形按可用高度约束，居中上下对称 | 标题分开、显线、花形出现、下一章覆盖的顺序与110ms参数保留；数学/状态检查通过 |
| 产品9–15 | 全宽展开行的标签、计数、两条细线及加号位置不符注释 | products-cooperation-services.css/js：summary仅加号、保留aria名称，去行边线，OEM/ODM加号紧随对应正文；窄屏排序正文→加号→图示 | 原生details、16步骤、图示连接线与合作入口保留；检查通过 |
| 服务1 | 原仅两店独立盖屏，且没有统一跟随感 | xunai/stores-page.js、section-cover.js：competence起五个同级面板，避免嵌套sticky；原生滚动叠页加有界110ms短跟随 | 不接管全站滚轮，长内容先读完，边界/reduce清零；九视口模拟通过 |
| 服务2–4 | 标准店图注需删；盖屏min-height整屏比实际图片长 | stores-page.js、service-annotation.css：删除可见图注；自然内容高和统一外间距，保留两店左右构图 | 新注释撤销旧“保留设计参考标注”要求；检查通过 |
| 服务5 | 合作CTA需去图片、黑字 | service.html、service-annotation.css：移除该图片节点，米白底黑字、无text-shadow、自然高度 | 新注释撤销该CTA摄影保留锁；加盟入口保留；检查通过 |
| AI6 | 实际视频在#value；40rem最小高及居中figure使正文/视频错位 | ai-annotation.css、ai.html：#value自然高度、视频与正文顶齐 | poster/autoplay/muted/loop/playsinline保留；检查通过 |
| AI7 | 能力章整屏强制高，设备贴整屏底、文字仅自然高 | ai-annotation.css：自然高度，设备列stretch、右表格align-self:end | 既有1:3列、图像比例、文字内容不改；检查通过 |
| AI8 | 场景章内容结束后被盖屏min-height撑长 | ai-annotation.css：6内容章自然高度、相等且有上限的padding | 原图/裁切/顺序/hero保留；检查通过 |
| 联系1 | 文本↗与图片箭头形状、尺寸、状态不一致 | site-link-arrows.js/css、site-experience.js/css：复用首页既有箭头路径、currentColor和相对尺寸、统一hover/focus；动态路由幂等处理 | 保留链接容器变体，不改轮播左右箭头或流程方向；检查通过 |
| 联系2 | 手机菜单主导航下缺官方服务/投诉UI | site-navigation.js/css：原寻艾同位置两个入口及原生dialog；旧站既有0713-3671098/aat邮箱作为主动联系渠道 | 不新增后台、不发送数据；焦点/锁滚动恢复检查通过 |

## 多页面、部分屏幕空白追查

- 确证：产品固定整屏+额外停留；服务/AI盖屏min-height；AI40rem特例；企业荣誉/行动/介绍及进口普通章节的间距随--wide-u或根rem在4K继续膨胀；首页641–900px种植两列固定440px高而图片仅约249px。
- 修改：company.css/company-brand.css仅普通章节外间距；page-spacing.css仅contact/franchise对应章节；首页仅tablet planting-layout min-height改0；服务、AI、OEM/ODM普通章上下均使用clamp(40px,4.5vw,120px)。没有统一缩字、改图或改全局--u。
- 该比例为移动40px、1189宽约53.5px、1440宽64.8px、4K上限120px；相邻两章各有自己的上下呼吸空间。
- 排除的假阳性：加盟旧turn-panel整屏及六张流程图片旧高度已被后置规则覆盖，不重复改；首页品牌开场、特殊错落与种植滚动叙事不作为普通padding机械压缩。

## 验证与限制

`npm run check`通过：8入口、1170本地引用、19产品和566位图校验。13项专项Node检查通过：home motion、planting annotations、carousel motion、products detail、hero migration、honors/cooperation、section cover、service annotations、AI annotations、site experience、company interactions、shared arrows、annotation controls。另修改JS语法及git diff格式检查通过。

尺寸覆盖为各检查脚本的不同子集，不能写成每页面×全部视口真实跑过。合并包含320×640、360×800、390×844、430×932、768×1024、900/901边界、1024×768、1189×1263、1440×900、1488×1307、1920×560/1080、2560×1440、3840×2160。DPR、实体触屏、Safari、真实字体/异步媒体加载、缩放和像素视觉回归本轮尚未实测。

种植超宽短高视口中旧land stage上移会使先读文字随自然进程离屏；本轮未重设计该主图轨迹，1920×560应人工重点复核。不能宣称所有设备视觉缺陷已消除。历史性能审查仍未完成，本提交不代表Lighthouse或Web Vitals目标达成。

构建与上传结果以本轮最终终端记录、Git提交和远端SHA为准。原修改前证据不覆盖，原媒体及资源映射校验未改。

最终构建记录：`npm run build`通过；对website-code/dist再次运行check-package通过；所有本轮修改和新增运行模块与dist对应副本逐字节一致。构建产生的许可证换行差异已仅恢复该生成副本，未修改原字体授权文本。

## 上传前第34条新增注释

首页AI图片与表底部对齐：原.ai-image align-self:start和110u底margin使图像底边明显高于表格。仅改同一grid-row的image为align-self:end、margin-bottom:0；.ai-stats本来就是align-self:end。原图宽88%、裁切和移动单列顺序不改。home-motion新增这一布局约束检查通过；本条与此前33条一起上传，仍未获得浏览器截图验收。

上传前第35条新增注释：997×876菜单官方服务/投诉按钮去米白填充，background透明，文字/边框/触点及原生弹窗保留。源码与dist同字节更新；此单一色面删除不改变布局。

## 上传中第36–37条新增注释

企业正文区块向上覆盖：company.js复用section-cover（110ms短跟随），将两个brand包装设display:contents，使intro、导入章节、荣誉和行动共享main边界。每章保持自然内容高，原内侧边界不变，用背景伪元素全宽遮盖，无runway或全屏min-height；原点击商业组件和横向时间线保留。种植页脚原被显式放入coverChapters，现从该列表移除；其他共享cover均只选择main内容，页脚不参与盖屏。

## 上传中第38–40条新增注释

997×876/917进一步反馈侧图、品种留白、页脚：土地侧图改为明确3行/2行并按3:2预留，image min-height:0，stage至少容纳实测文字和整组侧图，避免剩余空间算法把图片压成横条及轨道溢出。品种桌面scene加入局部内容高度上限，标题/list的上下空间收敛，成分进度仍按相同归一状态映射。页脚虽已从cover列表移除，main原display:contents使最后sticky没有正文盒边界，仍能盖住页脚；main恢复block作为约束边界，页脚自然出现。planting Node检查扩至12视口（加入997×876/917）并验证3:2预留、无重叠/容纳边界；仍无浏览器修改后截图。

## 产品卡屏的后续更正

用户997×876截图显示切换中途产品下半被固定舞台裁断。仅缩短舞台仍保留overflow:clip与人工runway，不能彻底修复；本次将目录接入服务/企业同一自然高度cover，保留110ms跟随，移除合成舞台与内部位移。九视口Node检查覆盖hash目标、长章读取与cleanup；共享cover的正反向/边界/reduce检查仍通过。此实现替代前文产品3的compact舞台方案。

附带交付一致性更正：最终对dist运行资源校验发现OPPO-LICENSE.txt的Git文本换行规范化改变了manifest要求的3304原始字节。精确两路径使用-text保留源许可字节，未更改许可内容或资源校验规则。source/dist的许可字节及hash现都通过；不再恢复为旧的LF生成副本。
