function Thanks({ onRestart }) {
  return (
    <main className="thanks-page">

      <div className="thanks-background thanks-background-one"></div>
      <div className="thanks-background thanks-background-two"></div>

      <section className="thanks-card">

        <div className="thanks-icon">
          ❤️
        </div>

        <span className="thanks-kicker">
          MI HOGAR, TERRITORIO DE AMOR
        </span>

        <h1>
          ¡Gracias por
          <br />
          compartir!
        </h1>

        <p>
          Tu voz importa.
        </p>

        <p className="thanks-description">
          Tus respuestas ayudarán a conocer mejor las experiencias,
          sueños y necesidades de los estudiantes de Mosquera.
        </p>

        <div className="thanks-message">

          <span>✨</span>

          <p>
            Recuerda: tus sueños, tus ideas y lo que sientes
            también hacen parte de la construcción de un mejor futuro.
          </p>

        </div>

        <button
          className="thanks-button"
          onClick={onRestart}
        >
          Volver al inicio
          <span>→</span>
        </button>

        <small>
          Instrumento de caracterización · Mosquera, Cundinamarca
        </small>

      </section>

    </main>
  );
}

export default Thanks;