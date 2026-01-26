const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local manually since we are running a standalone script
const envPath = path.join(__dirname, '../.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Error reading .env.local:", e.message);
    process.exit(1);
}

if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", JSON.stringify(json.error, null, 2));
            } else {
                console.log("--- Available Models ---");
                // Filter for generateContent supported models
                const generateModels = (json.models || []).filter(m =>
                    m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
                );

                generateModels.forEach(m => {
                    console.log(`- ${m.name} (${m.displayName})`);
                });

                if (generateModels.length === 0) {
                    console.log("No models found that support generateContent.");
                    console.log("Raw response:", JSON.stringify(json, null, 2));
                }
            }
        } catch (e) {
            console.error("Parse Error:", e.message);
            console.log("Raw Data:", data);
        }
    });

}).on("error", (err) => {
    console.error("Network Error:", err.message);
});
