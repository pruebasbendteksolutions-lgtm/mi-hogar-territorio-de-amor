function Instructions({ onContinue, onBack }) {
  return (
    <main className="instructions-page">

      <section className="instructions-card">

        <div className="instructions-icon">
          ❤️
        </div>

        <span className="section-kicker">
          MI HOGAR, TERRITORIO DE AMOR
        </span>

        <h1>
          Queremos conocer
          <br />
          tu experiencia
        </h1>

        <p className="instructions-intro">
          Esta caracterización busca conocer cómo percibes tu familia,
          tus sueños y metas, y cómo te sientes en diferentes situaciones.
        </p>

        {/* MENSAJE */}

        <div className="instructions-message">

          <div className="message-icon">
            💬
          </div>

          <div>
            <h2>
              No hay respuestas correctas o incorrectas
            </h2>

            <p>
              Responde pensando en tu experiencia y en lo que realmente
              sucede contigo. Lo más importante es que seas sincero(a).
            </p>
          </div>

        </div>

        {/* DIMENSIONES */}

        <div className="instructions-section">

          <h2>
            ¿Qué queremos conocer?
          </h2>

          <div className="dimension-list">

            <article className="dimension-item">

              <div className="dimension-icon family">
                🏠
              </div>

              <h3>
                Entorno familiar
              </h3>

              <p>
                Queremos conocer cómo percibes el apoyo, la comunicación
                y el entorno compartido en tu hogar.
              </p>

            </article>

            <article className="dimension-item">

              <div className="dimension-icon future">
                🌱
              </div>

              <h3>
                Proyecto de vida
              </h3>

              <p>
                Conoceremos tus sueños, metas, capacidades y las personas
                que te acompañan para construir tu futuro.
              </p>

            </article>

            <article className="dimension-item">

              <div className="dimension-icon emotional">
                💛
              </div>

              <h3>
                Bienestar emocional
              </h3>

              <p>
                Queremos saber cómo enfrentas emociones difíciles y si
                reconoces personas a quienes puedes pedir ayuda.
              </p>

            </article>

          </div>

        </div>

        {/* ESCALA */}

        <div className="scale-box">

          <h2>
            ¿Cómo responderás?
          </h2>

          <p>
            Las preguntas se responden utilizando una escala de frecuencia.
            Escoge la opción que más se parezca a tu experiencia.
          </p>

          <div className="scale-preview">

            <div className="scale-preview-item">
              <strong>5</strong>
              <span>Siempre</span>
            </div>

            <div className="scale-preview-item">
              <strong>4</strong>
              <span>Casi siempre</span>
            </div>

            <div className="scale-preview-item">
              <strong>3</strong>
              <span>Algunas veces</span>
            </div>

            <div className="scale-preview-item">
              <strong>2</strong>
              <span>Casi nunca</span>
            </div>

            <div className="scale-preview-item">
              <strong>1</strong>
              <span>Nunca</span>
            </div>

          </div>

        </div>

        {/* NAVEGACIÓN */}

        <div className="instructions-navigation">

          <button
            type="button"
            className="instructions-back-button"
            onClick={onBack}
          >
            ← Volver
          </button>

          <button
            type="button"
            className="instructions-start-button"
            onClick={onContinue}
          >
            Comenzar caracterización
            <span>→</span>
          </button>

        </div>

      </section>

    </main>
  );
}

export default Instructions;