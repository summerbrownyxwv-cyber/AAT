import { mountSectionCover } from '../section-cover.js';

/* Figma 5:3; shared shell and brand fonts are retained. */
window.XunAiStores=(()=>{
 let resizeServices=()=>{};
 const wide=matchMedia('(min-width:1920px)'),ultra=matchMedia('(min-width:2560px)');
 wide.addEventListener('change',()=>resizeServices());ultra.addEventListener('change',()=>resizeServices());
 const base='../assets/xunai/stores/';
 const image=(file,alt,extra='')=>`<img src="${base}${file}.webp" alt="${alt}" width="1440" height="960" ${extra||'loading="lazy"'}>`;
 const arrow=()=>`<img src="${base}imgArrowNarrowUpRight.svg" width="20" height="20" alt="">`;
 const media=(file,alt)=>window.XunAiDesign.responsiveMarkup(`<img src="../assets/xunai/stores/${file}.webp" alt="${alt}" loading="lazy" width="900" height="1200">`);
 const strengths=[['自研项目','独创五行配方<br>双效灸膏+黄金艾绒','comp-imgRectangle2'],['科技赋能','AI中医检测系统','comp-imgImg62611'],['独家研发','融合蕲春艾灸古法技艺','comp-imgRectangle3'],['艾灸空间','以现代人的审美需求建立','comp-imgRectangle5']];
 const strengthCard=(i,large=false)=>`<button type="button" class="xs-strength ${large?'is-large':''}" data-strength="${i}" aria-label="${large?'当前展示':'放大查看'}${strengths[i][0]}"><span class="xs-strength-photo">${media(strengths[i][2],strengths[i][0])}</span><span class="xs-strength-caption"><strong>${strengths[i][0]}</strong><span>${strengths[i][1]}</span></span></button>`;
 const competence=()=>`<section class="xs-section xs-competence">${heading('寻艾竞争力','四大核心领先 × 一站式解决方案<br>打造可持续的新中式艾草养生生活方式')}<div class="xs-strength-layout"><div class="xs-strength-thumbs">${[0,1,2].map(i=>strengthCard(i)).join('')}</div><div class="xs-strength-feature" aria-live="polite">${strengthCard(3,true)}<p>打破传统的空间体验，对艾灸文化进行重新演绎。在都市语境中重构传统艾灸的疗愈智慧，以现代人的审美需求建立有温度的艾灸空间。</p></div></div></section>`;
 const booklet=standard=>{
  const type=standard?'标准店':'黑金店',prefix=standard?'standard':'black-gold';
  const photo=(file,label)=>`<img src="../assets/xunai/booklets/${['tea-upright','standard-sign','ai-blue','ai-room-rotated'].includes(file)?file+'.webp':(label.startsWith('AI中医师')?'black-gold':prefix)+'-img'+file+'.webp'}" alt="${type}${label}" loading="${file==='Rectangle1'?'eager':'lazy'}" width="900" height="1200">`;
  const productLink=(content,label)=>`<a class="xs-product-link" href="https://www.aiaitie.com/" target="_blank" rel="noopener noreferrer" aria-label="${label}（前往艾艾贴官网，新窗口打开）">${content}</a>`;
  const stories=standard?[['标准化建店','Rectangle8','standard-sign','Rectangle5'],['AI中医师','I9A42','ai-blue','ai-room-rotated']]:[['茶室','tea-upright','Rectangle11','tea-upright'],['AI中医师','I9A42','ai-blue','ai-room-rotated']];
  return `<header class="xs-booklet-heading"><h1>寻艾艾灸馆 · ${type}</h1><a class="route-link" href="#/stores/${prefix}">返回店型概览</a></header>
  <div class="xs-booklet-lead"><figure>${photo('Rectangle1','空间')}</figure><div class="xs-booklet-lead-copy"><div><h2>${type}空间</h2><p>了解门店空间与产品展示，合作细节可通过官方渠道咨询。</p><a class="xu-detail-link route-link" href="#/franchise/apply">整理加盟意向<span aria-hidden="true">↗</span></a></div></div></div>
  <section class="xs-booklet-products"><h2>自研产品</h2><div>${(standard?[9,10,15,16]:[9,10,12,15]).map((n,i)=>productLink(photo('Rectangle'+n,'自研产品展示'+(i+1)),'查看产品详情')).join('')}</div><p class="xs-products-more">${productLink('查看所有 '+arrow(),'查看所有产品')}</p></section>
  ${stories.map(([title,square,strip,large],i)=>`<section class="xs-booklet-story ${(standard?i===0:i===1)?'is-reverse':''}"><div class="xs-booklet-story-copy"><div class="xs-booklet-square">${photo(square,title+'细节')}</div><h2>${title}</h2>${!standard&&i===0?'<p>商业会晤</p>':''}<p class="xs-pending">${i===1?'以科技赋能提效，让传统成为可进化的智慧':standard?'总部整店输出，模式一键复制。':'一席茶，一方静境。'}</p><div class="xs-booklet-strip">${photo(strip,title+'展示')}</div><p class="xs-pending">${i===1?'寻艾·智能AI中医师随时为您检测':standard?'遵循品牌空间规范，呈现一致的视觉体验与服务品质。':'茶室融合东方茶文化与现代生活美学，为宾客提供品茗、交流与休憩的私享空间，让身心在一盏清茶之间回归平和。'}</p></div><figure>${photo(large,title+'空间')}</figure></section>`).join('')}
  <section class="xs-booklet-ending ${standard?'is-reverse':''}"><div>${photo('Rectangle7',standard?'产品展示':'产品陈列')}<h2>${standard?'品牌空间规范':'产品陈列'}</h2></div><figure>${photo('Rectangle14',standard?'门店荣誉展示':'产品陈列空间')}</figure></section>`;
 };
 const services=[['随心·颈/腰/关节灸','通络'],['自在·古法罐灸','调和'],['深调·古法蕴体灸','固本'],['乳腺养护灸','散郁'],['轻养·头部放松灸','解压'],['成人艾草精华泡浴','暖透'],['全息刮痧·肩/腰','放松'],['坐灸·泡脚','循环'],['古法·肩颈舒缓灸','舒筋'],['草本舒缓·关节','轻盈']];
 const nav=page=>`<nav class="xs-nav" aria-label="店型与服务"><div><span>店型</span><div><a class="route-link" href="#/stores/black-gold/detail" ${page==='/stores/black-gold'?'aria-current="page"':''}>黑金店</a><a class="route-link" href="#/stores/standard/detail" ${page==='/stores/standard'?'aria-current="page"':''}>标准店</a></div></div><a class="route-link" href="#/stores/services" ${page==='/stores/services'?'aria-current="page"':''}>服务卡项</a></nav>`;
 const serviceInfo=[
 ['王牌项目','三选一',['肩颈舒缓：找回精神头','腰部舒健：助腰部恢复轻松温暖好状态','关节养护：关节健康，“行动力”才能加倍'],['智能经络仪通络','三年陈艾小罐灸','艾灸器施灸'],50,'198','1680'],
 ['王牌项目','暖 / 润',['古法罐灸·暖：脏腑调理，暖护内在运化，守护代谢平衡','古法罐灸·润：润泽内火，呵护内在清爽小世界'],['手法放松','智能经络仪通络','黄金艾绒罐灸'],60,'298','2680'],
 ['明星项目','暖 / 润',['古法蕴体灸·暖：补充阳气，找回平衡','古法蕴体灸·润：安抚烦躁、上火，呵护上下肢循环'],['高倍浓缩艾草精华泡浴液','手法放松','智能经络仪通络','黄金艾绒温灸','封穴醒汗','头部放松'],80,'368','3380'],
 ['女性项目','',['女性特调方案，疏解压力，不让心里的“千千结”陪你过夜'],['背部手法放松','背部经络疏通','乳腺经络疏通','古法艾灸箱艾灸'],60,'298','2380'],
 ['服务项目','',['1秒即热，5秒灸感直达皮下','艾灸效果看得见'],['头部放松手法','三年陈艾小罐灸'],30,'168','1280'],
 ['服务项目','',['呵护肌肤健康好状态','以温暖之力帮助身心平衡'],['精油香薰','泡浴三进三出','醒神收汗','颂钵唤醒'],60,'168','1280'],
 ['服务项目','',['20分钟轻养生，释放肩、腰压力，帮助赶走疲劳'],['古法开穴','专业手法放松','能量刮痧'],20,'39',''],
 ['服务项目','',['臀足双向调理，暖暖的好植愈'],['蕲艾原液泡脚','蕲艾坐灸'],30,'69.9',''],
 ['服务项目','',['深度放松肩颈'],['肩颈手法','古法艾灸箱艾灸'],40,'168',''],
 ['服务项目','',['天然草本融合专业手法','舒适缓解关节僵硬、肌肉紧张'],['肩膀放松','肩颈仪器疏通','涂抹艾草金油'],20,'68','']
 ];
 const intro=i=>{const [category,variant,benefits,steps,minutes,price,pack]=serviceInfo[i];return `<div class="xs-project-copy"><p class="xs-project-category">${category}</p><h3>${services[i][0]}</h3>${variant?`<p class="xs-project-variant">${variant}</p>`:''}<ul class="xs-project-benefits">${benefits.map(text=>`<li>${text}</li>`).join('')}</ul><div class="xs-project-price"><p><span>${minutes}分钟 / 次</span><strong>${price}元</strong></p>${pack?`<p><span>十次套餐</span><strong>${pack}元</strong></p>`:''}</div><details class="xs-service-steps"><summary>服务流程 <span>${steps.length}项</span></summary><ol>${steps.map(step=>`<li>${step}</li>`).join('')}</ol></details></div>`};

 const serviceSection=(standalone=false)=>`<section class="xs-services-section xs-section" id="services" data-services><header class="xs-service-heading"><${standalone?'h1':'h2'}>服务卡项</${standalone?'h1':'h2'}><p>独家自研项目套组 传承古法<br>高品质艾+服务标准化</p></header><div class="xs-service-layout"><aside class="xs-project"><div id="xs-project-description" aria-live="polite" aria-atomic="true"></div><nav class="xs-service-pager" aria-label="服务卡项翻页"><button type="button" data-service-prev aria-label="上一组服务卡项" disabled>‹</button><span data-service-count aria-live="polite">1 / 3</span><button type="button" data-service-next aria-label="下一组服务卡项">›</button></nav></aside><div class="xs-service-viewport"><div class="xs-service-track">${Array.from({length:3},(_,group)=>`<div class="xs-service-group" ${group?'inert':''} role="group" aria-label="第 ${group+1} 组服务卡项">${services.slice(group*4,group*4+4).map(([title,tag],offset)=>{const i=group*4+offset;return `<button type="button" class="xs-service-card" data-service="${i}" aria-pressed="false" aria-controls="xs-project-description"><span class="xs-card-photo">${i===0?image('imgReplaceImageHere',title):`<img src="../assets/xunai/shared/service-${i}.webp" alt="${title}" width="600" height="856" loading="lazy">`}</span><span class="xs-card-label"><span>${title}</span><span>${tag}</span></span></button>`}).join('')}</div>`).join('')}</div></div></div></section>`;
 const heading=(title,sub)=>`<header class="xs-section-heading"><h2>${title}</h2><p>${sub}</p></header>`;
 // User-supplied roster: retain source IDs; crossed-out rows 60 and 61 are excluded.
 // Public fields only. Do not infer addresses, opening status or staff contact details.
 const storeLocations=[
  [1,'寻艾艾灸馆（比邻苑店）','广东','佛山','加盟店'],
  [2,'寻艾艾灸馆（华达新城店）','广东','河源','加盟店'],
  [3,'寻艾艾灸馆（罗村海宜广场店）','广东','佛山','加盟店'],
  [4,'寻艾艾灸馆（澜湾广场店）','天津','天津','加盟店'],
  [5,'寻艾艾灸馆（府前大街店）','山东','东营','加盟店'],
  [6,'寻艾艾灸馆（保利上城店）','广东','深圳','直营店'],
  [7,'寻艾艾灸馆（九嶷南路店）','湖南','永州','加盟店'],
  [8,'寻艾艾灸馆（保利西海岸店）','湖南','长沙','加盟店'],
  [9,'寻艾艾灸馆（番禺聚宝路店）','广东','广州','加盟店'],
  [10,'寻艾艾灸馆（寰宇天下花园店）','广东','汕头','加盟店'],
  [11,'寻艾艾灸馆（裕兴市场店）','广东','汕头','加盟店'],
  [12,'寻艾艾灸馆（嘉怡商贸店）','广东','汕头','加盟店'],
  [13,'寻艾艾灸馆（龙光阳光禧园店）','广东','汕头','加盟店'],
  [14,'寻艾艾灸馆（九洲花园店）','广东','中山','加盟店'],
  [15,'寻艾艾灸馆（南华小区店）','广东','茂名','加盟店'],
  [16,'寻艾艾灸馆（华美春天店）','广东','普宁','加盟店'],
  [17,'寻艾艾灸馆（砂松店）','广东','揭阳','加盟店'],
  [18,'寻艾艾灸馆（渡馨南路店）','浙江','义乌','加盟店'],
  [19,'寻艾艾灸馆（奥体新城御府店）','江苏','南通','加盟店'],
  [20,'寻艾艾灸馆（江东南路店）','浙江','义乌','加盟店'],
  [21,'寻艾艾灸馆（晶都花园店）','浙江','金华','加盟店'],
  [22,'寻艾艾灸馆（圣特立国际花园店）','湖北','武汉','加盟店'],
  [23,'寻艾艾灸馆（新沙路店）','湖北','荆州','加盟店'],
  [24,'寻艾艾灸馆（大川世纪城店）','河北','沧州','加盟店'],
  [25,'寻艾艾灸馆（深圳黑金店）','广东','深圳','直营店'],
  [26,'寻艾艾灸馆（七拾九号院店）','河北','邢台','加盟店'],
  [27,'寻艾艾灸馆（玺云台店）','宁夏','银川','加盟店'],
  [28,'寻艾艾灸馆（万象花园店）','广东','中山','直营店'],
  [29,'寻艾艾灸馆（禾祥西路店）','福建','厦门','加盟店'],
  [30,'寻艾艾灸馆（和基花园店）','广东','佛山','加盟店'],
  [31,'寻艾艾灸馆（金宇名庭店）','宁夏','银川','加盟店'],
  [32,'寻艾艾灸馆（启航大厦店）','湖南','长沙','加盟店'],
  [33,'寻艾艾灸馆（新南佳州店）','广西','崇左','加盟店'],
  [34,'寻艾艾灸馆（九锦台店）','河南','郑州','加盟店'],
  [35,'寻艾艾灸馆（天府欧城店）','四川','成都','加盟店'],
  [36,'寻艾艾灸馆（大沥智博花园店）','广东','佛山','加盟店'],
  [37,'寻艾艾灸馆（沿江路店）','广东','广州','加盟店'],
  [38,'寻艾艾灸馆（民安小区店）','宁夏','银川','加盟店'],
  [39,'寻艾艾灸馆（农科路店）','湖北','黄冈','加盟店'],
  [40,'寻艾艾灸馆（天下川店）','宁夏','银川','加盟店'],
  [41,'寻艾艾灸馆（四季滨江田园店）','广东','韶关','直营店'],
  [42,'寻艾艾灸馆（英雄广场店）','湖南','湘潭','加盟店'],
  [43,'寻艾艾灸馆（东方花园店）','河北','邢台','加盟店'],
  [44,'寻艾艾灸馆（前海路店）','广东','深圳','加盟店'],
  [45,'寻艾艾灸馆（联祥花园店）','广东','中山','加盟店'],
  [46,'寻艾艾灸馆（新苑小区店）','广东','汕头','加盟店'],
  [47,'寻艾艾灸馆（西山华府店）','广西','贵港','加盟店'],
  [48,'寻艾艾灸馆（文明佳苑店）','江苏','南通','加盟店'],
  [49,'寻艾艾灸馆（北苑路店）','浙江','义乌','加盟店'],
  [50,'寻艾艾灸馆（万象汇店）','广东','珠海','加盟店'],
  [51,'寻艾艾灸馆（月明路店）','浙江','宁波','加盟店'],
  [52,'寻艾艾灸馆（泽普路店）','上海','上海','加盟店'],
  [53,'寻艾艾灸馆（好燃时刻体育公园店）','湖北','武汉','直营店'],
  [54,'寻艾艾灸馆（鸟巢店）','北京','北京','加盟店'],
  [55,'寻艾艾灸馆（皇庭御珑湾店）','广西','钦州','加盟店'],
  [56,'寻艾艾灸馆（武汉黑金店）','湖北','武汉','直营店'],
  [57,'寻艾艾灸馆（龙湾吾悦广场店）','浙江','温州','加盟店'],
  [58,'寻艾艾灸馆（茶薇花园店）','广东','中山','加盟店'],
  [59,'寻艾艾灸馆（大港油田店）','天津','天津','加盟店'],
  [62,'寻艾艾灸馆（金悦府店）','河南','开封','加盟店'],
  [63,'寻艾艾灸馆（天鹅湖畔店）','广东','深圳','加盟店'],
  [64,'寻艾轻享店（莲花北村店）','广东','深圳','加盟店'],
  [65,'寻艾艾灸馆（中央西谷大厦店）','广东','深圳','加盟店'],
  [66,'寻艾轻享店（隆尧县魏庄村店）','河北','邢台','加盟店'],
  [67,'寻艾艾灸馆（佰港城店）','湖北','武汉','加盟店'],
  [68,'寻艾艾灸馆（积玉桥万达广场店）','湖北','武汉','加盟店'],
  [69,'寻艾艾灸馆（云荟府店）','广东','汕头','加盟店'],
  [70,'寻艾艾灸馆（凤起路店）','浙江','杭州','直营店'],
  [71,'寻艾艾灸馆（保利时代店）','湖北','武汉','加盟店'],
  [72,'寻艾轻享店（御景天城店）','湖北','荆门','加盟店'],
  [73,'寻艾艾灸馆（百合花园店）','广东','广州','加盟店'],
  [74,'寻艾艾灸馆（城东大道店）','广东','云浮','加盟店'],
  [75,'寻艾艾灸馆（雅居乐花园店）','广东','河源','加盟店'],
  [76,'寻艾艾灸馆（金山湖花园店）','广东','惠州','加盟店'],
  [77,'寻艾艾灸馆（润园家园店）','广东','揭阳','加盟店'],
  [78,'寻艾艾灸馆（李堡店）','江苏','南通','加盟店'],
  [79,'寻艾艾灸馆（湖畔嘉苑店）','宁夏','银川','加盟店'],
  [80,'寻艾艾灸馆（丰庆路店）','河南','郑州','加盟店'],
  [81,'寻艾艾灸馆（盛唐至尊店）','河南','洛阳','加盟店'],
  [82,'寻艾艾灸馆（正弘城店）','河南','郑州','加盟店'],
  [83,'寻艾艾灸馆（锡贤路店）','江苏','无锡','加盟店'],
  [84,'寻艾艾灸馆（王庸路店）','山东','青岛','加盟店'],
  [85,'寻艾艾灸馆（铁橛山路店）','山东','青岛','加盟店'],
  [86,'寻艾艾灸馆（昆山黄金海岸店）','江苏','苏州','加盟店'],
  [87,'寻艾艾灸馆（万达越祥湾店）','广东','河源','加盟店'],
  [88,'寻艾艾灸馆（绿地中心店）','广东','佛山','加盟店'],
  [89,'寻艾艾灸馆（大冲新城花园店）','广东','深圳','加盟店'],
  [90,'寻艾艾灸馆（高桥上河国际店）','湖南','长沙','加盟店'],
  [91,'寻艾艾灸馆（湘江世纪城店）','湖南','长沙','加盟店'],
  [92,'寻艾艾灸馆（联发乾景店）','广西','桂林','加盟店'],
  [93,'寻艾艾灸馆（康居路店）','广东','梅州','加盟店'],
  [94,'寻艾艾灸馆（宝安壹方中心店）','广东','深圳','加盟店'],
  [95,'寻艾艾灸馆（凤凰大街店）','山东','潍坊','加盟店'],
  [96,'寻艾艾灸馆（文昌街店）','山东','潍坊','加盟店'],
  [97,'寻艾艾灸馆（美鑫公寓店）','广东','汕头','加盟店'],
  [98,'寻艾艾灸馆（市民广场店）','江苏','南通','加盟店'],
  [99,'寻艾艾灸馆（振华路店）','广东','东莞','加盟店'],
  [100,'寻艾艾灸馆（团结路店）','湖北','武汉','加盟店'],
  [101,'寻艾艾灸馆（湫水佳苑店）','江苏','南京','加盟店'],
  [102,'寻艾艾灸馆（磊口朝阳店）','广东','汕头','加盟店'],
  [103,'寻艾艾灸馆（东华路店）','广东','汕头','加盟店'],
  [104,'寻艾艾灸馆（园岭新村店）','广东','深圳','加盟店'],
  [105,'待定（未选址）','广西','贵港','加盟店'],
  [106,'寻艾艾灸馆（北辰三角洲店）','湖南','长沙','加盟店'],
  [107,'寻艾艾灸馆（日出东方店）','湖南','永州','加盟店'],
  [108,'寻艾艾灸馆（星湖湾店）','浙江','宁波','加盟店'],
  [109,'寻艾艾灸馆（长城汇店）','湖北','武汉','直营店']
 ];
 const locationRow=([id,name,province,city,type])=>`<details class="site-disclosure" data-store-id="${id}" data-store-type="${type}"><summary><span class="xs-city">${city}</span><span>${name}</span><img src="${base}imgGroup20.svg" width="18" height="18" alt=""></summary><p class="xs-pending">所在地区：${province} · ${city}<br>门店合作类型：${type}</p></details>`;
 const locations=()=>{
  const black=storeLocations.filter(row=>row[1].includes('黑金店')),standard=storeLocations.filter(row=>!row[1].includes('黑金店'));
  return `<section class="xs-section" id="locations">${heading('门店信息','城市·店型·汇总')}<div class="xs-location-group"><h3>黑金店</h3><div>${black.map(locationRow).join('')}</div></div><div class="xs-location-group"><h3>标准店</h3><div>${['直营店','加盟店'].map(type=>`<details class="site-disclosure xs-store-subgroup"><summary>${type}</summary><div data-store-cities>${standard.filter(row=>row[4]===type).map(locationRow).join('')}</div></details>`).join('')}</div></div></section>`;
 };
 const comparison=()=>`<section class="xs-section" id="types">${heading('店型对比','寻艾艾灸馆<br>黑金店 · 标准店')}${[['黑金店','imgE4A99442'],['标准店','imgRectangle']].map(([type,file],i)=>`<article class="xs-type ${i?'xs-type-reverse':''}"><div class="xs-type-copy"><h3>寻艾艾灸馆<br>${type}</h3><a class="xs-booklet-open route-link" href="#/stores/${i?'standard':'black-gold'}/detail">查看详情 ${arrow()}</a></div><figure>${image(file,type+(i?'设计参考':'空间'))}${i?'<figcaption>标准店设计参考</figcaption>':''}</figure></article>`).join('')}</section>`;
 return {
  locations,
  render(page){
   if(page.endsWith('/detail'))return `<div class="xs-page"><section class="xs-section xs-booklet">${booklet(page==='/stores/standard/detail')}</section></div>`;
   if(page==='/stores/services')return `<div class="xs-page xs-services">${nav(page)}${serviceSection(true)}</div>`;
   return `<div class="xs-page"><section class="xs-hero"><div class="xs-hero-media"><video class="opening-film" muted playsinline loop autoplay preload="metadata" poster="../assets/xunai/booklets/black-gold-imgRectangle1.webp" aria-label="寻艾黑金店空间影像"><source src="../assets/xunai/stores/黑金店体验流程.mp4" type="video/mp4"></video></div><div class="xs-hero-content"><p>了解标准店、黑金店与服务卡项。</p><h1>寻艾艾灸馆</h1>${nav(page)}<div class="xs-hero-intro"><span>体验·轻养·服务</span><p>寻艾是以线下艾灸馆为基础业态的终端品牌。依托集团强大的供应链，将蕲春道地艾草与艾艾贴产品带进终端门店，结合自研体质检测AI与蕲春非遗灸法，革新传统艾灸服务，让顾客的艾灸体验焕然一新。</p></div></div></section>${competence()}${locations()}${comparison()}${serviceSection()}</div>`;
  },
  mount(main){
   window.XunAiReview.mount(main);
   const stopCover=mountSectionCover([...main.querySelectorAll('#types > .xs-type')]);
   const layout=main.querySelector('.xs-strength-layout');
   if(layout){let active=3;layout.addEventListener('click',event=>{const button=event.target.closest('[data-strength]');if(!button)return;const index=Number(button.dataset.strength);if(index===active)return;const from=button.querySelector('img').getBoundingClientRect();const old=active;active=index;layout.querySelector('.xs-strength-thumbs').innerHTML=[0,1,2,3].filter(i=>i!==active).map(i=>strengthCard(i)).join('');const feature=layout.querySelector('.xs-strength-feature');feature.innerHTML=strengthCard(active,true)+(active===3?'<p>打破传统的空间体验，对艾灸文化进行重新演绎。在都市语境中重构传统艾灸的疗愈智慧，以现代人的审美需求建立有温度的艾灸空间。</p>':'');const img=feature.querySelector('img'),to=img.getBoundingClientRect();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)img.animate([{transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`},{transform:'none'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});layout.querySelector(`[data-strength="${old}"]`).focus({preventScroll:true});});}
   const root=main.querySelector('[data-services]');if(!root)return stopCover;
   const track=root.querySelector('.xs-service-track'),groups=[...track.children],cards=[...root.querySelectorAll('[data-service]')],copy=root.querySelector('#xs-project-description'),prev=root.querySelector('[data-service-prev]'),next=root.querySelector('[data-service-next]');
   const reduce=matchMedia('(prefers-reduced-motion: reduce)');let selected=-1,page=0,perPage=4;
   const pageCount=()=>Math.ceil(cards.length/perPage);
   const select=(index,focus=false,reveal=true)=>{
    index=Math.max(0,Math.min(services.length-1,index));const old=selected;selected=reveal?index:-1;page=Math.floor(index/perPage);
    groups.forEach((group,i)=>{group.inert=i!==page;group.hidden=i!==page});
    cards.forEach((card,i)=>card.setAttribute('aria-pressed',String(i===selected)));
    copy.innerHTML=reveal?intro(index):'';prev.disabled=page===0;next.disabled=page===pageCount()-1;
    root.querySelector('[data-service-count]').textContent=`${page+1} / ${pageCount()}`;
    copy.getAnimations().forEach(animation=>animation.cancel());
    if(reveal&&old!==index&&!reduce.matches)copy.animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});
    if(focus)cards[index].focus({preventScroll:true});
   };
   select(0,false,false);
   resizeServices=()=>{
    if(!root.isConnected)return;
    const size=ultra.matches?6:wide.matches?5:4;if(size===perPage)return;
    const anchor=selected>=0?selected:page*perPage,focus=cards.includes(document.activeElement);
    perPage=size;cards.forEach((card,i)=>groups[Math.floor(i/perPage)].append(card));
    select(anchor,focus,selected>=0);
   };
   resizeServices();
   cards.forEach((card,i)=>card.addEventListener('click',()=>{select(i);if(innerWidth<768)copy.scrollIntoView({block:'center',behavior:reduce.matches?'auto':'smooth'})}));
   prev.addEventListener('click',()=>select((page-1)*perPage,false,false));next.addEventListener('click',()=>select((page+1)*perPage,false,false));
   track.addEventListener('keydown',event=>{const columns=wide.matches?perPage:2;const move={ArrowRight:1,ArrowLeft:-1,ArrowDown:columns,ArrowUp:-columns}[event.key];if(move){event.preventDefault();select(Number(event.target.closest('[data-service]').dataset.service)+move,true,false)}});
   let point=null,swiped=false;const viewport=root.querySelector('.xs-service-viewport');
   viewport.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0){point=[event.clientX,event.clientY];swiped=false}});
   viewport.addEventListener('pointerup',event=>{if(!point)return;const dx=event.clientX-point[0],dy=event.clientY-point[1];point=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3){swiped=true;select(Math.max(0,Math.min(pageCount()-1,page+(dx<0?1:-1)))*perPage,false,false)}});
   viewport.addEventListener('pointercancel',()=>point=null);
   viewport.addEventListener('click',event=>{if(swiped){event.preventDefault();event.stopPropagation();swiped=false}},true);
   viewport.addEventListener('dragstart',event=>event.preventDefault());
   return stopCover;
  }
 };
})();
