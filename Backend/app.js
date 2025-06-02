const express = require('express');
const cors = require('cors'); // Si tu frontend y backend están en dominios diferentes
const app = express();
const PORT = process.env.PORT || 3000;

// Importa tus archivos de rutas
const asignaturaRoutes = require('./Routes/Asignaturaroutes');
const departamentoRoutes = require('./Routes/Departamentoroutes');
const estudianteRoutes = require('./Routes/Estudianteroutes');
const asistenciaRoutes = require('./Routes/Asistenciaroutes');

// Middleware
app.use(express.json()); // Para parsear el cuerpo de las solicitudes JSON
app.use(cors()); // Habilita CORS para permitir solicitudes desde tu frontend

// Rutas de la API
app.use('/api', asignaturaRoutes); // Puedes usar '/api/asignaturas' dentro de AsignaturaRoutes.js
app.use('/api', departamentoRoutes);
app.use('/api', estudianteRoutes);
app.use('/api', asistenciaRoutes);

// Ruta de prueba (opcional)
app.get('/', (req, res) => {
    res.send('Backend de Registro de Colegio funcionando.');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
    console.log('¡Conexión a Firebase Firestore configurada!');
});