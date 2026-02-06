
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

console.log("PDFJS V3 Default Import Test");

try {
    if (pdfjsLib && pdfjsLib.getDocument) {
        console.log("SUCCESS: pdfjsLib.getDocument exists.");

        const dummyData = new Uint8Array(100);
        const loadingTask = pdfjsLib.getDocument({
            data: dummyData,
            disableFontFace: true,
            verbosity: 0
        });

        loadingTask.promise.then(() => {
            console.log("Loaded?");
        }).catch(err => {
            if (err.name === 'InvalidPDFException' || err.message.includes('Invalid PDF structure')) {
                console.log("SUCCESS: Parsed invalid PDF as expected.");
            } else {
                console.log("FAIL: Unexpected error: " + err.message);
            }
        });

    } else {
        console.log("FAIL: Default export does not have getDocument.");
        console.log("Exports:", Object.keys(pdfjsLib));
    }
} catch (e) {
    console.log("CRITICAL FAIL:", e);
}
