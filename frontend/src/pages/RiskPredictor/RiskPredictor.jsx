import React, { useEffect, useState } from "react";
import CrashRiskModel from "../../charts/classification/CrashRiskModel";
import RiskPredictorForm from "../../charts/classification/RiskPredictorForm";
import "./RiskPredictor.css";

const API_URL = `http://${window.location.hostname}:8000`;

// Same value used in the notebook when the High_risk label was created.
const RISK_THRESHOLD = 254.9;

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
        fetch(`${API_URL}/api/classification/coefficients`)
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Failed to fetch classification data.");
      }

      const [
        predictionData,
        metricsData,
        importanceData,
        coefficientData
      ] = await Promise.all(
        responses.map((response) => response.json())
      );

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

    loadData();
  }, []);

  if (loading) return <p>Loading risk model...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="risk-predictor-page">
      
      <header className="risk-page-header">
        <div className="risk-page-header-content">

          <span className="risk-page-eyebrow">
            ROAD SAFETY ANALYTICS
          </span>

          <h1>Road Accident Risk Predictor</h1>

          <p>Which areas are most at risk of road accidents?</p>

          <p>
            Not all Local Government Areas (LGAs) face the same level of road accident risk.
             By examining historical crash patterns and local characteristics, we can identify
              areas that may be more likely to experience high crash rates.
          </p>

          <p>
            Explore how population, severe crashes, wet-weather conditions and rural roads contribute
             to predicting crash risk in 2024. Use the model evaluation charts and adjustable risk 
             cut-off to investigate its predictions.
          </p>

        </div>
      </header>
      

      <CrashRiskModel
        predictions={predictions}
        metrics={metrics}
        importance={importance}
        coefficients={coefficients}
        riskThreshold={RISK_THRESHOLD}
      />


      <section className="risk-form-section">
        <RiskPredictorForm />
      </section>
            

      
    </main>

    
  );
}

export default RiskPredictor;
