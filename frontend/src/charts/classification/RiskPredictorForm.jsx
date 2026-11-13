import React, { useState } from "react";
import "./RiskPredictorForm.css";

const API_URL = `http://${window.location.hostname}:8000`;

// Must match the path shown next to "POST" in http://localhost:8000/docs
const PREDICT_PATH = "/api/classification/predict";

// FastAPI returns `detail` as a string for HTTPException errors and as a
// list of objects for validation errors (422). Turn either into readable text.
function getErrorMessage(data) {
    const detail = data && data.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
        return detail
            .map(item => {
                const field = Array.isArray(item.loc)
                    ? item.loc[item.loc.length - 1]
                    : "";
                return field ? `${field}: ${item.msg}` : item.msg;
            })
            .join("; ");
    }

    return "Prediction failed.";
}

function RiskPredictorForm() {
    const [formData, setFormData] = useState({
        lga_name: "",
        population: "",
        severe_percent: "",
        wet_weather_percent: "",
        avg_speed_limit: "",
        probability_cutoff: 0.5
    });

    // The API returns the probability only. The cut-off slider is applied
    // here in the browser, so the classification updates as the slider moves.
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setLoading(true);
        setResult(null);
        setError("");

        try {
            const response = await fetch(`${API_URL}${PREDICT_PATH}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    population: Number(formData.population),
                    severe_pct: Number(formData.severe_percent),
                    wet_weather_pct: Number(formData.wet_weather_percent),
                    avg_speed_limit: Number(formData.avg_speed_limit)
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(getErrorMessage(data));
            }

            // Assumes `probability` is between 0 and 1 (e.g. predict_proba).
            const probability = Number(data.probability);

            if (!Number.isFinite(probability)) {
                throw new Error("The server did not return a valid probability.");
            }

            const modelThreshold = Number(data.threshold_used);

            setResult({
                lga_name: formData.lga_name || "Hypothetical LGA",
                probability: Math.min(1, Math.max(0, probability)),
                model_threshold: Number.isFinite(modelThreshold) ? modelThreshold : null
            });

        } catch (err) {
            setError(err.message || "Unable to connect to the prediction server.");
        } finally {
            setLoading(false);
        }
    }

    const cutoff = Number(formData.probability_cutoff);
    const isHighRisk = result ? result.probability >= cutoff : false;
    const prediction = isHighRisk ? "High risk" : "Low risk";
    const probabilityPercentage = result
        ? (result.probability * 100).toFixed(1)
        : null;

    return (
        <div className="risk-predictor-container">

            <div className="predictor-heading">
                <h2>Try the Risk Predictor</h2>
                <p>
                    Enter hypothetical LGA characteristics to see how the
                    Logistic Regression model predicts crash risk.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="risk-predictor-form">

                <div className="predictor-section">
                    <h3>LGA Information</h3>

                    <div className="predictor-field">
                        <label htmlFor="lga_name">LGA Name</label>
                        <input
                            id="lga_name"
                            type="text"
                            name="lga_name"
                            placeholder="Enter an LGA name"
                            value={formData.lga_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="predictor-field">
                        <label htmlFor="population">Population</label>
                        <input
                            id="population"
                            type="number"
                            name="population"
                            min="0"
                            required
                            placeholder="e.g. 50000"
                            value={formData.population}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="predictor-field">
                        <label htmlFor="severe_percent">Severe Crash Percentage (%)</label>
                        <input
                            id="severe_percent"
                            type="number"
                            name="severe_percent"
                            min="0"
                            max="100"
                            step="any"
                            required
                            placeholder="e.g. 15"
                            value={formData.severe_percent}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="predictor-field">
                        <label htmlFor="wet_weather_percent">Wet-weather Crash Percentage (%)</label>
                        <input
                            id="wet_weather_percent"
                            type="number"
                            name="wet_weather_percent"
                            min="0"
                            max="100"
                            step="any"
                            required
                            placeholder="e.g. 20"
                            value={formData.wet_weather_percent}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="predictor-field">
                        <label htmlFor="avg_speed_limit">Average Speed Limit (km/h)</label>
                        <input
                            id="avg_speed_limit"
                            type="number"
                            name="avg_speed_limit"
                            min="1"
                            step="any"
                            required
                            placeholder="e.g. 60"
                            value={formData.avg_speed_limit}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="predictor-section">
                    <h3>Classification Settings</h3>

                    <div className="predictor-field">
                        <label htmlFor="probability_cutoff">
                            Risk Probability Cut-off:{" "}
                            {(cutoff * 100).toFixed(0)}%
                        </label>

                        <input
                            id="probability_cutoff"
                            type="range"
                            name="probability_cutoff"
                            min="0.05"
                            max="0.95"
                            step="0.01"
                            value={formData.probability_cutoff}
                            onChange={handleChange}
                        />

                        <p className="predictor-hint">
                            The model classifies an area as high risk when
                            its predicted probability reaches or exceeds
                            this cut-off. After predicting, you can move
                            the slider to see the classification change.
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    className="predictor-button"
                    disabled={loading}
                >
                    {loading ? "Calculating..." : "Predict Crash Risk"}
                </button>

            </form>

            {error && (
                <div className="predictor-error" role="alert">
                    {error}
                </div>
            )}

            {result && (
                <div className="prediction-result" aria-live="polite">

                    <h3>Prediction Result</h3>

                    <p className="result-lga">
                        {result.lga_name}
                    </p>

                    <div className={`result-status ${
                        isHighRisk ? "high-risk" : "low-risk"
                    }`}>
                        {prediction}
                    </div>

                    <div className="result-probability">
                        {probabilityPercentage}%
                    </div>

                    <p className="result-description">
                        Predicted probability of belonging to the high-risk class.
                    </p>

                    <div className="result-details">
                        <div>
                            <span>Probability cut-off</span>
                            <strong>
                                {(cutoff * 100).toFixed(0)}%
                            </strong>
                        </div>

                        <div>
                            <span>Predicted probability</span>
                            <strong>
                                {probabilityPercentage}%
                            </strong>
                        </div>

                        <div>
                            <span>Model classification</span>
                            <strong>{prediction}</strong>
                        </div>
                    </div>

                    <p className="result-explanation">
                        The predicted probability is{" "}
                        {isHighRisk ? "equal to or above" : "below"}{" "}
                        the selected probability cut-off of{" "}
                        {(cutoff * 100).toFixed(0)}%.
                        Therefore, the model classifies this hypothetical
                        LGA as {prediction.toLowerCase()}.
                        {result.model_threshold !== null && (
                            <>
                                {" "}The model's built-in cut-off is{" "}
                                {(result.model_threshold * 100).toFixed(0)}%.
                            </>
                        )}
                    </p>

                </div>
            )}

            <p className="predictor-disclaimer">
                This tool demonstrates the Logistic Regression model using
                user-provided hypothetical inputs. Predictions are model
                estimates, not confirmed real-world crash risk assessments.
            </p>

        </div>
    );
}

export default RiskPredictorForm;
