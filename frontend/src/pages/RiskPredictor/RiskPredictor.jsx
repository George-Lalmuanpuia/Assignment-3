import React, { useEffect, useState } from "react";
import CrashRiskModel from "../../charts/classification/CrashRiskModel";

const API_URL = `http://${window.location.hostname}:8000`;

// Same value used in the notebook when the High_risk label was created.
const RISK_THRESHOLD = 250;

function RiskPredictor() {
  const [predictions, setPredictions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [importance, setImportance] = useState([]);
  const [coefficients, setCoefficients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const responses = await Promise.all([
          fetch(`${API_URL}/api/classification/predictions`),
          fetch(`${API_URL}/api/classification/metrics`),
          fetch(`${API_URL}/api/classification/importance`),
          fetch(`${API_URL}/api/classification/coefficients`),
        ]);

        if (responses.some((response) => !response.ok)) {
          throw new Error("Failed to fetch classification data.");
        }

        const [predictionData, metricsData, importanceData, coefficientData] =
          await Promise.all(responses.map((response) => response.json()));

        setPredictions(predictionData);
        setMetrics(metricsData);
        setImportance(importanceData);
        setCoefficients(coefficientData);
      } catch (err) {
        console.error("Classification data loading error:", err);
        setError(
          "Unable to load the risk model results. Check that the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading risk model...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="risk-explorer-page">
      <h1>Road Accident Risk Predictor</h1>

      <section className="risk-introduction">
        <h2>Which LGAs are likely to have a high crash risk?</h2>

        <p>
          This model looks at each New South Wales Local Government Area
          (LGA) using its population, severe crash share, wet-weather crash
          share and rural-road crash share from 2020 to 2023. It then predicts
          whether the LGA will have a high crash rate in 2024, which means{" "}
          {RISK_THRESHOLD} or more crashes per 100,000 residents.
        </p>

        <p>
          Start with the accuracy summary, then check the ROC curve and
          confusion matrix to see how often the model is right. Move the risk
          cut-off slider to see how flagging more or fewer LGAs changes the
          results, and use the table at the bottom to find the LGAs the model
          expects to be high risk.
        </p>
      </section>

      <CrashRiskModel
        predictions={predictions}
        metrics={metrics}
        importance={importance}
        coefficients={coefficients}
        riskThreshold={RISK_THRESHOLD}
      />
    </main>
  );
}

export default RiskPredictor;
