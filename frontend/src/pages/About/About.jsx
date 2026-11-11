
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* Page Header */}
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
          By applying machine learning techniques and data
          visualisation, the system allows users to explore
          accident data, predict road accident risk and discover
          patterns across different Local Government Areas (LGAs).
        </p>
      </section>

      {/* Project Objectives */}
      <section className="about-section">
        <h2>Project Objectives</h2>

        <div className="about-grid">
          <div className="about-card">
            <h3>Risk Prediction</h3>
            <p>
              Use Logistic Regression to classify road accident
              risk based on selected population, road and
              accident-related features.
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
            <h3>LGA Clustering</h3>
            <p>
              Group LGAs with similar accident characteristics
              using K-Means clustering and explore their
              differences through visualisations.
            </p>
          </div>
        </div>
      </section>

      {/* Dataset Information */}
      <section className="about-section">
        <h2>Dataset Information</h2>
        <p>
          The project uses road accident data to investigate
          accident patterns and road safety characteristics
          across different Local Government Areas (LGAs).
        </p>
        <p>
          Selected variables used by the risk prediction model
          include:
        </p>

        <div className="about-grid dataset-grid">
          <div className="about-card">
            <h3>Population</h3>
            <p>Population information for the selected area.</p>
          </div>

          <div className="about-card">
            <h3>Severe Accidents (%)</h3>
            <p>Percentage of accidents classified as severe.</p>
          </div>

          <div className="about-card">
            <h3>Wet-weather Accidents (%)</h3>
            <p>Percentage of accidents occurring in wet weather.</p>
          </div>

          <div className="about-card">
            <h3>Rural-road Accidents (%)</h3>
            <p>Percentage of accidents occurring on rural roads.</p>
          </div>

          <div className="about-card">
            <h3>Average Speed Limit</h3>
            <p>Average speed limit associated with the area.</p>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="about-section">
        <h2>Machine Learning Methodology</h2>

        <div className="method-grid">

          <div className="method-card">
            <h3>1. Risk Prediction - Logistic Regression</h3>
            <p>
              Logistic Regression, a supervised machine learning
              algorithm, is used to classify road accident risk
              into two categories.
            </p>
            <p>
              The model uses five input features: Population,
              Severe Accident Percentage, Wet-weather Percentage,
              Rural-road Percentage and Average Speed Limit.
            </p>
            <p>
              A crash-rate threshold of 250 accidents per
              100,000 population is used to distinguish between
              the two risk categories. This threshold is based
              on a median crash rate of approximately 254.9,
              rounded down to 250.
            </p>
          </div>

          <div className="method-card">
            <h3>2. LGA Clustering - K-Means</h3>
            <p>
              K-Means clustering is used to group Local Government
              Areas based on similarities in their road accident
              characteristics.
            </p>
            <p>
              Principal Component Analysis (PCA) is used to
              visualise the clustering results in a two-dimensional
              scatter plot, making it easier to explore how
              different LGAs are grouped.
            </p>
            <p>
              Cluster profile visualisations provide additional
              information about the characteristics of each group.
            </p>
          </div>

        </div>
      </section>

      {/* Model Evaluation */}
      <section className="about-section">
        <h2>Risk Prediction Model Evaluation</h2>
        <p>
          The Logistic Regression model was evaluated using
          several classification metrics to assess its
          predictive performance.
        </p>

        <div className="evaluation-grid">
          <div className="evaluation-card">
            <h3>73.6%</h3>
            <p>Accuracy</p>
          </div>

          <div className="evaluation-card">
            <h3>70.6%</h3>
            <p>Precision (Class 1)</p>
          </div>

          <div className="evaluation-card">
            <h3>77.4%</h3>
            <p>Recall (Class 1)</p>
          </div>

          <div className="evaluation-card">
            <h3>73.8%</h3>
            <p>F1-Score (Class 1)</p>
          </div>
        </div>

        <p className="evaluation-note">
          The model evaluation was conducted on 129 test
          observations. The results indicate moderate
          classification performance.
        </p>

        <h3 className="sub-heading">Confusion Matrix</h3>
        <p>
          The confusion matrix shows the number of correct
          and incorrect predictions made by the model.
        </p>

        <div className="confusion-wrapper">
          <table className="confusion-table">
            <thead>
              <tr>
                <th>Actual / Predicted</th>
                <th>Class 0</th>
                <th>Class 1</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Class 0</th>
                <td>47</td>
                <td>20</td>
              </tr>
              <tr>
                <th>Class 1</th>
                <td>14</td>
                <td>48</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="evaluation-note">
          Class 0 and Class 1 represent the two categories
          defined by the crash-rate threshold.
        </p>
      </section>

      {/* System Features */}
      <section className="about-section">
        <h2>System Features</h2>

        <ul className="about-list">
          <li>Road accident risk prediction using Logistic Regression.</li>
          <li>Interactive road safety data visualisations.</li>
          <li>LGA accident pattern exploration.</li>
          <li>K-Means clustering of similar LGAs.</li>
          <li>PCA scatter plot for cluster visualisation.</li>
          <li>Cluster profile analysis.</li>
        </ul>
      </section>

      {/* Limitations */}
      <section className="about-section limitations-section">
        <h2>Limitations</h2>

        <p>
          The Logistic Regression model achieved an accuracy
          of 73.6%, indicating that its predictions are not
          completely accurate. Some road accident risks may
          therefore be incorrectly classified.
        </p>

        <p>
          The prediction model also uses only two risk
          classifications. This limits its ability to represent
          more detailed levels of road accident severity or risk.
        </p>

        <p>
          The model's predictions depend on the quality,
          availability and selected features of the dataset.
          Other factors that influence road accidents may not
          be fully represented.
        </p>

        <p>
          Similarly, clustering results depend on the selected
          features and model configuration. PCA provides a
          visual representation of the clusters but does not
          guarantee that all differences between LGAs are
          represented in two dimensions.
        </p>

        <p>
          Therefore, the system should be used as an analytical
          tool for exploring road safety patterns rather than
          as a guarantee of actual road accident risk.
        </p>
      </section>

    </div>
  );
}

export default About;

