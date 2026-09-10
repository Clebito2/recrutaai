import { NextResponse } from 'next/server';

// Limite de 10MB para arquivos de currículo
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Limite de caracteres enviados à IA (custo + segurança)
const MAX_TEXT_CHARS = 15000;

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

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
                console.warn('[parse-file] pdf-parse falhou, tentando fallback Gemini Multimodal:', pdfError.message);
            }

            // Se o PDF for escaneado, imagem, vetorizado no Canva ou pdf-parse falhou:
            if (!text || !text.trim()) {
                console.log(`[parse-file] PDF sem camada de texto direta (${fileName}). Ativando OCR com Gemini Multimodal...`);
                try {
                    const { callGeminiMultimodal } = await import('@/skills/gemini-client');
                    const base64Data = buffer.toString('base64');
                    const ocrPrompt = "Extraia e transcreva com máxima fidelidade TODO o texto e informações contidas neste currículo. Preserve a ordem e organização: Dados Pessoais/Contato, Objetivo, Resumo Profissional, Experiências Anteriores (com empresas, cargos, datas e responsabilidades), Formação Acadêmica, Cursos e Habilidades. Retorne apenas o texto puro transcrito, sem introduções ou conclusões.";
                    
                    const extracted = await callGeminiMultimodal({
                        systemPrompt: "Você é um especialista em OCR e processamento de documentos e currículos profissionais.",
                        textPrompt: ocrPrompt,
                        fileData: {
                            mimeType: 'application/pdf',
                            data: base64Data
                        },
                        config: {
                            temperature: 0.1,
                            maxOutputTokens: 4096
                        }
                    });

                    if (extracted && extracted.trim()) {
                        text = extracted;
                        console.log(`[parse-file] Gemini OCR concluiu extração com sucesso: ${text.length} caracteres extraídos.`);
                    }
                } catch (geminiError) {
                    console.error('[parse-file] Erro no fallback Gemini Multimodal:', geminiError.message);
                }
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
                        ? 'Não foi possível extrair texto legível deste PDF mesmo após OCR. Verifique se o arquivo não está corrompido ou protegido por senha.'
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
