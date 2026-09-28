import { useState } from "react";

function Participant({ onContinue, onBack }) {
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");

  const canContinue = age !== "" && course !== "";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canContinue) return;

    const ageValue = age === "18+" ? "18+" : Number(age);

    onContinue({
      age: ageValue,
      course,
    });
  };

  return (
    <main className="participant-page">

      <div className="participant-background participant-background-one"></div>
      <div className="participant-background participant-background-two"></div>

      <div className="participant-container">

        <div className="participant-intro">

          <div className="participant-heart">
            ❤️
          </div>

          <span className="participant-kicker">
            MI HOGAR, TERRITORIO DE AMOR
          </span>

          <h1>
            Queremos
            <br />
            conocerte
          </h1>

          <p>
            Esta encuesta es anónima. No necesitamos saber tu nombre.
            Solo queremos conocer cómo viven, sueñan y sienten nuestros
            estudiantes.
          </p>

        </div>

        <section className="participant-card">

          <div className="participant-card-header">

            <span>PRIMER PASO</span>

            <h2>Cuéntanos un poquito</h2>

            <p>
              Selecciona tu edad y el curso en el que estás.
            </p>

          </div>

          <form
            className="participant-form"
            onSubmit={handleSubmit}
          >

            {/* EDAD */}
            <div className="participant-field">

              <label htmlFor="age">
                ¿Qué edad tienes?
              </label>

              <select
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              >

                <option value="">
                  Selecciona tu edad
                </option>

                <option value="8">8 años</option>
                <option value="9">9 años</option>
                <option value="10">10 años</option>
                <option value="11">11 años</option>
                <option value="12">12 años</option>
                <option value="13">13 años</option>
                <option value="14">14 años</option>
                <option value="15">15 años</option>
                <option value="16">16 años</option>
                <option value="17">17 años</option>
                <option value="18+">18 años o más</option>

              </select>

            </div>

            {/* CURSO */}
            <div className="participant-field">

              <label htmlFor="course">
                ¿En qué curso estás?
              </label>

              <select
                id="course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >

                <option value="">
                  Selecciona tu curso
                </option>

                <option value="3°">3°</option>
                <option value="4°">4°</option>
                <option value="5°">5°</option>
                <option value="6°">6°</option>
                <option value="7°">7°</option>
                <option value="8°">8°</option>
                <option value="9°">9°</option>
                <option value="10°">10°</option>
                <option value="11°">11°</option>
                <option value="Otro">Otro</option>

              </select>

            </div>

            {/* PRIVACIDAD */}
            <div className="participant-version">

              <div className="participant-version-icon">
                🔒
              </div>

              <div>

                <strong>
                  Tus respuestas son anónimas
                </strong>

                <p>
                  No te pediremos nombre, documento ni información
                  que permita identificarte.
                </p>

              </div>

            </div>

            {/* CONTINUAR */}
            <button
              type="submit"
              className="participant-button"
              disabled={!canContinue}
            >
              Continuar

              <span>
                →
              </span>
            </button>

          </form>

        </section>

        <button
          type="button"
          className="simple-back-button"
          onClick={onBack}
        >
          ← Volver
        </button>

      </div>

    </main>
  );
}

export default Participant;