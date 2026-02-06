import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
// We don't need fs for this simple test of the library load

// Mock worker setup (mimicking the fix in route.js)
if (typeof window === 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.mjs';
}

console.log("PDFJS Legacy Import Successful. Version:", pdfjsLib.version);

try {
    // Just create a loading task with dummy data to see if it crashes immediately
    const dummyData = new Uint8Array(100);
    const loadingTask = pdfjsLib.getDocument({
        data: dummyData,
        disableFontFace: true,
        verbosity: 0
    });

    console.log("Task created, awaiting promise...");

    // It will likely fail with "Invalid PDF structure" but that means the LIBRARY is working
    loadingTask.promise.then(() => {
        console.log("Docs loaded (unexpectedly!)");
    }).catch(err => {
        // We expect an error because the data is garbage, but we want to make sure it's a PDF error, not a runtime/module error
        if (err.name === 'InvalidPDFException' || err.message.includes('Invalid PDF structure')) {
            console.log("SUCCESS: Library loaded and attempted to parse (threw expected InvalidPDF error for dummy data).");
        } else {
            console.error("FAILURE: Library threw unexpected error:", err.message);
            console.error("Error Name:", err.name);
        }
    });

} catch (e) {
    console.error("CRITICAL EXCEPTION:", e);
}
