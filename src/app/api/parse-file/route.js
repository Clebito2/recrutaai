import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import * as pdfjsProxy from 'pdfjs-dist/legacy/build/pdf.js';

// Handle CJS/ESM interop
const pdfjsLib = pdfjsProxy.default || pdfjsProxy;

// Configure worker for Node.js environment
// In Node.js with legacy build, we generally don't need to specify workerSrc.
// It falls back to a "fake worker" on the main thread which is what we want for text extraction.
// Setting it to a non-existent file causes crashes in production.

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        if (file.type === 'application/pdf') {
            console.log('API: Iniciando análise de PDF (v3):', file.name);
            try {
                // Convert Buffer to Uint8Array which pdfjs accepts
                const uint8Array = new Uint8Array(buffer);

                // Load the document using the imported library instance
                const loadingTask = pdfjsLib.getDocument({
                    data: uint8Array,
                    disableFontFace: true,
                    verbosity: 0
                });

                const doc = await loadingTask.promise;
                console.log('API: PDF carregado, páginas:', doc.numPages);

                let fullText = [];
                for (let i = 1; i <= doc.numPages; i++) {
                    const page = await doc.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item) => item.str).join(' ');
                    fullText.push(pageText);
                }

                text = fullText.join('\n');
                console.log('API: Extração concluída, caracteres:', text.length);
            } catch (pdfError) {
                console.error('API [PDF EXCEPTION]:', pdfError);
                throw new Error(`Erro no PDF parser: ${pdfError.message} (Code: ${pdfError.name || 'UNKNOWN'})`);
            }
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.endsWith('.docx')
        ) {
            try {
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;
                if (result.messages.length > 0) {
                    console.log('Mammoth messages:', result.messages);
                }
            } catch (docxError) {
                console.error('DOCX parsing error:', docxError);
                throw new Error(`Falha ao ler DOCX: ${docxError.message}`);
            }
        } else if (file.type === 'text/plain') {
            text = await file.text();
        } else {
            try {
                text = buffer.toString('utf-8');
            } catch (e) {
                return NextResponse.json({ error: 'Formato de arquivo não suportado' }, { status: 400 });
            }
        }

        if (!text || !text.trim()) {
            return NextResponse.json({ error: 'Não foi possível extrair texto do arquivo (arquivo vazio ou ilegível)' }, { status: 400 });
        }

        return NextResponse.json({ text });
    } catch (error) {
        console.error('CRITICAL Error parsing file:', error);
        console.error('Stack trace:', error.stack);
        return NextResponse.json({
            error: 'Erro ao processar arquivo: ' + error.message,
            details: error.stack
        }, { status: 500 });
    }
}
