const fs=require('node:fs');
const path=require('node:path');
const {parseHTML}=require('linkedom');
const ROOT=process.env.ALLRATES_ROOT || path.resolve(__dirname,'..');
function optimize(html) {
  let manifest;
  try{manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'seo/assets-manifest.json'),'utf8'));}catch{return html;}
  const {document}=parseHTML(html);
  const fontUrl='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Georgian:wght@400;500;600;700;800;900&display=swap';
  document.querySelectorAll('link[href^="https://fonts.googleapis.com/css"]').forEach(el=>el.remove());
  const font=document.createElement('link');font.rel='stylesheet';font.href=fontUrl;document.head.prepend(font);
  for(const origin of ['https://fonts.googleapis.com','https://fonts.gstatic.com'])if(!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)){const link=document.createElement('link');link.rel='preconnect';link.href=origin;if(origin.includes('gstatic'))link.setAttribute('crossorigin','');document.head.prepend(link);}
  for(const node of document.querySelectorAll('.home-section[onclick],.forex-rate-link')) {
    let href;
    if(node.dataset.forexPair) href=`/analytics?category=forex&asset=${encodeURIComponent(node.dataset.forexPair)}#asset-chart-title`;
    else href=node.getAttribute('onclick')?.match(/location.href='([^']+)'/)?.[1];
    if(!href)continue;
    const link=document.createElement('a');
    for(const attribute of node.attributes)link.setAttribute(attribute.name,attribute.value);
    link.removeAttribute('onclick');link.removeAttribute('role');link.removeAttribute('tabindex');
    link.setAttribute('href',href);link.style.textDecoration='none';link.style.color='inherit';
    link.append(...node.childNodes);node.replaceWith(link);
  }
  document.querySelectorAll('a[href="/valutis-kursebi-dges"]').forEach(a=>a.setAttribute('href','/official'));
  const homeTitle=document.querySelector('.home-card-title-h1');
  if(homeTitle && !homeTitle.querySelector('.visually-hidden')) {
    const prefix=document.createElement('span');prefix.className='visually-hidden';prefix.textContent='ვალუტის ';
    const suffix=document.createElement('span');suffix.className='visually-hidden';suffix.textContent=' — დღეს საქართველოში';
    homeTitle.prepend(prefix);homeTitle.append(suffix);
  }
  if(document.querySelector('[data-analytics-page]')) {
    const heading=document.querySelector('h2#asset-chart-title');
    if(heading){const h1=document.createElement('h1');for(const attribute of heading.attributes)h1.setAttribute(attribute.name,attribute.value);h1.append(...heading.childNodes);heading.replaceWith(h1);}
  }
  for(const node of document.querySelectorAll('script[src],link[rel="stylesheet"][href]')) {
    const attr=node.localName==='script'?'src':'href';
    let original=node.getAttribute('data-source')||node.getAttribute(attr).split('?')[0];
    if(!original.startsWith('/')&&!original.startsWith('http'))original='/'+original;
    if(manifest.assets[original]) {
      node.setAttribute('data-source',original);node.setAttribute(attr,manifest.assets[original]);
      if(node.localName==='script')node.setAttribute('defer','');
    }
  }
  for(const img of document.querySelectorAll('img')) {
    const source=img.getAttribute('data-original-src')||img.getAttribute('src');
    const meta=manifest.images[source];if(!meta)continue;
    const tile=!!img.closest('.article-tile');
    img.setAttribute('data-original-src',source);
    img.setAttribute('src',meta.variants[tile?0:meta.variants.length-1].src);
    img.setAttribute('srcset',meta.variants.map(v=>`${v.src} ${v.width}w`).join(', '));
    img.setAttribute('sizes',tile?'(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 25vw':'(max-width: 900px) 100vw, 900px');
    img.setAttribute('width',meta.width);img.setAttribute('height',meta.height);
    img.setAttribute('decoding','async');
  }
  return document.toString().replace(/[\t ]+$/gm,'');
}
module.exports={optimize};
