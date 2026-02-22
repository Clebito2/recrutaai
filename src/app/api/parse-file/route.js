import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { checkRateLimit, RATE_LIMITS } from '../../../lib/rate-limiter';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // Increased for Gemini multimodal
const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'audio/mp4',
    'audio/x-m4a',
    'audio/mpeg',
    'audio/wav'
];

/**
 * Protocolo Elite V6.0 - "Nuclear Strategy"
 * We bypass local parsing for complex formats (PDF, Audio).
 * This allows Gemini 2.0 to process files natively with maximum fidelity.
 */
export async function POST(req) {
    try {
        const rateLimitResponse = checkRateLimit(req, RATE_LIMITS.parseFile);
        if (rateLimitResponse) return rateLimitResponse;

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

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.toLowerCase();
        let responseData = {};

        // 1. NATIVE AI PROCESSING (PDF & Audio)
        if (file.type === 'application/pdf' || filename.endsWith('.pdf')) {
            responseData = {
                type: 'pdf',
                inlineData: {
                    mimeType: 'application/pdf',
                    data: buffer.toString('base64')
                }
            };
        } else if (
            file.type.startsWith('audio/') ||
            filename.endsWith('.m4a') ||
            filename.endsWith('.mp3') ||
            filename.endsWith('.wav')
        ) {
            const mimeType = file.type || (filename.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg');
            responseData = {
                type: 'audio',
                inlineData: {
                    mimeType: mimeType,
                    data: buffer.toString('base64')
                }
            };
        }
        // 2. LOCAL EXTRACTION (DOCX & TXT)
        else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            filename.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer });
            responseData = {
                type: 'text',
                text: result.value
            };
        } else if (file.type === 'text/plain' || filename.endsWith('.txt')) {
            responseData = {
                type: 'text',
                text: buffer.toString('utf-8')
            };
        } else {
            return NextResponse.json({ error: 'Formato de arquivo não suportado' }, { status: 400 });
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('API Error parsing file:', error);
        return NextResponse.json({
            error: 'Erro ao processar arquivo: ' + error.message
        }, { status: 500 });
    }
}


