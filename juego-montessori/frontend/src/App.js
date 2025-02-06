import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./components/Inicio";
import SeleccionEdad from "./components/SeleccionEdad";
import RegistroUsuario from "./components/RegistroUsuario";
import IniciarSesion from "./components/IniciarSesion";
import Bienvenido from "./components/Bienvenido";
import Resultados from "./components/Resultados";
import Historial from "./components/Historial";
import Pregunta from "./components/Pregunta"

function App() {
  const [username, setUsername] = useState(""); // Estado para manejar el nombre de usuario

  return (
    <div style={{ backgroundColor: "#DFF6FF", minHeight: "100vh" }}>
      <Router>
        <Routes>
          {/* Ruta de inicio */}
          <Route path="/" element={<Inicio />} />

          {/* Ruta para registrar un usuario */}
          <Route
            path="/registro"
            element={<RegistroUsuario setUsername={setUsername} />}
          />

          {/* Ruta para iniciar sesión */}
          <Route
            path="/iniciar-sesion"
            element={<IniciarSesion setUsername={setUsername} />}
          />

          {/* Ruta de bienvenida después de iniciar sesión */}
          <Route
            path="/bienvenido"
            element={<Bienvenido username={username} />}
          />

          {/* Ruta para seleccionar edad */}
          <Route
            path="/seleccion-edad"
            element={<SeleccionEdad username={username} />}
          />

          {/* Ruta para mostrar resultados */}
          <Route
            path="/resultados"
            element={<Resultados username={username} />}
          />

          {/* Ruta para mostrar resultados */}
          <Route
            path="/pregunta"
            element={<Pregunta username={username} />}
          />

          {/* Ruta para mostrar el historial */}
          <Route path="/historial" element={<Historial username={username} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
