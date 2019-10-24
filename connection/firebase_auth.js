const firebase = require('firebase')
require('dotenv').config()

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_Auth_Domain,
  databaseURL: process.env.FIREBASE_DATABASEURL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_Storage_Bucket,
  messagingSenderId: process.env.FIREBASE_Messaging_Sender_Id,
  appId: process.env.FIREBASE_App_Id,
  measurementId: process.env.FIREBASE_Measurement_Id
};
firebase.initializeApp(config);

module.exports = firebase