import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import db from "../firebase-config";
import Header from "./Header";
import Footer from "./Footer";
import { FaArrowLeft } from "react-icons/fa"; // Importamos el ícono de flecha

const IniciarSesion = ({ setUsername }) => {
  const [usuario, setUsuario] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userRef = doc(db, "users", usuario); // Verifica si el usuario existe en Firebase
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUsername(usuario); // Guarda el nombre de usuario en el estado global
        navigate("/bienvenido", { state: { username: usuario } });
      } else {
        setError("El nombre de usuario no existe");
      }
    } catch (error) {
      console.error("Error al verificar el usuario:", error);
      setError("Hubo un problema al verificar el usuario.");
    }
  };

  return (
    <>
      <Header />
      {/* Botón de regresar con ícono */}
      <button
        className="btn btn-light position-absolute"
        style={{
          top: "20px",
          left: "20px",
          zIndex: "10",
          borderRadius: "50px",
          padding: "8px 10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
        onClick={() => navigate("/")}
      >
        <FaArrowLeft size={18} color="#555" />
      </button>

      <div
        className="container d-flex justify-content-center align-items-center"
        style={{
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.85)", // Fondo semitransparente
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h3 className="text-center mb-4" style={{ fontWeight: "bold" }}>
            Iniciar Sesión
          </h3>
          <form>
            <div className="mb-3">
              <label htmlFor="usuario" className="form-label">
                Nombre de Usuario
              </label>
              <input
                type="text"
                className="form-control"
                id="usuario"
                value={usuario}
                placeholder="Ingresa tu usuario"
                onChange={(e) => {
                  setUsuario(e.target.value);
                  setError(""); // Limpia el error al escribir
                }}
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "0.9rem",
                }}
              />
            </div>
            {error && (
              <div className="alert alert-danger mt-3" style={{ fontSize: "0.9rem" }}>
                {error}
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleLogin}
              style={{
                borderRadius: "50px",
                padding: "10px",
                fontSize: "1rem",
                backgroundColor: "#4CAF50",
                border: "none",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default IniciarSesion;
