const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local
let apiKey = '';
try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.log("Could not read .env.local automatically.");
}

if (!apiKey) {
    console.error("❌ Erro: Chave não encontrada em .env.local");
    console.log("Por favor, verifique se o arquivo existe e tem a linha GEMINI_API_KEY=...");
    process.exit(1);
}

console.log(`🔑 Testando chave: ${apiKey.substring(0, 10)}... (oculta)`);

const data = JSON.stringify({
    contents: [{ parts: [{ text: "Teste de conexão." }] }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log("\n✅ SUCESSO! A chave API está válida e funcionando.");
            console.log("Resposta do Google:", responseBody.substring(0, 100) + "...");
        } else {
            console.log(`\n❌ FALHA! Código: ${res.statusCode}`);
            console.log("Mensagem de erro:", responseBody);
            console.log("\nDiagnóstico provável:");
            if (res.statusCode === 400) console.log("- Chave inválida ou revogada.");
            if (res.statusCode === 403) console.log("- Permissões insuficientes (verifique se a API Generative Language está ativa).");
        }
    });
});

req.on('error', (error) => {
    console.error("Erro na conexão:", error);
});

req.write(data);
req.end();
