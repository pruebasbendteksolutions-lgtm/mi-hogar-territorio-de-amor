import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./config";

/**
 * Escucha en tiempo real todas las encuestas
 * almacenadas en Firestore.
 */
export function subscribeToSurveys(onData, onError) {
  const surveysRef = collection(db, "respuestas");

  const unsubscribe = onSnapshot(
    surveysRef,
    (snapshot) => {
      const surveys = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      onData(surveys);
    },
    (error) => {
      console.error(
        "❌ Error leyendo las encuestas:",
        error
      );

      if (onError) {
        onError(error);
      }
    }
  );

  return unsubscribe;
}