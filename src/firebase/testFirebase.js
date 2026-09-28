import { collection, addDoc } from "firebase/firestore";
import { db } from "./config";

export async function testFirebase() {
  try {
    const docRef = await addDoc(collection(db, "pruebas"), {
      mensaje: "Firebase conectado correctamente",
      fecha: new Date(),
    });

    console.log("🔥 Firebase conectado. ID:", docRef.id);

    return true;
  } catch (error) {
    console.error("❌ Error conectando Firebase:", error);

    return false;
  }
}