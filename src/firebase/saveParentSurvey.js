
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "./config";

export async function saveParentSurvey({
  answers,
  contact,
}) {
  try {
    const batch = writeBatch(db);

    // Documento independiente para las respuestas analíticas.
    const surveyRef = doc(collection(db, "respuestas_padres"));

    batch.set(surveyRef, {
      answers,
      createdAt: serverTimestamp(),
    });

    // Los datos de contacto solo se guardan si existe
    // autorización explícita de la persona.
    if (
      contact?.consent === true &&
      contact.name?.trim() &&
      contact.phone?.trim()
    ) {
      const contactRef = doc(
        collection(db, "contactos_padres")
      );

      batch.set(contactRef, {
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        consent: true,
        surveyId: surveyRef.id,
        createdAt: serverTimestamp(),
      });
    }

    // Guarda ambos documentos en una sola operación.
    await batch.commit();

    console.log("Encuesta de padres guardada correctamente.");

    return {
      success: true,
      id: surveyRef.id,
    };
  } catch (error) {
    console.error(
      "Error guardando la encuesta de padres:",
      error
    );

    return {
      success: false,
      error,
    };
  }
}
