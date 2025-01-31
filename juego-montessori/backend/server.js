const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors()); // Permite peticiones del frontend
app.use(bodyParser.json()); // Procesa JSON

// Ruta para recibir datos (del ESP32)
let datosESP32 = { boton: null, posicion_x: 0, posicion_y: 0 };

app.post('/api/joystick', (req, res) => {
    datosESP32 = req.body; // Guardar datos recibidos
    console.log("Datos recibidos del ESP32:", datosESP32);
    res.status(200).json({ message: "Datos recibidos correctamente" });
});

// Ruta para enviar el estado del juego al frontend
app.get('/api/estado', (req, res) => {
    res.json({
        puntaje: 120, 
        nivel: "Fácil",
        mensaje: "¡Sigue adelante!",
        datosESP32
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
