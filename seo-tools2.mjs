import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderArticle } from './seo-tools.mjs';

const out = 'dist';
const site = 'https://newyorkhut.com';
const updated = '2026-08-26';

const page = {
  slug: 'ny-hut-filing-deadline-calculator',
  title: 'NY HUT Filing Deadline Calculator',
  desc: 'Calculate the standard Form MT-903 due date for a monthly, quarterly, or annual New York Highway Use Tax reporting period.',
  category: 'Filing Tools',
  body: `<p>Choose the filing frequency and reporting period shown on the carrier's current New York account notice. This calculator applies the standard Form MT-903 rule: the return is due on the last day of the month following the reporting period.</p>
  <div class="calc" id="deadline-calculator">
    <label for="deadline-frequency">Filing frequency</label>
    <select id="deadline-frequency" onchange="showDeadlineFields()"><option value="quarterly">Quarterly</option><option value="monthly">Monthly</option><option value="annual">Annual</option></select>
    <label for="deadline-year">Reporting year</label>
    <input id="deadline-year" type="number" min="2022" max="2100" value="2026">
    <div id="deadline-month-wrap" style="display:none"><label for="deadline-month">Reporting month</label><select id="deadline-month"><option value="0">January</option><option value="1">February</option><option value="2">March</option><option value="3">April</option><option value="4">May</option><option value="5">June</option><option value="6">July</option><option value="7">August</option><option value="8">September</option><option value="9">October</option><option value="10">November</option><option value="11">December</option></select></div>
    <div id="deadline-quarter-wrap"><label for="deadline-quarter">Reporting quarter</label><select id="deadline-quarter"><option value="1">January 1–March 31</option><option value="2">April 1–June 30</option><option value="3">July 1–September 30</option><option value="4">October 1–December 31</option></select></div>
    <button type="button" onclick="calculateHutDeadline()">Calculate due date</button>
    <div id="deadline-result" class="result" aria-live="polite"></div>
  </div>
  <script>
  function showDeadlineFields(){
    const frequency=document.getElementById('deadline-frequency').value;
    document.getElementById('deadline-month-wrap').style.display=frequency==='monthly'?'block':'none';
    document.getElementById('deadline-quarter-wrap').style.display=frequency==='quarterly'?'block':'none';
  }
  function calculateHutDeadline(){
    const frequency=document.getElementById('deadline-frequency').value;
    const year=Number(document.getElementById('deadline-year').value);
    const result=document.getElementById('deadline-result');
    result.style.display='block';
    if(!year||year<2022){result.innerHTML='<strong>Enter a reporting year of 2022 or later.</strong>';return}
    let due;
    let period;
    if(frequency==='monthly'){
      const month=Number(document.getElementById('deadline-month').value);
      due=new Date(year,month+2,0,12);
      period=new Date(year,month,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
    }else if(frequency==='quarterly'){
      const quarter=Number(document.getElementById('deadline-quarter').value);
      const endMonth=quarter*3-1;
      due=new Date(year,endMonth+2,0,12);
      period='Quarter '+quarter+' of '+year;
    }else{
      due=new Date(year+1,0,31,12);
      period='Calendar year '+year;
    }
    const statutory=new Date(due);
    let weekendShift=false;
    if(due.getDay()===6){due.setDate(due.getDate()+2);weekendShift=true}
    if(due.getDay()===0){due.setDate(due.getDate()+1);weekendShift=true}
    const format=(date)=>date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    result.innerHTML='<strong>'+period+' is due '+format(due)+'.</strong><br>'+(weekendShift?'The standard month-end date ('+format(statutory)+') falls on a weekend, so this result moves it to Monday. ':'')+'If this date is a New York legal holiday, the deadline moves to the next business day. Confirm the current Tax Department holiday calendar before filing.';
  }
  showDeadlineFields();
  </script>
  <h2>Standard filing schedules</h2>
  <table><thead><tr><th>Frequency</th><th>Reporting period</th><th>Standard deadline</th></tr></thead><tbody><tr><td>Monthly</td><td>Each calendar month</td><td>Last day of the following month</td></tr><tr><td>Quarterly</td><td>January–March</td><td>April 30</td></tr><tr><td>Quarterly</td><td>April–June</td><td>July 31</td></tr><tr><td>Quarterly</td><td>July–September</td><td>October 31</td></tr><tr><td>Quarterly</td><td>October–December</td><td>January 31 of the following year</td></tr><tr><td>Annual</td><td>January–December</td><td>January 31 of the following year</td></tr></tbody></table>
  <h2>Which frequency should you select?</h2><p>New accounts generally begin quarterly unless New York assigns a different frequency. The Tax Department reviews prior-year HUT liability and notifies carriers when their filing frequency changes. Use the frequency assigned to the account rather than selecting one solely from an estimated tax amount.</p>
  <h2>No activity does not automatically eliminate the return</h2><p>A carrier issued a permanent certificate of registration generally must file the HUT return even when no tax is due. A valid HUT trip certificate follows different rules for its covered period.</p>`
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
const card = `<div class="card tool-card"><div class="card-top"><span class="card-icon">DUE</span><span class="card-number">05</span></div><div class="eyebrow">Filing calculator</div><h3>NY HUT Filing Deadline</h3><p>Calculate the standard MT-903 due date for monthly, quarterly, or annual reporting.</p><a href="/${page.slug}/">Calculate a deadline →</a></div>`;
home = home.replace('</div></div></section><section class="section authority-strip">', `${card}</div></div></section><section class="section authority-strip">`);
home = home.replace('<strong>29</strong><span>Guides and decision tools</span>', '<strong>30</strong><span>Guides and decision tools</span>');
await writeFile(homePath, home);

console.log('Added NY HUT filing deadline calculator.');

export { renderArticle };
