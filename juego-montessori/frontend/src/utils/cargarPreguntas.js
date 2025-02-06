import { collection, getDocs, query, where } from "firebase/firestore";
import db from "../firebase-config"; // Asegúrate de que `db` esté configurado

export const cargarPreguntas = async (grupoEdad) => {
  try {
    const preguntasRef = collection(db, "preguntas"); // Referencia a la colección
    const q = query(preguntasRef, where("grupoEdad", "==", grupoEdad)); // Filtra por grupoEdad
    const querySnapshot = await getDocs(q);

    const preguntas = [];
    querySnapshot.forEach((doc) => {
      preguntas.push({ id: doc.id, ...doc.data() });
    });

    return preguntas; // Retorna las preguntas cargadas
  } catch (error) {
    console.error("Error al cargar las preguntas:", error);
    return [];
  }
};
