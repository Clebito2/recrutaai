
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function testPdf() {
    console.log('Testing PDF Parsing with pdfjs-dist...');
    try {
        console.log('pdfjs-dist/legacy/build/pdf.mjs loaded successfully');

        const dummyBuffer = new Uint8Array(Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n...'));

        const loadingTask = pdfjsLib.getDocument({
            data: dummyBuffer,
            disableFontFace: true,
        });

        try {
            await loadingTask.promise;
            console.log('Success (Unexpected for dummy file)');
        } catch (e) {
            if (e.name === 'InvalidPDFException' || e.message.includes('Invalid PDF') || e.message.includes('Missing PDF')) {
                console.log('Library works! (Correctly rejected invalid PDF data)');
            } else {
                console.log('Unknown error (might be library issue):', e);
            }
        }
    } catch (e) {
        console.error('Critical Error (Library likely missing or incompatible):', e);
    }
}

testPdf();
