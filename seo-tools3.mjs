import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderArticle } from './seo-tools2.mjs';

const out = 'dist';
const site = 'https://newyorkhut.com';
const updated = '2026-08-26';

const page = {
  slug: 'ny-hut-gross-weight-calculator',
  title: 'NY HUT Gross Weight Calculator',
  desc: 'Calculate the gross weight used for the general New York HUT threshold from power-unit weight, attached-equipment weight, and maximum load.',
  category: 'Weight Tools',
  body: `<p>New York's HUT definition of gross weight is broader than simply reading the empty weight of the power unit. Use this worksheet to combine the vehicle, the heaviest trailer or other device it will draw, and the maximum load it will carry or draw.</p>
  <div class="calc" id="weight-calculator">
    <label for="weight-type">Power-unit type</label>
    <select id="weight-type"><option value="truck">Truck or other self-propelled vehicle</option><option value="tractor">Tractor</option></select>
    <label for="weight-power">Unloaded weight of the power unit (lbs)</label>
    <input id="weight-power" type="number" min="0" placeholder="Example: 12000">
    <label for="weight-trailer">Unloaded weight of the heaviest trailer, semitrailer, dolly, or other device to be drawn (lbs)</label>
    <input id="weight-trailer" type="number" min="0" value="0">
    <label for="weight-load">Maximum load to be carried or drawn (lbs)</label>
    <input id="weight-load" type="number" min="0" value="0">
    <button type="button" onclick="calculateHutWeight()">Calculate HUT gross weight</button>
    <div id="weight-result" class="result" aria-live="polite"></div>
  </div>
  <script>
  function calculateHutWeight(){
    const type=document.getElementById('weight-type').value;
    const power=Number(document.getElementById('weight-power').value||0);
    const trailer=Number(document.getElementById('weight-trailer').value||0);
    const load=Number(document.getElementById('weight-load').value||0);
    const result=document.getElementById('weight-result');
    result.style.display='block';
    if(!power||power<0||trailer<0||load<0){result.innerHTML='<strong>Enter a valid unloaded power-unit weight.</strong>';return}
    const gross=power+trailer+load;
    const formatted=new Intl.NumberFormat('en-US').format(gross);
    const unloadedThreshold=type==='tractor'?4000:8000;
    let message='<strong>Calculated HUT gross weight: '+formatted+' lbs.</strong><br>';
    if(gross>18000){message+='This is above the general 18,000-pound gross-weight threshold, so HUT credential review is indicated unless an exclusion or exemption applies.'}
    else{message+='This is at or below the general 18,000-pound gross-weight threshold.'}
    if(power>unloadedThreshold){message+='<br><br><strong>Unloaded-weight method note:</strong> The power unit exceeds the '+new Intl.NumberFormat('en-US').format(unloadedThreshold)+'-pound unloaded-weight threshold for a '+type+'. If the carrier elects the unloaded-weight method, additional HUT registration and reporting consequences may apply.'}
    result.innerHTML=message;
  }
  </script>
  <h2>New York gross-weight formula</h2>
  <p><strong>Power-unit unloaded weight + heaviest attached-device unloaded weight + maximum load carried or drawn = HUT gross weight.</strong></p>
  <p>The driver and helpers are not included. Special rules apply to tow trucks, including flatbed tow trucks, and this calculator does not attempt to determine those specialized weights.</p>
  <h2>Gross-weight method</h2><p>Under the general gross-weight method, qualifying trucks and tractors with gross weight over 18,000 pounds operating on New York public highways are included, subject to exclusions and exemptions.</p>
  <h2>Unloaded-weight method</h2><p>If the carrier chooses the unloaded-weight method for the calendar year, it generally applies to every truck over 8,000 pounds unloaded weight and every tractor over 4,000 pounds unloaded weight that operates on New York public highways during the reporting period.</p>
  <h2>Use one reporting method consistently</h2><p>The carrier chooses the gross-weight or unloaded-weight method on its first return for the calendar year and generally must use that method for all vehicles and returns during the year.</p>`
};

const path = join(out, page.slug, 'index.html');
await mkdir(dirname(path), { recursive:true });
await writeFile(path, renderArticle(page));

const sitemapPath = join(out, 'sitemap.xml');
let sitemap = await readFile(sitemapPath, 'utf8');
sitemap = sitemap.replace('</urlset>', `  <url><loc>${site}/${page.slug}/</loc><lastmod>${updated}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>\n</urlset>`);
await writeFile(sitemapPath, sitemap);

const homePath = join(out, 'index.html');
let home = await readFile(homePath, 'utf8');
const card = `<div class="card tool-card"><div class="card-top"><span class="card-icon">LBS</span><span class="card-number">06</span></div><div class="eyebrow">Weight calculator</div><h3>NY HUT Gross Weight</h3><p>Combine the power unit, heaviest attached equipment, and maximum load for the HUT threshold.</p><a href="/${page.slug}/">Calculate HUT weight →</a></div>`;
home = home.replace('</div></div></section><section class="section authority-strip">', `${card}</div></div></section><section class="section authority-strip">`);
home = home.replace('<strong>30</strong><span>Guides and decision tools</span>', '<strong>31</strong><span>Guides and decision tools</span>');
await writeFile(homePath, home);

console.log('Added NY HUT gross-weight calculator.');
