// This page prepares an enquiry locally; users contact the official channels themselves.
let formState = {}, liveRegion, formRoot, productionForm = false;
function formTemplate(step = 1) {
  if (step === 3) {
    const phone = productionForm ? '13476850503' : '4009315728';
    return `<div class="form-success" tabindex="-1"><h3>意向已整理，尚未发送</h3><p>本页不会发送或保存填写内容。你可以复制下方内容，通过官方电话沟通，或在自己的邮件应用中确认后发送。</p><label class="field form-summary-label">意向摘要<textarea data-form-summary rows="9" readonly></textarea></label><div class="form-ready-actions"><button class="filter-button" type="button" data-form-copy>复制意向内容</button><a class="pill-button" href="tel:${phone}">${productionForm ? '联系严总：13476850503' : '加盟咨询：4009-315-728'}</a><a class="filter-button" data-form-mail href="mailto:aat@dongyuanjt.com">打开邮件应用</a></div><p>企业邮箱：<a href="mailto:aat@dongyuanjt.com">aat@dongyuanjt.com</a></p><p data-form-copy-status role="status"></p><div class="form-actions"><button class="filter-button" type="button" data-form-back>返回修改</button><button class="filter-button" type="button" data-form-restart>重新填写</button></div></div>`;
  }
  if (step === 2) {
    return `<form class="prototype-form" data-step="2" novalidate>
      <p class="form-progress">第 2 步 / 合作意向</p>
      <div class="form-grid">
        ${productionForm ? `<label class="field">合作类型 *<select name="cooperation_type" required><option value="">请选择</option><option>OEM研发</option><option>ODM定制</option><option>暂不确定</option></select></label>
        <label class="field">意向产品 *<input name="product" required maxlength="150" placeholder="希望合作的产品" /></label>` : `<label class="field">意向店型 *<select name="store_type" required><option value="">请选择</option><option>标准店</option><option>黑金店</option><option>暂不确定</option></select></label>
        <label class="field">意向区域 *<input name="area" required maxlength="150" placeholder="城市 / 商圈" /></label>`}
        <label class="field span-2">${productionForm ? '补充需求（选填）' : '补充说明（选填）'}<textarea name="note" maxlength="3000" placeholder="补充你希望了解的内容"></textarea></label>
      </div>
      <div class="form-actions"><button class="filter-button" type="button" data-form-back>返回</button><button class="pill-button" type="submit">生成意向摘要</button></div>
    </form>`;
  }
  return `<form class="prototype-form" data-step="1" novalidate>
    <p class="form-progress">第 1 步 / 基本信息 · 标 * 为必填</p>
    <div class="form-grid">
      <label class="field">姓名 *<input name="name" required autocomplete="name" maxlength="100" /></label>
      <label class="field">联系电话 *<input name="phone" type="tel" inputmode="tel" required autocomplete="tel" maxlength="40" /></label>
      <label class="field span-2">所在城市 *<input name="city" required autocomplete="address-level2" maxlength="100" /></label>
    </div>
    <div class="form-actions"><span></span><button class="pill-button" type="submit">下一步</button></div>
  </form>`;
}

function mountForm(step) {
  const mount = formRoot?.querySelector('[data-form-mount]');
  if (!mount) return;
  mount.innerHTML = formTemplate(step);
  mount.querySelectorAll('[name]').forEach(control => {
    if (formState[control.name] !== undefined) control.value = formState[control.name];
  });
  const form = mount.querySelector('form');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!validateForm(form)) return;
      form.querySelectorAll('[name]').forEach(control => { formState[control.name] = control.value.trim(); });
      mountForm(step + 1);
      mount.querySelector('input, select, .form-success')?.focus();
    });
  }
  if (step === 3) {
    const labels = { name: '姓名', phone: '联系电话', city: '所在城市', cooperation_type: '合作类型', product: '意向产品', store_type: '意向店型', area: '意向区域', note: '补充说明' };
    const title = productionForm ? '生产合作意向' : '寻艾加盟意向';
    const summary = title + '\n' + Object.entries(formState).map(([name,value]) => labels[name] + '：' + (value || '未填写')).join('\n');
    const textarea = mount.querySelector('[data-form-summary]');
    textarea.value = summary;
    mount.querySelector('[data-form-mail]').href = 'mailto:aat@dongyuanjt.com?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(summary);
    mount.querySelector('[data-form-copy]').addEventListener('click', async () => {
      const status = mount.querySelector('[data-form-copy-status]');
      try { await navigator.clipboard.writeText(summary); status.textContent = '意向内容已复制，尚未发送。'; }
      catch { textarea.focus(); textarea.select(); status.textContent = '请使用系统复制操作复制选中内容，尚未发送。'; }
    });
    liveRegion.textContent = '意向摘要已生成，尚未发送。请通过官方电话或邮箱联系。';
  }
  mount.querySelector('[data-form-back]')?.addEventListener('click', () => {
    mount.querySelectorAll('[name]').forEach(control => { formState[control.name] = control.value; });
    mountForm(step - 1);
    mount.querySelector('input, select')?.focus();
  });
  mount.querySelector('[data-form-restart]')?.addEventListener('click', () => {
    formState = {};
    liveRegion.textContent = '';
    mountForm(1);
    mount.querySelector('input')?.focus();
  });
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('.field').forEach((field, index) => {
    field.classList.remove('has-error');
    field.querySelector('.field-error')?.remove();
    const input = field.querySelector('input, select, textarea');
    if (input && (!input.validity.valid || (input.required && !input.value.trim()))) {
      valid = false;
      field.classList.add('has-error');
      const error = document.createElement('span');
      error.className = 'field-error';
      error.id = `field-error-${index}`;
      error.textContent = '请完成此项后继续';
      field.append(error);
      input.setAttribute('aria-describedby', error.id);
      input.setAttribute('aria-invalid', 'true');
    } else if (input) {
      input.removeAttribute('aria-describedby');
      input.removeAttribute('aria-invalid');
    }
  });
  liveRegion.textContent = valid ? '' : '表单中有未完成的必填项';
  if (!valid) form.querySelector('.has-error input, .has-error select')?.focus();
  return valid;
}

export function mountFranchiseForm(main, production = false) {
  productionForm = production;
  formRoot = main;
  formState = {};
  liveRegion = document.createElement('div');
  liveRegion.className = 'live-region';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  main.append(liveRegion);
  mountForm(1);
  return () => {
    formState = {};
    formRoot = null;
    productionForm = false;
    liveRegion.remove();
  };
}
