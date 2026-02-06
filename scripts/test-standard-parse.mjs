import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

console.log("Testing Standard Build implementation...");

(async () => {
    try {
        // Prepare dummy data
        const dummyData = new Uint8Array(100);

        const loadingTask = pdfjsLib.getDocument({
            data: dummyData,
            disableFontFace: true,
            verbosity: 0
        });

        try {
            await loadingTask.promise;
        } catch (promiseError) {
            // We expect InvalidPDFException
            if (promiseError.name === 'InvalidPDFException') {
                console.log("SUCCESS: Library initialized and threw expected InvalidPDFException.");
            } else {
                console.log("FAIL: Library threw unexpected error properly:");
                console.log(promiseError.message);
                console.log("Type:", promiseError.name);
            }
            return;
        }
        console.log("Unexpected success (should have failed parsing)");
    } catch (e) {
        console.log("CRITICAL FAIL: Crash during setup");
        console.log(e);
    }
})();
