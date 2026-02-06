
console.log("Node Version:", process.version);

async function testImports() {
    try {
        await import('pdfjs-dist/legacy/build/pdf.mjs');
        console.log("SUCCESS: Imported legacy/build/pdf.mjs");
    } catch (e) {
        console.log("FAIL: legacy/build/pdf.mjs");
        console.log(e.message);
    }

    try {
        await import('pdfjs-dist/build/pdf.mjs');
        console.log("SUCCESS: Imported build/pdf.mjs");
    } catch (e) {
        console.log("FAIL: build/pdf.mjs");
        console.log(e.message);
    }
}

testImports();
