import React from "react";
import Header from "./Header"; // Importa el componente Header (nubes)
import Footer from "./Footer"; // Importa el componente Footer (césped)
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Importamos el ícono de flecha
import { doc, getDoc, updateDoc } from "firebase/firestore";
import db from "../firebase-config";

// Importa las imágenes
import img1Anio from "../assets/1anio.png";
import img2Anios from "../assets/2anios.png";
import img3Anios from "../assets/3anios.png";
import img4Anios from "../assets/4anios.png";

const SeleccionEdad = ({ username }) => {
  const navigate = useNavigate();

  const seleccionarEdad = async (edad) => {
    const grupoEdad = edad <= 2 ? "grupo1" : "grupo2";

    try {
      const userRef = doc(db, "users", username);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const progress = userSnap.data().progress || {};
        const totalRounds = progress.totalRounds || 0;
        const nuevaRonda = totalRounds + 1;

        const nuevaRondaData = {
          tiempoTotal: 0,
          totalPreguntas: 0,
          respuestasPorColor: {
            Amarillo: { correct: 0, wrong: 0 },
            Azul: { correct: 0, wrong: 0 },
            Celeste: { correct: 0, wrong: 0 },
            Magenta: { correct: 0, wrong: 0 },
            Rojo: { correct: 0, wrong: 0 },
            Verde: { correct: 0, wrong: 0 },
          },
        };

        await updateDoc(userRef, {
          [`progress.rounds.ronda_${nuevaRonda}`]: nuevaRondaData,
          "progress.totalRounds": nuevaRonda,
        });

        // Imprime los datos que se envían a /pregunta
        console.log("Redirigiendo a /pregunta con:", {
          username,
          grupoEdad,
          rondaId: nuevaRonda,
        });

        navigate("/pregunta", { state: { username, grupoEdad, rondaId: nuevaRonda } });
      } else {
        console.error("Usuario no encontrado en Firestore.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error al actualizar la nueva ronda en Firestore:", error);
    }
  };

  return (
    <div style={styles.container}>
      <Header /> {/* Nubes como header */}
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
        onClick={() => navigate("/bienvenido", { state: { username } })}
      >
        <FaArrowLeft size={18} color="#555" />
      </button>
      <div style={styles.content}>
        <h1 style={styles.title}>Selecciona la edad del niño:</h1>

        {/* Opciones de edad */}
        <div style={styles.optionsContainer}>
          <div style={styles.option} onClick={() => seleccionarEdad(1)}>
            <img src={img1Anio} alt="1 Año" style={styles.image} />
          </div>

          <div style={styles.option} onClick={() => seleccionarEdad(2)}>
            <img src={img2Anios} alt="2 Años" style={styles.image} />
          </div>

          <div style={styles.option} onClick={() => seleccionarEdad(3)}>
            <img src={img3Anios} alt="3 Años" style={styles.image} />
          </div>

          <div style={styles.option} onClick={() => seleccionarEdad(4)}>
            <img src={img4Anios} alt="4 Años" style={styles.image} />
          </div>
        </div>
      </div>
      <Footer /> {/* Césped como footer */}
    </div>
  );
};

// Estilos CSS-in-JS
const styles = {
  container: {
    position: "relative",
    textAlign: "center",
    backgroundColor: "#DFF6FF",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
  },
  content: {
    position: "relative",
    marginTop: "13%",
    zIndex: 10,
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "5px",
    color: "#333",
  },
  optionsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
    maxWidth: "1500px",
    margin: "0 auto",
  },
  option: {
    cursor: "pointer",
    textAlign: "center",
    transition: "transform 0.2s ease-in-out",
    padding: "10px",
  },
  image: {
    width: "200px",
    height: "300px",
    objectFit: "contain",
  },
};

export default SeleccionEdad;
