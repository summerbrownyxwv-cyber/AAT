import { canonicalAsset } from '../website-code/asset-urls.js';
const pngAssets = ["817f2.webp", "e126f.webp", "52b10.webp"];
const asset = file => canonicalAsset(pngAssets.includes(file) ? `../assets/products/figma/${file}` : `../assets/products/web/${file.replace('.png','.webp')}`);

export const assets = {
  flower: asset('a7074.webp'),
  sevenYearMoxa: asset('311a9.webp'),
  hydrosol: asset('e5c04.webp'),
  apparatus: asset('d017b.webp'),
  essentialOil: asset('bad74.webp'),
  ranScene: asset('817f2.webp'),
  cuiScene: asset('e126f.webp'),
  wenScene: asset('52b10.webp'),
  zhiScene: '../assets/xunai/brand/imgFrame69.webp',
  cooperationDiagram: asset('1284b.webp'),
  certifications: [asset('420b7.webp'), asset('aa15b.webp'), asset('59457.webp')],
};

export const productSeriesIntro = '从传统艾绒、艾条，到艾草精油、纯露与日常贴敷产品，艾艾贴围绕一株艾草，形成「燃、萃、温、植」四个产品系列。不同的产品形态，让艾草融入更多日常场景。';

export const productSeries = [
  {
    id: 'ran', name: '燃', title: '燃', color: '#955f36', image: assets.ranScene,
    description: '沿承传统明火艾灸与制艾工艺，以艾灸器、艾绒柱、清艾条等不同形态，呈现「燃」系列的艾灸产品。',
  },
  {
    id: 'cui', name: '萃', title: '萃', color: '#6f712b', image: assets.cuiScene,
    description: '从艾叶中提取草本精华，形成精油、纯露等产品。「萃」系列以不同的提取产品形态，延展艾草的日常应用。',
  },
  {
    id: 'wen', name: '温', title: '温', color: '#955f36', image: assets.wenScene,
    description: '以自发热与贴敷形态融入日常。「温」系列涵盖艾灸精华贴、腰腹贴、眼贴与足贴，回应不同部位的温敷需求。',
  },
  {
    id: 'zhi', name: '植', title: '植', color: '#6f712b', image: assets.zhiScene,
    description: '由艾草贴、艾草足浴包与一日一茶组成，「植」系列探索草本在贴敷、足浴与茶饮中的不同形态，让艾草融入日常生活。',
  },
];

export const series = productSeries;

export const heroProducts = [
  {
    id: 'essential-oil', name: '艾草精油', title: '艾草精油', series: '萃',
    image: assets.essentialOil, src: assets.essentialOil,
    description: '艾草提取精油\n滴管瓶装', visualScale: .88,
    frame: { width: 172.264, height: 455.903 }, rotation: -32.85,
    imageStyle: { width: '100%', height: '100%', left: '0%', top: '0%', objectFit: 'cover' },
  },
  {
    id: 'seven-year-moxa', name: '七年清艾条', title: '七年清艾条', series: '燃',
    image: assets.sevenYearMoxa, src: assets.sevenYearMoxa,
    description: '七年陈艾\n传统清艾条', visualScale: .96,
    frame: { width: 166.689, height: 386.181 }, rotation: -16.11,
    imageStyle: { width: '328.11%', height: '212.33%', left: '-118.71%', top: '-49.87%' },
  },
  {
    id: 'essence-patch', name: '艾灸精华贴', title: '艾灸精华贴', series: '温',
    image: assets.flower, src: assets.flower,
    description: '自发热贴敷产品\n日常温敷', visualScale: .97,
    frame: { width: 321.479, height: 319.425 }, rotation: 0,
    imageStyle: { width: '200.74%', height: '302.89%', left: '-48.93%', top: '-106.75%' },
  },
  {
    id: 'moxibustion-apparatus', name: '艾灸器', title: '艾灸器', series: '燃',
    image: assets.apparatus, src: assets.apparatus,
    description: '蕲春三年陈艾\n贴附式艾灸器', visualScale: .98,
    frame: { width: 255.333, height: 350.286 }, rotation: 13.88,
    imageStyle: { width: '100%', height: '100%', left: '0%', top: '0%', objectFit: 'cover' },
  },
  {
    id: 'hydrosol', name: '艾草纯露', title: '艾草纯露', series: '萃',
    image: assets.hydrosol, src: assets.hydrosol,
    description: '瓶装艾草纯露\n日常肌肤养护', visualScale: .86,
    frame: { width: 162.625, height: 471.891 }, rotation: 30,
    imageStyle: { width: '371.41%', height: '128%', left: '-133.43%', top: '-15.14%' },
  },
];

const catalogLayer = (file, left, top, width, height) => ({
  src: `../assets/products/catalog/${file}.webp`, left, top, width, height,
  imageStyle: { width: '100%', height: '100%', left: '0%', top: '0%', objectFit: 'contain' },
});

const apparatusDescription = '采用倒流香结构的贴附式艾灸器，以蕲春三年陈艾为灸材。小巧轻便，无需持续手持，便于日常艾灸。';

// All product compositions share the original 405 × 520 card coordinate system.
export const productGroups = [
  {
    id: 'ran', key: 'ran', title: '燃系列产品', index: '01', color: '#955f36',
    products: [
      {
        id: 'apparatus', name: '艾灸器', description: apparatusDescription, copySource: 'figma-product',
        frame: { width: 405, height: 520 },
        layers: [
          { src: asset('5b3a9.webp'), left: 74, top: 75, width: 192, height: 367, imageStyle: { width: '213.22%', height: '167.3%', left: '-53.22%', top: '-32.15%' } },
          { src: asset('2cc2e.webp'), left: 232, top: 294, width: 132, height: 159, imageStyle: { width: '246.17%', height: '305.98%', left: '-67.41%', top: '-111.11%' } },
        ],
      },
      {
        id: 'moxa-column', name: '艾绒柱', description: '艾绒制成的柱状灸材，采用袋装包装。延续「燃」系列的明火艾灸方式，提供不同于条状艾条的产品形态。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          { src: asset('1c3a2.webp'), left: 61, top: 130, width: 284, height: 323, imageStyle: { width: '227.75%', height: '301.16%', left: '-63.48%', top: '-94.43%' } },
        ],
      },
      {
        id: 'moxa-stick', name: '清艾条', description: '条状艾灸灸材，延续传统制艾工艺与明火艾灸方式。以长条形袋装呈现，是「燃」系列的传统艾条产品。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          { src: asset('b708e.webp'), left: 90, top: 95, width: 236, height: 391, imageStyle: { width: '217.37%', height: '196.78%', left: '-61.44%', top: '-54.02%' } },
        ],
      },
      {
        id: 'combined-suspension-moxa', name: '联合悬灸盒', description: '盒装联合悬灸产品，搭配多点位悬灸组件。延续「燃」系列的艾灸方式，以不同的器具形态提供日常艾灸选择。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          catalogLayer('suspension-box-pack', 33, 83.5, 242, 342),
          catalogLayer('suspension-box-device', 198, 324.5, 174, 112),
        ],
      },
      {
        id: 'ear-moxa', name: '耳灸', description: '耳部艾灸器具，采用耳罩式外观并配有盒装包装。以适配耳部的器具形态，丰富「燃」系列的艾灸产品选择。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [catalogLayer('ear-moxa', 32.5, 131.5, 340, 257)],
      },
      {
        id: 'eye-moxa', name: '眼灸', description: '眼部艾灸产品，搭配眼罩式器具与盒装包装。以适配眼部的外观设计，呈现「燃」系列中不同部位的艾灸选择。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          catalogLayer('eye-moxa-pack', 38.5, 85, 195, 350),
          catalogLayer('eye-moxa-device', 140.5, 316, 226, 119),
        ],
      },
    ],
  },
  {
    id: 'cui', key: 'cui', title: '萃系列产品', index: '02', color: '#6f712b',
    products: [
      {
        id: 'hydrosol', name: '艾草纯露', description: '瓶装艾草纯露，用于日常肌肤养护。以纯露形态呈现草本提取产品，与同系列的精油、精油棒形成不同选择。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          { src: asset('344ef.webp'), left: 88, top: 73, width: 161, height: 381, imageStyle: { width: '436.02%', height: '276.9%', left: '-172.59%', top: '-93.59%' } },
          { src: assets.hydrosol, left: 117, top: 163, width: 300, height: 300, imageStyle: { width: '100%', height: '100%', left: '0%', top: '0%', objectFit: 'cover' } },
        ],
      },
      {
        id: 'essential-oil', name: '艾草精油', description: '艾草精油，采用瓶装与盒装组合呈现。以精油形态延展艾草的草本提取应用，与纯露、精油棒形成不同的产品选择。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          catalogLayer('essential-oil-pack', 46, 85, 163, 350),
          catalogLayer('essential-oil-bottle', 263, 185, 96, 250),
        ],
      },
      {
        id: 'essential-oil-stick', name: '艾草精油棒', description: '鼻吸式艾草精油棒，采用小巧的棒状形态。区别于滴管瓶装精油，以便携形式呈现「萃」系列的草本提取产品。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          catalogLayer('essential-oil-stick-pack', 38.5, 153, 235, 233),
          catalogLayer('essential-oil-stick-device', 287.5, 114, 79, 292),
        ],
      },
      {
        id: 'bath-essence', name: '艾草精华泡浴液', description: '艾草精华泡浴液，采用盒装与独立杯装呈现。以适合居家泡浴的产品形态，延展「萃」系列的草本提取应用。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          catalogLayer('bath-essence-pack', 32, 170, 310, 140),
          catalogLayer('bath-essence-cup', 262, 218, 111, 132),
        ],
      },
      {
        id: 'itch-ointment', name: '艾草止痒膏', description: '艾草止痒膏，采用盒装膏体形态。与精油、纯露等产品共同组成「萃」系列，呈现草本提取产品的不同应用形式。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [catalogLayer('itch-ointment', 44.5, 94, 316, 332)],
      },
      {
        id: 'soothing-essential-oil', name: '艾草舒缓精华油', description: '艾草舒缓精华油，采用滴管瓶与盒装组合呈现。以精华油的产品形态，丰富「萃」系列的草本提取产品选择。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          catalogLayer('soothing-oil-pack', 70.5, 85, 122, 350),
          catalogLayer('soothing-oil-bottle', 233.5, 121, 101, 314),
        ],
      },
    ],
  },
  {
    id: 'wen', key: 'wen', title: '温系列产品', index: '03', color: '#955f36',
    products: [
      {
        id: 'essence-patch', name: '艾灸精华贴', description: '「温」系列的自发热贴敷产品，结合艾草精油与温敷形态。采用花形贴片设计，将日常温敷化为轻便的贴敷体验。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          { src: asset('38ce5.webp'), left: 35, top: 103, width: 271, height: 313, imageStyle: { width: '250.64%', height: '324.82%', left: '-74.5%', top: '-104.92%' } },
          { src: assets.flower, left: 242, top: 288, width: 128, height: 128, imageStyle: { width: '211.46%', height: '318.01%', left: '-53.25%', top: '-114.67%' } },
        ],
      },
      {
        id: 'waist-abdomen-patch', name: '腰腹贴', description: '面向腰腹部位的温敷贴，采用横向展开的贴片形态。与艾灸精华贴、眼贴同属「温」系列，便于按部位选择。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          { src: asset('bc1b8.webp'), left: 34, top: 74, width: 263, height: 389, imageStyle: { width: '190.53%', height: '192.82%', left: '-46.91%', top: '-43.08%' } },
          { src: asset('67fe3.webp'), left: 173, top: 337, width: 210, height: 95, imageStyle: { width: '163.72%', height: '239.9%', left: '-29.97%', top: '-70.98%' } },
        ],
      },
      {
        id: 'eye-patch', name: '眼贴', description: '面向眼部的温敷贴片产品，采用花形贴片与盒装组合呈现。以独立的眼部产品设计，丰富「温」系列的日常温敷选择。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          catalogLayer('eye-patch-pack', 40, 96, 242, 319),
          catalogLayer('flower-patch', 229, 290, 136, 134),
        ],
      },
      {
        id: 'foot-patch', name: '足贴', description: '面向足部的温敷贴片产品，采用花形贴片与盒装包装。与眼贴、腰腹贴形成不同部位的选择，延展「温」系列的日常温敷场景。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          catalogLayer('foot-patch-pack', 39, 92, 242, 320),
          catalogLayer('foot-patch-device', 211, 322, 155, 106),
        ],
      },
    ],
  },
  {
    id: 'zhi', key: 'zhi', title: '植系列产品', index: '04', color: '#6f712b',
    products: [
      {
        id: 'wormwood-patch', name: '艾草贴', description: '「植」系列的艾草贴片产品，以盒装与独立贴片呈现。将草本应用延伸至日常贴敷，与足浴包形成不同的护理选择。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          { src: asset('a9e49.webp'), left: 35, top: 92, width: 247, height: 302, imageStyle: { width: '200.89%', height: '247.17%', left: '-49.85%', top: '-69.14%' } },
          { src: asset('c849b.webp'), left: 196, top: 266, width: 171, height: 128, imageStyle: { width: '100%', height: '100%', left: '0%', top: '0%', objectFit: 'cover' } },
        ],
      },
      {
        id: 'foot-bath-bag', name: '艾草足浴包', description: '用于足浴的袋装草本产品，归属「植」系列。以足浴包形态融入居家足浴场景，延展艾草在家庭护理中的应用。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          { src: asset('e226c.webp'), left: 92, top: 107, width: 222, height: 280, imageStyle: { width: '260.17%', height: '310.1%', left: '-78.94%', top: '-96.28%' } },
        ],
      },
      {
        id: 'daily-tea', name: '一日一茶', description: '盒装袋泡茶产品，搭配独立三角茶包。以茶饮形态融入日常，与艾草贴、足浴包共同组成「植」系列的三款产品。', copySource: 'product-packaging',
        frame: { width: 405, height: 520 },
        layers: [
          catalogLayer('tea-pack', 38, 109, 270, 265),
          catalogLayer('tea-bag', 216, 272, 151, 139),
        ],
      },
    ],
  },
];
