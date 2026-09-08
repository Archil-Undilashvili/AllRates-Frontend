// Only browser assets enter the public directory. Backend, source tools and
// saved upstream payloads must never be published as static downloads.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const out = path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
for (const name of fs.readdirSync(root)) {
  if (/\.html$/.test(name) || ['robots.txt','sitemap.xml','site.webmanifest','favicon.svg','favicon-192.png'].includes(name)) fs.copyFileSync(path.join(root,name),path.join(out,name));
}
for (const name of ['css','js','Logos','assets','articles','official-rates']) fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
let redirects = fs.readFileSync(path.join(root,'_redirects'),'utf8');
for(const [route,page] of [['/','home'],['/rates','rates'],['/official','official'],...['usd-gel','eur-gel','gbp-gel','rub-gel','try-gel'].map(pair=>[`/official-rates/${pair}`,pair])]) {
  redirects = redirects.split('\n').filter(line=>!(line.trim().split(/\s+/)[0]===route && /\s200\s*!?\s*$/.test(line))).join('\n');
  // Exact dynamic routes must precede the legacy official-rates wildcard.
  redirects = `${route} /.netlify/functions/rate-page/${page} 200!\n${redirects}`;
}
fs.writeFileSync(path.join(out,'_redirects'),redirects);
fs.writeFileSync(path.join(out,'release.json'),JSON.stringify({commit:process.env.COMMIT_REF || 'local',builtAt:new Date().toISOString()}));
console.log('Production assets staged; dynamic rate pages use cached server rendering.');
