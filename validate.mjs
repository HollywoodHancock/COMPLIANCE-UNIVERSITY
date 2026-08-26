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
