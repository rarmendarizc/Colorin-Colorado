import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import axios from "axios";
import db from "../firebase-config";
import { io } from "socket.io-client";
import Header from "./Header";
import Footer from "./Footer";
import { FaDoorOpen } from "react-icons/fa";

const socket = io("http://localhost:5000");

const Pregunta = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const grupoEdad = location.state?.grupoEdad;
  const username = location.state?.username;
  const rondaId = location.state?.rondaId;

  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [tiempo, setTiempo] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [procesandoRespuesta, setProcesandoRespuesta] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const erroresPorColor = useRef({
    celeste: 0,
    magenta: 0,
    azul: 0,
    amarillo: 0,
    verde: 0,
    rojo: 0,
  });

  const respuestasPorColorRef = useRef({
    Amarillo: { correct: 0, wrong: 0 },
    Azul: { correct: 0, wrong: 0 },
    Celeste: { correct: 0, wrong: 0 },
    Magenta: { correct: 0, wrong: 0 },
    Rojo: { correct: 0, wrong: 0 },
    Verde: { correct: 0, wrong: 0 },
  });

  const intervaloRef = useRef(null);

  useEffect(() => {
    cargarPreguntasIniciales();
    iniciarTemporizador();
  }, []);

  useEffect(() => {
    if (preguntaActual) {
      socket.on("mensajeESP32", (data) => {
        if (!procesandoRespuesta && preguntaActual) {
          manejarRespuesta(data.boton?.toLowerCase());
        }
      });

      return () => {
        socket.off("mensajeESP32");
      };
    }
  }, [preguntaActual, procesandoRespuesta]);

  const cargarPreguntasIniciales = async () => {
    try {
      const preguntasRef = collection(db, "preguntas");
      const q = query(preguntasRef, where("grupoEdad", "==", grupoEdad));
      const querySnapshot = await getDocs(q);

      const preguntasValidas = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => p.pregunta && p.respuestaCorrecta && p.imagen);

      const preguntasSeleccionadas = seleccionarPreguntasPorColor(preguntasValidas);
      setPreguntas(preguntasSeleccionadas);

      if (preguntasSeleccionadas.length > 0) {
        setPreguntaActual(preguntasSeleccionadas[0]);
      }
    } catch (error) {
      console.error("Error al cargar preguntas iniciales:", error);
    }
  };

  const seleccionarPreguntasPorColor = (preguntasValidas) => {
    const gruposPorColor = {
      Amarillo: [],
      Azul: [],
      Celeste: [],
      Magenta: [],
      Rojo: [],
      Verde: [],
    };

    preguntasValidas.forEach((pregunta) => {
      if (gruposPorColor[pregunta.respuestaCorrecta]) {
        gruposPorColor[pregunta.respuestaCorrecta].push(pregunta);
      }
    });

    return Object.values(gruposPorColor)
      .flatMap((preguntasColor) => preguntasColor.slice(0, 3))
      .sort(() => Math.random() - 0.5);
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

    const colorActual = preguntaActual.respuestaCorrecta;
    respuestasPorColorRef.current[colorActual].correct += esCorrecta ? 1 : 0;
    respuestasPorColorRef.current[colorActual].wrong += esCorrecta ? 0 : 1;

    if (!esCorrecta) {
      erroresPorColor.current[colorCorrecto] += 1;
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
    } else {
      finalizarRonda();
    }
  };

  const finalizarRonda = async (usarModelo = true) => {
    clearInterval(intervaloRef.current);

    if (!usarModelo) {
      return mostrarResultados({});
    }

    try {
      const respuestaModelo = await axios.post("http://localhost:5001/predecir", erroresPorColor.current);
      mostrarResultados(respuestaModelo.data.refuerzo_validado || {});
    } catch (error) {
      console.error("Error al finalizar la ronda o comunicarse con el modelo ML:", error);
    }
  };

  const mostrarResultados = async (coloresRefuerzo) => {
    const userRef = doc(db, "users", username);
    await updateDoc(userRef, {
      [`progress.rounds.ronda_${rondaId}`]: {
        tiempoTotal: tiempo,
        respuestasPorColor: respuestasPorColorRef.current,
        erroresPorColor: erroresPorColor.current,
      },
    });

    navigate("/resultados", {
      state: { username, tiempo, grupoEdad, coloresRefuerzo },
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
              <button onClick={() => finalizarRonda(false)} style={styles.finalizarButton}>
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
        {mensaje && <p style={mensaje.includes("correcta") ? styles.correct : styles.incorrect}>{mensaje}</p>}
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

export default Pregunta;
