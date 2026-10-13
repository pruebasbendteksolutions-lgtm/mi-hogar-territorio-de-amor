
import { useEffect, useMemo, useState } from "react";
import { parentQuestions } from "../data/parentQuestions";
import { subscribeToParentSurveys } from "../firebase/subscribeParentSurveys";

const COLORS = [
  "#718c78",
  "#c8a96b",
  "#819bc7",
  "#b28bb7",
  "#d68c72",
  "#7ba9a3",
  "#a3a66d",
  "#9a8a7a",
  "#c9785b",
  "#8b6fc4",
];

function isAnswered(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return true;
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOption(option) {
  if (typeof option === "string") return option;
  if (option && typeof option === "object") {
    return String(option.label ?? option.text ?? option.value ?? "");
  }
  return String(option ?? "");
}

function matchesOption(answer, option) {
  const selectedOption = normalizeOption(option).trim();

  const matches = (value) => {
    if (typeof value !== "string") return false;
    const normalizedValue = value.trim();

    return (
      normalizedValue === selectedOption ||
      normalizedValue.startsWith(`${selectedOption}:`)
    );
  };

  return Array.isArray(answer)
    ? answer.some(matches)
    : matches(answer);
}

function getSurveyDate(value) {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = getSurveyDate(value);

  if (!date) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getQuestionText(question) {
  return question.title || question.text || question.question || "Pregunta sin título";
}

function isMultipleChoice(question) {
  const type = String(question.type || "").toLowerCase();

  return (
    type.includes("multiple") ||
    type.includes("multi") ||
    type.includes("checkbox")
  );
}

function PieChart({ items, total }) {
  let current = 0;

  const segments = items.map((item, index) => {
    const percentage = total > 0 ? (item.count / total) * 100 : 0;
    const start = current;
    current += percentage;

    return {
      ...item,
      percentage,
      start,
      end: current,
      color: COLORS[index % COLORS.length],
    };
  });

  const gradient =
    total > 0
      ? `conic-gradient(${segments
          .filter((item) => item.count > 0)
          .map(
            (item) =>
              `${item.color} ${item.start}% ${item.end}%`
          )
          .join(", ")})`
      : "#e9ebe5";

  return (
    <div className="pdx-pie-layout">
      <div
        className="pdx-pie"
        style={{ background: gradient }}
        role="img"
        aria-label={`Distribución de ${total} respuestas`}
      >
        <div className="pdx-pie-center">
          <strong>{total}</strong>
          <span>selecciones</span>
        </div>
      </div>

      <div className="pdx-legend">
        {segments.map((item) => (
          <div className="pdx-legend-row" key={item.option}>
            <span
              className="pdx-legend-dot"
              style={{ background: item.color }}
            />

            <span className="pdx-legend-name">{item.option}</span>

            <strong>{item.count}</strong>

            <small>{Math.round(item.percentage)}%</small>
          </div>
        ))}

        {total === 0 && (
          <p className="pdx-muted">
            Aún no hay respuestas para esta pregunta.
          </p>
        )}
      </div>
    </div>
  );
}

function BarChart({ items, total }) {
  const maxCount = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="pdx-bars">
      {items.map((item, index) => {
        const percentage =
          total > 0 ? Math.round((item.count / total) * 100) : 0;

        const width = (item.count / maxCount) * 100;

        return (
          <div className="pdx-bar-item" key={item.option}>
            <div className="pdx-bar-labels">
              <span>{item.option}</span>
              <strong>
                {item.count}
                <small> · {percentage}%</small>
              </strong>
            </div>

            <div className="pdx-bar-track">
              <div
                className="pdx-bar-fill"
                style={{
                  width: `${width}%`,
                  background: COLORS[index % COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}

      {total === 0 && (
        <p className="pdx-muted">
          Aún no hay respuestas para esta pregunta.
        </p>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, detail }) {
  return (
    <article className="pdx-stat-card">
      <div className="pdx-stat-top">
        <span className="pdx-stat-icon">{icon}</span>
        <span className="pdx-stat-label">{label}</span>
      </div>

      <strong className="pdx-stat-value">{value}</strong>

      <span className="pdx-stat-detail">{detail}</span>
    </article>
  );
}

export default function ParentDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubscribe = subscribeToParentSurveys(
      (data) => {
        setSurveys(Array.isArray(data) ? data : []);
        setLoading(false);
        setError("");
      },
      (firebaseError) => {
        console.error("Error al cargar las encuestas de padres:", firebaseError);
        setError(
          "No fue posible cargar las respuestas. Verifica la conexión y los permisos de Firebase."
        );
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const questions = useMemo(() => {
    return parentQuestions.map((question) => {
      const questionId = String(question.id);

      const questionResponses = surveys.filter((survey) =>
        isAnswered(survey.answers?.[questionId])
      );

      const rawOptions = Array.isArray(question.options)
        ? question.options
        : [];

      const options = rawOptions.map((option) => {
        const label = normalizeOption(option);

        const count = surveys.reduce((total, survey) => {
          const answer = survey.answers?.[questionId];

          return total + (matchesOption(answer, label) ? 1 : 0);
        }, 0);

        return {
          option: label,
          count,
        };
      });

      const multiple = isMultipleChoice(question);

      // En preguntas de selección múltiple una familia puede elegir
      // más de una opción. La torta muestra la proporción de selecciones.
      const chartTotal = multiple
        ? options.reduce((sum, item) => sum + item.count, 0)
        : questionResponses.length;

      return {
        ...question,
        id: questionId,
        displayText: getQuestionText(question),
        options,
        answered: questionResponses.length,
        unanswered: Math.max(0, surveys.length - questionResponses.length),
        chartTotal,
        multiple,
      };
    });
  }, [surveys]);

  const visibleQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch = question.displayText
        .toLowerCase()
        .includes(term);

      const matchesSelected =
        selectedQuestion === "all" ||
        question.id === String(selectedQuestion);

      return matchesSearch && matchesSelected;
    });
  }, [questions, search, selectedQuestion]);

  const totalSurveys = surveys.length;
  const totalQuestions = questions.length;
  const totalPossibleAnswers = totalSurveys * totalQuestions;

  const totalAnswered = questions.reduce(
    (sum, question) => sum + question.answered,
    0
  );

  const completion =
    totalPossibleAnswers > 0
      ? Math.round((totalAnswered / totalPossibleAnswers) * 100)
      : 0;

  const latestDate = surveys.reduce((latest, survey) => {
    const date = getSurveyDate(
      survey.createdAt || survey.fecha || survey.timestamp
    );

    return date && (!latest || date > latest) ? date : latest;
  }, null);

  const mostAnswered = [...questions].sort(
    (a, b) => b.answered - a.answered
  )[0];

  const leastAnswered = [...questions].sort(
    (a, b) => a.answered - b.answered
  )[0];

  const selectedQuestionLabel =
    selectedQuestion === "all"
      ? "Todas las preguntas"
      : questions.find(
          (question) => question.id === String(selectedQuestion)
        )?.displayText || "Pregunta seleccionada";

  if (loading) {
    return (
      <main className="pdx-page">
        <div className="pdx-loading">
          <div className="pdx-spinner" />
          <h2>Cargando dashboard</h2>
          <p>Estamos consultando las respuestas de las familias...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pdx-page">
      <div className="pdx-container">
        <header className="pdx-header">
          <div className="pdx-brand">
            <div className="pdx-brand-mark">♥</div>

            <div>
              <span className="pdx-eyebrow">
                MI HOGAR, TERRITORIO DE AMOR
              </span>
              <h1>Dashboard de padres</h1>
              <p>
                Una mirada general a las respuestas y necesidades de las familias.
              </p>
            </div>
          </div>

          <div className="pdx-header-status">
            <span className="pdx-status-dot" />
            <span>Datos de Firebase</span>
          </div>
        </header>

        {error && (
          <div className="pdx-error" role="alert">
            <strong>No pudimos cargar los datos.</strong>
            <p>{error}</p>
          </div>
        )}

        <section className="pdx-welcome">
          <div>
            <span className="pdx-eyebrow">RESUMEN GENERAL</span>
            <h2>Conocer para acompañar mejor</h2>
            <p>
              Consulta la participación de las familias y revisa cada pregunta
              con sus respectivos gráficos.
            </p>
          </div>

          <div className="pdx-welcome-symbol" aria-hidden="true">
            <span>♡</span>
            <span>⌂</span>
            <span>♡</span>
          </div>
        </section>

        <section className="pdx-stats-grid" aria-label="Resumen de encuestas">
          <StatCard
            icon="👨‍👩‍👧"
            label="Encuestas recibidas"
            value={totalSurveys}
            detail="Respuestas enviadas por familias"
          />

          <StatCard
            icon="📝"
            label="Preguntas"
            value={totalQuestions}
            detail="Preguntas en el formulario"
          />

          <StatCard
            icon="📊"
            label="Respuestas registradas"
            value={totalAnswered}
            detail={`De ${totalPossibleAnswers} respuestas posibles`}
          />

          <StatCard
            icon="✓"
            label="Participación"
            value={`${completion}%`}
            detail="Porcentaje de preguntas respondidas"
          />
        </section>

        <section className="pdx-overview-grid">
          <article className="pdx-overview-card">
            <span className="pdx-overview-icon">↗</span>
            <div>
              <span className="pdx-overview-label">
                Pregunta con más respuestas
              </span>
              <strong>
                {totalSurveys > 0 && mostAnswered
                  ? mostAnswered.displayText
                  : "Aún no hay respuestas"}
              </strong>
              {totalSurveys > 0 && mostAnswered && (
                <small>
                  {mostAnswered.answered} de {totalSurveys} familias
                </small>
              )}
            </div>
          </article>

          <article className="pdx-overview-card">
            <span className="pdx-overview-icon">◷</span>
            <div>
              <span className="pdx-overview-label">Última actualización</span>
              <strong>
                {latestDate
                  ? formatDate(latestDate)
                  : "Todavía no hay registros"}
              </strong>
              <small>Según la fecha guardada en Firebase</small>
            </div>
          </article>
        </section>

        <section className="pdx-results-section">
          <div className="pdx-results-heading">
            <div>
              <span className="pdx-eyebrow">ANÁLISIS POR PREGUNTA</span>
              <h2>Resultados de las familias</h2>
              <p>
                Cada pregunta tiene una gráfica de torta y otra de barras.
              </p>
            </div>

            <span className="pdx-results-count">
              {visibleQuestions.length}{" "}
              {visibleQuestions.length === 1 ? "pregunta" : "preguntas"}
            </span>
          </div>

          <div className="pdx-controls">
            <label className="pdx-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por el texto de la pregunta..."
                aria-label="Buscar pregunta"
              />
            </label>

            <label className="pdx-filter">
              <span>Filtrar preguntas</span>
              <select
                value={selectedQuestion}
                onChange={(event) => setSelectedQuestion(event.target.value)}
              >
                <option value="all">Todas las preguntas</option>

                {questions.map((question, index) => (
                  <option value={question.id} key={question.id}>
                    {index + 1}. {question.displayText}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="pdx-active-filter">
            <span>Mostrando:</span>
            <strong>{selectedQuestionLabel}</strong>

            {(search || selectedQuestion !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedQuestion("all");
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {visibleQuestions.length === 0 ? (
            <div className="pdx-empty">
              <span>⌕</span>
              <h3>No encontramos preguntas</h3>
              <p>
                Prueba con otra búsqueda o limpia los filtros para ver todos
                los resultados.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedQuestion("all");
                }}
              >
                Mostrar todas las preguntas
              </button>
            </div>
          ) : (
            <div className="pdx-question-grid">
              {visibleQuestions.map((question) => {
                const questionIndex = questions.findIndex(
                  (item) => item.id === question.id
                );

                return (
                  <article className="pdx-question-card" key={question.id}>
                    <div className="pdx-question-header">
                      <div className="pdx-question-number">
                        P{questionIndex + 1}
                      </div>

                      <div className="pdx-question-title">
                        <span className="pdx-question-kicker">
                          PREGUNTA {questionIndex + 1}
                        </span>
                        <h3>{question.displayText}</h3>
                      </div>

                      <span className="pdx-answer-badge">
                        {question.answered} / {totalSurveys}
                      </span>
                    </div>

                    <div className="pdx-question-meta">
                      <span>
                        <strong>{question.answered}</strong>{" "}
                        {question.answered === 1
                          ? "familia respondió"
                          : "familias respondieron"}
                      </span>

                      <span>
                        {question.unanswered} sin responder
                      </span>
                    </div>

                    {question.options.length === 0 ? (
                      <div className="pdx-no-options">
                        <h4>No hay opciones configuradas</h4>
                        <p>
                          Esta pregunta no tiene una lista de opciones en
                          parentQuestions.js. Si es abierta, debe analizarse
                          mediante respuestas de texto.
                        </p>
                      </div>
                    ) : (
                      <div className="pdx-chart-pair">
                        <section className="pdx-chart-panel">
                          <div className="pdx-chart-heading">
                            <div>
                              <span className="pdx-chart-index">01</span>
                              <h4>Distribución</h4>
                            </div>
                            <span className="pdx-chart-type">Torta</span>
                          </div>

                          <p className="pdx-chart-description">
                            Proporción de cada opción seleccionada.
                          </p>

                          <PieChart
                            items={question.options}
                            total={question.chartTotal}
                          />
                        </section>

                        <section className="pdx-chart-panel">
                          <div className="pdx-chart-heading">
                            <div>
                              <span className="pdx-chart-index">02</span>
                              <h4>Comparación</h4>
                            </div>
                            <span className="pdx-chart-type">Barras</span>
                          </div>

                          <p className="pdx-chart-description">
                            Cantidad de selecciones por opción.
                          </p>

                          <BarChart
                            items={question.options}
                            total={question.answered}
                          />
                        </section>
                      </div>
                    )}

                    {question.multiple && (
                      <p className="pdx-multiple-note">
                        Pregunta de selección múltiple: una familia puede elegir
                        varias opciones. Por eso, el total de selecciones de la
                        torta puede ser mayor que el número de familias.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="pdx-footer">
          <span>♥</span>
          <p>Mi Hogar, Territorio de Amor</p>
          <small>Información para comprender y acompañar a las familias.</small>
        </footer>
      </div>
    </main>
  );
}
