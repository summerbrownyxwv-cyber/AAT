// Final review additions: local-only store search and complaint form.
window.XunAiReview={mount(main){
 const locations=main.querySelector('#locations');if(!locations)return;
 const header=locations.querySelector('header')||locations.firstElementChild;
 header.insertAdjacentHTML('afterend',`<div class="xr-store-tools"><label for="xr-store-query">查询门店</label><input id="xr-store-query" type="search" placeholder="输入城市、店型或门店名称" autocomplete="off"><p role="status" id="xr-store-result"></p><a href="#xr-complaint" class="xu-action-link" id="xr-complaint-open">投诉疑似冒用品牌门店<span aria-hidden="true">↗</span></a></div>`);
 const input=locations.querySelector('input'),rows=[...locations.querySelectorAll('[data-store-id]')],status=locations.querySelector('#xr-store-result');
 const filter=()=>{const query=input.value.trim().toLocaleLowerCase();let count=0;for(const row of rows){const text=row.textContent+row.closest('.xs-location-group').querySelector('h3').textContent;row.hidden=!text.toLocaleLowerCase().includes(query);if(!row.hidden)count++;}locations.querySelectorAll('.xs-city-book,.xs-store-subgroup').forEach(group=>{group.hidden=![...group.querySelectorAll('[data-store-id]')].some(row=>!row.hidden);group.open=!!query&&!group.hidden;});locations.querySelectorAll('.xs-location-group').forEach(g=>g.hidden=![...g.querySelectorAll('[data-store-id]')].some(d=>!d.hidden));status.textContent=query?(count?`找到 ${count} 条记录。`:'未找到匹配门店，请尝试城市或店型。') :'';};input.addEventListener('input',filter);
 // Group the existing roster by city on every screen size.
 const lists=[...locations.querySelectorAll('[data-store-cities]')].map(list=>({list,items:[...list.children]}));
 const groupCities=()=>{
  for(const {list,items} of lists){
   const cities=new Map();
   for(const row of items){const city=row.querySelector('.xs-city').textContent;if(!cities.has(city))cities.set(city,[]);cities.get(city).push(row);}
   list.replaceChildren();
   for(const [city,stores] of cities){
    stores.sort((a,b)=>Number(b.dataset.storeType==='直营店')-Number(a.dataset.storeType==='直营店'));
    const book=document.createElement('details');book.className='site-disclosure xs-city-book xu-disclosure';
    book.innerHTML=`<summary><span class="xs-city">${city}</span><span class="xu-toggle-icon" aria-hidden="true"></span></summary><div></div>`;
    book.lastElementChild.append(...stores);list.append(book);
   }
  }
  filter();
 };
 groupCities();
 locations.insertAdjacentHTML('beforeend',`<dialog class="xr-complaint service-dialog" aria-labelledby="xr-complaint-title"><div class="dialog-shell"><div class="dialog-head"><p>官方验证 / 投诉</p><button type="button" class="icon-button" data-xr-close aria-label="关闭投诉表单">×</button></div><h2 id="xr-complaint-title">反馈疑似冒用品牌门店</h2><p class="xr-note">【投诉接收渠道待补充】当前仅供表单预览，不上传或保存信息。</p><form class="xr-form" novalidate><div class="xr-fields">${[['store','门店名称','text'],['city','所在城市 / 地址','text'],['contact','联系邮箱','email']].map(([name,label,type])=>`<label class="xr-field"><span>${label} *</span><input name="${name}" type="${type}" required maxlength="200" ${name==='contact'?'autocomplete="email"':''} aria-describedby="xr-error-${name}"><small id="xr-error-${name}"></small></label>`).join('')}<label class="xr-field xr-wide"><span>情况说明 *</span><textarea name="message" rows="5" maxlength="3000" required aria-describedby="xr-error-message"></textarea><small id="xr-error-message"></small></label></div><button class="pill-button" type="submit">检查填写内容</button><p role="status" class="xr-status"></p></form></div></dialog>`);
 const dialog=locations.querySelector('dialog'),open=locations.querySelector('#xr-complaint-open');open.addEventListener('click',e=>{e.preventDefault();dialog.showModal()});dialog.querySelector('[data-xr-close]').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>open.focus({preventScroll:true}));
 const form=dialog.querySelector('form'),fields=[...form.querySelectorAll('input,textarea')];const validate=field=>{const invalid=!field.value.trim()||!field.validity.valid;field.setAttribute('aria-invalid',String(invalid));dialog.querySelector('#xr-error-'+field.name).textContent=invalid?(field.type==='email'?'请填写有效的联系邮箱。':'请填写此项。'):'';return !invalid;};fields.forEach(f=>f.addEventListener('blur',()=>validate(f)));form.addEventListener('submit',e=>{e.preventDefault();const invalid=fields.filter(f=>!validate(f));dialog.querySelector('.xr-status').textContent=invalid.length?'请检查标出的填写项。':'填写检查通过。接收渠道待补充，本次未发送或保存信息。';invalid[0]?.focus()});
}};
