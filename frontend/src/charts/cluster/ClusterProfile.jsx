
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import "./ClusterProfile.css";

const FEATURES = [
  "Crash rate per 100k",
  "Severe %",
  "Wet-weather %",
  "Rural-road %",
];

const FEATURE_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
];

function getNumericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatValue(feature, value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  if (feature === "Crash rate per 100k") {
    return value.toFixed(2);
  }

  return `${value.toFixed(2)}%`;
}

function getClusterLabel(cluster) {
  const value = String(cluster);

  return value.toLowerCase().startsWith("cluster")
    ? value
    : `Cluster ${value}`;
}

function ClusterProfile({ data = [] }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  const [selectedCluster, setSelectedCluster] = useState("All");

  // Find the column containing the cluster identifier.
  const clusterKey = useMemo(() => {
    if (!data.length) return null;

    return (
      Object.keys(data[0]).find((key) =>
        /kmean|cluster/i.test(key)
      ) || null
    );
  }, [data]);

  // Prepare cluster data and convert feature values to numbers.
  const chartData = useMemo(() => {
    if (!data.length || !clusterKey) return [];

    return data
      .map((row) => {
        const result = {
          cluster: String(row[clusterKey]),
        };

        FEATURES.forEach((feature) => {
          result[feature] = getNumericValue(row[feature]);
        });

        return result;
      })
      .filter((row) => row.cluster !== "undefined");
  }, [data, clusterKey]);

  // Get the available cluster names.
  const clusterOptions = useMemo(() => {
    return [...new Set(chartData.map((row) => row.cluster))].sort(
      (a, b) =>
        a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: "base",
        })
    );
  }, [chartData]);

  // Calculate the arithmetic mean of each feature across clusters.
  // Each cluster contributes equally to the average.
  const averageProfile = useMemo(() => {
    return FEATURES.map((feature) => ({
      feature,
      value: d3.mean(
        chartData,
        (row) => row[feature]
      ) ?? null,
    }));
  }, [chartData]);

  const selectedProfile = chartData.find(
    (row) => row.cluster === selectedCluster
  );

  // Show either the overall averages or the selected cluster's values.
  const displayedData = useMemo(() => {
    if (selectedCluster === "All") {
      return averageProfile;
    }

    if (!selectedProfile) return [];

    return FEATURES.map((feature) => ({
      feature,
      value: selectedProfile[feature],
    }));
  }, [selectedCluster, selectedProfile, averageProfile]);

  // Use the same reference scale when switching between clusters.
  // Crash rate uses its maximum observed cluster value.
  // Percentage features use a 0–100 scale.
  const getFeatureMaximum = (feature) => {
    if (feature === "Crash rate per 100k") {
      return Math.max(
        d3.max(chartData, (row) => row[feature]) || 1,
        1
      );
    }

    return 100;
  };

  // Dynamic insight based on the selected view.
  const insight = useMemo(() => {
    if (selectedCluster === "All") {
      return {
        title: "Overall Cluster Averages",
        description:
          "Each bar represents the arithmetic average of that feature across all available clusters. Every cluster contributes equally to the calculation.",
      };
    }

    if (!selectedProfile) {
      return {
        title: "Cluster Profile",
        description: "No profile data is available for this cluster.",
      };
    }

    const clusterAverage = d3.mean(
      chartData,
      (row) => row["Crash rate per 100k"]
    );

    const clusterCrashRate = selectedProfile["Crash rate per 100k"];

    let description = `Showing the four feature values for ${getClusterLabel(
      selectedCluster
    )}.`;

    if (
      clusterCrashRate !== null &&
      clusterAverage !== undefined &&
      clusterAverage !== null
    ) {
      const difference = clusterCrashRate - clusterAverage;
      const percentageDifference =
        clusterAverage !== 0
          ? (Math.abs(difference) / clusterAverage) * 100
          : 0;

      if (difference > 0) {
        description += ` Its crash rate is ${percentageDifference.toFixed(
          1
        )}% above the average across clusters.`;
      } else if (difference < 0) {
        description += ` Its crash rate is ${percentageDifference.toFixed(
          1
        )}% below the average across clusters.`;
      } else {
        description += " Its crash rate matches the average across clusters.";
      }
    }

    return {
      title: `${getClusterLabel(selectedCluster)} Profile`,
      description,
    };
  }, [selectedCluster, selectedProfile, chartData]);

  // Draw the horizontal bar chart.
  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (!displayedData.length) return;

    const width = 900;
    const height = 350;

    const margin = {
      top: 20,
      right: 115,
      bottom: 20,
      left: 190,
    };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, chartWidth]);

    const y = d3
      .scaleBand()
      .domain(FEATURES)
      .range([0, chartHeight])
      .padding(0.38);

    // Subtle background tracks.
    chart
      .selectAll(".profile-track")
      .data(displayedData)
      .join("rect")
      .attr("class", "profile-track")
      .attr("x", 0)
      .attr("y", (d) => y(d.feature))
      .attr("width", chartWidth)
      .attr("height", y.bandwidth())
      .attr("rx", 7);

    // Feature labels.
    chart
      .selectAll(".profile-feature-label")
      .data(displayedData)
      .join("text")
      .attr("class", "profile-feature-label")
      .attr("x", -18)
      .attr("y", (d) => y(d.feature) + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .text((d) => d.feature);

    // Horizontal bars.
    const bars = chart
      .selectAll(".profile-bar")
      .data(displayedData)
      .join("rect")
      .attr("class", "profile-bar")
      .attr("x", 0)
      .attr("y", (d) => y(d.feature))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("rx", 7)
      .attr(
        "fill",
        (d) => FEATURE_COLORS[FEATURES.indexOf(d.feature)]
      );

    bars
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .attr("width", (d) => {
        if (d.value === null) return 0;

        const maximum = getFeatureMaximum(d.feature);
        const ratio = Math.max(0, Math.min(d.value / maximum, 1));

        return x(ratio);
      });

    // Actual values beside each bar.
    chart
      .selectAll(".profile-value-label")
      .data(displayedData)
      .join("text")
      .attr("class", "profile-value-label")
      .attr("x", (d) => {
        if (d.value === null) return 8;

        const maximum = getFeatureMaximum(d.feature);
        const ratio = Math.max(0, Math.min(d.value / maximum, 1));

        return x(ratio) + 10;
      })
      .attr("y", (d) => y(d.feature) + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .text((d) => formatValue(d.feature, d.value));

    // Hover tooltip.
    bars
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("opacity", 0.82);

        d3.select(tooltipRef.current)
          .style("opacity", 1)
          .text(
            `${d.feature}: ${formatValue(d.feature, d.value)}`
          );
      })
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(
          event,
          wrapperRef.current
        );

        d3.select(tooltipRef.current)
          .style("left", `${mouseX + 14}px`)
          .style("top", `${mouseY - 12}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 1);

        d3.select(tooltipRef.current)
          .style("opacity", 0);
      });

    return () => {
      svg.selectAll("*").interrupt();
    };
  }, [displayedData, chartData]);

  if (!data.length || !clusterKey || !chartData.length) {
    return (
      <div className="cluster-profile-chart">
        <div className="profile-empty">
          Unable to display cluster profiles. Check that the API
          returns cluster identifiers and all four feature columns.
        </div>
      </div>
    );
  }

  return (
    <section className="cluster-profile-chart">
      <div className="profile-header">
        <div>
          <span className="profile-eyebrow">
            CLUSTER ANALYSIS
          </span>

          <h2>Cluster Profile Comparison</h2>

          <p className="profile-description">
            Explore the differences between clusters using four
            road-safety indicators.
          </p>
        </div>

        <div className="profile-header-icon">
          <span>↗</span>
        </div>
      </div>

      {/* Cluster selection buttons */}
      <div className="profile-selector">
        <span className="profile-selector-label">
          Select a view
        </span>

        <div className="cluster-buttons">
          <button
            type="button"
            className={`cluster-button ${
              selectedCluster === "All" ? "active" : ""
            }`}
            style={{ "--cluster-color": "#64748b" }}
            onClick={() => setSelectedCluster("All")}
          >
            <span className="cluster-button-dot all-dot" />
            All Clusters
          </button>

          {clusterOptions.map((cluster, index) => {
            const color =
              d3.schemeTableau10[index % d3.schemeTableau10.length];

            return (
              <button
                type="button"
                key={cluster}
                className={`cluster-button ${
                  selectedCluster === cluster ? "active" : ""
                }`}
                style={{ "--cluster-color": color }}
                onClick={() => setSelectedCluster(cluster)}
              >
                <span
                  className="cluster-button-dot"
                  style={{ backgroundColor: color }}
                />
                {getClusterLabel(cluster)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic insight */}
      <div className="profile-insight">
        <div className="profile-insight-icon">i</div>

        <div>
          <strong>{insight.title}</strong>
          <p>{insight.description}</p>
        </div>
      </div>

      {/* Horizontal bar chart */}
      <div className="profile-chart-panel">
        <div className="profile-chart-heading">
          <div>
            <h3>
              {selectedCluster === "All"
                ? "Overall Cluster Averages"
                : `${getClusterLabel(selectedCluster)} Feature Values`}
            </h3>

            <p>
              {selectedCluster === "All"
                ? "Average value of each feature across all clusters"
                : "Individual feature values for the selected cluster"}
            </p>
          </div>

          <span className="profile-chart-count">
            {FEATURES.length} FEATURES
          </span>
        </div>

        <div className="profile-chart-wrapper" ref={wrapperRef}>
          <svg ref={svgRef} />

          <div
            className="profile-tooltip"
            ref={tooltipRef}
          />
        </div>

        <div className="profile-chart-note">
          <span className="profile-note-dot" />
          Bar lengths use feature-specific scales because crash
          rate and percentage measurements have different units.
          The values beside the bars show the actual measurements.
        </div>
      </div>
    </section>
  );
}

export default ClusterProfile;
