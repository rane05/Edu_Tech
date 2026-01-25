require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const College = require('./model/cetCollege');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-predictor';
const FILE_PATH = './fill.js';
const BATCH_SIZE = 500;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected for Robust Seeding'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const seed = async () => {
    try {
        console.log('Clearing existing data...');
        await College.deleteMany({});
        console.log('Existing data cleared.');

        const fileStream = fs.createReadStream(FILE_PATH);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineCount = 0;
        let batch = [];
        let objectBuffer = '';
        let insideObject = false;
        let braceCount = 0;
        let totalInserted = 0;

        console.log('Starting stream parsing...');

        for await (const line of rl) {
            lineCount++;
            const trimmedLine = line.trim();

            if (!insideObject) {
                // Look for start of an object inside the array
                // Typical line start: {
                if (trimmedLine.startsWith('{')) {
                    insideObject = true;
                    objectBuffer = ''; // Start fresh
                    braceCount = 0; // Reset count
                }
            }

            if (insideObject) {
                objectBuffer += line + '\n'; // Keep indentation for readability if needed, but mainly content

                // Count braces to find the end of the object
                for (let i = 0; i < line.length; i++) {
                    if (line[i] === '{') braceCount++;
                    if (line[i] === '}') braceCount--;
                }

                // If braceCount is 0, we found the end of the object
                if (braceCount === 0) {
                    insideObject = false;
                    // Remove trailing comma if present (e.g., "},") which might be included in the accumulated buffer depending on flow
                    // Actually, braceCount 0 means we closed the object. 
                    // Usually the line is "      },"
                    // We need to clean the buffer to be valid JSON

                    try {
                        // Clean up the buffer to be JSON parsable
                        // 1. Remove optional trailing comma
                        let jsonStr = objectBuffer.trim();
                        if (jsonStr.endsWith(',')) {
                            jsonStr = jsonStr.slice(0, -1);
                        }

                        // 2. Parse
                        // Note: If keys are not quoted, JSON.parse will fail. fill.js snippet showed quoted keys.
                        // If it fails, we might need eval (risky but works for JS objects)
                        let collegeObj;
                        try {
                            collegeObj = JSON.parse(jsonStr);
                        } catch (e) {
                            // Fallback for JS object syntax (e.g. { name: '...' })
                            // We use Function constructor to evaluate it safely-ish
                            collegeObj = new Function(`return ${jsonStr}`)();
                        }

                        if (collegeObj && collegeObj.name) {
                            batch.push(collegeObj);
                        }

                    } catch (err) {
                        console.error(`Failed to parse object ending around line ${lineCount}:`, err.message);
                        // console.log('Buffer:', objectBuffer); 
                    }

                    if (batch.length >= BATCH_SIZE) {
                        await College.insertMany(batch);
                        totalInserted += batch.length;
                        console.log(`Inserted batch. Total: ${totalInserted}`);
                        batch = []; // Clear batch
                    }
                }
            }
        }

        // Insert remaining
        if (batch.length > 0) {
            await College.insertMany(batch);
            totalInserted += batch.length;
            console.log(`Inserted final batch. Total: ${totalInserted}`);
        }

        console.log('Seeding complete.');
        process.exit(0);

    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seed();
