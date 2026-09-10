const { execSync } = require('child_process');

try {
    const output = execSync('npx netlify api listSiteBuilds --data "{\\"site_id\\":\\"08ec447b-da8e-4869-9f23-470003888963\\"}"');
    const builds = JSON.parse(output.toString());
    
    console.log("Recent Builds:");
    builds.slice(0, 3).forEach(b => {
        console.log(`- ID: ${b.id}`);
        console.log(`  Status: ${b.state}`);
        console.log(`  Error: ${b.error_message || 'None'}`);
        console.log(`  Time: ${b.created_at}`);
    });
} catch (e) {
    console.error(e.message);
}
