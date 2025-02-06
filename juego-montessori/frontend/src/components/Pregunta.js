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
  const { grupoEdad, username, rondaId, preguntas: preguntasIniciales, refuerzoColores } = location.state || {};

  const [preguntas, setPreguntas] = useState(preguntasIniciales || []);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [tiempo, setTiempo] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [procesandoRespuesta, setProcesandoRespuesta] = useState(false);

  // Inicializamos los errores acumulados por color
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
    if (refuerzoColores?.length > 0) {
      cargarPreguntasRefuerzo(); // Cargar preguntas de refuerzo si existen colores
    } else {
      cargarPreguntas(); // Cargar preguntas regulares
    }
    iniciarTemporizador();

    return () => {
      clearInterval(intervaloRef.current);
    };
  }, [grupoEdad, preguntas, refuerzoColores]);

  const cargarPreguntas = async () => {
    if (preguntas.length > 0) return;

    try {
      const preguntasRef = collection(db, "preguntas");
      const q = query(preguntasRef, where("grupoEdad", "==", grupoEdad));
      const querySnapshot = await getDocs(q);

      let preguntasValidas = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => p.pregunta && p.respuestaCorrecta && p.imagen);

      const gruposPorColor = {
        Amarillo: [], Azul: [], Celeste: [], Magenta: [], Rojo: [], Verde: [],
      };

      preguntasValidas.forEach((pregunta) => {
        const color = pregunta.respuestaCorrecta;
        if (gruposPorColor[color]) {
          gruposPorColor[color].push(pregunta);
        }
      });

      const seleccionarPreguntasUnicas = (preguntasColor) => {
        const seleccionadas = [];
        while (seleccionadas.length < 3 && preguntasColor.length > 0) {
          const indexAleatorio = Math.floor(Math.random() * preguntasColor.length);
          seleccionadas.push(preguntasColor.splice(indexAleatorio, 1)[0]);
        }
        return seleccionadas;
      };

      const preguntasSeleccionadas = Object.values(gruposPorColor)
        .flatMap((preguntasColor) => seleccionarPreguntasUnicas(preguntasColor))
        .sort(() => Math.random() - 0.5);

      setPreguntas(preguntasSeleccionadas);
      if (preguntasSeleccionadas.length > 0) {
        setPreguntaActual(preguntasSeleccionadas[0]);
      }
    } catch (error) {
      console.error("Error al cargar preguntas desde Firestore:", error);
    }
  };

  const cargarPreguntasRefuerzo = async () => {
    try {
      console.log("Colores de refuerzo recibidos del modelo:", refuerzoColores);

      const preguntasRef = collection(db, "preguntas");
      const q = query(preguntasRef, where("grupoEdad", "==", grupoEdad));
      const querySnapshot = await getDocs(q);

      let preguntasValidas = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((pregunta) => refuerzoColores.includes(pregunta.respuestaCorrecta.toLowerCase()));

      const seleccionarPreguntas = (preguntasColor) => {
        const seleccionadas = [];
        while (seleccionadas.length < 3 && preguntasColor.length > 0) {
          const indexAleatorio = Math.floor(Math.random() * preguntasColor.length);
          seleccionadas.push(preguntasColor.splice(indexAleatorio, 1)[0]);
        }
        return seleccionadas;
      };

      const preguntasSeleccionadas = refuerzoColores.flatMap((color) => {
        const preguntasPorColor = preguntasValidas.filter(
          (pregunta) => pregunta.respuestaCorrecta.toLowerCase() === color.toLowerCase()
        );
        return seleccionarPreguntas(preguntasPorColor);
      });

      preguntasSeleccionadas.sort(() => Math.random() - 0.5);

      console.log("Preguntas seleccionadas para refuerzo:", preguntasSeleccionadas);

      setPreguntas(preguntasSeleccionadas);
      if (preguntasSeleccionadas.length > 0) {
        setPreguntaActual(preguntasSeleccionadas[0]);
      }
    } catch (error) {
      console.error("Error al cargar preguntas de refuerzo:", error);
    }
  };

  useEffect(() => {
    const manejarSocket = (data) => {
      if (!procesandoRespuesta && preguntaActual) {
        const colorRecibido = data.boton?.toLowerCase() || "";
        manejarRespuesta(colorRecibido);
      }
    };

    socket.on("mensajeESP32", manejarSocket);

    return () => {
      socket.off("mensajeESP32", manejarSocket);
    };
  }, [preguntaActual, procesandoRespuesta]);

  const iniciarTemporizador = () => {
    intervaloRef.current = setInterval(() => {
      setTiempo((prev) => prev + 1);
    }, 1000);
  };

  const manejarRespuesta = (respuesta) => {
    if (!preguntaActual || !respuesta) {
      console.error("La respuesta o la pregunta actual no están definidas.");
      return;
    }

    setProcesandoRespuesta(true);

    const colorCorrecto = preguntaActual.respuestaCorrecta.toLowerCase();
    const esCorrecta = respuesta === colorCorrecto;

    setMensaje(esCorrecta ? "✅ ¡Respuesta correcta!" : "❌ Respuesta incorrecta");

    const colorActual = preguntaActual.respuestaCorrecta;
    respuestasPorColorRef.current[colorActual].correct += esCorrecta ? 1 : 0;
    respuestasPorColorRef.current[colorActual].wrong += esCorrecta ? 0 : 1;

    // Incrementar los errores si es incorrecta
    if (!esCorrecta) {
      erroresPorColor.current[colorActual.toLowerCase()] += 1;
    }

    setTimeout(() => {
      setMensaje("");
      avanzarPregunta();
    }, 2000);
  };

  const avanzarPregunta = () => {
    const siguientePreguntaIndex = preguntas.indexOf(preguntaActual) + 1;
    if (siguientePreguntaIndex < preguntas.length) {
      setPreguntaActual(preguntas[siguientePreguntaIndex]);
      setProcesandoRespuesta(false);
    } else {
      finalizarPartida();
    }
  };

  const finalizarPartida = async () => {
    clearInterval(intervaloRef.current);

    try {
      console.log("Errores acumulados por color:", erroresPorColor.current);

      const respuestaModelo = await axios.post("http://localhost:5001/predecir", erroresPorColor.current);

      const coloresRefuerzo = respuestaModelo.data.refuerzo_validado || [];
      console.log("Predicción del modelo - Colores de refuerzo:", coloresRefuerzo);

      const userRef = doc(db, "users", username);
      await updateDoc(userRef, {
        [`progress.rounds.ronda_${rondaId}`]: {
          tiempoTotal: tiempo,
          totalPreguntas: preguntas.length,
          respuestasPorColor: respuestasPorColorRef.current,
        },
      });

      navigate("/resultados", {
        state: { username, tiempo, grupoEdad, coloresRefuerzo },
      });
    } catch (error) {
      console.error("Error al finalizar la partida o enviar los datos al modelo:", error);
    }
  };

  const handleCerrarSesion = () => {
    clearInterval(intervaloRef.current);
    navigate("/bienvenido", { state: { username } });
  };

  return (
    <div style={styles.container}>
      <div style={styles.timerWrapper}>
        <div style={styles.timer}>⏱ {tiempo}s</div>
      </div>
      <Header />

      <button onClick={handleCerrarSesion} style={styles.cerrarSesionBtn}>
        <FaDoorOpen size={20} />
      </button>

      <div style={styles.content}>
        <h2 style={styles.question}>{preguntaActual?.pregunta}</h2>
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
    justifyContent: "space-between",
    minHeight: "100vh",
    backgroundColor: "#DFF6FF",
  },
  timerWrapper: {
    position: "fixed",
    top: "10px",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    zIndex: 1000,
  },
  timer: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#333",
    padding: "10px 20px",
    borderRadius: "10px",
  },
  cerrarSesionBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
    backgroundColor: "#FF6B6B",
    color: "white",
    borderRadius: "50px",
    padding: "8px 12px",
    border: "none",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: 1050,
  },
  content: {
    textAlign: "center",
    marginTop: "200px",
  },
  question: {
    fontSize: "2.5rem",
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
