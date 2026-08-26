import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const out='dist';
const site='https://newyorkhut.com';
const order='https://nyhut.com';
const errors=[];

async function walk(dir){
  const items=await readdir(dir);
  const files=[];
  for(const item of items){
    const p=join(dir,item); const s=await stat(p);
    if(s.isDirectory()) files.push(...await walk(p)); else files.push(p);
  }
  return files;
}

const files=await walk(out);
const htmlFiles=files.filter(f=>f.endsWith('.html'));
for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
  const rel=file.replace(/^dist\/?/,'');
  if(!/<link rel="canonical" href="https:\/\/newyorkhut\.com\//.test(html)) errors.push(`${rel}: missing NewYorkHUT canonical`);
  if(!html.includes(order) && !rel.includes('404')) errors.push(`${rel}: missing NYHUT.com conversion link`);
  if(/<form[^>]+action=["']https?:\/\/newyorkhut\.com/i.test(html)) errors.push(`${rel}: transactional form detected on educational site`);
  if(/application\/ld\+json/.test(html) && /"@type":"(Product|Offer)"/.test(html)) errors.push(`${rel}: transactional Product/Offer schema detected`);
  if((html.match(/<footer>/g)||[]).length!==1) errors.push(`${rel}: expected exactly one footer`);
  if(/permit assistance|permit services|private permit assistance|credential assistance/i.test(html)) errors.push(`${rel}: competing commercial language detected`);
  if(/href=["']\/(services|order|checkout|customer-portal)(\/|["'])/i.test(html)) errors.push(`${rel}: local transactional route detected`);
}

const homepage=await readFile(join(out,'index.html'),'utf8');
if(!homepage.includes('<link rel="canonical" href="https://newyorkhut.com/">')) errors.push('index.html: homepage canonical must use the slash URL');
if(!homepage.includes('Compliance University™')) errors.push('index.html: missing Compliance University parent-brand relationship');
if(!homepage.includes('NYHUT.com handles ordering, payment, customer accounts, and permit delivery')) errors.push('index.html: missing explicit transactional boundary');

const notFound=await readFile(join(out,'404.html'),'utf8');
if(!notFound.includes('<meta name="robots" content="noindex,follow">')) errors.push('404.html: missing noindex directive');

const redirects=await readFile(join(out,'_redirects'),'utf8');
for(const obsolete of ['/new-york-hut-guide ','/cost/tax-calculation ','/tools/hut-permit-requirement ']){
  if(!redirects.includes(obsolete)) errors.push(`_redirects: missing obsolete URL ${obsolete.trim()}`);
}

const sitemap=await readFile(join(out,'sitemap.xml'),'utf8');
const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
if(locs.length!==new Set(locs).size) errors.push('sitemap.xml: duplicate URLs');
for(const loc of locs){ if(!loc.startsWith(site+'/')) errors.push(`sitemap.xml: non-NewYorkHUT URL ${loc}`); }

if(errors.length){
  console.error(`Validation failed (${errors.length})`);
  for(const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`Validation passed: ${htmlFiles.length} HTML files, ${locs.length} sitemap URLs, NYHUT conversion boundary intact.`);
