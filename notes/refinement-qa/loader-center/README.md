# 首页开场中心透明 · U-04

最新浏览器注释要求：中间图形不要底色。页面为 `/website-code/index.html`，用户视口698×1080；问题等级P2，已明确授权修复，无额外确认需求。

米白色welcome路径覆盖圆线；下层另有半透明实心图像，直接去掉上层会露出底色和重复Logo。修改仅涉及index.html的路径fill与loader.css的两层旧中心图像透明度。主Logo、五圆/轨道线、全屏米白背景、共享SVG与loader.js均保留。

| CSS视口 | 修改前 | 修改后 |
| --- | --- | --- |
| 390×844 | [before](before-390.png) | [after](after-390.png) |
| 698×1080 | [before](before-698.png) | [after](after-698.png) |
| 1440×900 | [before](before-1440.png) | [after](after-1440.png) |
| 3840×2160 | [before](before-3840.png) | [after](after-3840.png) |

Chrome154 / DPR1。截图取原滚动动画0.55进度；after另检查0、0.8进度，全部center fill=none、旧填充opacity0、五圆与180条轨道线存在、主Logo已加载、横溢出0。退出开场后loader移除、main恢复可用，无脚本错误。结果见[before.json](before.json)、[after.json](after.json)。现有check-honors-cooperation与git diff --check通过。仅复测本组件，不替代全站上线验收。
