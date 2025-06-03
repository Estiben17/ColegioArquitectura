// Backend/config/firebaseConfig.js

const admin = require('firebase-admin');
// const path = require('path'); // Ya no necesitamos 'path' si no leemos de archivo
// const fs = require('fs'); // Ya no necesitamos 'fs' si no leemos de archivo
const dotenv = require('dotenv');

// Load environment variables from .env file (solo para desarrollo local)
dotenv.config();

// Obtén el contenido de la clave de servicio desde la variable de entorno
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let serviceAccount;
if (serviceAccountJson) {
    try {
        // Parsea el contenido JSON de la variable de entorno
        serviceAccount = JSON.parse(serviceAccountJson);
        console.log(`✅ Clave de servicio Firebase cargada exitosamente desde la variable de entorno.`);
    } catch (error) {
        console.error(`❌ ERROR: No se pudo parsear el JSON de la variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY.`);
        console.error('Asegúrate de que el valor de la variable de entorno sea un JSON válido y de una sola línea.');
        console.error('Detalle del error:', error.message);
        process.exit(1); // Salir si la clave no se puede parsear (error crítico)
    }
} else {
    console.error(`❌ ERROR: La variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY no está definida.`);
    console.error('Asegúrate de configurarla en tu entorno de despliegue y en tu archivo .env para desarrollo local.');
    process.exit(1); // Salir si la clave no está definida (error crítico)
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