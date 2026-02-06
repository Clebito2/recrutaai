import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { checkRateLimit, RATE_LIMITS } from '../../../lib/rate-limiter';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'audio/mp4',
    'audio/x-m4a',
    'audio/mpeg'
];

// Protocolo Elite V6.0 - "Nuclear Strategy"
// For PDFs, we bypass local parsing completely and return the raw file data (Base64).
// This allows the AI Service (Gemini) to process the file natively.

export async function POST(req) {
    try {
        const rateLimitResponse = checkRateLimit(req, RATE_LIMITS.parseFile);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
            }, { status: 400 });
        }

        const isValidType = ALLOWED_TYPES.includes(file.type) ||
            file.name.endsWith('.docx') ||
            file.name.endsWith('.pdf') ||
            file.name.endsWith('.txt') ||
            file.name.endsWith('.m4a') ||
            file.name.endsWith('.mp3');

        if (!isValidType) {
            return NextResponse.json({
                error: 'Formato não suportado. Use PDF, DOCX, TXT, M4A ou MP3.'
            }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let responseData = {};

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            console.log('API: PDF detectado. Retornando Base64 para processamento nativo via IA:', file.name);

            // Convert buffer to Base64
            const base64 = buffer.toString('base64');

            // Return structured data for the frontend to pass to analyze-candidate
            responseData = {
                type: 'pdf',
                text: null, // No text extracted locally
                inlineData: {
                    mimeType: 'application/pdf',
                    data: base64
                }
            };

        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.endsWith('.docx')
        ) {
            try {
                console.log('API: DOCX detectado. Extraindo texto com Mammoth...');
                const result = await mammoth.extractRawText({ buffer });
                const text = result.value;
                if (result.messages.length > 0) {
                    console.log('Mammoth messages:', result.messages);
                }

                responseData = {
                    type: 'text',
                    text: text
                };
            } catch (docxError) {
                console.error('DOCX parsing error:', docxError);
                throw new Error(`Falha ao ler DOCX: ${docxError.message}`);
            }
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const text = await file.text();
            responseData = {
                type: 'text',
                text: text
            };
        } else if (
            file.type === 'audio/mp4' ||
            file.type === 'audio/x-m4a' ||
            file.type === 'audio/mpeg' ||
            file.name.endsWith('.m4a') ||
            file.name.endsWith('.mp3')
        ) {
            console.log('API: Arquivo de áudio detectado. Retornando Base64 para processamento via IA:', file.name);

            const base64 = buffer.toString('base64');
            const mimeType = file.type || (file.name.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg');

            responseData = {
                type: 'audio',
                text: null,
                inlineData: {
                    mimeType: mimeType,
                    data: base64
                }
            };
        } else {
            // Fallback: try to read as text
            try {
                const text = buffer.toString('utf-8');
                responseData = {
                    type: 'text',
                    text: text
                };
            } catch (e) {
                return NextResponse.json({ error: 'Formato de arquivo não suportado' }, { status: 400 });
            }
        }

        const hasContent = responseData.text?.trim() || responseData.inlineData;

        if (!hasContent) {
            return NextResponse.json({ error: 'Não foi possível ler o conteúdo do arquivo.' }, { status: 400 });
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('CRITICAL Error parsing file:', error);
        console.error('Stack trace:', error.stack);
        return NextResponse.json({
            error: 'Erro ao processar arquivo: ' + error.message,
            details: error.stack
        }, { status: 500 });
    }
}
