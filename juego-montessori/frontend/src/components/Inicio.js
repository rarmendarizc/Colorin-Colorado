import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import gameImage from "../assets/game.png"; // Asegúrate de colocar la imagen en la carpeta `src/assets` o ajusta la ruta

const Inicio = () => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column justify-content-between"
      style={{
        minHeight: "100vh",
        backgroundColor: "#DFF6FF", // Fondo celeste
      }}
    >
      {/* Header */}
      <Header />

      {/* Contenido principal */}
      <div
        className="container d-flex flex-column justify-content-center align-items-center"
        style={{
          flex: 1,
          marginTop: "5px",
        }}
      >
        {/* Imagen reemplazando el texto */}
        <img
          src={gameImage}
          alt="Game"
          style={{
            width: "550px",
            height: "auto",
            marginBottom: "20px",
          }}
        />
      </div>

      {/* Botones de navegación flotando más arriba */}
      <div
        style={{
          position: "fixed",
          bottom: "170px", // Más arriba para evitar que se escondan en el footer
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <button
          className="btn"
          style={{
            backgroundColor: "#4CAF50", // Verde bonito
            color: "white",
            borderRadius: "50px", // Botón ovalado
            fontSize: "1.2rem",
            padding: "10px 30px",
            border: "none",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
          onClick={() => navigate("/registro")}
        >
          Registrar
        </button>
        <button
          className="btn"
          style={{
            backgroundColor: "#FF5722", // Naranja atractivo
            color: "white",
            borderRadius: "50px", // Botón ovalado
            fontSize: "1.2rem",
            padding: "10px 30px",
            border: "none",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
          onClick={() => navigate("/iniciar-sesion")}
        >
          Iniciar Sesión
        </button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Inicio;
