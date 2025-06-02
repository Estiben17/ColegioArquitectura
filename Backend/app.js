const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Importa tus archivos de rutas
// Asegúrate de que las rutas relativas sean correctas desde app.js
const asignaturaRoutes = require('./Routes/Asignaturaroutes'); // <-- CORREGIDO
const departamentoRoutes = require('./Routes/Departamentoroutes'); // <-- CORREGIDO
const estudianteRoutes = require('./Routes/Estudianteroutes');     // <-- CORREGIDO
const asistenciaRoutes = require('./Routes/Asistenciaroutes');      // Ajustado a la estructura que hemos visto


// Middleware
app.use(express.json());
app.use(cors());

// Rutas de la API - ASIGNAR UN PREFIJO ÚNICO A CADA GRUPO DE RUTAS
app.use('/api/asignaturas', asignaturaRoutes); // <-- CADA UNO CON SU PROPIO PREFIJO
app.use('/api/departamentos', departamentoRoutes); // <-- ESTO ES LO QUE NECESITAMOS
app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/asistencias', asistenciaRoutes);

// Ruta de prueba (opcional)
app.get('/', (req, res) => {
    res.send('Backend de Registro de Colegio funcionando.');
});

// Manejo de rutas no encontradas (MUY RECOMENDADO!)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Manejo de errores global (MUY RECOMENDADO!)
app.use((err, req, res, next) => {
    console.error(err.stack); // Registra el error en la consola del servidor
    res.status(500).json({ message: 'Algo salió mal en el servidor!', error: err.message });
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
    console.log('¡Conexión a Firebase Firestore configurada!');
});