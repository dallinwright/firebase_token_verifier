'use strict';

// Firebase app initialization for token verification
const admin = require("firebase-admin");

// Load the AWS SDK
const AWS = require('aws-sdk');

function _initializeApp(serviceAccount) {
  console.log("Initializing application");

    if(admin.apps.length === 0) {   // <---Important!!! In lambda, it will cause double initialization.
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    }
}

async function _verifyUserToken(token) {
  try {
    console.log("Beginning token verification");
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    throw error;
  }
}

// Will get the secret name from AWS SecretManager with it's custom response 'circular' data structure.
// We need to promisfy the callback internal to the function to be able to wait for the async call to complete.
function _getSecret(secretsManager, secretName) {
  console.log("Beginning secret pull and decrypt");
  return secretsManager.getSecretValue({SecretId: secretName}).promise();
}

module.exports.verifyToken = async function verifyToken(awsRegion, secretName, token) {
    // Create a Secrets Manager client
    const secretsManager = new AWS.SecretsManager({
      region: awsRegion
    });

    try {
      // Logic to pull our private certificate from AWS SecretManager to authenticate to Firebase Admin SDK tooling
      const secret = await _getSecret(secretsManager, secretName);
      const secretJSON = JSON.parse(secret.SecretString);
      const serviceAccount = JSON.parse(secretJSON.SERVICE_ACCOUNT);

      // Initialize our application with Firebase
      _initializeApp(serviceAccount);
    } catch (error) {
      return error;
    }


    // verify user is authenticated. A user id is returned if authenticated. Anything else is not a valid user token.
    try {
      const userBody = await _verifyUserToken(token);
      return userBody.uid;
    } catch (error) {
      return error;
    }
}
