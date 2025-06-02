const admin = require('firebase-admin');

// Ruta a tu archivo de clave de cuenta de servicio descargado
// Asegúrate de que esta ruta sea correcta y el archivo esté en una ubicación segura.
const serviceAccount = require('../../firebase-admin-key.json'); // Ajusta esta ruta si es necesario

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Exporta la instancia de Firestore para que otros módulos puedan usarla
const db = admin.firestore();

module.exports = db;