import { useEffect, useMemo, useState } from "react";

import {

  questions8to12,

  questions13to17,

} from "../data/questions";

import { subscribeToSurveys } from "../firebase/subscribeSurveys";

function Dashboard() {

  const [surveys, setSurveys] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Filtros generales del Dashboard

  const [ageFilter, setAgeFilter] = useState("todos");

  const [courseFilter, setCourseFilter] = useState("todos");

  // Filtros exclusivos de Resultados por pregunta

  const [questionAgeFilter, setQuestionAgeFilter] =

    useState("todos");

  const [questionCourseFilter, setQuestionCourseFilter] =

    useState("todos");

  // Pregunta seleccionada para los gráficos
  const [selectedChartQuestion, setSelectedChartQuestion] = useState("1");

  useEffect(() => {

    const unsubscribe = subscribeToSurveys(

      (data) => {

        setSurveys(data);

        setLoading(false);

      },

      () => {

        setError(

          "No fue posible cargar las respuestas desde Firebase."

        );

        setLoading(false);

      }

    );

    return () => unsubscribe();

  }, []);

  /*

   * CURSOS DISPONIBLES

   */

  const courses = useMemo(() => {

    const uniqueCourses = [

      ...new Set(

        surveys

          .map((survey) =>

            survey.course?.trim()

          )

          .filter(Boolean)

      ),

    ];

    return uniqueCourses.sort();

  }, [surveys]);

  /*

   * ENCUESTAS FILTRADAS - DASHBOARD GENERAL

   */

  const filteredSurveys = useMemo(() => {

    return surveys.filter((survey) => {

      const matchesAge =

        ageFilter === "todos" ||

        survey.version === ageFilter;

      const surveyCourse =

        survey.course?.trim() || "Sin curso";

      const matchesCourse =

        courseFilter === "todos" ||

        surveyCourse === courseFilter;

      return matchesAge && matchesCourse;

    });

  }, [surveys, ageFilter, courseFilter]);

  /*

   * ENCUESTAS FILTRADAS - RESULTADOS POR PREGUNTA

   */

  const questionFilteredSurveys = useMemo(() => {

    return surveys.filter((survey) => {

      const matchesAge =

        questionAgeFilter === "todos" ||

        survey.version === questionAgeFilter;

      const surveyCourse =

        survey.course?.trim() || "Sin curso";

      const matchesCourse =

        questionCourseFilter === "todos" ||

        surveyCourse === questionCourseFilter;

      return matchesAge && matchesCourse;

    });

  }, [

    surveys,

    questionAgeFilter,

    questionCourseFilter,

  ]);

  /*

   * PREGUNTAS SEGÚN LA VERSIÓN

   */

  const getQuestionsForSurvey = (survey) => {

    if (survey.version === "8-12") {

      return questions8to12;

    }

    return questions13to17;

  };

  /*

   * ESTADÍSTICAS GENERALES

   */

  const statistics = useMemo(() => {

    const ageGroups = {

      "8-12": 0,

      "13-17": 0,

      "18+": 0,

    };

    const coursesData = {};

    const dimensions = {

      "Entorno familiar": {

        total: 0,

        count: 0,

      },

      "Proyecto de vida": {

        total: 0,

        count: 0,

      },

      "Bienestar emocional": {

        total: 0,

        count: 0,

      },

    };

    const answerDistribution = {

      1: 0,

      2: 0,

      3: 0,

      4: 0,

      5: 0,

    };

    let totalScore = 0;

    let totalAnswers = 0;

    filteredSurveys.forEach((survey) => {

      if (ageGroups[survey.version] !== undefined) {

        ageGroups[survey.version]++;

      }

      const course =

        survey.course?.trim() || "Sin curso";

      coursesData[course] =

        (coursesData[course] || 0) + 1;

      const questions =

        getQuestionsForSurvey(survey);

      questions.forEach((question) => {

        if (question.type !== "scale") {

          return;

        }

        const answer =

          survey.answers?.[question.id];

        if (

          typeof answer !== "number" ||

          answer < 1 ||

          answer > 5

        ) {

          return;

        }

        totalScore += answer;

        totalAnswers++;

        answerDistribution[answer]++;

        if (dimensions[question.dimension]) {

          dimensions[question.dimension].total +=

            answer;

          dimensions[question.dimension].count++;

        }

      });

    });

    const dimensionResults = Object.entries(

      dimensions

    ).map(([name, data]) => ({

      name,

      average:

        data.count > 0

          ? data.total / data.count

          : 0,

    }));

    return {

      total: filteredSurveys.length,

      ageGroups,

      courses: coursesData,

      overallAverage:

        totalAnswers > 0

          ? totalScore / totalAnswers

          : 0,

      dimensions: dimensionResults,

      answerDistribution,

      totalAnswers,

    };

  }, [filteredSurveys]);

  /*

   * ANÁLISIS POR PREGUNTA

   *

   * IMPORTANTE:

   * Aquí usamos questionFilteredSurveys,

   * NO filteredSurveys.

   *

   * Por eso los filtros de esta sección

   * funcionan de manera independiente.

   */

  const questionAnalysis = useMemo(() => {

    const analysis = {};

    questionFilteredSurveys.forEach((survey) => {

      const questions =

        getQuestionsForSurvey(survey);

      questions.forEach((question) => {

        if (question.type !== "scale") {

          return;

        }

        if (!analysis[question.id]) {

          analysis[question.id] = {

            id: question.id,

            text: question.text,

            dimension: question.dimension,

            total: 0,

            score: 0,

            distribution: {

              1: 0,

              2: 0,

              3: 0,

              4: 0,

              5: 0,

            },

          };

        }

        const answer =

          survey.answers?.[question.id];

        if (

          typeof answer !== "number" ||

          answer < 1 ||

          answer > 5

        ) {

          return;

        }

        analysis[question.id].total++;

        analysis[question.id].score += answer;

        analysis[question.id].distribution[

          answer

        ]++;

      });

    });

    return Object.values(analysis)

      .sort((a, b) => a.id - b.id)

      .map((question) => ({

        ...question,

        average:

          question.total > 0

            ? question.score / question.total

            : 0,

      }));

  }, [questionFilteredSurveys]);

  /*

   * AGRUPAR PREGUNTAS POR DIMENSIÓN

   */

  const questionsByDimension = useMemo(() => {

    const groups = {

      "Entorno familiar": [],

      "Proyecto de vida": [],

      "Bienestar emocional": [],

    };

    questionAnalysis.forEach((question) => {

      if (groups[question.dimension]) {

        groups[question.dimension].push(

          question

        );

      }

    });

    return groups;

  }, [questionAnalysis]);

    /*
   * DATOS PARA LOS GRÁFICOS COMPARATIVOS
   */
  const chartScaleValues = [5, 4, 3, 2, 1];

  const chartColors = {
    5: "#718c78",
    4: "#8fb6a0",
    3: "#c8a96b",
    2: "#d99a75",
    1: "#c9785b",
  };

  const selectedQuestionResult = questionAnalysis.find(
    (question) => String(question.id) === selectedChartQuestion
  );

  // Compara siempre los tres grupos de edad. El filtro de curso sí aplica.
  const ageComparison = useMemo(() => {
    const groups = [
      { id: "8-12", label: "8–12 años" },
      { id: "13-17", label: "13–17 años" },
      { id: "18+", label: "18+ años" },
    ];

    return groups.map((group) => {
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let total = 0;

      surveys.forEach((survey) => {
        if (survey.version !== group.id) return;

        const course = survey.course?.trim() || "Sin curso";
        if (questionCourseFilter !== "todos" && course !== questionCourseFilter) return;

        const questions = getQuestionsForSurvey(survey);
        const question = questions.find(
          (item) => String(item.id) === selectedChartQuestion && item.type === "scale"
        );
        if (!question) return;

        const answer = survey.answers?.[question.id];
        if (typeof answer !== "number" || answer < 1 || answer > 5) return;

        distribution[answer]++;
        total++;
      });

      return { ...group, total, distribution };
    });
  }, [surveys, questionCourseFilter, selectedChartQuestion]);

  const pieDistribution = selectedQuestionResult
    ? selectedQuestionResult.distribution
    : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const pieTotal = chartScaleValues.reduce(
    (sum, value) => sum + pieDistribution[value],
    0
  );

  const pieGradient = (() => {
    if (!pieTotal) return "#e9e7e1";
    let current = 0;
    const segments = chartScaleValues.map((value) => {
      const start = current;
      current += (pieDistribution[value] / pieTotal) * 100;
      return `${chartColors[value]} ${start}% ${current}%`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  })();

  const comparisonMax = Math.max(
    1,
    ...ageComparison.flatMap((group) =>
      chartScaleValues.map((value) => group.distribution[value])
    )
  );

/*

   * RESPUESTAS ABIERTAS

   */

  const openResponses = useMemo(() => {

    return filteredSurveys

      .map((survey) => {

        const response =

          survey.answers?.[13];

        if (

          typeof response !== "string" ||

          !response.trim()

        ) {

          return null;

        }

        return {

          id: survey.id,

          version:

            survey.version || "Sin versión",

          course:

            survey.course || "Sin curso",

          response: response.trim(),

        };

      })

      .filter(Boolean);

  }, [filteredSurveys]);

  const formatAverage = (value) => {

    return Number(value || 0).toFixed(2);

  };

  const getPercentage = (value, total) => {

    if (!total) {

      return 0;

    }

    return Math.round(

      (value / total) * 100

    );

  };

  /*

   * TEXTO DE LAS RESPUESTAS

   */

  const scaleLabels = {

    5: {

      label: "Siempre",

      emoji: "💖",

    },

    4: {

      label: "Casi siempre",

      emoji: "😊",

    },

    3: {

      label: "A veces",

      emoji: "🙂",

    },

    2: {

      label: "Casi nunca",

      emoji: "😕",

    },

    1: {

      label: "Nunca",

      emoji: "💭",

    },

  };

  /*

   * COLOR / ESTADO DEL PROMEDIO

   */

  const getAverageStatus = (average) => {

    if (average >= 4) {

      return {

        text: "Fortaleza",

        className: "good",

      };

    }

    if (average >= 3) {

      return {

        text: "Atención",

        className: "medium",

      };

    }

    return {

      text: "Prioridad",

      className: "low",

    };

  };

  /*

   * TEXTO DEL FILTRO ACTUAL

   */

  const questionAgeLabel =

    questionAgeFilter === "todos"

      ? "Todas las edades"

      : questionAgeFilter === "8-12"

      ? "8–12 años"

      : questionAgeFilter === "13-17"

      ? "13–17 años"

      : "18+ años";

  const questionCourseLabel =

    questionCourseFilter === "todos"

      ? "Todos los cursos"

      : questionCourseFilter;

  if (loading) {

    return (

      <main className="dashboard-page">

        <div className="dashboard-container">

          <section className="dashboard-message">

            <div className="dashboard-spinner" />

            <p>

              Cargando resultados...

            </p>

          </section>

        </div>

      </main>

    );

  }

  if (error) {

    return (

      <main className="dashboard-page">

        <div className="dashboard-container">

          <section className="dashboard-error">

            <h2>

              No pudimos cargar el Dashboard

            </h2>

            <p>

              {error}

            </p>

          </section>

        </div>

      </main>

    );

  }

  return (

    <main className="dashboard-page">

      <div className="dashboard-container">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <span className="dashboard-kicker">

              MI HOGAR, TERRITORIO DE AMOR

            </span>

            <h1>

              Dashboard de resultados

            </h1>

            <p>

              Análisis de las respuestas recopiladas

              en la comunidad educativa.

            </p>

          </div>

          <div className="dashboard-live">

            <span className="dashboard-live-dot" />

            Actualización en tiempo real

          </div>

        </header>

        {/* FILTROS GENERALES */}

        <section className="dashboard-filters">

          <div className="dashboard-filter">

            <label htmlFor="age-filter">

              Grupo de edad

            </label>

            <select

              id="age-filter"

              value={ageFilter}

              onChange={(event) =>

                setAgeFilter(event.target.value)

              }

            >

              <option value="todos">

                Todos los grupos

              </option>

              <option value="8-12">

                8–12 años

              </option>

              <option value="13-17">

                13–17 años

              </option>

              <option value="18+">

                18+ años

              </option>

            </select>

          </div>

          <div className="dashboard-filter">

            <label htmlFor="course-filter">

              Curso

            </label>

            <select

              id="course-filter"

              value={courseFilter}

              onChange={(event) =>

                setCourseFilter(event.target.value)

              }

            >

              <option value="todos">

                Todos los cursos

              </option>

              {courses.map((course) => (

                <option

                  key={course}

                  value={course}

                >

                  {course}

                </option>

              ))}

            </select>

          </div>

          <button

            type="button"

            className="dashboard-clear-filters"

            onClick={() => {

              setAgeFilter("todos");

              setCourseFilter("todos");

            }}

          >

            Limpiar filtros

          </button>

        </section>

        {/* RESUMEN */}

        <section className="dashboard-stats">

          <article className="dashboard-stat-card">

            <span>

              Encuestas

            </span>

            <strong>

              {statistics.total}

            </strong>

            <small>

              Según filtros actuales

            </small>

          </article>

          <article className="dashboard-stat-card">

            <span>

              Promedio general

            </span>

            <strong>

              {formatAverage(

                statistics.overallAverage

              )}

            </strong>

            <small>

              Escala de 1 a 5

            </small>

          </article>

          <article className="dashboard-stat-card">

            <span>

              Respuestas analizadas

            </span>

            <strong>

              {statistics.totalAnswers}

            </strong>

            <small>

              Preguntas cuantitativas

            </small>

          </article>

          <article className="dashboard-stat-card">

            <span>

              Voz estudiantil

            </span>

            <strong>

              {openResponses.length}

            </strong>

            <small>

              Respuestas abiertas

            </small>

          </article>

        </section>

        {/* DIMENSIONES */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-kicker">

                ANÁLISIS

              </span>

              <h2>

                Dimensiones evaluadas

              </h2>

              <p>

                Promedio de las respuestas de cada

                área de la encuesta.

              </p>

            </div>

          </div>

          <div className="dashboard-dimensions">

            {statistics.dimensions.map(

              (dimension) => (

                <article

                  className="dashboard-dimension-card"

                  key={dimension.name}

                >

                  <div className="dashboard-dimension-top">

                    <span>

                      {dimension.name}

                    </span>

                    <strong>

                      {formatAverage(

                        dimension.average

                      )}

                    </strong>

                  </div>

                  <div className="dashboard-bar">

                    <div

                      className="dashboard-bar-fill"

                      style={{

                        width: `${

                          (dimension.average / 5) *

                          100

                        }%`,

                      }}

                    />

                  </div>

                  <small>

                    de 5 puntos

                  </small>

                </article>

              )

            )}

          </div>

        </section>

        {/* ANÁLISIS DETALLADO POR PREGUNTA */}

{/* ==================================================

    ANÁLISIS DETALLADO POR PREGUNTA

================================================== */}

        {/* ANÁLISIS VISUAL COMPARATIVO */}
        <section className="dashboard-section visual-analysis">
          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-kicker">ANÁLISIS VISUAL</span>
              <h2>Análisis comparativo de respuestas</h2>
              <p>Explora la distribución de respuestas y compara los resultados entre los grupos de edad.</p>
            </div>
          </div>

          <div className="visual-question-selector">
            <label htmlFor="chart-question">Pregunta que deseas analizar</label>
            <select id="chart-question" value={selectedChartQuestion} onChange={(event) => setSelectedChartQuestion(event.target.value)}>
              {[...questions8to12, ...questions13to17]
                .filter((question, index, all) => question.type === "scale" && all.findIndex((item) => String(item.id) === String(question.id)) === index)
                .sort((a, b) => a.id - b.id)
                .map((question) => (
                  <option key={question.id} value={String(question.id)}>
                    Pregunta {String(question.id).padStart(2, "0")} — {question.text}
                  </option>
                ))}
            </select>
            <p>Curso: <strong>{questionCourseLabel}</strong> · Torta: <strong>{questionAgeLabel}</strong></p>
          </div>

          <div className="visual-analysis-grid">
            <article className="visual-chart-card">
              <div className="visual-chart-heading"><div><span>01 · DISTRIBUCIÓN</span><h3>¿Cómo respondieron?</h3></div></div>
              {pieTotal === 0 ? (
                <div className="dashboard-empty"><p>No hay respuestas para esta pregunta y estos filtros.</p></div>
              ) : (
                <div className="visual-pie-layout">
                  <div className="visual-pie" style={{ background: pieGradient }} role="img" aria-label="Gráfico de torta con distribución de respuestas">
                    <div className="visual-pie-center"><strong>{pieTotal}</strong><span>respuestas</span></div>
                  </div>
                  <div className="visual-pie-legend">
                    {chartScaleValues.map((value) => {
                      const count = pieDistribution[value];
                      const percentage = pieTotal ? Math.round((count / pieTotal) * 100) : 0;
                      return (
                        <div className="visual-legend-row" key={value}>
                          <span className="visual-legend-dot" style={{ background: chartColors[value] }} />
                          <span className="visual-legend-label">{scaleLabels[value].emoji} {scaleLabels[value].label}</span>
                          <strong>{count}</strong><span>{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>

            <article className="visual-chart-card">
              <div className="visual-chart-heading"><div><span>02 · COMPARACIÓN</span><h3>Respuestas por grupo de edad</h3></div></div>
              <p className="visual-chart-description">Cantidad de respuestas por opción. Se muestran los tres grupos para facilitar la comparación.</p>
              <div className="visual-bar-chart">
                {ageComparison.map((group) => (
                  <div className="visual-age-group" key={group.id}>
                    <div className="visual-age-group-heading"><strong>{group.label}</strong><span>{group.total} respuestas</span></div>
                    {chartScaleValues.map((value) => {
                      const count = group.distribution[value];
                      const width = (count / comparisonMax) * 100;
                      return (
                        <div className="visual-comparison-row" key={value}>
                          <span className="visual-comparison-label">{scaleLabels[value].emoji} {scaleLabels[value].label}</span>
                          <div className="visual-comparison-track"><div className="visual-comparison-fill" style={{ width: `${width}%`, background: chartColors[value] }} /></div>
                          <strong>{count}</strong>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

<section className="dashboard-section dashboard-question-analysis">

  <div className="dashboard-section-header">

    <div>

      <span className="dashboard-kicker">

        ANÁLISIS DETALLADO

      </span>

      <h2>

        Resultados por pregunta

      </h2>

      <p>

        Explora cómo respondió cada grupo de estudiantes

        a las preguntas de la encuesta.

      </p>

    </div>

  </div>

  {/* FILTROS DEL ANÁLISIS */}

  <div className="question-analysis-filters">

    <div className="question-analysis-filter">

      <label htmlFor="question-age-filter">

        Rango de edad

      </label>

      <select

        id="question-age-filter"

        value={questionAgeFilter}

        onChange={(event) =>

          setQuestionAgeFilter(event.target.value)

        }

      >

        <option value="todos">

          Todas las edades

        </option>

        <option value="8-12">

          8–12 años

        </option>

        <option value="13-17">

          13–17 años

        </option>

        <option value="18+">

          18+ años

        </option>

      </select>

    </div>

    <div className="question-analysis-filter">

      <label htmlFor="question-course-filter">

        Curso

      </label>

      <select

        id="question-course-filter"

        value={questionCourseFilter}

        onChange={(event) =>

          setQuestionCourseFilter(event.target.value)

        }

      >

        <option value="todos">

          Todos los cursos

        </option>

        {courses.map((course) => (

          <option

            key={course}

            value={course}

          >

            {course}

          </option>

        ))}

      </select>

    </div>

    <button

      type="button"

      className="question-analysis-reset"

      onClick={() => {

        setQuestionAgeFilter("todos");

        setQuestionCourseFilter("todos");

      }}

    >

      Restablecer

    </button>

  </div>

  {/* RESUMEN DE FILTROS */}

  <div className="question-analysis-summary">

    <div>

      <span className="question-analysis-summary-label">

        Analizando

      </span>

      <strong>

        {questionAgeLabel}

        {" · "}

        {questionCourseLabel}

      </strong>

    </div>

    <div>

      <span className="question-analysis-summary-label">

        Participantes

      </span>

      <strong>

        {questionFilteredSurveys.length}

      </strong>

    </div>

  </div>

  {/* CARTAS */}

  {Object.entries(questionsByDimension).map(

    ([dimension, questions]) => {

      if (questions.length === 0) {

        return null;

      }

      return (

        <div

          className="question-analysis-dimension"

          key={dimension}

        >

          <div className="question-analysis-dimension-header">

            <div>

              <span>

                {dimension === "Entorno familiar" && "🏠"}

                {dimension === "Proyecto de vida" && "🚀"}

                {dimension === "Bienestar emocional" && "💚"}

              </span>

              <div>

                <h3>

                  {dimension}

                </h3>

                <p>

                  {questions.length}{" "}

                  {questions.length === 1

                    ? "pregunta"

                    : "preguntas"}

                </p>

              </div>

            </div>

          </div>

          <div className="question-analysis-grid">

            {questions.map((question) => {

              const status =

                getAverageStatus(

                  question.average

                );

              return (

                <article

                  className="question-card"

                  key={question.id}

                >

                  {/* CABECERA */}

                  <div className="question-card-header">

                    <span className="question-card-number">

                      Pregunta {String(

                        question.id

                      ).padStart(2, "0")}

                    </span>

                    <span

                      className={`question-card-status ${status.className}`}

                    >

                      {status.text}

                    </span>

                  </div>

                  {/* PREGUNTA */}

                  <div className="question-card-question">

                    <h3>

                      {question.text}

                    </h3>

                  </div>

                  {/* RESULTADO PRINCIPAL */}

                  <div className="question-card-result">

                    <div className="question-card-score">

                      <strong>

                        {formatAverage(

                          question.average

                        )}

                      </strong>

                      <span>

                        / 5

                      </span>

                    </div>

                    <div className="question-card-result-info">

                      <span>

                        Promedio de respuestas

                      </span>

                      <strong>

                        {question.total}{" "}

                        {question.total === 1

                          ? "respuesta"

                          : "respuestas"}

                      </strong>

                    </div>

                  </div>

                  {/* BARRA DEL PROMEDIO */}

                  <div className="question-card-average-bar">

                    <div

                      style={{

                        width: `${

                          (question.average / 5) *

                          100

                        }%`,

                      }}

                    />

                  </div>

                  {/* DISTRIBUCIÓN */}

                  <div className="question-card-distribution">

                    {[5, 4, 3, 2, 1].map(

                      (value) => {

                        const count =

                          question

                            .distribution[value];

                        const percentage =

                          getPercentage(

                            count,

                            question.total

                          );

                        const scale =

                          scaleLabels[value];

                        return (

                          <div

                            className="question-card-answer"

                            key={value}

                          >

                            <div className="question-card-answer-info">

                              <span className="question-card-answer-label">

                                <span className="question-card-answer-emoji">

                                  {scale.emoji}

                                </span>

                                <span>

                                  {scale.label}

                                </span>

                              </span>

                              <strong>

                                {count}

                              </strong>

                              <span>

                                {percentage}%

                              </span>

                            </div>

                            <div className="question-card-answer-bar">

                              <div

                                style={{

                                  width: `${percentage}%`,

                                }}

                              />

                            </div>

                          </div>

                        );

                      }

                    )}

                  </div>

                </article>

              );

            })}

          </div>

        </div>

      );

    }

  )}

  {questionAnalysis.length === 0 && (

    <div className="dashboard-empty">

      <p>

        No hay respuestas cuantitativas

        para los filtros seleccionados.

      </p>

    </div>

  )}

</section>

        {/* DISTRIBUCIÓN 1-5 */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-kicker">

                RESPUESTAS

              </span>

              <h2>

                Distribución de respuestas

              </h2>

              <p>

                Cantidad de respuestas para cada

                nivel de la escala.

              </p>

            </div>

          </div>

          <div className="dashboard-distribution">

            {[5, 4, 3, 2, 1].map(

              (value) => {

                const count =

                  statistics.answerDistribution[

                    value

                  ];

                const percentage =

                  getPercentage(

                    count,

                    statistics.totalAnswers

                  );

                return (

                  <div

                    className="dashboard-distribution-row"

                    key={value}

                  >

                    <div className="dashboard-score">

                      <strong>

                        {value}

                      </strong>

                      <span>

                        / 5

                      </span>

                    </div>

                    <div className="dashboard-distribution-bar">

                      <div

                        className="dashboard-distribution-fill"

                        style={{

                          width: `${percentage}%`,

                        }}

                      />

                    </div>

                    <div className="dashboard-distribution-value">

                      <strong>

                        {count}

                      </strong>

                      <span>

                        {percentage}%

                      </span>

                    </div>

                  </div>

                );

              }

            )}

          </div>

        </section>

        {/* EDADES */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-kicker">

                POBLACIÓN

              </span>

              <h2>

                Distribución por grupo de edad

              </h2>

            </div>

          </div>

          <div className="dashboard-age-grid">

            {Object.entries(

              statistics.ageGroups

            ).map(([group, count]) => (

              <article

                className="dashboard-age-card"

                key={group}

              >

                <span>

                  {group}

                </span>

                <strong>

                  {count}

                </strong>

                <small>

                  {count === 1

                    ? "encuesta"

                    : "encuestas"}

                </small>

              </article>

            ))}

          </div>

        </section>

        {/* CURSOS */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-kicker">

                PARTICIPACIÓN

              </span>

              <h2>

                Participación por curso

              </h2>

            </div>

          </div>

          {Object.keys(

            statistics.courses

          ).length === 0 ? (

            <div className="dashboard-empty">

              <p>

                No hay cursos registrados para

                estos filtros.

              </p>

            </div>

          ) : (

            <div className="dashboard-course-list">

              {Object.entries(

                statistics.courses

              )

                .sort(

                  ([, a], [, b]) => b - a

                )

                .map(

                  ([course, count]) => {

                    const percentage =

                      getPercentage(

                        count,

                        statistics.total

                      );

                    return (

                      <div

                        className="dashboard-course-row"

                        key={course}

                      >

                        <span>

                          {course}

                        </span>

                        <div className="dashboard-course-bar">

                          <div

                            className="dashboard-course-fill"

                            style={{

                              width: `${percentage}%`,

                            }}

                          />

                        </div>

                        <strong>

                          {count}

                        </strong>

                      </div>

                    );

                  }

                )}

            </div>

          )}

        </section>

        {/* VOZ ESTUDIANTIL TEMA IMPORTANTE Y DE PREGUNTA ABIERTA*/}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-kicker">

                VOZ ESTUDIANTIL

              </span>

              <h2>

                ¿Qué quieren mejorar?

              </h2>

              <p>

                Respuestas abiertas de los

                participantes.

              </p>

            </div>

          </div>

          {openResponses.length === 0 ? (

            <div className="dashboard-empty">

              <p>

                No hay respuestas abiertas para

                los filtros seleccionados.

              </p>

            </div>

          ) : (

            <div className="dashboard-open-responses">

              {openResponses.map(

                (item) => (

                  <article

                    className="dashboard-response"

                    key={item.id}

                  >

                    <div className="dashboard-response-meta">

                      <span>

                        {item.version}

                      </span>

                      <span>

                        {item.course}

                      </span>

                    </div>

                    <p>

                      “{item.response}”

                    </p>

                  </article>

                )

              )}

            </div>

          )}

        </section>

        {/* FOOTER */}

        <footer className="dashboard-footer">

          <div>

            <strong>

              Mi Hogar, Territorio de Amor

            </strong>

            <p>

              Panel de análisis de respuestas.

            </p>

          </div>

          <div>

            <span>

              Registros mostrados:

            </span>

            <strong>

              {statistics.total}

            </strong>

          </div>

        </footer>

      </div>

    </main>

  );

}

export default Dashboard;
