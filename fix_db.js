const mongoose = require('mongoose');
require('dotenv').config();

async function fix() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('profiles');

        console.log('Dropping uniqueCode index...');
        try {
            await collection.dropIndex('uniqueCode_1');
            console.log('Successfully dropped index uniqueCode_1.');
        } catch (e) {
            console.log('Index uniqueCode_1 not found or already dropped.');
        }

        console.log('Closing connection.');
        await mongoose.disconnect();
        console.log('Done. Now restart your app and Mongoose will recreate the index properly.');
    } catch (err) {
        console.error('Error:', err);
    }
}

fix();
