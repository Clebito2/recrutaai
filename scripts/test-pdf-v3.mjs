import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js';

console.log("PDFJS V3 Legacy Import Successful.");

try {
    // Just create a loading task with dummy data to see if it initializes
    const dummyData = new Uint8Array(100);
    const loadingTask = getDocument({
        data: dummyData,
        disableFontFace: true,
        verbosity: 0
    });

    console.log("Task created, awaiting promise...");

    // we expect an invalid PDF failure
    loadingTask.promise.then(() => {
        console.log("Docs loaded (unexpectedly!)");
    }).catch(err => {
        if (err.name === 'InvalidPDFException' || err.message.includes('Invalid PDF structure')) {
            console.log("SUCCESS: Library loaded and attempted to parse (threw expected InvalidPDF error).");
        } else {
            console.error("FAILURE: Library threw unexpected error:", err.message);
            console.error(err);
        }
    });

} catch (e) {
    console.error("CRITICAL EXCEPTION:", e);
}
