
import { useState } from "react";

import Home from "./pages/Home";
import Instructions from "./pages/Instructions";
import Participant from "./pages/Participant";
import Survey from "./pages/Survey";
import Thanks from "./pages/Thanks";
import Dashboard from "./pages/Dashboard";
import ParentSurvey from "./pages/ParentSurvey";
import ParentDashboard from "./pages/ParentDashboard";

import { saveSurvey } from "./firebase/saveSurvey";
import { saveParentSurvey } from "./firebase/saveParentSurvey";

function App() {
  const [screen, setScreen] = useState(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (
      path.endsWith("/dashboard-padres") ||
      hash.includes("dashboard-padres")
    ) {
      return "parentDashboard";
    }

    if (
      path.endsWith("/dashboard") ||
      hash.includes("dashboard")
    ) {
      return "dashboard";
    }

    if (path.endsWith("/encuesta-padres")) {
      return "parentSurvey";
    }

    return "home";
  });

  const [saving, setSaving] = useState(false);
  const [savingParents, setSavingParents] = useState(false);

  // Datos exclusivos de la encuesta estudiantil.
  const [participant, setParticipant] = useState({
    age: "",
    course: "",
  });

  const [answers, setAnswers] = useState({});

  // =========================================
  // ENCUESTA DE ESTUDIANTES
  // =========================================

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
    if (saving) return;

    setSaving(true);

    try {
      const dataToSave = {
        age: participant.age,
        course: participant.course,
        version: surveyData.version,
        answers: surveyData.answers,
      };

      console.log(
        "Datos de la encuesta estudiantil:",
        dataToSave
      );

      const result = await saveSurvey(dataToSave);

      if (!result.success) {
        alert(
          "No pudimos guardar tus respuestas. " +
            "Verifica tu conexión a Internet e inténtalo nuevamente."
        );
        return;
      }

      setAnswers(surveyData.answers || {});
      setScreen("thanks");

      console.log(
        "Encuesta estudiantil guardada. ID:",
        result.id
      );
    } catch (error) {
      console.error(
        "Error al guardar la encuesta estudiantil:",
        error
      );

      alert(
        "Ocurrió un error al guardar la encuesta. Inténtalo nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSurveyBack = () => {
    if (saving) return;

    setScreen("participant");
  };

  const handleRestart = () => {
    setParticipant({
      age: "",
      course: "",
    });

    setAnswers({});
    setScreen("home");
  };

  // =========================================
  // ENCUESTA DE PADRES Y ACUDIENTES
  // =========================================

  const handleStartParents = () => {
    setScreen("parentSurvey");
  };

  const handleParentSurveyFinish = async (surveyData) => {
    if (savingParents) return;

    setSavingParents(true);

    try {
      const result = await saveParentSurvey(surveyData);

      if (!result.success) {
        alert(
          "No pudimos guardar la encuesta de padres. " +
            "Verifica tu conexión a Internet e inténtalo nuevamente."
        );
        return;
      }

      console.log(
        "Encuesta de padres guardada. ID:",
        result.id
      );

      setScreen("parentThanks");
    } catch (error) {
      console.error(
        "Error al guardar la encuesta de padres:",
        error
      );

      alert(
        "Ocurrió un error al guardar la encuesta de padres. Inténtalo nuevamente."
      );
    } finally {
      setSavingParents(false);
    }
  };

  const handleParentRestart = () => {
    setScreen("home");
  };

  // =========================================
  // NAVEGACIÓN Y DASHBOARDS
  // =========================================

  if (screen === "dashboard") {
    return <Dashboard />;
  }

  if (screen === "parentDashboard") {
    return <ParentDashboard />;
  }

  // =========================================
  // PANTALLAS DE PADRES
  // =========================================

  if (screen === "parentSurvey") {
    return (
      <ParentSurvey
        onFinish={handleParentSurveyFinish}
        onBack={() => setScreen("home")}
        saving={savingParents}
      />
    );
  }

  if (screen === "parentThanks") {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <section className="dashboard-section">
            <span className="dashboard-kicker">
              MI HOGAR · TERRITORIO DE AMOR
            </span>

            <h1>¡Gracias por participar!</h1>

            <p>
              Tus respuestas se han guardado correctamente.
              Gracias por ayudarnos a comprender mejor las
              necesidades de las familias.
            </p>

            <button
              type="button"
              className="hero-button"
              onClick={handleParentRestart}
            >
              Volver al inicio
            </button>
          </section>
        </div>
      </main>
    );
  }

  // =========================================
  // PANTALLAS DE ESTUDIANTES
  // =========================================

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

  if (screen === "thanks") {
    return <Thanks onRestart={handleRestart} />;
  }

  if (screen === "participant") {
    return (
      <Participant
        onContinue={handleParticipantContinue}
        onBack={handleParticipantBack}
      />
    );
  }

  if (screen === "instructions") {
    return (
      <Instructions
        onContinue={handleInstructionsContinue}
        onBack={handleInstructionsBack}
      />
    );
  }

  // =========================================
  // INICIO
  // =========================================

  return (
    <Home
      onStart={handleStart}
      onStartParents={handleStartParents}
    />
  );
}

export default App;
