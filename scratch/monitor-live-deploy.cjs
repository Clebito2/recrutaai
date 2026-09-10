const https = require('https');

const token = 'nfc_6a1ridXSzRAkKrpM1D7G7cRbae7kBxXkec7d';
const deployId = '6aa2fe94c5d450ce16887ee2';

function request(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.netlify.com',
      path: '/api/v1' + path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'Node-Script'
      }
    };
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
    req.end();
  });
}

async function check() {
  const res = await request('/deploys/' + deployId);
  const d = res.data;
  console.log(`Deploy ${d.id}: state=${d.state}, error_message=${d.error_message || 'none'}, summary=${JSON.stringify(d.summary || {})}`);
}

check().catch(console.error);
