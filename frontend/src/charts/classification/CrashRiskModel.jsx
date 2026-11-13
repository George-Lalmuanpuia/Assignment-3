import React, { useMemo, useState } from "react";
import * as d3 from "d3";
import "./CrashRiskModel.css";

/* ------------------------------------------------------------------ */
/* Constants and small helpers                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_THRESHOLD = 0.62;
const MIN_THRESHOLD = 0.05;
const MAX_THRESHOLD = 0.95;
const ROWS_PER_PAGE = 15;

const FEATURE_LABELS = {
  "Population": "Population",
  "Severe %": "Severe crash %",
  "Wet-weather %": "Wet-weather crash %",
  "Avg speed limit": "Avg speed limit",
};

function featureLabel(feature) {
  return FEATURE_LABELS[feature] || feature;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toBinary(value) {
  return value === true ||
    String(value).toLowerCase() === "true" ||
    Number(value) === 1
    ? 1
    : 0;
}

function percent(value, digits = 1) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(digits)}%` : "N/A";
}

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

/* ------------------------------------------------------------------ */
/* Model maths, computed in the browser so the cut-off slider is live   */
/* ------------------------------------------------------------------ */

// Classify with a given cut-off and count the four outcomes.
function getConfusion(rows, threshold) {
  let tn = 0;
  let fp = 0;
  let fn = 0;
  let tp = 0;

  rows.forEach((row) => {
    const predicted = row.prob >= threshold ? 1 : 0;

    if (row.actual === 1 && predicted === 1) tp += 1;
    else if (row.actual === 1 && predicted === 0) fn += 1;
    else if (row.actual === 0 && predicted === 1) fp += 1;
    else tn += 1;
  });

  return { tn, fp, fn, tp };
}

function getScores({ tn, fp, fn, tp }) {
  const total = tn + fp + fn + tp;
  const precision = tp + fp > 0 ? tp / (tp + fp) : null;
  const recall = tp + fn > 0 ? tp / (tp + fn) : null;
  const f1 =
    precision !== null && recall !== null && precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : null;

  return {
    total,
    correct: tn + tp,
    incorrect: fp + fn,
    accuracy: total > 0 ? (tn + tp) / total : null,
    precision,
    recall,
    f1,
  };
}

// Sweep every distinct probability as a cut-off to get the ROC curve.
function buildRoc(rows) {
  const positives = rows.filter((row) => row.actual === 1).length;
  const negatives = rows.length - positives;

  if (!positives || !negatives) return { points: [], auc: null };

  const sorted = [...rows].sort((a, b) => b.prob - a.prob);
  const points = [{ fpr: 0, tpr: 0, threshold: 1 }];

  let tp = 0;
  let fp = 0;

  sorted.forEach((row, index) => {
    if (row.actual === 1) tp += 1;
    else fp += 1;

    const isLastOfTie =
      index === sorted.length - 1 || sorted[index + 1].prob !== row.prob;

    if (isLastOfTie) {
      points.push({
        fpr: fp / negatives,
        tpr: tp / positives,
        threshold: row.prob,
      });
    }
  });

  let auc = 0;
  for (let i = 1; i < points.length; i += 1) {
    auc +=
      ((points[i].fpr - points[i - 1].fpr) *
        (points[i].tpr + points[i - 1].tpr)) /
      2;
  }

  return { points, auc };
}

/* ------------------------------------------------------------------ */
/* ROC curve                                                            */
/* ------------------------------------------------------------------ */

function RocChart({ roc, auc, operating, onPickThreshold }) {
  const [hover, setHover] = useState(null);

  const width = 460;
  const height = 420;
  const margin = { top: 16, right: 20, bottom: 54, left: 58 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const x = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

  const linePath = d3
    .line()
    .x((d) => x(d.fpr))
    .y((d) => y(d.tpr))(roc);

  const areaPath = d3
    .area()
    .x((d) => x(d.fpr))
    .y0(innerHeight)
    .y1((d) => y(d.tpr))(roc);

  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];

  function findNearest(event) {
    const [mouseX, mouseY] = d3.pointer(event, event.currentTarget);
    let best = null;
    let bestDistance = Infinity;

    roc.forEach((point) => {
      const distance = Math.hypot(x(point.fpr) - mouseX, y(point.tpr) - mouseY);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = point;
      }
    });

    return best;
  }

  return (
    <div className="crm-chart-box">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`ROC curve. The area under the curve is ${
          auc !== null ? auc.toFixed(2) : "not available"
        }.`}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className="crm-grid"
                x1={0}
                x2={innerWidth}
                y1={y(tick)}
                y2={y(tick)}
              />
              <line
                className="crm-grid"
                x1={x(tick)}
                x2={x(tick)}
                y1={0}
                y2={innerHeight}
              />
              <text
                className="crm-tick"
                x={-10}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {tick.toFixed(1)}
              </text>
              <text
                className="crm-tick"
                x={x(tick)}
                y={innerHeight + 20}
                textAnchor="middle"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          ))}

          <path className="crm-roc-area" d={areaPath} />

          <line
            className="crm-roc-diagonal"
            x1={x(0)}
            y1={y(0)}
            x2={x(1)}
            y2={y(1)}
          />
          <text
            className="crm-roc-note"
            x={x(0.55)}
            y={y(0.55) + 22}
            transform={`rotate(-45 ${x(0.55)} ${y(0.55) + 22})`}
            textAnchor="middle"
          >
            Random guessing
          </text>

          <path className="crm-roc-line" d={linePath} />

          {operating && (
            <g>
              <circle
                className="crm-roc-operating"
                cx={x(operating.fpr)}
                cy={y(operating.tpr)}
                r={7}
              />
            </g>
          )}

          {hover && (
            <circle
              className="crm-roc-hover"
              cx={x(hover.fpr)}
              cy={y(hover.tpr)}
              r={5}
            />
          )}

          <text
            className="crm-auc-label"
            x={innerWidth - 8}
            y={innerHeight - 14}
            textAnchor="end"
          >
            AUC = {auc !== null ? auc.toFixed(2) : "N/A"}
          </text>

          <text
            className="crm-axis-title"
            x={innerWidth / 2}
            y={innerHeight + 46}
            textAnchor="middle"
          >
            False positive rate
          </text>
          <text
            className="crm-axis-title"
            transform={`translate(${-42},${innerHeight / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            True positive rate
          </text>

          <rect
            className="crm-hit-area"
            width={innerWidth}
            height={innerHeight}
            onMouseMove={(event) => setHover(findNearest(event))}
            onMouseLeave={() => setHover(null)}
            onClick={(event) => {
              const point = findNearest(event);
              if (point) onPickThreshold(point.threshold);
            }}
          />
        </g>
      </svg>

      {hover && (
        <div className="crm-chart-tip" role="status">
          Cut-off {Math.min(hover.threshold, 1).toFixed(2)}: finds{" "}
          {percent(hover.tpr, 0)} of high-risk LGAs, with{" "}
          {percent(hover.fpr, 0)} false alarms
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confusion matrix                                                     */
/* ------------------------------------------------------------------ */

function ConfusionMatrix({ confusion }) {
  const width = 460;
  const height = 420;
  const margin = { top: 52, right: 16, bottom: 20, left: 112 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const cellWidth = innerWidth / 2;
  const cellHeight = innerHeight / 2;

  const cells = [
    { row: 0, col: 0, value: confusion.tn, name: "True negative" },
    { row: 0, col: 1, value: confusion.fp, name: "False positive" },
    { row: 1, col: 0, value: confusion.fn, name: "False negative" },
    { row: 1, col: 1, value: confusion.tp, name: "True positive" },
  ];

  const maxValue = Math.max(...cells.map((cell) => cell.value), 1);
  const rowTotals = [
    confusion.tn + confusion.fp,
    confusion.fn + confusion.tp,
  ];

  const colour = d3.scaleSequential(d3.interpolateBlues).domain([0, maxValue * 1.15]);

  return (
    <div className="crm-chart-box">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Confusion matrix. True negatives ${confusion.tn}, false positives ${confusion.fp}, false negatives ${confusion.fn}, true positives ${confusion.tp}.`}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          <text
            className="crm-axis-title"
            x={innerWidth / 2}
            y={-34}
            textAnchor="middle"
          >
            Model predicted
          </text>
          {["Low risk", "High risk"].map((label, index) => (
            <text
              key={label}
              className="crm-matrix-axis"
              x={cellWidth * index + cellWidth / 2}
              y={-12}
              textAnchor="middle"
            >
              {label}
            </text>
          ))}

          <text
            className="crm-axis-title"
            transform={`translate(${-98},${innerHeight / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            Actual (2024)
          </text>
          {["Low risk", "High risk"].map((label, index) => (
            <text
              key={label}
              className="crm-matrix-axis"
              x={-12}
              y={cellHeight * index + cellHeight / 2}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {label}
            </text>
          ))}

          {cells.map((cell) => {
            const fill = colour(cell.value);
            const dark = cell.value > maxValue * 0.5;
            const share = rowTotals[cell.row]
              ? cell.value / rowTotals[cell.row]
              : 0;
            const centreX = cellWidth * cell.col + cellWidth / 2;
            const centreY = cellHeight * cell.row + cellHeight / 2;

            return (
              <g key={cell.name}>
                <rect
                  className="crm-matrix-cell"
                  x={cellWidth * cell.col + 2}
                  y={cellHeight * cell.row + 2}
                  width={cellWidth - 4}
                  height={cellHeight - 4}
                  rx={8}
                  fill={fill}
                />
                <text
                  className={`crm-matrix-count ${dark ? "is-light" : ""}`}
                  x={centreX}
                  y={centreY - 8}
                  textAnchor="middle"
                >
                  {cell.value}
                </text>
                <text
                  className={`crm-matrix-name ${dark ? "is-light" : ""}`}
                  x={centreX}
                  y={centreY + 16}
                  textAnchor="middle"
                >
                  {cell.name}
                </text>
                <text
                  className={`crm-matrix-share ${dark ? "is-light" : ""}`}
                  x={centreX}
                  y={centreY + 34}
                  textAnchor="middle"
                >
                  {percent(share, 0)} of actual{" "}
                  {cell.row === 0 ? "low" : "high"}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feature importance                                                   */
/* ------------------------------------------------------------------ */

function FeatureChart({ items, mode }) {
  const width = 620;
  const rowHeight = 62;
  const margin = { top: 14, right: 88, bottom: 40, left: 178 };
  const height = margin.top + margin.bottom + items.length * rowHeight;
  const innerWidth = width - margin.left - margin.right;

  const isImportance = mode === "importance";

  let low;
  let high;

  if (isImportance) {
    low = Math.min(0, d3.min(items, (d) => d.value - d.spread) ?? 0);
    high = Math.max(d3.max(items, (d) => d.value + d.spread) ?? 0, 0.001);
  } else {
    const extent = Math.max(d3.max(items, (d) => Math.abs(d.value)) ?? 0, 0.001);
    low = -extent * 1.1;
    high = extent * 1.1;
  }

  const x = d3.scaleLinear().domain([low, high]).range([0, innerWidth]).nice(5);
  const y = d3
    .scaleBand()
    .domain(items.map((d) => d.feature))
    .range([0, items.length * rowHeight])
    .padding(0.38);

  return (
    <div className="crm-chart-box crm-feature-box">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={
          isImportance
            ? "Bar chart of how much each factor the model relies on"
            : "Bar chart of whether each factor pushes towards high or low risk"
        }
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {x.ticks(5).map((tick) => (
            <g key={tick}>
              <line
                className="crm-grid"
                x1={x(tick)}
                x2={x(tick)}
                y1={0}
                y2={items.length * rowHeight}
              />
              <text
                className="crm-tick"
                x={x(tick)}
                y={items.length * rowHeight + 18}
                textAnchor="middle"
              >
                {isImportance ? tick.toFixed(2) : tick.toFixed(1)}
              </text>
            </g>
          ))}

          <line
            className="crm-zero-line"
            x1={x(0)}
            x2={x(0)}
            y1={0}
            y2={items.length * rowHeight}
          />

          {items.map((item) => {
            const barStart = Math.min(x(0), x(item.value));
            const barWidth = Math.abs(x(item.value) - x(0));
            const centreY = y(item.feature) + y.bandwidth() / 2;
            const fill = isImportance
              ? "var(--crm-accent)"
              : item.value >= 0
              ? "var(--crm-high)"
              : "var(--crm-low)";

            const labelX = isImportance
              ? x(item.value + item.spread) + 10
              : item.value >= 0
              ? x(item.value) + 10
              : x(0) + 10;

            return (
              <g key={item.feature}>
                <text
                  className="crm-feature-name"
                  x={-14}
                  y={centreY}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {featureLabel(item.feature)}
                </text>

                <rect
                  className="crm-feature-bar"
                  x={barStart}
                  y={y(item.feature)}
                  width={barWidth}
                  height={y.bandwidth()}
                  rx={5}
                  fill={fill}
                />

                {isImportance && item.spread > 0 && (
                  <g className="crm-error">
                    <line
                      x1={x(item.value - item.spread)}
                      x2={x(item.value + item.spread)}
                      y1={centreY}
                      y2={centreY}
                    />
                    <line
                      x1={x(item.value - item.spread)}
                      x2={x(item.value - item.spread)}
                      y1={centreY - 6}
                      y2={centreY + 6}
                    />
                    <line
                      x1={x(item.value + item.spread)}
                      x2={x(item.value + item.spread)}
                      y1={centreY - 6}
                      y2={centreY + 6}
                    />
                  </g>
                )}

                <text
                  className="crm-feature-value"
                  x={labelX}
                  y={centreY}
                  dominantBaseline="middle"
                >
                  {isImportance
                    ? item.value.toFixed(3)
                    : `${item.value >= 0 ? "+" : ""}${item.value.toFixed(2)}`}
                </text>
              </g>
            );
          })}

          <text
            className="crm-axis-title"
            x={innerWidth / 2}
            y={items.length * rowHeight + 36}
            textAnchor="middle"
          >
            {isImportance
              ? "Drop in ROC AUC when the factor is scrambled"
              : "Effect on risk (standardised coefficient)"}
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

function CrashRiskModel({
  predictions = [],
  metrics = null,
  importance = [],
  coefficients = [],
  riskThreshold = 250,
}) {
  const [cutoff, setCutoff] = useState(DEFAULT_THRESHOLD);
  const [featureMode, setFeatureMode] = useState("importance");
  const [view, setView] = useState("all");
  const [query, setQuery] = useState("");
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE);

  // Clean the prediction rows.
  const rows = useMemo(
    () =>
      predictions
        .map((item) => ({
          lga: String(item.LGA ?? ""),
          year: toNumber(item.Year),
          actual: toBinary(item.y_true),
          prob: toNumber(item.y_prob),
        }))
        .filter((item) => item.lga && item.prob !== null),
    [predictions]
  );

  const metricsRow = useMemo(() => {
    if (Array.isArray(metrics)) return metrics[0] || null;
    return metrics || null;
  }, [metrics]);

  const roc = useMemo(() => buildRoc(rows), [rows]);

  const confusion = useMemo(() => getConfusion(rows, cutoff), [rows, cutoff]);
  const scores = useMemo(() => getScores(confusion), [confusion]);

  const operating = useMemo(() => {
    const positives = confusion.tp + confusion.fn;
    const negatives = confusion.fp + confusion.tn;
    if (!positives || !negatives) return null;

    return {
      tpr: confusion.tp / positives,
      fpr: confusion.fp / negatives,
    };
  }, [confusion]);

  // Share of the most common class: what a model that never learns would score.
  const baseline = useMemo(() => {
    const fromMetrics = toNumber(metricsRow?.dummy_accuracy);
    if (fromMetrics !== null) return fromMetrics;
    if (!rows.length) return null;
    const highShare = rows.filter((row) => row.actual === 1).length / rows.length;
    return Math.max(highShare, 1 - highShare);
  }, [metricsRow, rows]);

  const cvMean = toNumber(metricsRow?.cv_roc_auc_mean);
  const cvStd = toNumber(metricsRow?.cv_roc_auc_std);

  const testYear = useMemo(() => {
    const years = rows.map((row) => row.year).filter((year) => year !== null);
    return years.length ? Math.max(...years) : null;
  }, [rows]);

  // Feature importance and direction.
  const importanceItems = useMemo(
    () =>
      importance
        .map((item) => ({
          feature: String(item.feature),
          value: toNumber(item.importance_mean),
          spread: toNumber(item.importance_std) ?? 0,
        }))
        .filter((item) => item.value !== null)
        .sort((a, b) => b.value - a.value),
    [importance]
  );

  const coefficientItems = useMemo(
    () =>
      coefficients
        .map((item) => ({
          feature: String(item.feature),
          value: toNumber(item.coefficient),
          spread: 0,
        }))
        .filter((item) => item.value !== null)
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
    [coefficients]
  );

  const featureItems =
    featureMode === "importance" ? importanceItems : coefficientItems;

  const featureInsight = useMemo(() => {
    if (!importanceItems.length) return "";

    const top = importanceItems[0];
    const rest = importanceItems.slice(1);
    const clearlyAhead = rest.every((item) => top.value - top.spread > item.value + item.spread);
    const direction = coefficientItems.find((item) => item.feature === top.feature);
    <br/>
    let text = clearlyAhead
      ? `${featureLabel(top.feature)} is the factor the model relies on most, and it is well ahead of the others.`
      : `${featureLabel(top.feature)} ranks first, but the gap to the other factors is within the margin of error.`;

    if (direction) {
      text +=
        direction.value >= 0
          ? ` A higher ${featureLabel(top.feature).toLowerCase()} pushes an LGA towards high risk.`
          : ` A higher ${featureLabel(top.feature).toLowerCase()} pushes an LGA towards low risk.`;
    }

    return text;
  }, [importanceItems, coefficientItems]);

  // LGA table, driven by the cut-off slider and the filters.
  const tableRows = useMemo(() => {
    const search = query.trim().toLowerCase();

    const list = rows
      .map((row) => {
        const predicted = row.prob >= cutoff ? 1 : 0;
        return { ...row, predicted, correct: predicted === row.actual };
      })
      .filter((row) => {
        if (view === "high" && row.predicted !== 1) return false;
        if (view === "low" && row.predicted !== 0) return false;
        if (onlyWrong && row.correct) return false;
        if (search && !row.lga.toLowerCase().includes(search)) return false;
        return true;
      });

    list.sort((a, b) => (view === "low" ? a.prob - b.prob : b.prob - a.prob));
    return list;
  }, [rows, cutoff, view, query, onlyWrong]);

  const predictedHigh = confusion.tp + confusion.fp;

  function resetControls() {
    setCutoff(DEFAULT_THRESHOLD);
    setView("all");
    setQuery("");
    setOnlyWrong(false);
    setVisibleRows(ROWS_PER_PAGE);
  }

  if (!rows.length) {
    return (
      <section className="crm">
        <p className="crm-empty">
          Unable to show the risk model. Check that the API returns the
          prediction rows with LGA, y_true and y_prob columns.
        </p>
      </section>
    );
  }

  const correctShare = scores.total ? (scores.correct / scores.total) * 100 : 0;

  return (
    <section className="crm">
      {/* HEADER */}
      <header className="crm-header">
        <h2>Crash Risk Prediction Model</h2>
        <p className="crm-subtitle">
          Logistic Regression |  2024 test data
        </p>
        <p className="crm-definition">
          An LGA counts as high risk when it has a higher than median crash rate ( {riskThreshold} or more crashes
          per 100,000 residents). The model sees each LGA's earlier years and
          predicts whether it will be high risk in the test year.
        </p>
      </header>
      <br />

      {/* CONTROLS */}
      <div className="crm-controls">
        <div className="crm-slider">
          <label htmlFor="crm-cutoff">
            Risk cut-off: <strong>{cutoff.toFixed(2)}</strong>
          </label>

          <input
            id="crm-cutoff"
            type="range"
            min={MIN_THRESHOLD}
            max={MAX_THRESHOLD}
            step={0.01}
            value={cutoff}
            onChange={(event) => setCutoff(Number(event.target.value))}
            aria-describedby="crm-cutoff-help"
          />

          <div className="crm-slider-ends" aria-hidden="true">
            <span>Flag more LGAs</span>
            <span>Flag fewer LGAs</span>
          </div>

          <p id="crm-cutoff-help" className="crm-help">
            An LGA is predicted high risk when its risk probability reaches
            this cut-off. Every chart and the table below update as you move it.
          </p>
        </div>

        <div className="crm-reset-wrapper">
          <button type="button" className="crm-reset" onClick={resetControls}>
            Reset
          </button>
        </div>
      </div>
      <br />
      
      {/* ACCURACY */}
      <div className="crm-accuracy-card">
        <section className="crm-section" aria-labelledby="crm-accuracy-title">
          <div className="crm-accuracy-top">
            <div>
              <h3 id="crm-accuracy-title">Overall model accuracy</h3>
              <p className="crm-accuracy-value">{percent(scores.accuracy)}</p>
            </div>
            <span className="crm-pill">At cut-off {cutoff.toFixed(2)}</span>
          </div>

          <div
            className="crm-accuracy-bar"
            role="img"
            aria-label={`${scores.correct} correct and ${scores.incorrect} incorrect predictions`}
          >
            <div className="crm-bar-correct" style={{ width: `${correctShare}%` }} />
            <div className="crm-bar-incorrect" style={{ width: `${100 - correctShare}%` }} />
          </div>

          <div className="crm-accuracy-legend">
            <span>Correct predictions: {scores.correct}</span>
            <span>Incorrect: {scores.incorrect}</span>
          </div>

          {baseline !== null && (
            <p className="crm-baseline">
              Always guessing the most common outcome would be right{" "}
              {percent(baseline)} of the time.
            </p>
          )}

          <dl className="crm-stats">
            <div>
              <dt>Precision</dt>
              <dd>{percent(scores.precision)}</dd>
              <span>Flagged LGAs that really were high risk</span>
            </div>

            <div>
              <dt>Recall</dt>
              <dd>{percent(scores.recall)}</dd>
              <span>High-risk LGAs the model caught</span>
            </div>

            <div>
              <dt>F1 score</dt>
              <dd>{percent(scores.f1)}</dd>
              <span>Balance of precision and recall</span>
            </div>

            <div>
              <dt>ROC AUC</dt>
              <dd>{roc.auc !== null ? roc.auc.toFixed(2) : "N/A"}</dd>
              <span>
                {cvMean !== null
                  ? `Cross-validation: ${cvMean.toFixed(2)}${
                      cvStd !== null ? ` ± ${cvStd.toFixed(2)}` : ""
                    }`
                  : "1.0 is perfect, 0.5 is guessing"}
              </span>
            </div>
          </dl>
        </section>
      </div>

      {/* ROC + CONFUSION MATRIX CHARTs*/}
      <div className="crm-charts-card">
      <section className="crm-section" aria-labelledby="crm-perf-title">
        <h2 id="crm-perf-title">Model Classification performance</h2>

        <div className="crm-grid-two">
          <div>
            <h3>ROC curve</h3>
            <RocChart
              roc={roc.points}
              auc={roc.auc}
              operating={operating}
              onPickThreshold={(threshold) =>
                setCutoff(clamp(threshold, MIN_THRESHOLD, MAX_THRESHOLD))
              }
            />
            <p className="crm-caption">
              The further the curve bends towards the top-left, the better the
              model separates high-risk from low-risk LGAs. The orange dot marks
              your current cut-off. Click the curve to try another one.
            </p>
          </div>

          <div>
            <h3>Confusion matrix</h3>
            <ConfusionMatrix confusion={confusion} />
            <p className="crm-caption">
              Correct and incorrect predictions at the current cut-off. The
              diagonal cells are correct; the other two are mistakes.
            </p>
          </div>
        </div>
      </section>
      </div>

      {/* FEATURE IMPORTANCE */}
      <div className="crm-feature-card">
      {featureItems.length > 0 && (
        <section className="crm-section" aria-labelledby="crm-feature-title">
          <div className="crm-feature-head">
            <div>
              <h3 id="crm-feature-title">What drives the prediction</h3>
              <p className="crm-caption crm-caption-tight">
                {featureMode === "importance"
                  ? "Longer bars mean the model depends on that factor more. Whiskers show the variation across repeated shuffles."
                  : "Orange bars push an LGA towards high risk, teal bars towards low risk."}
              </p>
            </div>

            {coefficientItems.length > 0 && importanceItems.length > 0 && (
              <div className="crm-toggle" role="group" aria-label="Feature chart type">
                <button
                  type="button"
                  className={featureMode === "importance" ? "is-active" : ""}
                  aria-pressed={featureMode === "importance"}
                  onClick={() => setFeatureMode("importance")}
                >
                  Importance
                </button>
                <button
                  type="button"
                  className={featureMode === "direction" ? "is-active" : ""}
                  aria-pressed={featureMode === "direction"}
                  onClick={() => setFeatureMode("direction")}
                >
                  Direction
                </button>
              </div>
            )}
          </div>
          <br />

          <FeatureChart items={featureItems} mode={featureMode} />

          {featureInsight && <p className="crm-insight">{featureInsight}</p>}
        </section>
      )}
      </div>

      {/* LGA TABLE */}
      <div className="crm-table-card">
      <section className="crm-section" aria-labelledby="crm-table-title">
        <h3 id="crm-table-title">Which LGAs are likely to be high risk?</h3>
        <p className="crm-caption crm-caption-tight">
          {predictedHigh} of {scores.total} LGAs are predicted high risk at this
          cut-off.{" "}
          {confusion.tp} of them really were, and the model missed{" "}
          {confusion.fn}.
        </p>
        <br />

        <div className="crm-filters">
          <div className="crm-filter">
            <label htmlFor="crm-search">Search LGA</label>
            <input
              id="crm-search"
              type="search"
              placeholder="e.g. Bourke"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleRows(ROWS_PER_PAGE);
              }}
            />
          </div>

          <div className="crm-filter">
            <label htmlFor="crm-view">Show</label>
            <select
              id="crm-view"
              value={view}
              onChange={(event) => {
                setView(event.target.value);
                setVisibleRows(ROWS_PER_PAGE);
              }}
            >
              <option value="all">All LGAs</option>
              <option value="high">Predicted high risk</option>
              <option value="low">Predicted low risk</option>
            </select>
          </div>

          <label className="crm-check">
            <input
              type="checkbox"
              checked={onlyWrong}
              onChange={(event) => {
                setOnlyWrong(event.target.checked);
                setVisibleRows(ROWS_PER_PAGE);
              }}
            />
            <span>Wrong predictions only</span>
          </label>
        </div>

        {tableRows.length === 0 ? (
          <p className="crm-empty">
            No LGAs match these filters. Clear the search or change the view.
          </p>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">LGA</th>
                  <th scope="col">Risk probability</th>
                  <th scope="col">Predicted</th>
                  <th scope="col">Actual</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(0, visibleRows).map((row, index) => (
                  <tr key={`${row.lga}-${row.year}`}>
                    <td className="crm-rank">{index + 1}</td>
                    <th scope="row">{row.lga}</th>
                    <td>
                      <div className="crm-prob">
                        <div className="crm-prob-track">
                          <div
                            className="crm-prob-fill"
                            style={{ width: `${row.prob * 100}%` }}
                          />
                          <div
                            className="crm-prob-cutoff"
                            style={{ left: `${cutoff * 100}%` }}
                          />
                        </div>
                        <span>{percent(row.prob, 0)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`crm-tag ${row.predicted ? "is-high" : "is-low"}`}>
                        {row.predicted ? "High risk" : "Low risk"}
                      </span>
                    </td>
                    <td>
                      <span className={`crm-tag ${row.actual ? "is-high" : "is-low"}`}>
                        {row.actual ? "High risk" : "Low risk"}
                      </span>
                    </td>
                    <td>
                      <span className={`crm-result ${row.correct ? "is-right" : "is-wrong"}`}>
                        {row.correct ? "✓ Correct" : "✗ Wrong"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tableRows.length > visibleRows && (
          <button
            type="button"
            className="crm-more"
            onClick={() => setVisibleRows((count) => count + ROWS_PER_PAGE)}
          >
            Show more ({tableRows.length - visibleRows} remaining)
          </button>
        )}
      </section>
      </div>
    </section>
  );
}

export default CrashRiskModel;
