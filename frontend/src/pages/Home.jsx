
function Home({ onNavigate }) {
  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">
          <p className="hero-label">
            ROAD SAFETY ANALYTICS
          </p>

          <h1>
            Understanding Road Safety Through Data
          </h1>

          <p className="hero-description">
            Explore road accident patterns, predict accident
            risks, and discover meaningful insights through
            data analytics and machine learning.
          </p>

          <div className="hero-buttons">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("Risk Predictor");
              }}
            >
              Explore Risk Predictor →
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1681389721900-d6ddb326386d?auto=format&fit=crop&fm=jpg&q=80&w=1400"
            alt="Aerial view of busy city highway traffic"
          />
        </div>

      </section>

      {/* Overview Section */}
      <section className="overview-section">

        <div className="overview-heading">
          <p className="section-label">OUR PLATFORM</p>
          <h2>Explore Our Features</h2>
          <p className="section-description">
            Discover tools designed to analyse road safety
            data and better understand accident risks.
          </p>
        </div>

        <div className="feature-grid">

          {/* Risk Predictor Card */}
          <button
            className="feature-card"
            onClick={() => onNavigate("Risk Predictor")}
          >
            <div className="feature-icon">📊</div>
            <h3>Risk Predictor</h3>
            <p>
              Predict road accident risk using available
              road safety data and machine learning models.
            </p>
            <span className="card-link">
              Risk Analysis →
            </span>
          </button>

          {/* Cluster Explorer Card */}
          <button
            className="feature-card"
            onClick={() => onNavigate("Cluster Explorer")}
          >
            <div className="feature-icon">📍</div>
            <h3>Cluster Explorer</h3>
            <p>
              Explore groups of areas with similar
              road safety characteristics and patterns.
            </p>
            <span className="card-link">
              Data Exploration →
            </span>
          </button>

          {/* About Card */}
          <button
            className="feature-card"
            onClick={() => onNavigate("About")}
          >
            <div className="feature-icon">📚</div>
            <h3>About</h3>
            <p>
              Learn about the dataset, analytical methods,
              machine learning models and project limitations.
            </p>
            <span className="card-link">
              Learn More →
            </span>
          </button>

        </div>
      </section>

    </div>
  );
}

export default Home;



