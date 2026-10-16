# 媒体与字体性能审计及待确认方案

本文件是本轮只读诊断。没有压缩、替换、解码全片或修改视频、字体、校验清单及播放代码。原始测量见 `data/media-audit.json`；采集日期 2026-10-15。所有 MB 均为十进制；资源总量不等于页面首屏传输量。

## 1. 已核实的资源状态

共 7 个 MP4，328,306,589 B（328.31 MB），未发现 WebM。全部 H.264 High、4:2:0、MP4，所有文件 `moov` 均在 `mdat` 前，已经 faststart。再次做 faststart 没有新增的流式加载收益。

| 视频 / 路由 | 字节 | 视频分辨率 / 帧率 | 视频时长 / 容器时长（秒） | 视频平均码率 | 音轨 |
| --- | ---: | --- | --- | ---: | --- |
| `assets/planting/planting-hero.mp4` / planting 首屏 | 91,317,434 | 1920×1080 / 30 | 291.766667 / 291.767 | 2.501 Mbps | 无 |
| `assets/xunai/ai/ai-demo.mp4` / ai #value | 89,964,461 | 1920×1080 / 30000/1001 | 518.985133 / 518.986 | 1.384 Mbps | 无 |
| `assets/planting/qiyou-one.mp4` / planting 品种介绍 | 64,487,852 | 1920×1080 / 25 | 128.48 / 128.575 | 3.883 Mbps | AAC LC、48kHz双声道，2,055,258 B 样本 |
| `assets/xunai/stores/黑金店体验流程.mp4` / service 首屏 | 41,704,236 | 2730×1440 / 30 | 53.066667 / 53.067 | 6.284 Mbps | 无 |
| `assets/homepage/home-hero.mp4` / index 品牌首屏 | 17,516,809 | 1920×1080 / 25 | 24.52 / 24.52 | 5.712 Mbps | 无 |
| `assets/company/company-hero.mp4` / company 首屏 | 16,128,344 | 1920×1080 / 25 | 52.48 / 52.48 | 2.456 Mbps | 无 |
| `assets/products/products-film.mp4` / products 品牌介绍 | 7,187,453 | 1920×1080 / 25 | 35.16 / 35.20 | 1.628 Mbps | AAC LC、48kHz双声道，14,876 B 样本 |

码率来自 MP4 sample bytes / track duration，容器还含索引等开销；不是简单按文件体积推算的编码参数。JSON 另保存原始 ffmpeg probe 文本、SHA256、MP4 track duration、frame count、timescale、keyframe间隔和原子偏移。

重点视频 `planting-hero.mp4` 的 SHA256 为 `5be5dc0c8635f1f42b097ffa35fcd5006e7dbac5c31bef214912624ca513dbdf`，与 `content/planting-video.json` 一致。它已经是此前为满足100MB目标产生的有损版本，1080p30、8753帧，原记录已明确植物细节变软。本轮不能再把它当作未经压缩的母版，也不能声称进一步编码会无损。A-22设计锁及本轮高风险边界要求先给候选方案、再经用户确认。

### 工具与局限

PATH 无 ffprobe/ffmpeg；已有 `imageio_ffmpeg` 附带本地 ffmpeg 7.1，未安装或下载新工具。只执行 `ffmpeg -i` 读取头信息；精确 sample/timing/faststart 来自 Python 标准库 ISO-BMFF 只读解析。未进行全片解码、SSIM、VMAF或画质抽检，本报告不作新的视觉等效结论。

## 2. 加载方式与真实请求证据

- 七个视频都有 poster、autoplay、muted、loop、playsinline；`site-experience.js:3–12`再次确保属性并禁用控件。不要恢复暂停UI。
- 首页、种植、企业和服务首屏为 `preload="metadata"`；种植品种介绍和产品介绍也为metadata；AI演示为 `preload="none"`。
- `content-motion.js:76–86`按IntersectionObserver/页面可见性暂停或继续播放；company用 `company.js:67–79` 独立实现。它们是解码/播放资源保护，没有移除source，**不能等同于阻止离屏媒体下载**。
- 浏览器诊断在1440×900、新鲜独立context执行，故意阻断MP4/WebM以隔离字体成本。index视频在文档y≈1395、AI演示在y≈1165时已经发起MP4请求（请求被诊断工具阻断）。AI虽为preload=none仍有请求，说明autoplay/已有src使其不能依靠preload属性达到真正延迟加载。这些数据只证明尝试发请求，**不证明原状实际下载了整片**。实际传输与播放数据应以主审的未阻断基准为准。
- 所有7个文件的本地 `Range: bytes=0-1023` 请求均为206、返回1024字节，`Accept-Ranges: bytes`、`Content-Range`正确。本地serve.mjs没有生产缓存头；这不是Vercel线上响应头结论，正式域名未提供时不能虚构线上验证。
- 当前无画质/分辨率/DPR自适应的视频源选择；这保留了已确认清晰度，不能为了移动端数字好看直接降分辨率或帧率。

## 3. 字体：一个可验证的低视觉风险瓶颈

| 字体 | 每份WOFF2体积 | SHA256（两目录相同） | 原sfnt尺寸（WOFF2头） |
| --- | ---: | --- | ---: |
| OPPO Sans | 13,645,776 B | `8d409dfff2a584a1e9c7d3022ef35887abe13510566fa19d776e475fc0a72c31` | 22,741,072 B |
| Tsukushi Mincho R | 2,254,280 B | `a0703fedb2f3e22439fe584d12d68ce9532b6549943f912af0496872f20630d2` | 4,824,724 B |
| Crimson Regular | 43,084 B | `126d2796c0ef94085dcd0cad414016bc99c6d19505b5937beb12d6ddb3c8b266` | 107,128 B |

`assets/fonts/`和`assets/xunai/fonts/`逐文件字节相同，6文件合计31,886,280 B，独有内容15,943,140 B。sfnt尺寸仅为解压后的字体文件尺寸，**不是浏览器实际内存实测**。

7个正文HTML都preload `assets/fonts/{oppo-sans,tsukushi-mincho-r}.woff2`，分别13.65MB与2.25MB。基础CSS声明同名family；`xunai/content.css:232–234`再次声明同family/weight，URL改为 `assets/xunai/fonts/`。字体全部font-display:swap；OPPO 100–700、Mincho400、Crimson400。没有CSS unicode-range，也未执行字形子集化。

1440×900、DPR1、Chrome154.0.8037.99、独立冷context诊断实测：

| 页面 | WOFF2请求URL数 | encodedBodySize合计 | 观察 |
| --- | ---: | ---: | --- |
| index | 2 | 15,900,056 B | 仅assets/fonts |
| service | 4 | 31,800,112 B | 同时请求两目录的OPPO与Mincho |
| ai | 4 | 31,800,112 B | 同上 |
| contact | 4 | 31,800,112 B | 同上 |

证据是 `media-audit.json.browserFontDiagnostic` 的实际Response与ResourceTiming。此字体隔离实验未限速、阻断视频，不作为整页LCP/流量基准。Crimson未在这四页初始状态发请求，不应为了“统一”新增其preload。

**低风险方案 F-01**：仅把xunai/content.css三条@font-face的src统一为 `../../assets/fonts/` 原字节相同文件。保留family、weight、display、所有字号/排版和原字体文件；既有HTML预载命中同一URL，减少这三类内页每次冷缓存最多15,900,056 B重复字体内容传输，同时跨页复用同一缓存键。需要主审在完成系统审计后执行并做六尺寸截图、实际字体请求、字形/换行及check/build回归。源目录重复文件不删除，生产产物排除需资源引用闭包和构建检查确认。

### 授权与子集风险

- `assets/fonts/OPPO-LICENSE.txt`明确要求保留版权及许可，并在§2(2)写明不得修改字体或其组件。当前任务不应自动对子集化、轮廓压缩、重编码或字重裁剪开绿灯。原文件WOFF2本身已经是压缩格式。
- 仓库中未找到Tsukushi Mincho或Crimson的独立许可档案。这个事实不能证明权利缺失，也不能证明允许Web嵌入、子集化或再分发；交由权利资料核对。
- 字体未来子集方案还需覆盖所有静态/动态文案、表单输入、接口字符、数字及标点、未来内容和语言，防止回退字体造成换行/高度变化。本轮不做子集候选。

## 4. 优化方案及确认边界

| ID / 优先级 | 方案 | 收益依据 | 视觉/行为风险 | 本轮处置 |
| --- | --- | --- | --- | --- |
| F-01 / P1 | 字节相同字体统一URL | 已实测三类页面重复加载15.90MB | 低；仍需字体/换行回归，不能只改预载地址留下双URL | 可由主审审计后局部实施；本子任务未修改 |
| V-01 / P1待确认 | 下屏视频poster先显示，source在接近视口时赋值 | 已见离屏视频尝试请求，实际下载由主基准量化 | 可能出现快滚/慢网首帧延迟，也涉及source/时序行为 | 先提交root与用户；不因preload=none就认为已实现，不改首屏自动播放 |
| V-02 / P2待确认 | qiyou-one可评估仅remux移除静音AAC音轨 | 音频样本2.055MB，约3.19%文件 | 视频packet可不重编码，但容器总时长比视频长≈95ms，loop边界可能变化；且更新hash/清单 | 不自动执行；要确认音轨可删和容器时长策略，收益有限 |
| V-03 / P2不建议 | products-film移除14.9KB静音音轨 | 仅约0.21% | 容器与视频时长差40ms、需改校验；收益很小 | 保留，避免无收益媒体变更 |
| V-04 / 待确认 | 视频H.264慢预设、相同尺寸帧率的CRF候选，或AV1/HEVC备选+现MP4 fallback | 当前码率与内容各异，不能预先保证收益 | 涉及颜色/纹理/运动质量、兼容性、首帧时机及资源校验 | 不编码/替换；需用户先确认候选方案，再逐片测试 |
| V-05 / 无需做 | faststart、重复“压缩”MP4容器 | 全部已有moov前置 | 重写无明确首帧收益；可能破坏可追溯性 | 保持 |
| F-02 / 暂缓 | 字体子集化 | OPPO确实大，但许可/动态覆盖未满足 | 授权、字符缺失、字体回退/布局差异 | 不实施、不猜授权 |

视频候选如获确认，应从可恢复的原字节创建单独候选，不覆盖先前文件；固定相同首帧、运动、明暗、叶片/纹理、渐变、特写帧进行原尺寸及4K显示对比。保持帧数、帧率、时长、构图、BT.709解释和轨道timestamp；用SSIM/VMAF辅助但不能替代人工核对。达不到视觉等效就保留当前文件。planting-hero现版本已经历有损压缩，优先交付/带宽优化而非第二代有损压缩。

## 5. 回滚与验证

本子任务不变更资产和运行源码，无需资源回滚。F-01若主审实施，单个CSS src变更可从性能基准提交恢复；两套源字体仍保留。涉及V-01或媒体候选需用户批准后限定单区域、分别验证，不能与字体URL优化捆绑。

性能复测应使用主审同一网络/设备/缓存条件，比较请求URL、encodedBodySize/实际receivedBytes、LCP/FCP/CLS，另实测自然自动播放、循环、可见性暂停及返回恢复。桌面/移动/4K关键帧不能因优化更改。现JSON的字体诊断和本地Range测试不能替代全站性能验收、真实用户INP、Safari或生产Vercel响应头。
