import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const START_URL = process.argv[2] && process.argv[2].startsWith('http')
  ? process.argv[2]
  : 'https://dps.psx.com.pk/';
const OUTPUT_MD = path.resolve(process.cwd(), 'docs/psx-data.md');
const MAX_BODY_CHARS = 4000;

function nowIso() {
  return new Date().toISOString();
}

function sanitizeJson(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

function appendMd(section) {
  fs.appendFileSync(OUTPUT_MD, `\n\n${section}\n`);
}

async function captureResponseEntry(response) {
  try {
    const req = response.request();
    const url = req.url();
    const method = req.method();
    const resourceType = req.resourceType();
    const headers = req.headers();
    const status = response.status();

    if (!['xhr', 'fetch'].includes(resourceType)) return null;
    let host;
    try { host = new URL(url).hostname; } catch { host = ''; }
    if (host !== 'dps.psx.com.pk') return null;

    const postData = req.postData();
    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch {
      // ignore
    }
    if (!bodyText) return { method, url, status, note: 'empty body' };
    const trimmed = bodyText.slice(0, MAX_BODY_CHARS);
    return { method, url, status, headers, postData, sample: sanitizeJson(trimmed) };
  } catch {
    return null;
  }
}

async function navigateByText(page, texts) {
  for (const t of texts) {
    try {
      const clicked = await page.evaluate((needle) => {
        const matches = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) {
          const el = walker.currentNode;
          const text = (el.textContent || '').trim();
          if (!text) continue;
          if (text.toLowerCase() === needle.toLowerCase() || text.toLowerCase().includes(needle.toLowerCase())) {
            matches.push(el);
          }
        }
        if (matches.length > 0) {
          const el = matches[0];
          if (el instanceof HTMLElement) {
            (el).click();
            return true;
          }
        }
        return false;
      }, t);
      if (clicked) {
        await page.waitForNetworkIdle({ idleTime: 1000, timeout: 10000 }).catch(() => {});
        await sleep(1200);
      }
    } catch {
      // ignore
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const found = new Map();

  page.on('response', async (res) => {
    const entry = await captureResponseEntry(res);
    if (!entry) return;
    if (found.has(entry.url)) return;
    found.set(entry.url, entry);
    const md = [
      `### ${entry.method} ${entry.url}`,
      `- Status: ${entry.status}`,
      `- Captured: ${nowIso()}`,
      entry.postData ? `- PostData: \n\n\`\`\`json\n${sanitizeJson(entry.postData).slice(0, MAX_BODY_CHARS)}\n\`\`\`` : '',
      `- Sample Response:\n\n\`\`\`json\n${entry.sample}\n\`\`\``,
    ].filter(Boolean).join('\n');
    appendMd(md);
    // eslint-disable-next-line no-console
    console.log(`Captured: ${entry.method} ${entry.url}`);
  });

  // Ensure file header exists
  if (!fs.existsSync(OUTPUT_MD)) {
    fs.mkdirSync(path.dirname(OUTPUT_MD), { recursive: true });
    fs.writeFileSync(OUTPUT_MD, '# PSX Data Portal (DPS) — Discovered Endpoints\n');
  } else {
    appendMd(`\n---\n\n## New Capture Session — ${nowIso()}`);
  }

  await page.goto(START_URL, { waitUntil: 'networkidle2', timeout: 60000 });

  // Passive capture on landing
  await sleep(3000);

  // Try to navigate common sections by visible text
  await navigateByText(page, [
    'Today’s Summary',
    "Today's Summary",
    'Indices',
    'Sector Summary',
    'Stock Screener',
    'Historical Data',
    'Company Announcements',
    'Listing Status',
    'Fixed Income Securities Detail',
    'Eligible Scrips',
    'Graphical View',
    'PSX Notices',
    'CDC Notices',
    'SECP Notices',
    'NCCPL Notices',
    'AGM/EOGM Calendar',
    'GIS Auction Results',
    'Circuit Breakers',
    'Downloads',
    'Financial Reports',
    'Analysis Reports',
    'Monthly Reports',
    '5 Years Progress Report',
    // Company page tabs
    'QUOTE',
    'PROFILE',
    'EQUITY',
    'ANNOUNCEMENTS',
    'FINANCIALS',
    'RATIOS',
    'PAYOUTS',
    'REPORTS'
  ]);

  // Also click any anchors that include key words
  const anchors = await page.$$eval('a', (as) => as.map((a) => ({ href: a.href, text: a.textContent?.trim() || '' })));
  const targets = anchors.filter((a) => /Indices|Sector|Summary|Listing|Historical|Announcement|Companies|Screener|Market/i.test(a.text) || /Indices|Sector|Summary|Listing|Historical|Announcement|Companies|Screener|Market/i.test(a.href));
  for (const t of targets.slice(0, 20)) {
    try {
      await page.goto(t.href, { waitUntil: 'networkidle2', timeout: 45000 });
      await sleep(1500);
    } catch {
      // ignore
    }
  }

  // Final wait to flush responses
  await sleep(3000);
  await browser.close();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


