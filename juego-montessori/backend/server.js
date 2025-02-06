const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Permitir todas las conexiones
        methods: ['GET', 'POST']
    }
});

const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mapear botones a colores y cadenas de texto a colores
const botonColorMap = {
    "1": "Azul",
    "2": "Verde",
    "3": "Magenta",
    "4": "Amarillo",
    "5": "Rojo",
    "6": "Celeste",
    "Verde": "Verde",
    "Rojo": "Rojo",
    "Azul": "Azul",
    "Amarillo": "Amarillo",
    "Celeste": "Celeste",
    "Magenta": "Magenta"
};

// Objeto donde guardaremos los datos recibidos
let datosESP32 = { boton: null };

// Ruta para recibir datos del ESP32
app.post('/api/joystick', (req, res) => {
    console.log("=== POST /api/joystick ===");
    console.log("Datos recibidos del ESP32:", req.body);

    // Guardamos en la variable global
    datosESP32 = req.body;

    // Determinar el color basado en el botón presionado (número o cadena)
    const boton = req.body.boton;
    const colorPresionado = botonColorMap[boton] || "Desconocido";

    // Emitir evento a través de Socket.IO
    io.emit('mensajeESP32', { boton: colorPresionado });

    // Imprimir el color en la consola
    console.log(`Botón presionado: ${boton} - Color: ${colorPresionado}`);

    // Respuesta al ESP32
    res.status(200).json({ message: "Datos recibidos correctamente", color: colorPresionado });
});

// Escuchar conexiones del cliente
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado a Socket.IO');
    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado de Socket.IO');
    });
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
