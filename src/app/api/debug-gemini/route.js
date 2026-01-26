import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const apiKey = process.env.GEMINI_API_KEY;
    const keyStatus = apiKey ? `Configurada (Inicia com: ${apiKey.substring(0, 4)}...)` : 'NÃO CONFIGURADA';

    // Teste real
    let apiResponse = null;
    let apiError = null;
    let status = 500;

    if (apiKey) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }]
                })
            });

            status = response.status;
            const data = await response.json();

            if (response.ok) {
                apiResponse = "SUCESSO: API retornou texto corretamente.";
            } else {
                apiError = data;
            }
        } catch (e) {
            apiError = e.message;
        }
    }

    return NextResponse.json({
        envCheck: {
            GEMINI_API_KEY: keyStatus
        },
        apiTest: {
            status,
            success: !apiError,
            error: apiError,
            message: apiResponse
        },
        timestamp: new Date().toISOString()
    });
}
