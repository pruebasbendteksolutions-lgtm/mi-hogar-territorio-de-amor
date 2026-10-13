function Home({ onStart, onStartParents }) {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <div className="logo-placeholder">
            🏠
          </div>

          <p className="hero-kicker">
            MOSQUERA · CUNDINAMARCA
          </p>

          <h1>
            Mi Hogar,
            <span>Territorio de Amor</span>
          </h1>

          <div className="hero-line" />

          <p className="hero-description">
            Un espacio para escuchar tu voz, conocer tus sueños,
            comprender tu bienestar y descubrir aquello que hace
            especial a tu hogar.
          </p>

          <p className="hero-location">
            Familia · Proyecto de vida · Bienestar emocional
          </p>

          <div className="home-options">
            <button
              type="button"
              className="hero-button"
              onClick={onStart}
            >
              <span>Encuesta de estudiantes</span>
              <span>→</span>
            </button>

            <button
              type="button"
              className="hero-button"
              onClick={onStartParents}
            >
              <span>Encuesta de padres/acudientes</span>
              <span>→</span>
            </button>
          </div>

          <p className="hero-footer">
            Instrumento de caracterización y orientación
          </p>
        </div>

        <div className="hero-decoration hero-decoration-one">
          ♥
        </div>

        <div className="hero-decoration hero-decoration-two">
          ✦
        </div>
      </section>
    </main>
  );
}

export default Home;