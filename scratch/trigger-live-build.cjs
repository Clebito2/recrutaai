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
  console.log('--- Triggering new build on recrutaai-live with clear_cache=true ---');
  // Netlify API to trigger a build: POST /sites/{site_id}/builds with { clear_cache: true }
  const trigger = await request('/sites/' + liveSiteId + '/builds', 'POST', JSON.stringify({ clear_cache: true }));
  console.log('Trigger status:', trigger.status);
  console.log('Trigger response:', trigger.data || trigger.raw);
}

main().catch(console.error);
