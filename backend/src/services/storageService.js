const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const env = require('../config/env');

let firebaseApp;
const getFirebase = () => {
  if (!firebaseApp) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey?.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  }
  return firebaseApp.storage().bucket();
};

const uploadBuffer = async ({ buffer, mimeType, originalName, folder }) => {
  const fileName = `${folder}/${uuidv4()}-${originalName}`;

  if (env.storageProvider !== 'firebase') {
    throw new Error('Only Firebase storage is configured');
  }

  const bucket = getFirebase();
  const file = bucket.file(fileName);
  await file.save(buffer, { contentType: mimeType, resumable: false });
  await file.makePublic();
  return file.publicUrl();
};

module.exports = { uploadBuffer };
