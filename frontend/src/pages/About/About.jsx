
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* PAGE HEADER */}
      <div className="about-header">
        <h1>About This Project</h1>
        <p>
          Understanding road accident risks through data analysis,
          machine learning and interactive visualisation.
        </p>
      </div>

      {/* PROJECT OVERVIEW */}
      <section className="about-section">
        <h2>Project Overview</h2>

        <p>
          This project focuses on analysing road safety data to
          understand accident patterns, identify areas with
          different road-safety characteristics and explore
          potential accident risks across Local Government
          Areas (LGAs).
        </p>

        <p>
          By applying machine learning techniques, statistical
          analysis and interactive data visualisation, the
          system allows users to predict road accident risk,
          explore patterns between different LGAs and examine
          similarities and differences in road-safety
          characteristics.
        </p>

        <p>
          The system combines supervised learning for risk
          prediction with unsupervised learning techniques
          for clustering and exploring road-safety patterns.
        </p>
      </section>

      {/* PROJECT OBJECTIVES */}
      <section className="about-section">
        <h2>Project Objectives</h2>

        <div className="about-grid">

          <div className="about-card">
            <h3>Risk Prediction</h3>
            <p>
              Apply Logistic Regression to classify road
              accident risk using population, road and
              accident-related characteristics.
            </p>
          </div>

          <div className="about-card">
            <h3>Data Analysis</h3>
            <p>
              Examine road accident information to identify
              patterns, trends and important road-safety
              characteristics.
            </p>
          </div>

          <div className="about-card">
            <h3>LGA Clustering</h3>
            <p>
              Apply K-Means and DBSCAN to explore similarities,
              group characteristics and unusual observations
              across different LGAs.
            </p>
          </div>

        </div>
      </section>

      {/* DATASET INFORMATION */}
      <section className="about-section">
        <h2>Dataset Information</h2>

        <p>
          The project uses road accident data to investigate
          road-safety characteristics across different Local
          Government Areas (LGAs).
        </p>

        <p>
          The system examines several population, road and
          accident-related indicators. These include:
        </p>

        <div className="about-grid dataset-grid">

          <div className="about-card">
            <h3>Population</h3>
            <p>
              Population information used as an input
              feature for risk prediction.
            </p>
          </div>

          <div className="about-card">
            <h3>Crash Rate per 100k</h3>
            <p>
              Road accident rate measured per 100,000
              population.
            </p>
          </div>

          <div className="about-card">
            <h3>Severe Accidents (%)</h3>
            <p>
              Percentage of accidents classified as severe.
            </p>
          </div>

          <div className="about-card">
            <h3>Wet-weather Accidents (%)</h3>
            <p>
              Percentage of accidents occurring in wet
              weather conditions.
            </p>
          </div>

          <div className="about-card">
            <h3>Rural-road Accidents (%)</h3>
            <p>
              Percentage of accidents occurring on rural roads.
            </p>
          </div>

          <div className="about-card">
            <h3>Average Speed Limit</h3>
            <p>
              Average speed limit associated with the
              selected area.
            </p>
          </div>

        </div>
      </section>

      {/* MACHINE LEARNING METHODOLOGY */}
      <section className="about-section">
        <h2>Machine Learning Methodology</h2>

        <div className="method-grid">

          {/* LOGISTIC REGRESSION */}
          <div className="method-card">
            <h3>1. Risk Prediction - Logistic Regression</h3>

            <p>
              Logistic Regression is a supervised machine
              learning algorithm used to classify road
              accident risk into two categories.
            </p>

            <p>
              The model uses five input features:
              Population, Severe Accident Percentage,
              Wet-weather Percentage, Rural-road Percentage
              and Average Speed Limit.
            </p>

            <p>
              A crash-rate threshold of 250 accidents per
              100,000 population is used to distinguish
              between the two risk categories. This
              threshold is based on a median crash rate
              of approximately 254.9, rounded down to 250.
            </p>

            <p>
              The model learns relationships between the
              selected input features and the defined risk
              categories to generate predictions.
            </p>
          </div>

          {/* K-MEANS */}
          <div className="method-card">
            <h3>2. LGA Clustering - K-Means</h3>

            <p>
              K-Means is an unsupervised machine learning
              algorithm that groups LGAs based on similarities
              in their road-safety characteristics.
            </p>

            <p>
              Each LGA is assigned to a cluster according
              to its similarity to the cluster's centre.
              Different colours are used to distinguish
              the identified clusters in the scatter plot.
            </p>

            <p>
              This allows users to explore groups of areas
              with similar road-safety patterns and examine
              differences between the identified clusters.
            </p>
          </div>

          {/* DBSCAN */}
          <div className="method-card">
            <h3>3. Density-Based Clustering - DBSCAN</h3>

            <p>
              DBSCAN (Density-Based Spatial Clustering of
              Applications with Noise) is an unsupervised
              clustering algorithm used to identify
              observations based on the density of nearby
              data points.
            </p>

            <p>
              Unlike K-Means, DBSCAN does not require a
              predefined number of clusters. It identifies
              dense groups of observations and can label
              observations that do not meet its density
              requirements as noise.
            </p>

            <p>
              In the scatter plot, DBSCAN noise observations
              are represented by hollow markers, allowing
              users to distinguish them from normal
              observations.
            </p>
          </div>

          {/* PCA */}
          <div className="method-card">
            <h3>4. Dimensionality Reduction - PCA</h3>

            <p>
              Principal Component Analysis (PCA) is a
              dimensionality reduction technique used to
              transform multiple original variables into
              a smaller set of principal components.
            </p>

            <p>
              The first two principal components, PC1 and
              PC2, are displayed on the horizontal and
              vertical axes of the clustering scatter plot.
              Each point represents an LGA positioned
              according to its PCA coordinates.
            </p>

            <p>
              This two-dimensional representation makes
              it easier to explore the distribution of
              LGAs, observe clustering patterns and
              investigate similarities between areas.
            </p>
          </div>

        </div>
      </section>

      {/* CLUSTER EXPLORER */}
      <section className="about-section">
        <h2>Cluster Explorer and Visualisation</h2>

        <p>
          The Cluster Explorer provides interactive
          visualisations that help users investigate
          road-safety patterns and compare characteristics
          across different LGAs.
        </p>

        <div className="method-grid">

          <div className="method-card">
            <h3>1. PCA Scatter Plot</h3>

            <p>
              The scatter plot displays individual LGA
              observations using their PC1 and PC2
              coordinates.
            </p>

            <p>
              K-Means cluster membership is represented
              through different colours, while hollow
              markers identify observations classified
              as noise by DBSCAN.
            </p>

            <p>
              Users can interact with the visualisation
              through several filters:
            </p>

            <ul className="method-list">
              <li>Filter observations by year.</li>
              <li>Select specific Local Government Areas.</li>
              <li>Filter by K-Means cluster membership.</li>
              <li>Filter DBSCAN noise and normal observations.</li>
              <li>Set minimum and maximum PC1 and PC2 values.</li>
              <li>Reset filters to restore the original dataset.</li>
            </ul>

            <p>
              Hovering over individual points displays
              additional information, including the LGA,
              year, cluster assignment and PCA coordinates.
            </p>
          </div>

          <div className="method-card">
            <h3>2. Cluster Profile Comparison</h3>

            <p>
              The cluster profile chart uses horizontal
              bar visualisations to examine four important
              road-safety indicators:
            </p>

            <ul className="method-list">
              <li>Crash rate per 100,000 population.</li>
              <li>Severe accident percentage.</li>
              <li>Wet-weather accident percentage.</li>
              <li>Rural-road accident percentage.</li>
            </ul>

            <p>
              Users can select All Clusters to view overall
              averages across the available LGA records
              or select an individual cluster to examine
              its displayed feature values.
            </p>

            <p>
              Different colours distinguish the indicators,
              while the values beside the bars provide
              their actual measurements.
            </p>
          </div>

        </div>

        <div className="about-info-note">
          <strong>Understanding PCA:</strong>
          <p>
            PC1 and PC2 are mathematical coordinates
            representing combinations of the original
            variables. Higher PC1 or PC2 values do not
            automatically indicate higher road accident
            risk. Their interpretation depends on the
            original PCA feature loadings.
          </p>
        </div>
      </section>

      {/* MODEL EVALUATION */}
      <section className="about-section">
        <h2>Risk Prediction Model Evaluation</h2>

        <p>
          The Logistic Regression model was evaluated
          using several classification metrics to assess
          its predictive performance on the test dataset.
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
          The confusion matrix illustrates the number
          of correct and incorrect predictions made
          by the Logistic Regression model.
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
          Class 0 and Class 1 represent the two risk
          categories defined using the crash-rate threshold
          of 250 accidents per 100,000 population.
        </p>
      </section>

      {/* SYSTEM FEATURES */}
      <section className="about-section">
        <h2>System Features</h2>

        <ul className="about-list">
          <li>Road accident risk prediction using Logistic Regression.</li>
          <li>Interactive road-safety data visualisations.</li>
          <li>K-Means clustering of similar LGAs.</li>
          <li>DBSCAN identification of density-based noise observations.</li>
          <li>PCA scatter plot for two-dimensional cluster exploration.</li>
          <li>Interactive filtering by year, LGA and cluster.</li>
          <li>Cluster profile comparison using four road-safety indicators.</li>
          <li>Interactive chart tooltips and cluster selection.</li>
        </ul>
      </section>

      {/* LIMITATIONS */}
      <section className="about-section limitations-section">
        <h2>Limitations</h2>

        <p>
          The Logistic Regression model achieved an accuracy
          of 73.6%, indicating that some road accident risks
          may be incorrectly classified. Its predictions
          should therefore not be treated as completely
          accurate.
        </p>

        <p>
          The prediction model uses only two risk
          classifications based on a selected crash-rate
          threshold. This limits its ability to represent
          more detailed levels of road accident risk.
        </p>

        <p>
          The model's performance depends on the quality,
          availability and selection of the dataset features.
          Other factors that influence road accidents may
          not be fully represented.
        </p>

        <p>
          K-Means clustering depends on the selected
          features, number of clusters and model
          configuration. Different configurations may
          produce different grouping results.
        </p>

        <p>
          DBSCAN results depend on density-related
          parameters and the distribution of the data.
          Some observations may be classified as noise
          even when they have meaningful road-safety
          characteristics.
        </p>

        <p>
          PCA provides a two-dimensional representation
          of the original dataset, meaning some information
          may be lost during dimensionality reduction.
          Consequently, distances and patterns displayed
          in the scatter plot may not fully represent
          differences in the original feature space.
        </p>

        <p>
          Therefore, the system should be used as an
          analytical tool for exploring road-safety
          patterns and supporting further investigation,
          rather than as a guarantee of actual road
          accident risk.
        </p>
      </section>

    </div>
  );
}

export default About;


