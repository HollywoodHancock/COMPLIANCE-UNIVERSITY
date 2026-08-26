import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderArticle } from './seo-wave2.mjs';

const out = 'dist';
const site = 'https://newyorkhut.com';
const updated = '2026-08-26';

const page = {
  slug: 'temporary-vs-permanent-ny-hut-wizard',
  title: 'Temporary vs Permanent NY HUT Registration Wizard',
  desc: 'Compare the temporary HUT trip-certificate path with permanent New York HUT registration using vehicle weight and operating-frequency questions.',
  category: 'Decision Tools',
  body: `<p>Use this educational wizard to identify the HUT credential path that deserves closer review. It does not determine every exemption, exclusion, unloaded-weight election, or unusual operating arrangement.</p>
  <div class="calc" id="hut-wizard">
    <label for="wizard-weight">Vehicle or combination gross weight (lbs)</label>
    <input id="wizard-weight" type="number" min="0" placeholder="Example: 26000">
    <label for="wizard-frequency">How often will this vehicle operate in New York?</label>
    <select id="wizard-frequency"><option value="">Select one</option><option value="once">One isolated trip</option><option value="occasional">Occasional trips</option><option value="regular">Regular or recurring operation</option></select>
    <label for="wizard-trips">How many New York HUT trip certificates has the carrier already obtained this calendar year?</label>
    <input id="wizard-trips" type="number" min="0" max="99" value="0">
    <label for="wizard-fuel">Is the vehicle or attached equipment transporting automotive fuel?</label>
    <select id="wizard-fuel"><option value="no">No</option><option value="yes">Yes</option></select>
    <label for="wizard-lease">Is this vehicle leased for more than 30 consecutive days?</label>
    <select id="wizard-lease"><option value="no">No / not leased</option><option value="yes">Yes</option></select>
    <label for="wizard-ny-days">If leased more than 30 days, will it operate in New York for more than 10 days?</label>
    <select id="wizard-ny-days"><option value="no">No / not applicable</option><option value="yes">Yes</option></select>
    <button type="button" onclick="runHutWizard()">Compare credential paths</button>
    <div id="wizard-result" class="result" aria-live="polite"></div>
  </div>
  <script>
  function runHutWizard(){
    const weight=Number(document.getElementById('wizard-weight').value||0);
    const frequency=document.getElementById('wizard-frequency').value;
    const trips=Number(document.getElementById('wizard-trips').value||0);
    const fuel=document.getElementById('wizard-fuel').value==='yes';
    const longLease=document.getElementById('wizard-lease').value==='yes';
    const manyNyDays=document.getElementById('wizard-ny-days').value==='yes';
    const result=document.getElementById('wizard-result');
    result.style.display='block';
    if(!weight||!frequency){result.innerHTML='<strong>Complete the weight and operating-frequency questions.</strong>';return}
    if(weight<=18000){result.innerHTML='<strong>Generally below the main gross-weight registration threshold.</strong><br>The vehicle may not require HUT under the general gross-weight rule. Confirm excluded/exempt status and whether the carrier has elected the unloaded-weight method before relying on this result.';return}
    if(fuel){result.innerHTML='<strong>Permanent AFC/HUT review is needed.</strong><br>The ordinary HUT trip-certificate path is not available for vehicles or attached devices transporting automotive fuel in the circumstances identified by New York. Review the applicable AFC credential requirements.';return}
    if(longLease&&manyNyDays){result.innerHTML='<strong>Permanent registration deserves priority review.</strong><br>For a lease longer than 30 consecutive days with more than 10 days of New York operation, New York generally requires the lessee to obtain a certificate and decal.';return}
    if(trips>=10){result.innerHTML='<strong>Permanent registration review is the practical next step.</strong><br>The carrier has reached New York\'s maximum of ten HUT trip certificates during a calendar year.';return}
    if(frequency==='regular'){result.innerHTML='<strong>Permanent HUT registration is likely the better path.</strong><br>Recurring New York operation does not fit the occasional-use purpose of trip certificates and creates ongoing mileage-record and return-filing considerations.';return}
    result.innerHTML='<strong>A HUT trip certificate may fit this occasional trip.</strong><br>The certificate is valid until midnight of the third day after issuance, cannot be extended for weekends or holidays, and counts toward the ten-per-calendar-year limit. Permanent registration may still be preferable if New York operations will continue.';
  }
  </script>
  <h2>How the two paths differ</h2>
  <table><thead><tr><th>Question</th><th>Trip certificate</th><th>Permanent registration</th></tr></thead><tbody><tr><td>Best suited for</td><td>Occasional New York operation</td><td>Regular or recurring operation</td></tr><tr><td>Validity</td><td>Until midnight of the third day after issuance</td><td>Until expiration, suspension, revocation, surrender, or replacement series</td></tr><tr><td>Calendar-year limit</td><td>Maximum ten per carrier</td><td>No trip-certificate count</td></tr><tr><td>HUT return for covered miles</td><td>Not required for the covered period</td><td>Ongoing returns generally required</td></tr><tr><td>Recordkeeping</td><td>Keep certificate copies at least four years</td><td>Maintain mileage, vehicle, and return support</td></tr></tbody></table>
  <h2>Use the result as a screening decision</h2><p>Before operating, confirm the current New York rule for the actual vehicle, weight method, commodity, lease, and exemption facts. The wizard intentionally routes uncertain or recurring cases toward closer credential review.</p>`
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
const card = `<div class="card tool-card"><div class="card-top"><span class="card-icon">T/P</span><span class="card-number">04</span></div><div class="eyebrow">Decision wizard</div><h3>Temporary vs Permanent NY HUT</h3><p>Compare occasional-trip and recurring-operation paths before choosing a credential.</p><a href="/${page.slug}/">Start the wizard →</a></div>`;
home = home.replace('</div></div></section><section class="section authority-strip">', `${card}</div></div></section><section class="section authority-strip">`);
home = home.replace('<strong>28</strong><span>Focused authority pages</span>', '<strong>29</strong><span>Guides and decision tools</span>');
await writeFile(homePath, home);

console.log('Added temporary-vs-permanent registration wizard.');
