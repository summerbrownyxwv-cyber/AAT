/* Verified contact channels, role entry points and four original brand stories. */
window.XunAiAbout=(()=>{
 const base='../assets/xunai/about/';
 const img=(name,alt,priority=false)=>`<img src="${base}${name}.webp" alt="${alt}" width="1440" height="960" ${priority?'fetchpriority="high"':'loading="lazy"'}>`;
 const paths=['careers','business','overseas'];
 const titles=['人才招聘','商务合作','海外合作'];
 const photos=['imgRectangle66','imgRectangle67','imgRectangle72'];
 const inboxes=['aat@dongyuanjt.com','aat@dongyuanjt.com','Ijh1@aiaitie.com'];
 const news=[
  ['imgRectangle68','艾艾贴携手湖北中医药大学、时珍实验室共建「时珍·数智人」AI中医系统'],
  ['imgRectangle70','寻艾深圳大冲新城花园店，落座万象天地旁'],
  ['imgRectangle69','恁可来咧！寻艾开进洛阳盛唐至尊'],
  ['imgRectangle71','一座12万平方米的艾草工厂，建在李时珍的家乡']
 ];
 const field=(name,label,type='text',required=true)=>`<label class="xo-field"><span>${label}${required?' *':'（选填）'}</span><input name="${name}" type="${type}" ${required?'required':''} maxlength="${type==='url'?1000:150}" ${name==='name'?'autocomplete="name"':name==='email'?'autocomplete="email"':name==='phone'?'autocomplete="tel"':''}><small class="xo-error"></small></label>`;
 const roleContact=index=>index===1?'<a href="tel:075522664794">商务合作：0755-22664794</a>':index===2?'<a href="mailto:Ijh1@aiaitie.com">海外业务：Ijh1@aiaitie.com</a>':'<a href="mailto:aat@dongyuanjt.com">通过企业邮箱咨询招聘：aat@dongyuanjt.com</a>';
 function form(index){
  const extra=index===0?field('role','意向岗位')+field('city','意向工作城市')+field('portfolio','简历或作品链接','url',false):index===1?field('company','公司 / 机构名称')+field('category','合作方向')+field('city','所在城市'):field('company','公司 / 机构名称')+field('country','国家 / 地区')+field('market','意向合作市场');
  return `<div class="xo-page xo-application"><a class="text-link route-link" href="#/about/culture">返回联系我们</a><div class="xo-application-layout"><aside><div class="xo-form-photo">${img(photos[index],titles[index])}</div><h1>${titles[index]}</h1><p>${['把热爱带进日常，和寻艾一起成长。','从一次交流开始，探索与寻艾的合作可能。','连接不同市场，让寻艾走进更多人的日常。'][index]}</p><p class="xo-role-contact">${roleContact(index)}</p><nav aria-label="其他联系入口">${titles.map((title,i)=>`<a class="route-link" href="#/about/${paths[i]}" ${i===index?'aria-current="page"':''}>${title}</a>`).join('')}</nav></aside><form class="xo-form" novalidate><h2>${index===0?'整理你的求职介绍':'整理你的合作意向'}</h2><p class="xo-form-note">标 * 为必填。此表单仅帮助整理沟通内容，不会上传或保存。整理后可复制内容，或使用自己的邮件应用发送至官方邮箱。</p><div class="xo-fields">${field('name','姓名')}${field('email','联系邮箱','email')}${field('phone','联系电话','tel',false)}${extra}<label class="xo-field xo-field-wide"><span>${index===0?'个人介绍':'合作需求'} *</span><textarea name="message" rows="5" required maxlength="3000"></textarea><small class="xo-error"></small></label></div><button class="pill-button" type="submit">整理沟通内容</button><p class="xo-form-status" role="status"></p><section class="xo-ready" hidden aria-labelledby="xo-ready-title"><h3 id="xo-ready-title">沟通内容已整理，尚未发送</h3><label class="xo-field"><span>可复制的沟通内容</span><textarea data-ready-copy rows="9" readonly></textarea></label><div class="xo-ready-actions"><button type="button" class="filter-button" data-copy-ready>复制内容</button><a class="pill-button" data-ready-mail href="mailto:${inboxes[index]}">打开邮件应用</a></div><p>请在邮件应用中确认收件人与内容后自行发送。企业邮箱：<a href="mailto:${inboxes[index]}">${inboxes[index]}</a></p><p class="xo-copy-status" role="status"></p></section></form></div></div>`;
 }
 const newsSection=()=>`<section class="xo-news xo-original-news" id="news"><header><h2>品牌动态</h2></header><div class="xo-news-group">${news.map(([photo,title])=>`<article class="xo-story">${img(photo,title)}<h3>${title}</h3></article>`).join('')}</div><div class="xo-news-more"><a class="xu-detail-link" href="https://mp.weixin.qq.com/mp/profile_ext?action=home&amp;__biz=Mzk0MDYxMzUxOQ==&amp;scene=124" target="_blank" rel="noopener noreferrer" aria-label="前往公众号阅读（新窗口打开）">前往公众号阅读<span aria-hidden="true">↗</span></a></div></section>`;
 const joinSection=()=>`<section class="xo-join" id="join" aria-label="加入与合作"><a class="xo-join-card route-link" href="#/franchise">${img(photos[0],'寻艾品牌团队')}<h2>加盟 / 产品代理</h2></a><a class="xo-join-card route-link" href="#/production/apply">${img(photos[1],'艾艾贴研发与生产')}<h2>生产合作</h2></a><a class="xo-join-card route-link" href="#/about/business">${img(photos[2],'集团业务合作')}<h2>合作与招聘</h2></a></section>`;
 return {
  render(page){
   const index=paths.indexOf(page.split('/').pop());if(index>=0)return form(index);
   return `<div class="xo-page xo-contact-original"><h1 class="xo-page-title">联系我们</h1><section class="xo-hero"><div class="xo-hero-photo">${img('imgRectangle53','东元集团团队合影',true)}</div></section><div class="xo-content">${newsSection()}${joinSection()}</div></div>`;
  },
  mount(main,page){
   const form=main.querySelector('.xo-form');
   const cleanup=()=>{};
   if(!form)return cleanup;
   const index=paths.indexOf(page.split('/').pop());
   const validate=input=>{
    const invalid=!input.validity.valid||(input.required&&!input.value.trim());
    input.setAttribute('aria-invalid',String(invalid));
    input.parentElement.querySelector('.xo-error').textContent=invalid?(input.validity.typeMismatch?'请填写有效的'+(input.type==='email'?'邮箱地址':'链接'):'请填写此项'):'';
    return invalid;
   };
   form.querySelectorAll('input[name],textarea[name]').forEach(input=>{
    const error=input.parentElement.querySelector('.xo-error');error.id='xo-error-'+input.name;input.setAttribute('aria-describedby',error.id);
    input.addEventListener('blur',()=>validate(input));
   });
   const ready=form.querySelector('.xo-ready'),copy=ready.querySelector('[data-ready-copy]');
   form.addEventListener('input',()=>{ready.hidden=true;form.querySelector('.xo-form-status').textContent=''});
   form.addEventListener('submit',event=>{
    event.preventDefault();let first;
    form.querySelectorAll('input[name],textarea[name]').forEach(input=>{if(validate(input)&&!first)first=input});
    form.querySelector('.xo-form-status').textContent=first?'请检查标出的必填信息。':'内容已整理，尚未发送。请选择复制内容，或打开邮件应用自行发送。';
    if(first){first.focus();return}
    copy.value=titles[index]+'意向\n'+[...form.querySelectorAll('[name]')].map(input=>input.closest('label').querySelector('span').textContent.replace(/ \*|（选填）/g,'')+'：'+(input.value.trim()||'未填写')).join('\n');
    ready.querySelector('[data-ready-mail]').href='mailto:'+inboxes[index]+'?subject='+encodeURIComponent(titles[index]+'意向')+'&body='+encodeURIComponent(copy.value);
    ready.hidden=false;ready.querySelector('.xo-copy-status').textContent='';copy.focus();
   });
   ready.querySelector('[data-copy-ready]').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(copy.value);ready.querySelector('.xo-copy-status').textContent='内容已复制，尚未发送。'}
    catch{copy.focus();copy.select();ready.querySelector('.xo-copy-status').textContent='请使用系统复制操作复制选中内容，尚未发送。'}
   });
   return cleanup;
  }
 };
})();
