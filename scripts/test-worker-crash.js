
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

console.log("Testing workerSrc behavior...");

try {
    // Mimic the current route code
    if (typeof window === 'undefined') {
        console.log("Setting bad workerSrc...");
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'non-existent-file.js';
    }

    const dummyData = new Uint8Array(100);
    const loadingTask = pdfjsLib.getDocument({
        data: dummyData,
        disableFontFace: true,
        verbosity: 0
    });

    console.log("Task created...");

    loadingTask.promise.then(() => {
        console.log("Success (Unexpected)");
    }).catch(err => {
        console.log("Caught error:", err.message);
        console.log("Error Name:", err.name);
        if (err.message.includes('Worker') || err.message.includes('Setting up fake worker failed')) {
            console.log("CONCLUSION: Bad workerSrc is fatal or problematic.");
        } else {
            console.log("CONCLUSION: Error unrelated to worker path (likely just bad PDF data).");
        }
    });

} catch (e) {
    console.error("CRITICAL EXCEPTION:", e);
}
