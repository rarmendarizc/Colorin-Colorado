import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { io } from "socket.io-client";
import db from "../firebase-config";
import Header from "./Header";
import Footer from "./Footer";
import { FaDoorOpen } from "react-icons/fa";

const socket = io("http://localhost:5000");

const PreguntaRefuerzo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { grupoEdad, coloresRefuerzo, username, rondaId } = location.state || {};

  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [procesandoRespuesta, setProcesandoRespuesta] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [preguntasIncorrectas, setPreguntasIncorrectas] = useState([]);

  const erroresPorColor = useRef({
    celeste: 0,
    magenta: 0,
    azul: 0,
    amarillo: 0,
    verde: 0,
    rojo: 0,
  });

  const intervaloRef = useRef(null);

  useEffect(() => {
    cargarPreguntasRefuerzo();
    iniciarTemporizador();
  }, []);

  useEffect(() => {
    if (preguntas.length > 0 && preguntaActual) {
      socket.on("mensajeESP32", (data) => {
        if (!procesandoRespuesta) {
          manejarRespuesta(data.boton?.toLowerCase());
        }
      });

      return () => {
        socket.off("mensajeESP32");
      };
    }
  }, [preguntas, preguntaActual, procesandoRespuesta]);

  const cargarPreguntasRefuerzo = async () => {
    try {
      if (!grupoEdad) {
        console.error("Error: grupoEdad no definido. No se pueden cargar preguntas.");
        return;
      }

      const preguntasRef = collection(db, "preguntas");
      const q = query(preguntasRef, where("grupoEdad", "==", grupoEdad));
      const querySnapshot = await getDocs(q);

      let preguntasValidas = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      let preguntasSeleccionadas = [];

      for (const [color, nivel] of Object.entries(coloresRefuerzo || {})) {
        if (!nivel || nivel === "sin refuerzo") continue;

        const cantidad = nivel === "leve" ? 1 : nivel === "moderado" ? 2 : nivel === "intensivo" ? 3 : 0;
        const preguntasPorColor = preguntasValidas.filter(
          (pregunta) => pregunta.respuestaCorrecta?.toLowerCase() === color.toLowerCase()
        );

        preguntasSeleccionadas.push(...preguntasPorColor.slice(0, cantidad));
      }

      preguntasSeleccionadas.sort(() => Math.random() - 0.5);
      setPreguntas(preguntasSeleccionadas);

      if (preguntasSeleccionadas.length > 0) {
        setPreguntaActual(preguntasSeleccionadas[0]);
      } else {
        finalizarRonda();
      }
    } catch (error) {
      console.error("Error al cargar preguntas de refuerzo:", error);
    }
  };

  const iniciarTemporizador = () => {
    intervaloRef.current = setInterval(() => setTiempo((prev) => prev + 1), 1000);
  };

  const manejarRespuesta = (respuesta) => {
    if (procesandoRespuesta || !preguntaActual || !respuesta) return;

    setProcesandoRespuesta(true);

    const colorCorrecto = preguntaActual.respuestaCorrecta.toLowerCase();
    const esCorrecta = respuesta === colorCorrecto;

    setMensaje(esCorrecta ? "✅ ¡Respuesta correcta!" : "❌ Respuesta incorrecta");

    if (!esCorrecta) {
      erroresPorColor.current[colorCorrecto] += 1;
      setPreguntasIncorrectas((prev) => [...prev, preguntaActual]);
    }

    setTimeout(() => {
      setMensaje("");
      avanzarPregunta();
      setProcesandoRespuesta(false);
    }, 2000);
  };

  const avanzarPregunta = () => {
    const siguientePreguntaIndex = preguntas.indexOf(preguntaActual) + 1;
    if (siguientePreguntaIndex < preguntas.length) {
      setPreguntaActual(preguntas[siguientePreguntaIndex]);
    } else if (preguntasIncorrectas.length > 0) {
      setPreguntas([...preguntasIncorrectas]);
      setPreguntasIncorrectas([]);
      setPreguntaActual(preguntasIncorrectas[0]);
    } else {
      finalizarRonda();
    }
  };

  const finalizarRonda = () => {
    clearInterval(intervaloRef.current);
    navigate("/resultados", {
      state: {
        mensajeExito: "¡Has completado el refuerzo con éxito!",
        grupoEdad,
        username,
        rondaId: rondaId + 1,
      },
    });
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.overlay}>
        <div style={styles.timer}>
          ⏰ {`${tiempo}s`}
        </div>
        <button onClick={() => setMostrarModal(true)} style={styles.exitButton}>
          <FaDoorOpen size={20} />
        </button>
      </div>

      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h5>¿Quieres finalizar la partida?</h5>
            <div style={styles.modalButtons}>
              <button onClick={finalizarRonda} style={styles.finalizarButton}>
                Finalizar
              </button>
              <button onClick={() => setMostrarModal(false)} style={styles.cancelarButton}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.content}>
        <h2>{preguntaActual?.pregunta || "Cargando pregunta..."}</h2>
        <img src={preguntaActual?.imagen || ""} alt="Pregunta" style={styles.image} />
        {mensaje && (
          <p style={mensaje.includes("correcta") ? styles.correct : styles.incorrect}>
            {mensaje}
          </p>
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
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: "10px",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    padding: "0 20px",
    zIndex: 2,
  },
  timer: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  exitButton: {
    position: "absolute",
    top: "10px",
    right: "15px",
    backgroundColor: "#FF6B6B", // Rojo suave
    color: "white",
    borderRadius: "50px",
    padding: "8px 12px",
    border: "none",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: "1050",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "10px",
  },
  finalizarButton: {
    backgroundColor: "#FF6B6B",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelarButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  content: {
    textAlign: "center",
    marginTop: "170px",
  },
  image: {
    height: "160px",
    objectFit: "contain",
    margin: "20px 0",
  },
  correct: {
    color: "green",
    fontSize: "1.5rem",
  },
  incorrect: {
    color: "red",
    fontSize: "1.5rem",
  },
};

export default PreguntaRefuerzo;
