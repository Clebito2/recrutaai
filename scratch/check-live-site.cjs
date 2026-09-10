const https = require('https');

const token = 'nfc_6a1ridXSzRAkKrpM1D7G7cRbae7kBxXkec7d';
const liveSiteId = '79bda198-51d2-4a5d-8ce2-d4d462b274d4';

function request(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.netlify.com',
      path: '/api/v1' + path,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'Node-Script'
      }
    };
    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('--- Checking Live Site (recrutaai-live) ---');
  const site = await request('/sites/' + liveSiteId);
  console.log('Site Name:', site.data?.name);
  console.log('Site URL:', site.data?.url);
  console.log('Repo URL:', site.data?.build_settings?.repo_url);
  console.log('Repo Branch:', site.data?.build_settings?.repo_branch);
  console.log('Build Command:', site.data?.build_settings?.cmd);

  console.log('\n--- Checking Latest Deploys on Live Site ---');
  const deploys = await request('/sites/' + liveSiteId + '/deploys?per_page=3');
  if (Array.isArray(deploys.data)) {
    deploys.data.forEach(d => {
      console.log(`Deploy ${d.id}: state=${d.state}, branch=${d.branch}, commit=${d.commit_ref?.slice(0,7)}, title=${d.title}, created_at=${d.created_at}`);
    });
  } else {
    console.log('Deploys response:', deploys);
  }
}

main().catch(console.error);
