
import pdfParse from 'pdf-parse';
import fs from 'fs';

console.log("Testing pdf-parse...");

async function test() {
    try {
        // Create a minimal valid PDF buffer (empty page)
        // This is a minimal PDF header/trailer
        const pdfData = Buffer.from(`%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> >>
endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
223
%%EOF
`);

        const data = await pdfParse(pdfData);
        console.log("SUCCESS: Parsed PDF.");
        console.log("Text content:", data.text);
        console.log("Info:", data.info);
    } catch (e) {
        console.error("FAIL:", e);
    }
}

test();
