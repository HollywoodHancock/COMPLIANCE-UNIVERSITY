import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderArticle } from './seo-tools3.mjs';

const out = 'dist';
const site = 'https://newyorkhut.com';
const updated = '2026-08-26';

const page = {
  slug: 'ny-hut-renewal-calculator',
  title: 'NY HUT Renewal Calculator and Credential Action Checker',
  desc: 'Estimate New York state HUT renewal credential fees and identify whether a vehicle may instead need revision, replacement, or cancellation.',
  category: 'Renewal Tools',
  body: `<p>Use this tool after reviewing the carrier's current New York renewal notice and fleet. It estimates the state certificate-and-decal fee and helps separate renewal vehicles from credentials that require another action.</p>
  <div class="calc" id="renewal-calculator">
    <label for="renewal-active">Active vehicles that should remain in the renewed HUT fleet</label>
    <input id="renewal-active" type="number" min="0" value="1">
    <label for="renewal-removed">Vehicles sold, transferred, junked, or permanently removed from service</label>
    <input id="renewal-removed" type="number" min="0" value="0">
    <label for="renewal-changed">Vehicles with changed plate information or increased gross/unloaded weight</label>
    <input id="renewal-changed" type="number" min="0" value="0">
    <label for="renewal-lost">Vehicles with a lost, mutilated, or destroyed certificate/decal</label>
    <input id="renewal-lost" type="number" min="0" value="0">
    <label for="renewal-notice">Has New York instructed the carrier to renew this credential series?</label>
    <select id="renewal-notice"><option value="yes">Yes</option><option value="no">No / not sure</option></select>
    <button type="button" onclick="calculateHutRenewal()">Review renewal actions</button>
    <div id="renewal-result" class="result" aria-live="polite"></div>
  </div>
  <script>
  function calculateHutRenewal(){
    const active=Number(document.getElementById('renewal-active').value||0);
    const removed=Number(document.getElementById('renewal-removed').value||0);
    const changed=Number(document.getElementById('renewal-changed').value||0);
    const lost=Number(document.getElementById('renewal-lost').value||0);
    const notice=document.getElementById('renewal-notice').value;
    const result=document.getElementById('renewal-result');
    result.style.display='block';
    if([active,removed,changed,lost].some(value=>value<0||!Number.isInteger(value))){result.innerHTML='<strong>Enter whole numbers of vehicles.</strong>';return}
    const renewalFee=active*1.5;
    const replacementFee=lost*1.5;
    let actions=[];
    if(active) actions.push(active+' active vehicle'+(active===1?'':'s')+' included in the renewal estimate');
    if(removed) actions.push(removed+' vehicle'+(removed===1?'':'s')+' to review for cancellation and decal surrender');
    if(changed) actions.push(changed+' vehicle'+(changed===1?'':'s')+' to review for revised credentials');
    if(lost) actions.push(lost+' vehicle'+(lost===1?'':'s')+' to review for duplicate/replacement credentials');
    if(!actions.length) actions.push('No vehicle actions entered');
    let html='<strong>Estimated New York renewal credential fee: '+renewalFee.toLocaleString('en-US',{style:'currency',currency:'USD'})+'.</strong><br>This uses the current $1.50 state fee per renewed vehicle and does not include optional service-company charges.';
    if(lost) html+='<br><br>Separate estimated replacement fees: '+replacementFee.toLocaleString('en-US',{style:'currency',currency:'USD'})+'. Do not automatically add this if the current renewal process will replace that credential.';
    html+='<br><br><strong>Fleet review:</strong><ul>'+actions.map(action=>'<li>'+action+'</li>').join('')+'</ul>';
    if(notice==='no') html+='<strong>Timing warning:</strong> New York controls when a credential series must be renewed. Confirm the current Tax Department notice or OSCAR account before submitting a renewal.';
    result.innerHTML=html;
  }
  </script>
  <h2>Current state credential fee</h2><p>New York currently states that the HUT certificate-of-registration renewal fee is $1.50 per vehicle and includes both the new certificate and decal.</p>
  <h2>Renewal is not the correct action for every vehicle</h2>
  <table><thead><tr><th>Vehicle situation</th><th>Action to review</th></tr></thead><tbody><tr><td>Active vehicle included in a required new credential series</td><td>Renewal</td></tr><tr><td>Plate information changed or weight increased</td><td>Revised credential</td></tr><tr><td>Certificate or decal lost, mutilated, or destroyed</td><td>Duplicate/replacement through OSCAR or Form TMT-334</td></tr><tr><td>Vehicle sold, transferred, junked, or permanently removed</td><td>Cancellation and required decal surrender</td></tr></tbody></table>
  <h2>Account compliance still matters</h2><p>Outstanding HUT returns or tax can affect credential issuance, renewal, suspension, or revocation. Review the account status before assuming that payment of the credential fee completes the renewal.</p>`
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
const card = `<div class="card tool-card"><div class="card-top"><span class="card-icon">REN</span><span class="card-number">07</span></div><div class="eyebrow">Renewal calculator</div><h3>NY HUT Renewal Readiness</h3><p>Estimate state credential fees and separate renewals from revisions, replacements, and cancellations.</p><a href="/${page.slug}/">Check renewal actions →</a></div>`;
home = home.replace('</div></div></section><section class="section authority-strip">', `${card}</div></div></section><section class="section authority-strip">`);
home = home.replace('<strong>31</strong><span>Guides and decision tools</span>', '<strong>32</strong><span>Guides and decision tools</span>');
await writeFile(homePath, home);

console.log('Added NY HUT renewal calculator.');
