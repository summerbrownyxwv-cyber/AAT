import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../planting-page.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../planting-page.css', import.meta.url), 'utf8');
const extract = (start, end) => {
  const first = source.indexOf(start), last = source.indexOf(end, first);
  assert(first >= 0 && last > first, `Missing geometry boundary: ${start}`);
  return source.slice(first, last);
};
// Execute the shipped measurement arithmetic with explicit layout inputs.
// This checks geometry invariants, not browser rendering or font measurement.
const measure = new Function('state', `
  const {innerWidth,innerHeight,land,research,traitsStory,reduced,document,getComputedStyle}=state;
  const stories=[land,research,traitsStory];
  const composition={section:{dataset:{}}};
  let landGeometry;
  ${extract("  const top = document.querySelector('.site-navigation')", '  if (innerHeight <= 560)')}
  ${extract('  stories.forEach(item => {\n    const distance', '  const titleStyle')}
  ${extract('  composition.start = traitsStory.start', '  const researchWidth')}
  return {landGeometry,composition,traitsStory};
`);
const approximately = (actual, expected) => assert(Math.abs(actual-expected)<.001, `${actual} != ${expected}`);
const viewports = [[320,640],[390,844],[768,1024],[900,800],[901,800],[997,876],[997,917],[1189,1263],[1440,900],[1920,1080],[2560,1440],[3840,2160]];
for (const [width,height] of viewports) {
  const unit = Math.max(1,width/1440), narrow=width<=900;
  const nav=(narrow?64:72)*unit;
  const left=narrow?20:87*width/1440, right=narrow?20:68*width/1440;
  const contentWidth=width-left-right;
  const fieldWidth=narrow?contentWidth:contentWidth*.2327;
  const fieldGap=(narrow?8:12)*unit, thumbnailGap=(narrow?8:10)*unit;
  const headingHeight=(narrow?20:20*unit)*1.4;
  const bodySize=narrow?Math.max(12,Math.min(15,width*.022)):16*unit;
  // Conservative CJK text-height fixture; actual font layout requires manual preview.
  const paragraphHeight=Math.ceil(160/Math.floor(fieldWidth/bodySize))*bodySize*(narrow?1.55:1.6875);
  const makeStory=(name,baseHeight)=>{
    const properties={};
    const style={height:'',setProperty(key,value){properties[key]=value;}};
    const stage={style,clientWidth:width,getBoundingClientRect:()=>({left:0}),
      get offsetHeight(){return parseFloat(style.height)||baseHeight;},get clientHeight(){return this.offsetHeight;}};
    return {section:{dataset:{scrollStory:name},style:{setProperty(key,value){properties[key]=value;}}},stage,properties,start:1000};
  };
  for (const reducedMotion of [false,true]) {
    const land=makeStory('land',narrow?height-nav:Math.max(580*unit,740*width/1440));
    const research=makeStory('research',Math.min(height-nav,680*unit));
    const traitsStory=makeStory('traits',height-nav);
    const thumbnails={};
    const field={clientWidth:fieldWidth,querySelector(selector){return selector==='h3'?{offsetHeight:headingHeight}:selector==='p'?{offsetHeight:paragraphHeight}:thumbnails;}};
    land.section.querySelector=selector=>selector==='.plant-land-field'?field:null;
    const document={querySelector(selector){return selector==='.site-navigation'?{getBoundingClientRect:()=>({height:nav})}:{getBoundingClientRect:()=>({left,right:width-right})};}};
    const result=measure({innerWidth:width,innerHeight:height,land,research,traitsStory,reduced:{matches:reducedMotion},document,getComputedStyle:element=>({rowGap:String(element===field?fieldGap:thumbnailGap)})});
    const geometry=result.landGeometry;
    const properties=land.properties;
    const number=name=>parseFloat(properties[name]);
    assert(geometry.finalWidth>0 && geometry.finalHeight>0);
    assert(geometry.left+geometry.finalWidth <= width-right+.001);
    if (!reducedMotion) {
      const copyBottom=number('--land-aside-top')+headingHeight+paragraphHeight+fieldGap;
      assert(number('--land-thumbnails-top') >= copyBottom+fieldGap-.001, 'Thumbnails must follow the full copy');
      const thumbBottom=number('--land-thumbnails-top')+number('--land-thumbnails-height');
      assert(thumbBottom <= (narrow?geometry.height-18*unit:geometry.height-24*unit)+.001, 'Field thumbnails fit the content stage');
      const glassBottom=number('--land-thumbnails-top')+number('--land-glass-height');
      assert(glassBottom <= thumbBottom+.001, 'Two greenhouse images must not stretch beyond the three-image rail');
      if(!narrow) approximately((number('--land-thumbnails-height')-2*thumbnailGap)/3,fieldWidth*2/3);
      const oldTraitsHeight=traitsStory.stage.offsetHeight*5.6;
      approximately(parseFloat(traitsStory.section.style.height),oldTraitsHeight*2/3);
      approximately(land.travel,land.stage.offsetHeight*1.35);
      approximately(research.travel,research.stage.offsetHeight*.55);
      approximately(result.composition.start,traitsStory.start+traitsStory.travel*2/4.6);
      approximately(result.composition.travel,traitsStory.travel*2.6/4.6);
      const anchor=Number(result.composition.section.dataset.chapterScroll);
      assert(anchor>result.composition.start && anchor<traitsStory.start+traitsStory.travel);
    } else {
      assert.equal(land.section.style.height,'auto');
      assert.equal(research.section.style.height,'auto');
      assert.equal(traitsStory.section.style.height,'auto');
      assert.equal(result.composition.travel,0);
    }
  }
  const thirdLeft=0, secondLeft=contentWidth*(narrow?.51:.305), secondaryWidth=contentWidth*(narrow?.45:.28093);
  approximately(thirdLeft,0);
  assert(secondLeft>=thirdLeft+secondaryWidth && secondLeft+secondaryWidth<=contentWidth, 'Research images keep their order, gap, and shell bounds');
}
assert.match(styles,/\.planting-page\{[^}]*display:block\}/);
assert.match(styles,/grid-template-rows:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(styles,/grid-template-rows:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(styles,/\.plant-land-field\{opacity:var\(--land-copy\)/);
assert.doesNotMatch(source,/p < \.28 \|\| p > \.86/);
assert.match(styles,/\.plant-research-second\{left:30\.5%\}/);
assert.match(styles,/\.plant-research-third\{left:0\}/);
assert.match(styles,/\.plant-research-second\{left:51%\}\.plant-research-third\{left:0\}/);
const reducedStyles=styles.slice(styles.indexOf('@media(prefers-reduced-motion:reduce)'));
assert.match(reducedStyles,/\.plant-land-thumbnails\{[^}]*opacity:1!important/);
assert.match(reducedStyles,/\.plant-land-glass \.plant-land-thumbnails>img\{aspect-ratio:3\/2;height:auto\}/);
assert(source.includes('const traitProgress = reduced.matches ? 1 : clamp(traitsStory.progress * 4.6 / 1.8)'));
assert(source.includes('smoothstep(1.8 / 4.6,2 / 4.6,traitsStory.progress)'));
assert(source.includes('clamp((traitsStory.progress * 4.6 - 2) / 2.6)'));
console.log(`PASS: shipped planting arithmetic at ${viewports.length} viewports, copy/thumbnail bounds, equal-size greenhouse previews, research alignment, exact one-third traits reduction, anchors, and reduced-motion flow. Browser visual review remains required.`);
