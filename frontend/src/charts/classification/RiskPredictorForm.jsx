
import React, { useState } from "react";
import "./RiskPredictorForm.css";

const API_URL = `http://${window.location.hostname}:8000`;

function RiskPredictorForm() {
    const [formData, setFormData] = useState({
        lga_name: "",
        population: "",
        severe_percent: "",
        wet_weather_percent: "",
        avg_speed_limit: "",
        probability_cutoff: 0.5
    });

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
            const response = await fetch(
                `${API_URL}/api/classification/predict`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        lga_name: formData.lga_name || "Hypothetical LGA",
                        population: Number(formData.population),
                        severe_percent: Number(formData.severe_percent),
                        wet_weather_percent: Number(formData.wet_weather_percent),
                        avg_speed_limit: Number(formData.avg_speed_limit),
                        probability_cutoff: Number(formData.probability_cutoff)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Prediction failed.");
            }

            setResult(data);

        } catch (err) {
            setError(err.message || "Unable to connect to the prediction server.");
        } finally {
            setLoading(false);
        }
    }

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
                        <label>LGA Name</label>
                        <input
                            type="text"
                            name="lga_name"
                            placeholder="Enter an LGA name"
                            value={formData.lga_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="predictor-field">
                        <label>Population</label>
                        <input
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
                        <label>Severe Crash Percentage (%)</label>
                        <input
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
                        <label>Wet-weather Crash Percentage (%)</label>
                        <input
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
                        <label>Average Speed Limit (km/h)</label>
                        <input
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
                        <label>
                            Risk Probability Cut-off:{" "}
                            {(Number(formData.probability_cutoff) * 100).toFixed(0)}%
                        </label>

                        <input
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
                            this cut-off.
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
                <div className="predictor-error">
                    {error}
                </div>
            )}

            {result && (
                <div className="prediction-result">

                    <h3>Prediction Result</h3>

                    <p className="result-lga">
                        {result.lga_name}
                    </p>

                    <div className={`result-status ${
                        result.is_high_risk ? "high-risk" : "low-risk"
                    }`}>
                        {result.prediction}
                    </div>

                    <div className="result-probability">
                        {result.probability_percentage}%
                    </div>

                    <p className="result-description">
                        Predicted probability of belonging to the high-risk class.
                    </p>

                    <div className="result-details">
                        <div>
                            <span>Probability cut-off</span>
                            <strong>
                                {(result.probability_cutoff * 100).toFixed(0)}%
                            </strong>
                        </div>

                        <div>
                            <span>Predicted probability</span>
                            <strong>
                                {result.probability_percentage}%
                            </strong>
                        </div>

                        <div>
                            <span>Model classification</span>
                            <strong>{result.prediction}</strong>
                        </div>
                    </div>

                    <p className="result-explanation">
                        The predicted probability is{" "}
                        {result.is_high_risk ? "equal to or above" : "below"}{" "}
                        the selected probability cut-off of{" "}
                        {(result.probability_cutoff * 100).toFixed(0)}%.
                        Therefore, the model classifies this hypothetical
                        LGA as {result.prediction.toLowerCase()}.
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
