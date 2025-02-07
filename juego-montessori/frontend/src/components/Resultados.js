import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import db from "../firebase-config";
import Header from "./Header";
import Footer from "./Footer";
import { FaHome } from "react-icons/fa";

const Resultados = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, grupoEdad, tiempo, coloresRefuerzo, mensajeExito } = location.state || {};

  const [ultimaRonda, setUltimaRonda] = useState(null);

  useEffect(() => {
    if (!mensajeExito) {
      const obtenerProgreso = async () => {
        try {
          const userRef = doc(db, "users", username);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const progress = userSnap.data().progress || {};
            const rounds = progress.rounds || {};
            const totalRounds = progress.totalRounds || 0;

            setUltimaRonda({
              ...rounds[`ronda_${totalRounds}`],
              totalRounds,
            });
          }
        } catch (error) {
          console.error("Error al obtener los resultados:", error);
        }
      };

      obtenerProgreso();
    }
  }, [username, mensajeExito]);

  const iniciarNuevaRonda = async () => {
    try {
      const userRef = doc(db, "users", username);
      const nuevaRondaId = (ultimaRonda?.totalRounds || 0) + 1;

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
        [`progress.rounds.ronda_${nuevaRondaId}`]: nuevaRondaData,
        "progress.totalRounds": nuevaRondaId,
      });

      console.log("Iniciando nueva ronda con 18 preguntas...");

      navigate("/pregunta", {
        state: {
          username,
          grupoEdad,
          rondaId: nuevaRondaId,
        },
      });
    } catch (error) {
      console.error("Error al iniciar la nueva ronda:", error);
    }
  };

  const manejarRefuerzo = () => {
    const hayRefuerzo = coloresRefuerzo && Object.values(coloresRefuerzo).some((nivel) => nivel !== "sin refuerzo");

    if (hayRefuerzo) {
      navigate("/preguntaRefuerzo", {
        state: {
          username,
          grupoEdad,
          coloresRefuerzo,
          rondaId: `refuerzo_${new Date().getTime()}`,
        },
      });
    } else {
      iniciarNuevaRonda();
    }
  };

  if (mensajeExito) {
    return (
      <div style={styles.container}>
        <Header />
        <button onClick={() => navigate("/bienvenido", { state: { username } })} style={styles.homeButton}>
          <FaHome size={25} />
        </button>
        <div style={styles.content}>
          <h1 style={styles.successTitle}>🎉 {mensajeExito} 🎉</h1>
          <button style={styles.refuerzoButton} onClick={iniciarNuevaRonda}>
            🔁 Volver a jugar
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ultimaRonda) {
    return (
      <div style={styles.loadingContainer}>
        <Header />
        <button onClick={() => navigate("/bienvenido", { state: { username } })} style={styles.homeButton}>
          <FaHome size={25} />
        </button>
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

  const coloresFiltrados = Object.entries(coloresRefuerzo || {}).filter(([_, nivel]) => nivel !== "sin refuerzo");

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
          </div>
        )}

        <button style={styles.refuerzoButton} onClick={manejarRefuerzo}>
          🚀 {coloresFiltrados.length > 0 ? "Refuerza Ahora" : "Nueva Ronda"}
        </button>
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
    padding: "150px 20px",
  },
  title: {
    fontSize: "2.8rem",
    color: "#333",
    marginBottom: "15px",
  },
  successTitle: {
    fontSize: "3rem",
    color: "#4CAF50",
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
    padding: "5px",
    borderRadius: "5px",
    width: "150px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
  }),
  summaryTitle: {
    fontSize: "1.2rem",
    marginBottom: "2px",
  },
  summaryValue: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  refuerzoContainer: {
    marginTop: "5px",
    backgroundColor: "#FFE082",
    padding: "10px",
    borderRadius: "7px",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
  },
  refuerzoTitle: {
    fontSize: "1.3rem",
    color: "#BF360C",
    marginBottom: "10px",
  },
  colorList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  colorItem: {
    fontSize: "1.1rem",
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
