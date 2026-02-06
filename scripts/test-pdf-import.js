
const pdfjsLib = require('pdfjs-dist');
const fs = require('fs');
const path = require('path');

// Mock file creation
const dummyPdfPath = path.join(__dirname, 'test.pdf');

// Helper to create a dummy PDF if none exists (requires pdf-lib or similar, but we'll specificy to use an existing one or fail gracefully if we can't create one)
// For now, let's just try to init pdfjsLib and see if it crashes on require/init

console.log("Testing pdfjs-dist import...");
try {
    console.log("pdfjs-dist version:", pdfjsLib.version);

    // Check worker configuration
    console.log("Worker source (before):", pdfjsLib.GlobalWorkerOptions.workerSrc);

    // Try to set worker to false/null as typical for node
    // pdfjsLib.GlobalWorkerOptions.workerSrc = ''; 

    console.log("Environment check: window is " + (typeof window));

    console.log("Import test passed. Now checking if we can create a loading task mock...");

    // We won't actually parse a file without a file, but we can check if the library throws immediately
    // In many failures, just importing or setting up the worker fails in Node

    console.log("Successfully initialized pdfjs-dist context.");
} catch (error) {
    console.error("CRITICAL ERROR with pdfjs-dist:", error);
}
