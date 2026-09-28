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

  const [ageFilter, setAgeFilter] = useState("todos");
  const [courseFilter, setCourseFilter] = useState("todos");

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
   * ENCUESTAS FILTRADAS
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
   * PREGUNTAS SEGÚN LA VERSIÓN
   */
  const getQuestionsForSurvey = (survey) => {
    if (survey.version === "8-12") {
      return questions8to12;
    }

    return questions13to17;
  };

  /*
   * ESTADÍSTICAS
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

        {/* FILTROS */}
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

        {/* VOZ ESTUDIANTIL */}
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