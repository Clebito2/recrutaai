
import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

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
            try {
                // Convert Buffer to Uint8Array for pdfjs-dist
                const uint8Array = new Uint8Array(buffer);

                // Load the PDF document
                // Load the PDF document
                const loadingTask = pdfjsLib.getDocument({
                    data: uint8Array,
                    // Use CDN for standard fonts in serverless environments
                    standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
                    disableFontFace: true,
                });

                const doc = await loadingTask.promise;
                const numPages = doc.numPages;
                let fullText = [];

                for (let i = 1; i <= numPages; i++) {
                    const page = await doc.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item) => item.str).join(' ');
                    fullText.push(pageText);
                }

                text = fullText.join('\n');
            } catch (pdfError) {
                console.error('PDF parsing detailed error:', pdfError);
                console.error('Stack:', pdfError.stack);
                throw new Error(`Falha ao ler PDF: ${pdfError.message} (Code: ${pdfError.name})`);
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
            // Fallback for potentially misinterpreted types or simple text files
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
