const pdf = require('pdf-parse');
const fs = require('fs');

console.log("Type of export:", typeof pdf);
console.log("Keys:", Object.keys(pdf));

if (typeof pdf === 'object' && pdf.PDFParse) {
    console.log("Type of PDFParse component:", typeof pdf.PDFParse);
}

// Mock buffer
const buffer = Buffer.from("test pdf content");

// Attempt 1: Direct function
try {
    console.log("Attempt 1: Direct function call...");
    pdf(buffer).then(d => console.log("Success 1", d.text)).catch(e => console.log("Fail 1", e.message));
} catch (e) { console.log("Error 1", e.message); }

// Attempt 2: New Class (Main)
try {
    console.log("Attempt 2: New pdf()...");
    new pdf(buffer).then(d => console.log("Success 2", d.text)).catch(e => console.log("Fail 2", e.message));
} catch (e) { console.log("Error 2", e.message); }

// Attempt 3: New PDFParse nested
try {
    console.log("Attempt 3: new pdf.PDFParse()...");
    if (pdf.PDFParse) {
        new pdf.PDFParse(buffer).then(d => console.log("Success 3", d.text)).catch(e => console.log("Fail 3", e.message));
    }
} catch (e) { console.log("Error 3", e.message); }
