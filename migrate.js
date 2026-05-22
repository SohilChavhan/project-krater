/**
 * KRATER DATABASE MIGRATOR (High Reliability Version)
 */

const admin = require('firebase-admin');
const fs = require('fs');

const OLD_KEY_PATH = './old-project.json';
const NEW_KEY_PATH = './new-project.json';

// Helper to wait between batches to prevent timeouts
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (!fs.existsSync(OLD_KEY_PATH) || !fs.existsSync(NEW_KEY_PATH)) {
    console.error('❌ ERROR: Key files missing.');
    process.exit(1);
}

const oldApp = admin.initializeApp({ credential: admin.credential.cert(require(OLD_KEY_PATH)) }, 'old');
const newApp = admin.initializeApp({ credential: admin.credential.cert(require(NEW_KEY_PATH)) }, 'new');

const oldDb = oldApp.firestore();
const newDb = newApp.firestore();
const collections = ['tickets', 'chats', 'usernames', 'metadata'];

async function startMigration() {
    console.log('🚀 Starting High-Reliability Migration...');

    for (const colName of collections) {
        console.log(`\n📦 Migrating: ${colName}`);
        const snapshot = await oldDb.collection(colName).get();

        if (snapshot.empty) continue;

        let count = 0;
        let batch = newDb.batch();

        for (const doc of snapshot.docs) {
            batch.set(newDb.collection(colName).doc(doc.id), doc.data());
            count++;

            // Commit every 50 documents (Smaller batches for large data/images)
            if (count % 50 === 0) {
                await batch.commit();
                console.log(`   ...Progress: ${count} docs moved. Waiting...`);
                batch = newDb.batch();
                await sleep(1000); // Wait 1 second to clear the network
            }
        }

        if (count % 50 !== 0) await batch.commit();
        console.log(`✅ Finished ${colName} (${count} documents)`);
    }

    console.log('\n🎉 ALL DONE!');
}

startMigration().catch(console.error);
