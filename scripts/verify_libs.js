
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

async function test() {
    console.log('Testing library imports...');
    try {
        console.log('pdf-parse loaded');
        console.log('mammoth loaded');

        // Mock buffer (empty PDF-like signature?)
        // Real PDF signature is %PDF-
        const pdfBuffer = Buffer.from('%PDF-1.5\n%...');

        try {
            await pdf(pdfBuffer);
        } catch (e) {
            console.log('PDF Parse expected error (invalid file) but library works:', e.message);
        }

        console.log('Verification complete: Libraries likely loadable.');
    } catch (e) {
        console.error('Library verification failed:', e);
    }
}

test();
