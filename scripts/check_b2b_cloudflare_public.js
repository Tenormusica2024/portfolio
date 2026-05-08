#!/usr/bin/env node

const dns = require('dns').promises;
const https = require('https');

const expectedNameservers = new Set([
  'elma.ns.cloudflare.com',
  'eugene.ns.cloudflare.com',
]);

const pageChecks = [
  {
    url: 'https://ezlize.com/',
    expectedAsset: 'home-hero-freelance-ai-workflow.webp',
  },
  {
    url: 'https://ezlize.com/sales-operations-pipeline',
    expectedAsset: 'sales-ops-workflow-map-image2.webp',
  },
  {
    url: 'https://ezlize.com/komuten-automation',
    expectedAsset: 'komuten-workflow-image2.webp',
  },
  {
    url: 'https://ezlize.com/real-estate-ai-secretary',
    expectedAsset: 'realestate-workflow-image2.webp',
  },
  {
    url: 'https://ezlize.com/shigyo-inquiry-automation',
    expectedAsset: 'shigyo-workflow-image2.webp',
  },
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 20000 }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body,
        });
      });
    });

    request.on('timeout', () => {
      request.destroy(new Error(`timeout: ${url}`));
    });
    request.on('error', reject);
  });
}

async function checkNameservers() {
  const nameservers = (await dns.resolveNs('ezlize.com')).map((value) => value.toLowerCase()).sort();
  const missing = [...expectedNameservers].filter((expected) => !nameservers.includes(expected));
  return {
    nameservers,
    ok: missing.length === 0,
    missing,
  };
}

async function checkPage({ url, expectedAsset }) {
  const response = await fetchPage(url);
  const server = String(response.headers.server || '').toLowerCase();
  const cfRay = response.headers['cf-ray'];
  const assetPresent = response.body.includes(expectedAsset);
  const ok = response.statusCode === 200 && server.includes('cloudflare') && assetPresent;

  return {
    url,
    statusCode: response.statusCode,
    server: response.headers.server || '',
    cfRay: cfRay || '',
    expectedAsset,
    assetPresent,
    ok,
  };
}

async function main() {
  const failures = [];
  const ns = await checkNameservers();

  if (!ns.ok) {
    failures.push(`nameserver mismatch: missing ${ns.missing.join(', ')}`);
  }

  console.log(`nameservers: ${ns.nameservers.join(', ')}`);

  for (const page of pageChecks) {
    const result = await checkPage(page);
    console.log(
      [
        result.ok ? 'OK' : 'NG',
        result.url,
        `status=${result.statusCode}`,
        `server=${result.server || '-'}`,
        `asset=${result.assetPresent ? result.expectedAsset : `missing:${result.expectedAsset}`}`,
        result.cfRay ? `cf-ray=${result.cfRay}` : '',
      ]
        .filter(Boolean)
        .join(' | '),
    );

    if (!result.ok) {
      failures.push(`${result.url} failed public Cloudflare check`);
    }
  }

  if (failures.length > 0) {
    console.error('B2B Cloudflare public check failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log('B2B Cloudflare public check passed.');
}

main().catch((error) => {
  console.error(`B2B Cloudflare public check failed: ${error.message}`);
  process.exit(1);
});
