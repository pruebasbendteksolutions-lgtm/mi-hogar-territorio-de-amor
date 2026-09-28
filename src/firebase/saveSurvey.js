import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

/**
 * Guarda una encuesta completa en Firestore.
 *
 * La información almacenada es anónima:
 * - edad
 * - curso
 * - versión de encuesta
 * - respuestas
 * - fecha
 */
export async function saveSurvey({
  age,
  course,
  version,
  answers,
}) {
  try {
    const surveyData = {
      age,
      course,
      version,
      answers,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "respuestas"),
      surveyData
    );

    console.log("✅ Encuesta guardada correctamente.");
    console.log("🆔 ID del documento:", docRef.id);

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error(
      "❌ Error guardando la encuesta:",
      error
    );

    return {
      success: false,
      error,
    };
  }
}