import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import db from "../firebase-config";
import Header from "./Header";
import Footer from "./Footer";
import { FaArrowLeft } from "react-icons/fa"; // Ícono de regresar

const RegistroUsuario = ({ setUsername }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [usuario, setUsuario] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!nombre || !apellido || !usuario) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    try {
      // Crear un documento con el ID igual al valor de "usuario"
      const userRef = doc(db, "users", usuario);
      await setDoc(userRef, {
        nombre,
        apellido,
        usuario,
      });

      setUsername(usuario); // Guarda el nombre de usuario en el estado global
      navigate("/bienvenido", { state: { username: usuario } });
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      setError("Hubo un problema al registrar el usuario.");
    }
  };

  return (
    <>
      <Header />

      {/* Botón de regresar */}
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
          marginTop: "80px", // Espaciado para evitar que el header cubra el contenido
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.85)", // Fondo semitransparente
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h3 className="text-center mb-4" style={{ fontWeight: "bold" }}>
            Registrar Usuario
          </h3>
          <form>
            <div className="mb-2">
              <label htmlFor="nombre" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                className="form-control"
                id="nombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setError(""); // Limpia el mensaje de error al escribir
                }}
                style={{
                  borderRadius: "8px",
                  padding: "5px",
                  fontSize: "0.9rem",
                }}
              />
            </div>
            <div className="mb-2">
              <label htmlFor="apellido" className="form-label">
                Apellido
              </label>
              <input
                type="text"
                className="form-control"
                id="apellido"
                value={apellido}
                onChange={(e) => {
                  setApellido(e.target.value);
                  setError(""); // Limpia el mensaje de error al escribir
                }}
                style={{
                  borderRadius: "8px",
                  padding: "5px",
                  fontSize: "0.9rem",
                }}
              />
            </div>
            <div className="mb-2">
              <label htmlFor="usuario" className="form-label">
                Nombre de Usuario
              </label>
              <input
                type="text"
                className="form-control"
                id="usuario"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  setError(""); // Limpia el mensaje de error al escribir
                }}
                style={{
                  borderRadius: "8px",
                  padding: "5px",
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
              className="btn"
              onClick={handleRegister}
              style={{
                backgroundColor: "#4CAF50", // Verde amigable
                color: "white",
                borderRadius: "50px",
                padding: "12px 40px",
                fontSize: "1rem",
                border: "none",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                width: "100%",
              }}
            >
              Registrar
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default RegistroUsuario;
