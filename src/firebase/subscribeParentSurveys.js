
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./config";

/**
 * Escucha en tiempo real las encuestas de padres
 * y acudientes almacenadas en Firestore.
 */
export function subscribeToParentSurveys(onData, onError) {
  const surveysRef = collection(db, "respuestas_padres");

  const unsubscribe = onSnapshot(
    surveysRef,
    (snapshot) => {
      const surveys = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      onData(surveys);
    },
    (error) => {
      console.error(
        "Error leyendo las encuestas de padres:",
        error
      );

      if (onError) {
        onError(error);
      }
    }
  );

  return unsubscribe;
}
