
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function testPdf() {
    console.log('Testing PDF Parsing with pdfjs-dist...');
    try {
        // Minimal PDF binary string (header + body + object + crossref + trailer)
        // This is practically impossible to hand-code correctly for a valid PDF that pdfjs accepts without errors.
        // Instead, we will wrap the call in a try/catch and see if pdfjsLib.getDocument throws a module error 
        // or a "Invalid PDF structure" error. If it's the latter, the library is working.

        const dummyBuffer = new Uint8Array(Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n...'));

        const loadingTask = pdfjsLib.getDocument({
            data: dummyBuffer,
            disableFontFace: true,
        });

        try {
            await loadingTask.promise;
            console.log('Success (Unexpected for dummy file)');
        } catch (e) {
            if (e.name === 'InvalidPDFException' || e.message.includes('Invalid PDF')) {
                console.log('Library works! (Correctly rejected invalid PDF data)');
            } else if (e.message.includes('Missing PDF')) {
                console.log('Library works! (Correctly identified missing structure)');
            } else {
                console.log('Unknown error (might be library issue):', e);
            }
        }
    } catch (e) {
        console.error('Critical Error (Library likely missing or incompatible):', e);
    }
}

testPdf();
