const https = require('https');

const token = 'nfc_6a1ridXSzRAkKrpM1D7G7cRbae7kBxXkec7d';
const liveSiteId = '79bda198-51d2-4a5d-8ce2-d4d462b274d4';

function request(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.netlify.com',
      path: '/api/v1' + path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'Node-Script'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function check() {
  const deploys = await request('/sites/' + liveSiteId + '/deploys?per_page=1');
  const d = deploys[0];
  console.log(`Latest Deploy: ID=${d?.id}, state=${d?.state}, error=${d?.error_message || 'none'}, branch=${d?.branch}, commit=${d?.commit_ref?.slice(0,7)}, created_at=${d?.created_at}`);
}

check().catch(console.error);
