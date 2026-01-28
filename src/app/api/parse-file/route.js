import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

// Disable worker for pdf-parse if it tries to use one (it usually doesn't, but good practice for serverless)
// Actually pdf-parse is a pure node wrapper, so it shouldn't need env config.

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
            console.log('API: Iniciando análise de PDF (pdf-parse):', file.name);
            try {
                // pdf-parse library handles all the complexity of pdf.js internally in a node-friendly way
                const data = await pdfParse(buffer);
                text = data.text;

                console.log('API: PDF pages:', data.numpages);
                console.log('API: Extração concluída, caracteres:', text.length);
            } catch (pdfError) {
                console.error('API [PDF EXCEPTION]:', pdfError);
                throw new Error(`Erro no PDF parser: ${pdfError.message}`);
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
