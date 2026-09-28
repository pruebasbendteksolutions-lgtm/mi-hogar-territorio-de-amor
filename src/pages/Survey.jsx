import { useMemo, useState } from "react";
import { getQuestions, getScale } from "../data/questions";

function Survey({ age, course, onFinish, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  // =========================================================
  // DETERMINAR VERSIÓN
  // =========================================================

  const version = useMemo(() => {
    if (age === "18+") {
      return "18+";
    }

    const numericAge = Number(age);

    if (numericAge >= 8 && numericAge <= 12) {
      return "8-12";
    }

    if (numericAge >= 13 && numericAge <= 17) {
      return "13-17";
    }

    return null;
  }, [age]);

  // =========================================================
  // CARGAR PREGUNTAS SEGÚN EDAD
  // =========================================================

  const questions = useMemo(() => {
    if (!age) {
      return [];
    }

    return getQuestions(age);
  }, [age]);

  // =========================================================
  // CARGAR ESCALA SEGÚN EDAD
  // =========================================================

  const scale = useMemo(() => {
    if (!age) {
      return [];
    }

    return getScale(age);
  }, [age]);

  // =========================================================
  // SEGURIDAD
  // =========================================================

  if (!questions.length) {
    return (
      <main className="survey-page">
        <div className="survey-container">
          <div className="survey-card">

            <h2>
              No pudimos determinar la versión de la encuesta.
            </h2>

            <p>
              Verifica la edad seleccionada.
            </p>

            <button
              type="button"
              className="survey-back"
              onClick={onBack}
            >
              ← Volver
            </button>

          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // PREGUNTA ACTUAL
  // =========================================================

  const question = questions[currentQuestion];

  const isLastQuestion =
    currentQuestion === questions.length - 1;

  const currentAnswer = answers[question.id];

  // =========================================================
  // VALIDAR RESPUESTA
  // =========================================================

  const canContinue =
    question.type === "textarea"
      ? true
      : currentAnswer !== undefined;

  // =========================================================
  // GUARDAR RESPUESTA
  // =========================================================

  const handleAnswer = (value) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: value,
    }));
  };

  // =========================================================
  // SIGUIENTE
  // =========================================================

  const handleNext = () => {
    if (!canContinue) {
      return;
    }

    if (isLastQuestion) {
      onFinish({
        age,
        course,
        version,
        answers,
      });

      return;
    }

    setCurrentQuestion(
      (previous) => previous + 1
    );
  };

  // =========================================================
  // ATRÁS
  // =========================================================

  const handleBack = () => {
    if (currentQuestion === 0) {
      onBack();
      return;
    }

    setCurrentQuestion(
      (previous) => previous - 1
    );
  };

  // =========================================================
  // PROGRESO
  // =========================================================

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="survey-page">

      <div className="survey-container">

        {/* ===============================================
            HEADER
        =============================================== */}

        <header className="survey-header">

          <div>

            <span className="survey-kicker">
              MI HOGAR, TERRITORIO DE AMOR
            </span>

            <h1>
              Queremos escucharte
            </h1>

          </div>

          <div className="survey-counter">

            {currentQuestion + 1}

            <span>
              / {questions.length}
            </span>

          </div>

        </header>

        {/* ===============================================
            PROGRESO
        =============================================== */}

        <div className="survey-progress">

          <div
            className="survey-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        {/* ===============================================
            DIMENSIÓN
        =============================================== */}

        <div className="survey-dimension">

          {question.dimension}

        </div>

        {/* ===============================================
            TARJETA
        =============================================== */}

        <section className="survey-card">

          <span className="question-number">
            Pregunta {currentQuestion + 1}
          </span>

          {/* =============================================
              TEXTO REAL DE LA PREGUNTA
          ============================================= */}

          <h2>
            {question.text}
          </h2>

          {/* =============================================
              PREGUNTA ABIERTA
          ============================================= */}

          {question.type === "textarea" ? (

            <div className="open-question">

              <textarea
                value={currentAnswer || ""}
                onChange={(e) =>
                  handleAnswer(e.target.value)
                }
                placeholder="Escribe tu respuesta..."
              />

              <p>
                Tu respuesta es anónima.
              </p>

            </div>

          ) : (

            /* ===========================================
               ESCALA
            =========================================== */

            <div className="survey-options">

              {scale.map((option) => {

                const selected =
                  currentAnswer === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`survey-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() =>
                      handleAnswer(option.value)
                    }
                  >

                    <span className="survey-emoji">
                      {option.emoji}
                    </span>

                    <strong>
                      {option.value}
                    </strong>

                    <span>
                      {option.label}
                    </span>

                  </button>
                );

              })}

            </div>

          )}

          {/* =============================================
              NAVEGACIÓN
          ============================================= */}

          <div className="survey-navigation">

            <button
              type="button"
              className="survey-back"
              onClick={handleBack}
            >
              ← Atrás
            </button>

            <button
              type="button"
              className="survey-next"
              onClick={handleNext}
              disabled={!canContinue}
            >

              {isLastQuestion
                ? "Finalizar encuesta"
                : "Siguiente →"}

            </button>

          </div>

        </section>

        {/* ===============================================
            FOOTER
        =============================================== */}

        <p className="survey-footer">

          Tus respuestas son anónimas y serán utilizadas
          únicamente para comprender mejor las necesidades
          de nuestra comunidad educativa.

        </p>

      </div>

    </main>
  );
}

export default Survey;