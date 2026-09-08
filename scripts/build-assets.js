const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const esbuild = require('esbuild');
const ROOT = path.resolve(__dirname, '..');
async function main() {
  const articles=JSON.parse(fs.readFileSync(path.join(ROOT,'content/articles.json'),'utf8'));
  const imagePaths=new Set(articles.map(a=>a.image));
  for(const article of articles) for(const m of (article.body||article.html||'').matchAll(/<img[^>]+src="([^"]+)"/g)) if(m[1].startsWith('/Logos/')) imagePaths.add(m[1]);
  const manifest={images:{},assets:{}};
  fs.mkdirSync(path.join(ROOT,'assets/optimized'),{recursive:true});
  let originalBytes=0, thumbnailBytes=0;
  for(const src of imagePaths) {
    const input=path.join(ROOT,src);
    if(!fs.existsSync(input))continue;
    const buffer=fs.readFileSync(input), meta=await sharp(buffer).metadata();
    const hash=crypto.createHash('sha256').update(buffer).digest('hex').slice(0,10);
    const stem=path.basename(src,path.extname(src));
    const widths=[...new Set([640,1280,meta.width].map(w=>Math.min(w,meta.width)))].sort((a,b)=>a-b);
    const variants=[];
    for(const width of widths) {
      const output=`/assets/optimized/${stem}-${hash}-${width}.webp`;
      if(!fs.existsSync(path.join(ROOT,output))) await sharp(buffer).resize({width,withoutEnlargement:true}).webp({quality:92,effort:6}).toFile(path.join(ROOT,output));
      variants.push({src:output,width});
    }
    manifest.images[src]={width:meta.width,height:meta.height,variants};
    originalBytes+=buffer.length;thumbnailBytes+=fs.statSync(path.join(ROOT,variants[0].src)).size;
  }
  const sourceAssets=['css/style.css','css/pair-pages.css','js/main.js','js/pair-page.js','js/pair-comparison.js','js/header-controller.js','js/footer-controller.js'];
  for(const source of sourceAssets) {
    const loader=source.endsWith('.css')?'css':'js';
    let input=fs.readFileSync(path.join(ROOT,source),'utf8');
    if(source==='css/style.css')input=input.replace(/^@import url\('https:\/\/fonts.googleapis.com[^']+'\);\s*/, '');
    const result=await esbuild.transform(input,{loader,minify:true,target:loader==='js'?'es2020':undefined,legalComments:'eof'});
    const hash=crypto.createHash('sha256').update(result.code).digest('hex').slice(0,10);
    const out=`/assets/optimized/${path.basename(source,path.extname(source))}-${hash}.min.${loader}`;
    fs.writeFileSync(path.join(ROOT,out),result.code);
    manifest.assets['/'+source]=out;
  }
  const chart=fs.readFileSync(path.join(ROOT,'node_modules/chart.js/dist/chart.umd.min.js'));
  const hash=crypto.createHash('sha256').update(chart).digest('hex').slice(0,10);
  const chartPath=`/assets/optimized/chart-${hash}.min.js`;
  fs.writeFileSync(path.join(ROOT,chartPath),chart);
  manifest.assets['https://cdn.jsdelivr.net/npm/chart.js']=chartPath;
  fs.writeFileSync(path.join(ROOT,'seo/assets-manifest.json'),JSON.stringify(manifest,null,2));
  console.log(`Optimized ${imagePaths.size} images: ${(originalBytes/1048576).toFixed(2)} MB originals → ${(thumbnailBytes/1048576).toFixed(2)} MB thumbnails. Originals retained.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
