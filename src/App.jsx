import { useState } from "react";

import Home from "./pages/Home";
import Instructions from "./pages/Instructions";
import Participant from "./pages/Participant";
import Survey from "./pages/Survey";
import Thanks from "./pages/Thanks";
import Dashboard from "./pages/Dashboard";

import { saveSurvey } from "./firebase/saveSurvey";

function App() {
  const [screen, setScreen] = useState(() => {
    const path = window.location.pathname;

    if (path.endsWith("/dashboard")) {
      return "dashboard";
    }

    return "home";
  });

  const [saving, setSaving] = useState(false);

  const [participant, setParticipant] = useState({
    age: "",
    course: "",
  });

  const [answers, setAnswers] = useState({});

  const handleStart = () => {
    setScreen("instructions");
  };

  const handleInstructionsContinue = () => {
    setScreen("participant");
  };

  const handleParticipantContinue = (data) => {
    setParticipant({
      age: data.age,
      course: data.course,
    });

    setAnswers({});

    setScreen("survey");
  };

  const handleInstructionsBack = () => {
    setScreen("home");
  };

  const handleParticipantBack = () => {
    setScreen("instructions");
  };

  const handleSurveyFinish = async (surveyData) => {
    if (saving) {
      return;
    }

    setSaving(true);

    console.log("================================");
    console.log("ENCUESTA TERMINADA");
    console.log("================================");

    const dataToSave = {
      age: participant.age,
      course: participant.course,
      version: surveyData.version,
      answers: surveyData.answers,
    };

    console.log(
      "📦 Datos que se enviarán a Firebase:",
      dataToSave
    );

    const result = await saveSurvey(dataToSave);

    if (result.success) {
      setAnswers(surveyData);

      console.log(
        "🔥 Encuesta almacenada en Firestore."
      );

      console.log(
        "🆔 ID:",
        result.id
      );

      setSaving(false);

      setScreen("thanks");

      return;
    }

    console.error(
      "❌ No se pudo guardar la encuesta."
    );

    setSaving(false);

    alert(
      "No pudimos guardar tus respuestas. " +
      "Por favor, verifica tu conexión a Internet e inténtalo nuevamente."
    );
  };

  const handleSurveyBack = () => {
    if (saving) {
      return;
    }

    setScreen("participant");
  };

  const handleRestart = () => {
    setParticipant({
      age: "",
      course: "",
    });

    setAnswers({});

    setSaving(false);

    setScreen("home");
  };

  /*
   * DASHBOARD
   *
   * Si la URL termina en /dashboard,
   * mostramos directamente el Dashboard.
   */

  if (screen === "dashboard") {
    return <Dashboard />;
  }

  /*
   * ENCUESTA
   */

  if (screen === "survey") {
    return (
      <Survey
        age={participant.age}
        course={participant.course}
        onFinish={handleSurveyFinish}
        onBack={handleSurveyBack}
      />
    );
  }

  /*
   * AGRADECIMIENTO
   */

  if (screen === "thanks") {
    return <Thanks onRestart={handleRestart} />;
  }

  /*
   * PARTICIPANTE
   */

  if (screen === "participant") {
    return (
      <Participant
        onContinue={handleParticipantContinue}
        onBack={handleParticipantBack}
      />
    );
  }

  /*
   * INSTRUCCIONES
   */

  if (screen === "instructions") {
    return (
      <Instructions
        onContinue={handleInstructionsContinue}
        onBack={handleInstructionsBack}
      />
    );
  }

  /*
   * HOME
   */

  return <Home onStart={handleStart} />;
}

export default App;