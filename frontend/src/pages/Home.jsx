
function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <p className="hero-label">ROAD SAFETY ANALYTICS</p>

        <h1>Understanding Road Safety Through Data</h1>

        <p className="hero-description">
          Explore road accident patterns, predict accident risk,
          and discover insights using data analytics and machine learning.
        </p>

        <div className="hero-buttons">
          <a href="#" onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new Event("open-predictor"));
          }}>
            Explore Risk Predictor
          </a>
        </div>
      </section>

      <section className="overview-section">
        <h2>Explore Our Features</h2>
        <p className="section-description">
          Use the tools below to explore different aspects of road safety.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Risk Predictor</h3>
            <p>
              Predict road accident risk using the available
              road safety data and machine learning model.
            </p>
          </div>

          <div className="feature-card">
            <h3>Cluster Explorer</h3>
            <p>
              Explore groups of areas with similar
              road safety characteristics.
            </p>
          </div>

          <div className="feature-card">
            <h3>About / Method</h3>
            <p>
              Learn about the dataset, methods, models,
              and limitations of this project.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
