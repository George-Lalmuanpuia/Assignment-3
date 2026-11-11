
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* Page Heading */}
      <div className="about-header">
        <h1>About This Project</h1>
        <p>
          Understanding road accident risks through data analysis
          and machine learning
        </p>
      </div>

      {/* Project Overview */}
      <section className="about-section">
        <h2>Project Overview</h2>
        <p>
          This project focuses on analysing road safety data to
          understand accident patterns and identify areas with
          different levels of road accident risk.
        </p>
        <p>
          By using machine learning techniques, the system helps
          users explore accident data, predict risk levels and
          discover patterns across different Local Government
          Areas (LGAs).
        </p>
      </section>

      {/* Project Objectives */}
      <section className="about-section">
        <h2>Project Objectives</h2>

        <div className="about-grid">
          <div className="about-card">
            <h3>Risk Prediction</h3>
            <p>
              Predict road accident risk levels based on selected
              input features using a machine learning model.
            </p>
          </div>

          <div className="about-card">
            <h3>Data Analysis</h3>
            <p>
              Analyse road accident data to identify patterns
              and understand road safety trends.
            </p>
          </div>

          <div className="about-card">
            <h3>Clustering</h3>
            <p>
              Group LGAs with similar accident characteristics
              using an unsupervised machine learning approach.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="about-section">
        <h2>Methodology</h2>
        <p>
          The project uses data preprocessing, machine learning
          and data visualisation to analyse road accident risks.
          Two main machine learning approaches are used.
        </p>

        <div className="method-grid">
          <div className="method-card">
            <h3>1. Risk Prediction Model</h3>
            <p>
              A supervised machine learning model is used to
              classify road accident risk levels based on the
              selected input features.
            </p>
          </div>

          <div className="method-card">
            <h3>2. K-Means Clustering</h3>
            <p>
              K-Means is used to group LGAs based on similarities
              in their road accident data. PCA is used to help
              visualise the clustering results.
            </p>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="about-section">
        <h2>System Features</h2>

        <ul className="about-list">
          <li>Road accident risk prediction.</li>
          <li>Interactive data visualisations.</li>
          <li>LGA accident pattern exploration.</li>
          <li>Machine learning-based clustering.</li>
          <li>Visual presentation of analysis results.</li>
        </ul>
      </section>

      {/* Limitations */}
      <section className="about-section limitations-section">
        <h2>Limitations</h2>
        <p>
          The prediction results depend on the quality and
          availability of the dataset. Machine learning
          predictions are estimates and may not represent
          every real-world road condition.
        </p>
        <p>
          The clustering results also depend on the selected
          features and model configuration. Therefore, the
          results should be used as a guide for understanding
          road safety patterns rather than as absolute conclusions.
        </p>
      </section>

    </div>
  );
}

export default About;
