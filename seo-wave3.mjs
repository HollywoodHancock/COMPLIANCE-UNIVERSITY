import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderArticle } from './seo-wave2.mjs';

const out = 'dist';
const site = 'https://newyorkhut.com';
const updated = '2026-08-26';

const pages = [
  {
    slug:'ny-hut-mileage-record-requirements',
    title:'NY HUT Mileage Record Requirements: Daily Trips and Monthly Summaries',
    desc:'Learn which daily trip, vehicle, route, and mileage details New York carriers must retain to support Highway Use Tax returns.',
    category:'Recordkeeping',
    body:`<p>New York HUT is calculated from vehicle mileage, so a filed return must be supported by records created during normal operations—not reconstructed only after a notice or audit.</p><h2>Daily vehicle identification</h2><p>For each vehicle issued a certificate of registration, the daily record should identify the certificate number, license plate and jurisdiction, VIN, and the vehicle owner when the carrier operates leased or interchanged equipment.</p><h2>Trip-level mileage details</h2><p>Daily manifests or trip records should show each trip date, origin, destination, number of round trips when applicable, total New York mileage, mileage outside New York, and qualifying toll-paid New York State Thruway mileage.</p><h2>Laden and unladen mileage</h2><p>Carriers using the gross-weight method must separately support New York miles traveled laden and unladen. The records must also distinguish the relevant truck, tractor, and attached-device configurations.</p><h2>Monthly summaries and supporting records</h2><p>Prepare a monthly summary for each covered vehicle and retain the source records used to calculate actual mileage, such as odometer or hubometer readings, fuel records, dispatch sheets, driver trip reports, bills of lading, invoices, and toll documentation.</p><h2>Retention period</h2><p>New York requires HUT records to be retained for at least four years from the return due date or the date the return was filed, whichever is later, and made available for inspection.</p><p><a href="https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/hut/recordkeeping_requirements.htm" rel="nofollow">Review New York Tax Bulletin TB-HU-765</a>.</p>`
  },
  {
    slug:'ny-hut-account-closure',
    title:'How to Close a New York HUT Account',
    desc:'A carrier-focused checklist for final returns, outstanding obligations, vehicle credentials, and records when permanently ending New York HUT operations.',
    category:'Account Management',
    body:`<p>Stopping New York operations does not automatically close a HUT account or erase its filing requirements. A carrier permanently discontinuing HUT activity should complete both the tax-return and credential-management steps that apply to its account.</p><h2>File the final HUT return</h2><p>Form MT-903 instructions provide a final-return process for a business permanently discontinuing HUT activity. Report the final period accurately and resolve any tax, penalty, interest, or missing-return issue tied to the account.</p><h2>Separate the account from the vehicles</h2><p>Closing a business-level HUT obligation and cancelling individual vehicle credentials are related but distinct tasks. Review every active vehicle so sold, transferred, leased, junked, or permanently removed equipment is handled correctly.</p><h2>Keep proof of closure</h2><p>Retain the final return, payment confirmation, correspondence, credential cancellation records, and supporting mileage records. Existing record-retention duties continue after operations stop.</p><h2>Do not close an account needed for continued operations</h2><p>If the carrier expects to keep operating qualifying vehicles in New York, vehicle changes or credential cancellations may be appropriate without permanently closing the entire HUT account.</p><p><a href="https://www.tax.ny.gov/forms/current-forms/motor/mt903i.htm" rel="nofollow">Review the current Form MT-903 instructions</a>.</p>`
  },
  {
    slug:'ny-hut-certificate-cancellation',
    title:'NY HUT Certificate Cancellation: When a Vehicle Leaves the Fleet',
    desc:'Learn when a New York HUT certificate and decal should be cancelled after a vehicle is sold, transferred, junked, or removed from service.',
    category:'Credentials',
    body:`<p>A HUT certificate and decal belong to a specific vehicle and are not transferable. When the carrier no longer controls that vehicle, the credential record should be reviewed and cancelled when required.</p><h2>Common cancellation events</h2><ul><li>The vehicle is sold or transferred</li><li>A lease ends and the carrier no longer controls the vehicle</li><li>The vehicle is permanently removed from on-road service</li><li>The vehicle is junked or destroyed</li><li>A business transfer changes ownership or control of the vehicle</li></ul><h2>Cancellation is not a transfer</h2><p>Do not move the old decal to a replacement vehicle. A different vehicle requires its own valid credential record when subject to HUT.</p><h2>Preserve the audit trail</h2><p>Keep the cancellation confirmation, disposition or lease-termination documents, the vehicle's mileage records, and the returns covering its final operating period.</p><h2>Account obligations can continue</h2><p>Cancelling one vehicle does not necessarily close the carrier's HUT account or eliminate returns for other registered vehicles.</p><p><a href="https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/hut/decals.htm" rel="nofollow">Review New York's decal and cancellation guidance</a>.</p>`
  },
  {
    slug:'ny-hut-filing-frequency-changes',
    title:'NY HUT Filing Frequency Changes: Monthly, Quarterly, or Annual',
    desc:'Understand how New York reviews prior-year HUT liability and assigns monthly, quarterly, or annual filing schedules.',
    category:'Quarterly Filing',
    body:`<p>New HUT accounts generally begin with quarterly returns, but that schedule may change. The Tax Department reviews the preceding calendar year's HUT liability and notifies carriers when their required filing frequency changes.</p><h2>Quarterly filing</h2><p>A carrier with preceding-year HUT liability of more than $1,200 but not more than $12,000 generally continues filing quarterly.</p><h2>Monthly filing</h2><p>A carrier with preceding-year HUT liability over $12,000 is generally reclassified as a monthly filer.</p><h2>Annual filing</h2><p>A carrier with liability of $1,200 or less that was subject to HUT for the entire preceding calendar year is generally reclassified as an annual filer.</p><h2>Use the assigned schedule</h2><p>Do not change filing frequency based only on an internal estimate. Review Tax Department notices and the frequency displayed in HUT Web File, then file every required return—including no-tax-due returns—on the assigned schedule.</p><h2>Due-date rule</h2><p>Returns are generally due on the last day of the month following the reporting period, with the next-business-day rule applying when that date falls on a Saturday, Sunday, or legal holiday.</p><p><a href="https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/hut/filing_requirements.htm" rel="nofollow">Review New York Tax Bulletin TB-HU-260</a>.</p>`
  },
  {
    slug:'ny-hut-apportioned-vehicles',
    title:'NY HUT for Apportioned Vehicles: Why IRP Does Not Replace HUT',
    desc:'Learn why an apportioned plate or IRP registration does not by itself satisfy New York Highway Use Tax requirements.',
    category:'Registration',
    body:`<p>IRP and New York HUT address different obligations. An apportioned registration distributes vehicle registration fees among jurisdictions; it does not replace New York's separate highway-use tax credential and filing program.</p><h2>Start with the HUT vehicle test</h2><p>A truck, tractor, or other self-propelled vehicle with a gross weight over 18,000 pounds generally requires HUT review when operating on New York public highways, subject to alternate weight rules, exclusions, and exemptions.</p><h2>The plate does not decide the HUT result</h2><p>An IRP plate can establish lawful apportioned registration while the same vehicle still needs a New York HUT certificate and decal. IFTA credentials likewise do not replace HUT.</p><h2>Plate transfers and vehicle changes</h2><p>When an apportioned plate is transferred to a different vehicle, confirm that the HUT credential record matches the new VIN, weight, plate, ownership or lease status, and operating configuration before New York operation.</p><h2>Occasional versus recurring operation</h2><p>A qualifying occasional operator may consider a limited trip certificate. Regular New York operations generally call for permanent-registration review and preparation for continuing return and mileage-record obligations.</p><p><a href="https://www.tax.ny.gov/bus/hut/huidx.htm" rel="nofollow">Review New York's current HUT requirements</a>.</p>`
  }
];

for (const page of pages) {
  const path = join(out, page.slug, 'index.html');
  await mkdir(dirname(path), { recursive:true });
  await writeFile(path, renderArticle(page));
}

const sitemapPath = join(out, 'sitemap.xml');
let sitemap = await readFile(sitemapPath, 'utf8');
const additions = pages.map((page) => `  <url><loc>${site}/${page.slug}/</loc><lastmod>${updated}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n');
sitemap = sitemap.replace('</urlset>', `${additions}\n</urlset>`);
await writeFile(sitemapPath, sitemap);

const homePath = join(out, 'index.html');
let home = await readFile(homePath, 'utf8');
const icons = ['MIL','END','CAN','FREQ','IRP'];
const cards = pages.map((page, index) => `<div class="card"><div class="card-top"><span class="card-icon">${icons[index]}</span><span class="card-number">${String(index + 25).padStart(2,'0')}</span></div><div class="eyebrow">${page.category}</div><h3>${page.title}</h3><p>${page.desc}</p><a href="/${page.slug}/">Read the guide →</a></div>`).join('');
const section = `<section class="section"><div class="section-kicker">Ongoing HUT compliance</div><h2>Mileage, filing schedules, and fleet changes</h2><p class="lead">Detailed guidance for the obligations that continue after a carrier receives New York HUT credentials.</p><div class="grid">${cards}</div></section>`;
home = home.replace('<section class="conversion">', `${section}<section class="conversion">`);
home = home.replace('<strong>28</strong><span>Focused authority pages</span>', '<strong>33</strong><span>Focused authority pages</span>');
await writeFile(homePath, home);

console.log(`Added ${pages.length} third-wave authority pages.`);

export { renderArticle };
