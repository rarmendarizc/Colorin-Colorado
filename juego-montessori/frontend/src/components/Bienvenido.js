import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import db from "../firebase-config";
import Header from "./Header";
import Footer from "./Footer";
import lapizImage from "../assets/lapiz.png"; // Ajusta la ruta si es necesario
import crayonImage from "../assets/planeta.png"; // Ajusta la ruta si es necesario
import { FaDoorOpen } from "react-icons/fa"; // Ícono de puerta abierta

const Bienvenido = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const username = state?.username || "Usuario";
  const [nombre, setNombre] = useState("Usuario");
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const fetchNombre = async () => {
      try {
        const userRef = doc(db, "users", username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setNombre(userSnap.data().nombre || "Usuario");
        } else {
          console.error("Usuario no encontrado en Firestore");
          navigate("/"); // Redirige al inicio si no existe
        }
      } catch (error) {
        console.error("Error al obtener el nombre del usuario:", error);
        navigate("/"); // Redirige al inicio en caso de error
      }
    };

    fetchNombre();
  }, [username, navigate]);

  const handleCerrarSesion = () => {
    setMostrarModal(true);
  };

  const confirmarCerrarSesion = () => {
    setMostrarModal(false);
    navigate("/"); // Redirige al inicio
  };

  const cancelarCerrarSesion = () => {
    setMostrarModal(false);
  };

  return (
    <div
      className="d-flex flex-column justify-content-between"
      style={{
        minHeight: "100vh",
        backgroundColor: "#DFF6FF",
      }}
    >
      {/* Header */}
      <Header />

      {/* Botón de cerrar sesión con ícono */}
      <button
        onClick={handleCerrarSesion}
        className="btn"
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          backgroundColor: "#FF6B6B", // Rojo suave
          color: "white",
          borderRadius: "50px",
          padding: "8px 12px",
          border: "none",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: "1050", // Aseguramos que esté sobre el header
        }}
      >
        <FaDoorOpen size={20} />
      </button>

      {/* Modal de cerrar sesión */}
      {mostrarModal && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            zIndex: "1050",
          }}
          aria-hidden={!mostrarModal}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{
              width: "400px",
              textAlign: "center",
              borderRadius: "12px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.25)",
            }}
          >
            <h5 className="mb-4">¿Estás seguro de cerrar sesión?</h5>
            <div className="d-flex justify-content-around">
              <button
                className="btn btn-secondary"
                onClick={cancelarCerrarSesion}
              >
                No
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmarCerrarSesion}
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="container text-center" style={{ marginTop: "200px" }}>
        <div className="d-flex justify-content-center align-items-center">
          {/* Imagen del lápiz a la izquierda */}
          <img
            src={lapizImage}
            alt="Lápiz"
            style={{
              width: "120px",
              height: "auto",
              marginRight: "5px",
            }}
          />

          <h2
            className="display-4 fw-bold mb-4"
            style={{
              color: "#4A4A4A",
              fontFamily: "'Comic Sans MS', 'cursive', sans-serif",
              marginBottom: "10px",
            }}
          >
            ¡Bienvenido, {nombre}!
          </h2>

          {/* Imagen del planeta a la derecha */}
          <img
            src={crayonImage}
            alt="Planeta"
            style={{
              width: "150px",
              height: "auto",
              marginLeft: "10px",
            }}
          />
        </div>

        <div className="d-flex justify-content-center">
          {/* Botón de jugar */}
          <button
            className="btn"
            onClick={() => navigate("/seleccion-edad", { state: { username } })}
            style={{
              backgroundColor: "#4CAF50", // Verde amigable
              color: "white",
              borderRadius: "50px",
              padding: "12px 40px",
              fontSize: "1.2rem",
              border: "none",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            Jugar
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Bienvenido;
