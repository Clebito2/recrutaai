
import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

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
            const data = await pdf(buffer);
            text = data.text;
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
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

        if (!text.trim()) {
            return NextResponse.json({ error: 'Não foi possível extrair texto do arquivo' }, { status: 400 });
        }

        return NextResponse.json({ text });
    } catch (error) {
        console.error('Error parsing file:', error);
        return NextResponse.json({ error: 'Erro ao processar arquivo: ' + error.message }, { status: 500 });
    }
}
