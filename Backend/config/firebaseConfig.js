// Backend/config/firebaseConfig.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// __dirname is globally available in CommonJS modules
// It points to the directory of the current file (Backend/config/)

// Get the service account file name from environment variable
// Fallback to 'firebaseKey.json' if the environment variable is not set
const serviceAccountFileName = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || 'firebaseKey.json';

// Construct the absolute path to your service account key file
// Assumes firebaseKey.json (or whatever name you use) is in the same 'config' directory
const serviceAccountPath = path.resolve(__dirname, serviceAccountFileName);

let serviceAccount;
try {
    // Read the service account file content
    const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
    // Parse the content as JSON
    serviceAccount = JSON.parse(serviceAccountContent);
    console.log(`✅ Archivo de clave de servicio '${serviceAccountFileName}' cargado exitosamente.`);
} catch (error) {
    console.error(`❌ ERROR: No se pudo cargar el archivo de cuenta de servicio '${serviceAccountPath}'.`);
    console.error('Asegúrate de que el archivo exista en la carpeta Backend/config/ y el nombre sea correcto, y que sea un JSON válido.');
    console.error('Detalle del error:', error.message);
    process.exit(1); // Exit the application if the key cannot be loaded (critical error)
}

// Initialize Firebase Admin SDK
try {
    // Check if Firebase app is already initialized to prevent errors in hot-reloading environments
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("🔥 Firebase Admin SDK inicializado exitosamente.");
    } else {
        console.log("⚠️ Firebase Admin SDK ya estaba inicializado. Continuando...");
    }
} catch (error) {
    console.error("❌ Error al inicializar Firebase Admin SDK:", error);
    process.exit(1); // Exit if Firebase cannot be initialized (critical error)
}


// Export the Firestore instance for use in other modules
const db = admin.firestore();

// Optional: Add a quick check to see if db is a valid Firestore instance
if (typeof db.collection === 'function') {
    console.log("✅ Instancia de Firestore 'db' obtenida y lista para usar.");
} else {
    console.error("❌ Error: 'db' no parece ser una instancia válida de Firestore. Revisa la inicialización.");
}

module.exports = db;