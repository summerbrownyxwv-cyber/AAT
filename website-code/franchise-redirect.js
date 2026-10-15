const [route, anchor] = location.hash.slice(1).split('?anchor=');
const target = route === '/franchise' ? './service.html#/franchise' : './contact.html#/franchise/apply';
location.replace(target + (anchor ? `?anchor=${encodeURIComponent(anchor)}` : ''));
