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
  ${extract('  stories.forEach(item => {\n    const distance', '  const titleBottom')}
  ${extract('  composition.start = traitsStory.start', '  const researchWidth')}
  return {landGeometry,composition,traitsStory};
`);
const approximately = (actual, expected) => assert(Math.abs(actual-expected)<.001, `${actual} != ${expected}`);
const landPhotoRect = new Function('landGeometry','shrink',`${extract('  const {width:w,fullHeight:h,left,finalWidth,finalHeight,finalTop}=landGeometry;', '  landPhoto.style.cssText')}return rect;`);
const landClips = /\.plant-land\{[^}]*overflow:clip(?:;|\})/.test(styles);
assert(landClips,'The chapter clips oversized opening media without creating a scroll container');
const viewports = [[320,640],[390,844],[768,1024],[792,945],[900,800],[901,800],[901,1600],[997,876],[997,917],[1030,981],[1030,1600],[1044,900],[1102,981],[1189,1263],[1440,900],[1920,1080],[2560,1440],[3840,2160]];
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
  for (const reducedMotion of [false,true]) for (const copyScale of [1,2]) {
    const land=makeStory('land',narrow?height-nav:Math.max(580*unit,740*width/1440));
    const research=makeStory('research',Math.min(height-nav,680*unit));
    const traitsStory=makeStory('traits',height-nav);
    const thumbnails={};
    const field={clientWidth:fieldWidth,querySelector(selector){
      if(selector==='h3')return{offsetHeight:headingHeight};
      if(selector==='p')return{offsetHeight:paragraphHeight*copyScale};
      assert.fail(`The copy aside does not contain ${selector}`);
    }};
    land.section.querySelector=selector=>selector==='.plant-land-field'?field:selector==='.plant-land-heading'?{offsetHeight:36*unit}:selector.includes('.plant-land-thumbnails')?thumbnails:null;
    const document={querySelector(selector){return selector==='.site-navigation'?{getBoundingClientRect:()=>({height:nav})}:{getBoundingClientRect:()=>({left,right:width-right})};}};
    const result=measure({innerWidth:width,innerHeight:height,land,research,traitsStory,reduced:{matches:reducedMotion},document,getComputedStyle:element=>{
      assert(element===field||element===thumbnails,'Only existing copy and gallery nodes can be measured');
      return{rowGap:String(element===field?fieldGap:thumbnailGap)};
    }});
    const geometry=result.landGeometry;
    const properties=land.properties;
    const number=name=>parseFloat(properties[name]);
    assert(geometry.finalWidth>0 && geometry.finalHeight>0);
    approximately(geometry.finalWidth/geometry.finalHeight,869/404);
    approximately(geometry.finalTop,narrow?64:84*unit);
    assert(geometry.finalTop+geometry.finalHeight<=geometry.height,'The landscape crop fits the stage independently of sidebar text height');
    assert(geometry.left+geometry.finalWidth <= width-right+.001);
    if (!reducedMotion) {
      const copyBottom=number('--land-aside-top')+headingHeight+paragraphHeight*copyScale+fieldGap;
      const photoBottom=geometry.finalTop+geometry.finalHeight;
      const railWidth=narrow?fieldWidth:geometry.finalWidth;
      const railHeight=(railWidth-2*thumbnailGap)/3*2/3;
      approximately(number('--land-thumbnails-left'),left);
      approximately(number('--land-thumbnails-width'),railWidth);
      approximately(number('--land-thumbnails-height'),railHeight);
      approximately(number('--land-thumbnails-top'),narrow?copyBottom+fieldGap:photoBottom+24*unit);
      const thumbBottom=number('--land-thumbnails-top')+number('--land-thumbnails-height');
      approximately(geometry.height,Math.max(copyBottom,thumbBottom)+24*unit);
      assert(photoBottom+24*unit<=number('--land-thumbnails-top')+.001,'The thumbnail row starts below the main landscape crop');
      for(const count of [3,2]){
        const thumbnailWidth=(railWidth-2*thumbnailGap)/3;
        const frames=Array.from({length:count},(_,index)=>({left:left+index*(thumbnailWidth+thumbnailGap),right:left+index*(thumbnailWidth+thumbnailGap)+thumbnailWidth}));
        frames.forEach((rect,index)=>{
          assert(rect.right<=left+railWidth+.001,'Both photo states fit the same single row');
          if(index)assert(rect.left>=frames[index-1].right+thumbnailGap-.001,'Every crop frame has a separate horizontal slot');
          approximately(thumbnailWidth/railHeight,3/2);
        });
      }
      if(narrow)assert(number('--land-aside-top')>=photoBottom+24*unit-.001,'Narrow copy follows the landscape crop');
      else{
        const asideLeft=width-right-fieldWidth;
        assert(geometry.left+geometry.finalWidth<asideLeft,'The main photo and right copy do not share a horizontal slot');
        assert(left+railWidth<asideLeft,'The horizontal rail stays below the main photo, outside the right copy');
      }
      const formerTraitScene=narrow?traitsStory.stage.offsetHeight:Math.min(height-nav,Math.max(560*unit,width*.58));
      const compactBudget=formerTraitScene*5.6*2/3;
      approximately(parseFloat(traitsStory.section.style.height),Math.max(traitsStory.stage.offsetHeight,compactBudget));
      approximately(traitsStory.travel,Math.max(0,compactBudget-traitsStory.stage.offsetHeight));
      approximately(land.travel,land.stage.offsetHeight*1.35);
      const chapterBottom=parseFloat(land.section.style.height);
      const openingRect=landPhotoRect(geometry,0);
      const openingBottom=openingRect.y+openingRect.height;
      const visibleOpeningBottom=landClips?Math.min(openingBottom,chapterBottom):openingBottom;
      assert(visibleOpeningBottom<=chapterBottom,'The opening photo cannot paint into the next chapter');
      if(height===1600&&copyScale===1){
        assert(openingBottom>chapterBottom,'Tall narrow fixtures exercise the oversized opening crop');
        approximately(visibleOpeningBottom,chapterBottom);
      }
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
  const chapterPadding=(height<=600?16:narrow?24:48)*unit,titleHeight=43*unit;
  const headingOffset=new Function('cultivarChapter','cultivarTitle','getComputedStyle','unit',`${extract('  const titleBottom =','  coverChapters.forEach')}return titleBottom;`)({style:{setProperty(){}}},{offsetHeight:titleHeight},()=>({paddingTop:String(chapterPadding)}),unit);
  approximately(headingOffset,chapterPadding+titleHeight);
  for(const progress of [0,.5,1]){
    const titleBottom=chapterPadding+titleHeight-(chapterPadding+titleHeight+56*unit+400+height*.55*progress);
    assert(titleBottom<0,'A natural-flow cultivar title has left the viewport throughout research instead of covering its photos');
  }
  if(!narrow){
    const available=height-nav,space=Math.max(40,Math.min(width*.045,120));
    const photoHeight=contentWidth*.87*.36*3/4;
    const photoBottom=(available+56*unit)/2+photoHeight/2;
    assert(photoBottom+space<=available,'Trait media fits the reading viewport with the existing bottom spacing');
    const formerScene=Math.min(available,Math.max(560*unit,width*.58));
    const formerBottom=(formerScene+56*unit)/2+photoHeight/2;
    assert(photoBottom>=formerBottom,'Using the full reading viewport removes the additional lower void from the compact scene');
    if(width===997||width===1044||width===1102)assert(photoBottom-formerBottom>100,'Reported tall-screen fixtures recover over 100 CSS pixels of unused lower viewport');
  }
}
const sectionNames=['plant-origin','plant-research','plant-traits','plant-management','pf-campus','pf-technology','pf-lines','pf-capacity'];
const sections=sectionNames.map(name=>({name,style:{},classes:[],matches:selector=>selector.split(',').some(value=>value==='.'+name),classList:{add(value){this.owner.classes.push(value);}}}));
sections.forEach(section=>section.classList.owner=section);
const chapterLists=new Function('main',`${extract('const chapters =','let frame =')}return {chapters,coverChapters};`)({querySelectorAll:selector=>{assert.equal(selector,sectionNames.map(name=>'.'+name).join(','),'The complete chapter list stays ordered and excludes the footer');return sections;}});
assert.deepEqual(chapterLists.chapters,sections,'Every chapter remains available to hash offsets and resize measurement');
assert.deepEqual(chapterLists.coverChapters.map(section=>section.name),sectionNames.slice(3,-1),'Video/research, trait runway and the final capacity section are not outer sticky covers');
for(const section of sections)assert.equal(section.classes.includes('plant-cover'),sectionNames.slice(3,-1).includes(section.name));
assert.doesNotMatch(source,/dampedCovers|coverFollow|section\.style\.translate/,'Factory chapters have no delayed whole-section translate follower');
const motionSelector=source.match(/const stopContent = \[\.\.\.main\.querySelectorAll\('([^']+)'\)/)?.[1];
assert.equal(motionSelector,'.plant-hero,.plant-origin,.pf-campus,.pf-technology,.pf-lines','Capacity stays outside content reveal and counter animation');
const node=name=>({name,children:[],before(child){const parent=this.parentElement;parent.children.splice(parent.children.indexOf(this),0,child);child.parentElement=parent;},append(...children){children.forEach(child=>{const previous=child.parentElement;previous?.children.splice(previous.children.indexOf(child),1);this.children.push(child);child.parentElement=this;});}});
const parent=node('planting-content'),prior=['land','cultivar','campus','technology','lines'].map(node),capacity=node('capacity');
const reveal={classList:{remove(...classes){this.removed=classes;}}};
capacity.querySelectorAll=selector=>{assert.equal(selector,'.content-reveal-copy,.content-reveal-media');return[reveal];};
parent.append(...prior,capacity);
new Function('main','document',extract('const capacity =','main.querySelectorAll(\'img\')'))({querySelector:selector=>{assert.equal(selector,'.pf-capacity');return capacity;}},{createElement:()=>node('cover-stack')});
const coverStack=parent.children[0];
assert.equal(coverStack.className,'plant-cover-stack');
assert.deepEqual(coverStack.children,prior,'All upstream sticky sections have a containing block ending before capacity');
assert.deepEqual(parent.children,[coverStack,capacity],'Capacity sits outside the sticky containing block');
assert.deepEqual(reveal.classList.removed,['content-reveal-copy','content-reveal-media'],'Capacity is visible immediately without reveal movement');
for(const match of styles.matchAll(/[^{}]*\.plant-cultivar-title[^{}]*\{([^}]*)\}/g))assert.doesNotMatch(match[1],/(?:^|;)(?:position|top|z-index)\s*:/,'The cultivar heading never pins over later research photos');
assert.doesNotMatch(source,/cultivarTitle\.style|titleExitLimit|chapterExit/,'Scroll rendering does not move the natural-flow heading');
assert(source.includes('[land.section,...chapters].forEach(section => {'),'Natural chapter heights still contribute to subsequent story starts');
assert(source.includes('chapters.forEach(section=>observer.observe(section))'),'Natural chapter size changes still update scroll anchors');
assert.match(styles,/\.plant-land-stage,\.plant-research-stage,\.plant-traits-scene\{position:sticky;top:var\(--site-navigation-height\);height:calc\(100svh - var\(--site-navigation-height\)\)\}/);
assert.doesNotMatch(styles,/\.plant-traits-scene\{height:min\(/,'The inner trait viewport must not be compacted while a full viewport remains pinned');
assert.match(styles,/\.planting-page\{[^}]*display:block\}/);
assert.match(styles,/\.plant-land-thumbnails\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\);grid-template-rows:minmax\(0,1fr\)/,'Both gallery states use one row with three fixed slots');
assert.match(styles,/\.plant-land-gallery\{[^}]*left:var\(--land-thumbnails-left\);top:var\(--land-thumbnails-top\);width:var\(--land-thumbnails-width\);height:var\(--land-thumbnails-height\)/,'Both gallery states share the same measured footprint');
assert.doesNotMatch(styles,/\.plant-land-field \.plant-land-thumbnails/,'The thumbnail rail no longer contributes to the right copy column');
assert.match(styles,/\.plant-land-field\{opacity:var\(--land-copy\)/);
assert.match(styles,/\.planting-page figure\{[^}]*overflow:hidden/,'Every thumbnail has its own crop boundary');
assert.match(styles,/\.plant-land-thumbnails>figure\{position:relative;min-height:0;aspect-ratio:3\/2\}/);
assert.match(styles,/\.plant-land-thumbnails>figure>img\{position:absolute;inset:0;width:100%;height:100%;object-fit:cover\}/);
assert.equal((source.match(/\$\{landThumbnail\(/g)||[]).length,5,'All five rail photos use the bounded crop frame');
assert.doesNotMatch(source.match(/<aside class="plant-land-aside plant-land-field">(.*?)<\/aside>/s)?.[1]||'',/landThumbnail|plant-land-thumbnails/,'The desktop aside contains only copy');
assert.equal((source.match(/class="plant-land-gallery /g)||[]).length,2,'Both photo states have separate gallery containers');
assert.match(source,/querySelector\('\.plant-land-field'\)\.setAttribute\('aria-hidden',String\(!reduced\.matches && p < \.28\)\)/,'The base description remains available during the greenhouse state');
assert.match(styles,/\.plant-research-second\{left:30\.5%\}/);
assert.match(styles,/\.plant-research-third\{left:0\}/);
assert.match(styles,/\.plant-research-second\{left:51%\}\.plant-research-third\{left:0\}/);
const reducedStyles=styles.slice(styles.indexOf('@media(prefers-reduced-motion:reduce)'));
assert.match(reducedStyles,/\.plant-land-thumbnails\{[^}]*opacity:1!important/);
assert.match(reducedStyles,/\.plant-land-heading,\.plant-land-canvas,\.plant-land-photo,\.plant-greenhouse-photo,\.plant-land-aside,\.plant-land-gallery\{position:relative;inset:auto!important;opacity:1!important;transform:none!important;width:100%!important;height:auto!important\}/,'Reduced motion shows both galleries in natural flow without measured placement');
assert.match(reducedStyles,/\.plant-land-glass \.plant-land-thumbnails>figure\{aspect-ratio:3\/2;height:auto\}/);
assert(source.includes('const traitProgress = reduced.matches ? 1 : clamp(traitsStory.progress * 4.6 / 1.8)'));
assert(source.includes('smoothstep(1.8 / 4.6,2 / 4.6,traitsStory.progress)'));
assert(source.includes('clamp((traitsStory.progress * 4.6 - 2) / 2.6)'));
console.log(`PASS: planting arithmetic in ${viewports.length*4} cases (${viewports.length} viewports, regular/doubled copy and reduced motion); landscape crop, single-row photo states, non-overlapping copy, exact content-based stage bottom and tall-screen opening-media clipping; natural heading, released covers, final capacity, compact budget and state sequence preserved. Node checks are not browser visual proof.`);
