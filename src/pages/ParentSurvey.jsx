
import { useState } from "react";
import { parentQuestions } from "../data/parentQuestions";

function ParentSurvey({ onFinish, onBack, saving = false }) {
  const [answers, setAnswers] = useState({});
  const [otherAnswers, setOtherAnswers] = useState({});
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    consent: false,
  });
  const [error, setError] = useState("");

  const updateContact = (field, value) => {
    setContact((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleMultiple = (question, option) => {
    setAnswers((previous) => {
      const current = previous[question.id] || [];
      const selected = current.includes(option);

      if (selected) {
        return {
          ...previous,
          [question.id]: current.filter((item) => item !== option),
        };
      }

      if (
        question.maxSelections &&
        current.length >= question.maxSelections
      ) {
        setError(
          `Puedes seleccionar máximo ${question.maxSelections} opciones en esta pregunta.`
        );
        return previous;
      }

      let next = [...current, option];

      // Las opciones que indican que no se necesita apoyo
      // son excluyentes frente a las demás.
      if (
        option.startsWith("No tenemos dificultades") ||
        option.startsWith("No necesitamos orientación") ||
        option.startsWith("No requiero acompañamiento")
      ) {
        next = [option];
      } else {
        next = next.filter(
          (item) =>
            !item.startsWith("No tenemos dificultades") &&
            !item.startsWith("No necesitamos orientación") &&
            !item.startsWith("No requiero acompañamiento")
        );
      }

      setError("");

      return {
        ...previous,
        [question.id]: next,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (contact.consent && (!contact.name.trim() || !contact.phone.trim())) {
      setError(
        "Si autorizas el contacto, escribe tu nombre y teléfono."
      );
      return;
    }

    const cleanedAnswers = { ...answers };

    parentQuestions.forEach((question) => {
      const otherOption = question.otherOption;
      const selected = cleanedAnswers[question.id];

      if (!otherOption || !selected) return;

      if (question.type === "multiple") {
        cleanedAnswers[question.id] = selected.map((item) =>
          item === otherOption && otherAnswers[question.id]?.trim()
            ? `${otherOption}: ${otherAnswers[question.id].trim()}`
            : item
        );
      } else if (
        selected === otherOption &&
        otherAnswers[question.id]?.trim()
      ) {
        cleanedAnswers[question.id] =
          `${otherOption}: ${otherAnswers[question.id].trim()}`;
      }
    });

    onFinish({
      answers: cleanedAnswers,
      contact: contact.consent
        ? {
            name: contact.name.trim(),
            phone: contact.phone.trim(),
            consent: true,
          }
        : null,
    });
  };

  return (
    <main className="dashboard-page parent-survey-page">
      <div className="dashboard-container parent-survey-container">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-kicker">
              MI HOGAR, TERRITORIO DE AMOR
            </span>
            <h1>Encuesta para padres y acudientes</h1>
            <p>
              Instrumento breve de caracterización familiar,
              emocional y social.
            </p>
          </div>
        </header>

        <section className="dashboard-section parent-survey-intro">
          <h2>Tu experiencia importa</h2>
          <p>
            Esta encuesta busca reconocer las necesidades de las
            familias y orientar posibles acciones de acompañamiento
            psicológico, familiar, espiritual, jurídico y social.
          </p>
          <p>
            Tu participación es voluntaria. No es una evaluación
            clínica ni reemplaza la atención profesional. Responde
            únicamente lo que te resulte cómodo.
          </p>
          <p>
            No necesitas escribir tu nombre ni tus datos de contacto
            para responder la encuesta.
          </p>
        </section>

        <form onSubmit={handleSubmit}>
          {parentQuestions.map((question, index) => {
            const selected = answers[question.id];
            const selectedOptions = Array.isArray(selected)
              ? selected
              : [];

            return (
              <section
                className="dashboard-section parent-question"
                key={question.id}
              >
                <div className="parent-question-heading">
                  <span className="parent-question-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="dashboard-kicker">
                      {question.title}
                    </span>
                    <h2>{question.text}</h2>
                  </div>
                </div>

                <div className="parent-options">
                  {question.options.map((option) => {
                    const checked =
                      question.type === "multiple"
                        ? selectedOptions.includes(option) ||
                          selectedOptions.some((item) =>
                            item.startsWith(`${option}:`)
                          )
                        : selected === option ||
                          (question.otherOption &&
                            selected?.startsWith(`${option}:`));

                    return (
                      <label
                        className={`parent-option ${
                          checked ? "selected" : ""
                        }`}
                        key={option}
                      >
                        <input
                          type={
                            question.type === "multiple"
                              ? "checkbox"
                              : "radio"
                          }
                          name={`question-${question.id}`}
                          checked={Boolean(checked)}
                          onChange={() => {
                            setError("");

                            if (question.type === "multiple") {
                              toggleMultiple(question, option);
                            } else {
                              setAnswers((previous) => ({
                                ...previous,
                                [question.id]: option,
                              }));
                            }
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>

                {question.otherOption &&
                  (question.type === "multiple"
                    ? selectedOptions.some((item) =>
                        item.startsWith(question.otherOption)
                      )
                    : selected?.startsWith(question.otherOption)) && (
                    <div className="parent-other-field">
                      <label htmlFor={`other-${question.id}`}>
                        Cuéntanos brevemente (opcional)
                      </label>
                      <input
                        id={`other-${question.id}`}
                        type="text"
                        maxLength={300}
                        value={otherAnswers[question.id] || ""}
                        onChange={(event) =>
                          setOtherAnswers((previous) => ({
                            ...previous,
                            [question.id]: event.target.value,
                          }))
                        }
                        placeholder="Escribe aquí..."
                      />
                    </div>
                  )}

                {question.maxSelections && (
                  <p className="parent-selection-hint">
                    Seleccionadas: {selectedOptions.length} de{" "}
                    {question.maxSelections} máximo.
                  </p>
                )}
              </section>
            );
          })}

          <section className="dashboard-section parent-contact-section">
            <span className="dashboard-kicker">
              OPCIONAL
            </span>
            <h2>¿Te gustaría que te contactáramos?</h2>
            <p>
              Estos datos solo se solicitarán para dar seguimiento
              a la necesidad que indiques. Puedes enviar la encuesta
              sin proporcionarlos.
            </p>

            <div className="parent-contact-field">
              <label htmlFor="parent-name">
                Nombre y apellidos
              </label>
              <input
                id="parent-name"
                type="text"
                maxLength={120}
                value={contact.name}
                onChange={(event) =>
                  updateContact("name", event.target.value)
                }
                autoComplete="name"
                placeholder="Tu nombre"
              />
            </div>

            <div className="parent-contact-field">
              <label htmlFor="parent-phone">
                Teléfono de contacto
              </label>
              <input
                id="parent-phone"
                type="tel"
                maxLength={30}
                value={contact.phone}
                onChange={(event) =>
                  updateContact("phone", event.target.value)
                }
                autoComplete="tel"
                placeholder="Tu número de contacto"
              />
            </div>

            <label className="parent-consent">
              <input
                type="checkbox"
                checked={contact.consent}
                onChange={(event) =>
                  updateContact("consent", event.target.checked)
                }
              />
              <span>
                Autorizo que me contacten para dar seguimiento a la
                necesidad que indiqué.
              </span>
            </label>

            <p className="parent-privacy-note">
              La autorización es voluntaria. Los datos de contacto
              deben manejarse por separado de los resultados
              analíticos y solo deben ser accesibles para personal
              autorizado.
            </p>
          </section>

          {error && (
            <div className="dashboard-error" role="alert">
              {error}
            </div>
          )}

          <div className="parent-form-actions">
            <button
              type="button"
              className="dashboard-clear-filters"
              onClick={onBack}
              disabled={saving}
            >
              Volver
            </button>

            <button
              type="submit"
              className="hero-button"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Enviar encuesta"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default ParentSurvey;
