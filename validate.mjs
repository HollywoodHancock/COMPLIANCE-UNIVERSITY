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
  if(/\$(?:1\.50|25)(?!\d)|\b1\.50 per vehicle\b/i.test(html)) errors.push(`${rel}: state-only credential price exposed`);
  if(/permit service compan(?:y|ies) may charge|additional service fee/i.test(html)) errors.push(`${rel}: state-versus-service price comparison detected`);
  if(/OSCAR[^<]{0,80}(?:order|obtain|buy|request)[^<]{0,40}credential|(?:use|visit|go to)[^<]{0,40}OSCAR/i.test(html)) errors.push(`${rel}: self-service OSCAR purchase path promoted`);
}

const homepage=await readFile(join(out,'index.html'),'utf8');
if(!homepage.includes('<link rel="canonical" href="https://newyorkhut.com/">')) errors.push('index.html: homepage canonical must use the slash URL');
if(!homepage.includes('Compliance University™')) errors.push('index.html: missing Compliance University parent-brand relationship');
if(!/NYHUT\.com handles (?:ordering|carrier information), payment, customer accounts, and permit delivery/.test(homepage)) errors.push('index.html: missing explicit transactional boundary');

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

const destinationChecks = [
  ['temporary-ny-hut-permit/index.html', '/order?product=nyhut-temporary&'],
  ['ny-hut-trip-certificate-limits/index.html', '/order?product=nyhut-temporary&'],
  ['ny-hut-decal-replacement/index.html', '/order?product=nyhut-replacement&'],
  ['ny-hut-registration-guide/index.html', '/order?product=nyhut-new&'],
  ['ny-hut-gross-weight-calculator/index.html', '/order?product=nyhut-new&'],
  ['ny-hut-apportioned-vehicles/index.html', '/order?product=nyhut-new&'],
];
for(const [file, expected] of destinationChecks){
  const html=await readFile(join(out,file),'utf8');
  if(!html.includes(`https://nyhut.com${expected}`)) errors.push(`${file}: missing contextual NYHUT destination ${expected}`);
}

for(const page of [
  'ny-hut-mileage-record-requirements',
  'ny-hut-account-closure',
  'ny-hut-certificate-cancellation',
  'ny-hut-filing-frequency-changes',
  'ny-hut-apportioned-vehicles',
]){
  const file = join(out,page,'index.html');
  if(!htmlFiles.includes(file)) errors.push(`${page}: missing third-wave authority page`);
  if(!locs.includes(`${site}/${page}/`)) errors.push(`${page}: missing sitemap URL`);
}

if(errors.length){
  console.error(`Validation failed (${errors.length})`);
  for(const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`Validation passed: ${htmlFiles.length} HTML files, ${locs.length} sitemap URLs, NYHUT conversion boundary intact.`);
