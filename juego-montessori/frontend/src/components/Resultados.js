import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import db from "../firebase-config";
import Header from "./Header";
import Footer from "./Footer";
import { FaHome } from "react-icons/fa";

const Resultados = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, grupoEdad, tiempo, coloresRefuerzo } = location.state || {};

  const [ultimaRonda, setUltimaRonda] = useState(null);

  useEffect(() => {
    const obtenerProgreso = async () => {
      try {
        const userRef = doc(db, "users", username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const progress = userSnap.data().progress || {};
          const rounds = progress.rounds || {};

          const rondasOrdenadas = Object.keys(rounds).sort(
            (a, b) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1])
          );
          const ultimaRondaKey = rondasOrdenadas[rondasOrdenadas.length - 1];
          setUltimaRonda(rounds[ultimaRondaKey]);
        }
      } catch (error) {
        console.error("Error al obtener los resultados:", error);
      }
    };

    obtenerProgreso();
  }, [username]);

  const manejarRefuerzo = () => {
    navigate("/pregunta", {
      state: {
        username,
        grupoEdad,
        coloresRefuerzo,
        rondaId: `refuerzo_${new Date().getTime()}`,
      },
    });
  };

  if (!ultimaRonda) {
    return (
      <div style={styles.loadingContainer}>
        <Header />
        <div style={styles.loadingMessage}>Cargando resultados...</div>
        <Footer />
      </div>
    );
  }

  const { tiempoTotal = tiempo || 0, respuestasPorColor = {} } = ultimaRonda;
  const totalCorrectas = Object.values(respuestasPorColor).reduce(
    (total, color) => total + color.correct,
    0
  );
  const totalIncorrectas = Object.values(respuestasPorColor).reduce(
    (total, color) => total + color.wrong,
    0
  );

  // Filtrar solo los colores que necesitan refuerzo
  const coloresFiltrados = Object.entries(coloresRefuerzo).filter(([_, nivel]) => nivel !== "sin refuerzo");

  return (
    <div style={styles.container}>
      <Header />

      <button onClick={() => navigate("/bienvenido", { state: { username } })} style={styles.homeButton}>
        <FaHome size={25} />
      </button>

      <div style={styles.content}>
        <h1 style={styles.title}>🎉 ¡Resultados! 🎉</h1>

        <div style={styles.generalSummary}>
          <div style={styles.summaryBox("#FFCDD2", "#B71C1C")}>
            <p style={styles.summaryTitle}>Incorrectas</p>
            <p style={styles.summaryValue}>{totalIncorrectas}</p>
          </div>
          <div style={styles.summaryBox("#C8E6C9", "#1B5E20")}>
            <p style={styles.summaryTitle}>Correctas</p>
            <p style={styles.summaryValue}>{totalCorrectas}</p>
          </div>
          <div style={styles.summaryBox("#BBDEFB", "#0D47A1")}>
            <p style={styles.summaryTitle}>Tiempo</p>
            <p style={styles.summaryValue}>{tiempoTotal}s</p>
          </div>
        </div>

        {coloresFiltrados.length > 0 && (
          <div style={styles.refuerzoContainer}>
            <h2 style={styles.refuerzoTitle}>⚠️ Refuerza en estos colores:</h2>
            <ul style={styles.colorList}>
              {coloresFiltrados.map(([color, nivel], index) => (
                <li key={index} style={styles.colorItem}>
                  {color} - {nivel}
                </li>
              ))}
            </ul>
            <button style={styles.refuerzoButton} onClick={manejarRefuerzo}>
              🚀 Refuerza Ahora
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#DFF6FF",
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
  },
  content: {
    textAlign: "center",
    padding: "140px 20px",
  },
  title: {
    fontSize: "2.8rem",
    color: "#333",
    marginBottom: "15px",
  },
  generalSummary: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  summaryBox: (bgColor, textColor) => ({
    backgroundColor: bgColor,
    color: textColor,
    padding: "15px",
    borderRadius: "10px",
    width: "150px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  }),
  summaryTitle: {
    fontSize: "1.2rem",
    marginBottom: "5px",
  },
  summaryValue: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  refuerzoContainer: {
    marginTop: "20px",
    backgroundColor: "#FFE082",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  refuerzoTitle: {
    fontSize: "1.5rem",
    color: "#BF360C",
    marginBottom: "10px",
  },
  colorList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  colorItem: {
    fontSize: "1.2rem",
    color: "#FF5722",
  },
  refuerzoButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 25px",
    borderRadius: "8px",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    marginTop: "10px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  loadingMessage: {
    fontSize: "1.8rem",
    color: "#333",
  },
  homeButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    backgroundColor: "#FFB74D",
    color: "white",
    border: "none",
    borderRadius: "50%",
    padding: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
    zIndex: "1050",
  },
};

export default Resultados;
