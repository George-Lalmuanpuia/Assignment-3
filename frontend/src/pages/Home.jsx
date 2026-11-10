
function Home() {
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
            <a href="#" onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new Event("open-predictor"));
            }}>
              Explore Risk Predictor →
            </a>
          </div>

          <div className="hero-highlights">
            <span>✓ Data Analytics</span>
            <span>✓ Machine Learning</span>
            <span>✓ Road Safety Insights</span>
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

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Risk Predictor</h3>
            <p>
              Predict road accident risk using available
              road safety data and machine learning models.
            </p>
            <span className="card-link">
              Risk Analysis →
            </span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Cluster Explorer</h3>
            <p>
              Explore groups of areas with similar
              road safety characteristics and patterns.
            </p>
            <span className="card-link">
              Data Exploration →
            </span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>About / Method</h3>
            <p>
              Learn about the dataset, analytical methods,
              machine learning models and project limitations.
            </p>
            <span className="card-link">
              Learn More →
            </span>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Home;


