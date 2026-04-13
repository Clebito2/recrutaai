import { NextResponse } from 'next/server';

// Limite de 10MB para arquivos de currículo
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Limite de caracteres enviados à IA (custo + segurança)
const MAX_TEXT_CHARS = 15000;

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        // Validação de tamanho no servidor (defesa em profundidade)
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Limite: 10MB.` },
                { status: 413 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        // Detecção robusta por MIME type E extensão do arquivo
        const fileName = (file.name || '').toLowerCase();
        const mimeType = file.type || '';

        const isPDF = mimeType === 'application/pdf' || fileName.endsWith('.pdf');
        const isDOCX = mimeType.includes('wordprocessingml') || fileName.endsWith('.docx');
        const isTXT = mimeType === 'text/plain' || fileName.endsWith('.txt');

        if (isPDF) {
            try {
                const pdf = (await import('pdf-parse')).default;
                const data = await pdf(buffer);
                text = data.text;
            } catch (pdfError) {
                console.error('[parse-file] PDF parse error:', pdfError.message);
                if (pdfError.message?.includes('Invalid PDF') || pdfError.message?.includes('Bad XRef')) {
                    return NextResponse.json(
                        { error: 'PDF inválido ou corrompido. Tente exportar novamente ou use um arquivo DOCX/TXT.' },
                        { status: 422 }
                    );
                }
                throw pdfError;
            }
        } else if (isDOCX) {
            try {
                const mammoth = await import('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;
                if (result.messages?.length > 0) {
                    console.warn('[parse-file] DOCX warnings:', result.messages);
                }
            } catch (docxError) {
                console.error('[parse-file] DOCX parse error:', docxError.message);
                return NextResponse.json(
                    { error: 'Erro ao ler arquivo DOCX. O arquivo pode estar corrompido.' },
                    { status: 422 }
                );
            }
        } else if (isTXT) {
            text = buffer.toString('utf-8');
        } else {
            // Fallback: tenta UTF-8 para formatos desconhecidos
            try {
                text = buffer.toString('utf-8');
            } catch {
                return NextResponse.json(
                    { error: 'Formato não suportado. Use PDF, DOCX ou TXT.' },
                    { status: 415 }
                );
            }
        }

        if (!text?.trim()) {
            return NextResponse.json(
                {
                    error: isPDF
                        ? 'PDF sem texto extraível. Verifique se não é um PDF escaneado (imagem). Use PDF com texto selecionável ou exporte para DOCX.'
                        : 'Não foi possível extrair texto do arquivo. Verifique se o arquivo não está vazio ou corrompido.'
                },
                { status: 422 }
            );
        }

        // Truncar texto para não exceder limite de contexto da IA
        const truncated = text.length > MAX_TEXT_CHARS;
        const finalText = truncated ? text.substring(0, MAX_TEXT_CHARS) : text;

        console.log(`[parse-file] OK: ${fileName} | ${text.length} chars${truncated ? ` → truncado para ${MAX_TEXT_CHARS}` : ''}`);

        return NextResponse.json({
            text: finalText,
            charCount: text.length,
            truncated,
        });

    } catch (error) {
        console.error('[parse-file] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Erro interno ao processar arquivo: ' + error.message },
            { status: 500 }
        );
    }
}
