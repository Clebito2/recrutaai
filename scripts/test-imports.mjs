
console.log("Node Version:", process.version);

async function testImports() {
    console.log("--- Testing PDF.js Imports (Node Compatibility) ---");

    try {
        console.log("Trying legacy/build/pdf.mjs...");
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        console.log("SUCCESS: Imported legacy/build/pdf.mjs");
        console.log("Version:", pdfjs.version);
    } catch (e) {
        console.log("FAIL: legacy/build/pdf.mjs");
        console.error("Error Message:", e.message);
    }
}

testImports();
