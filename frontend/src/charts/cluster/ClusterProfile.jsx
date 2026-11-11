
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import "./ClusterProfile.css";

// The four road-safety features displayed in the bar chart.
const FEATURES = [
  "Crash rate per 100k",
  "Severe %",
  "Wet-weather %",
  "Rural-road %",
];

// Assigns a different colour to each feature in the bar chart.
const FEATURE_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
];

// Converts a value into a number.
// Returns null if the value is not a valid number.
function getNumericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// Formats feature values for display beside the bars.
function formatValue(feature, value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  // Crash rate is displayed as a normal number.
  if (feature === "Crash rate per 100k") {
    return value.toFixed(2);
  }

  // Other features are displayed as percentages.
  return `${value.toFixed(2)}%`;
}

// Makes sure cluster names are displayed consistently.
function getClusterLabel(cluster) {
  const value = String(cluster);

  return value.toLowerCase().startsWith("cluster")
    ? value
    : `Cluster ${value}`;
}

function ClusterProfile({ data = [] }) {

  // References the SVG chart, chart container and tooltip.
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  // Stores the currently selected cluster.
  const [selectedCluster, setSelectedCluster] = useState("All");

  // Finds the column containing the K-Means cluster identifier.
  const clusterKey = useMemo(() => {
    if (!data.length) return null;

    return (
      Object.keys(data[0]).find((key) =>
        /kmean|cluster/i.test(key)
      ) || null
    );
  }, [data]);

  // Prepares the chart data and converts feature values into numbers.
  const chartData = useMemo(() => {
    if (!data.length || !clusterKey) return [];

    return data
      .map((row) => {
        const result = {
          cluster: String(row[clusterKey]),
        };

        // Gets the numerical value for each road-safety feature.
        FEATURES.forEach((feature) => {
          result[feature] = getNumericValue(row[feature]);
        });

        return result;
      })
      // Removes records without a valid cluster identifier.
      .filter((row) => row.cluster !== "undefined");
  }, [data, clusterKey]);

  // Gets all available cluster names from the chart data.
  const clusterOptions = useMemo(() => {
    return [...new Set(chartData.map((row) => row.cluster))].sort(
      (a, b) =>
        a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: "base",
        })
    );
  }, [chartData]);

  // Uses the same cluster colour mapping as the scatter plot.
  const clusterColor = useMemo(
    () =>
      d3
        .scaleOrdinal()
        .domain(clusterOptions)
        .range(d3.schemeTableau10),
    [clusterOptions]
  );

  // Calculates the average value of each feature across all LGA records.
  const averageProfile = useMemo(() => {
    return FEATURES.map((feature) => ({
      feature,
      value: d3.mean(
        chartData,
        (row) => row[feature]
      ) ?? null,
    }));
  }, [chartData]);

  // Finds the data belonging to the currently selected cluster.
  const selectedProfile = chartData.find(
    (row) => row.cluster === selectedCluster
  );

  // Displays overall averages or the selected cluster's values.
  const displayedData = useMemo(() => {

    // Shows the overall averages when "All" is selected.
    if (selectedCluster === "All") {
      return averageProfile;
    }

    // Returns an empty chart if the selected cluster has no data.
    if (!selectedProfile) return [];

    // Gets the four feature values for the selected cluster.
    return FEATURES.map((feature) => ({
      feature,
      value: selectedProfile[feature],
    }));
  }, [selectedCluster, selectedProfile, averageProfile]);

  // Sets the maximum value used to calculate each bar's length.
  const getFeatureMaximum = (feature) => {

    // Uses the highest crash rate in the dataset as the maximum.
    if (feature === "Crash rate per 100k") {
      return Math.max(
        d3.max(chartData, (row) => row[feature]) || 1,
        1
      );
    }

    // Percentage features use 100 as their maximum.
    return 100;
  };

  // Generates an explanation based on the selected cluster.
  const insight = useMemo(() => {

    // Displays an explanation when all clusters are selected.
    if (selectedCluster === "All") {
      return {
        title: "Overall Cluster Averages",
        description:
          "Each bar represents the arithmetic average of that feature across all available LGA records. These averages provide an overall view of the road-safety characteristics represented in the dataset.",
      };
    }

    // Displays a message if the selected cluster has no data.
    if (!selectedProfile) {
      return {
        title: "Cluster Profile",
        description: "No profile data is available for this cluster.",
      };
    }

    // Calculates the average crash rate across all LGA records.
    const clusterAverage = d3.mean(
      chartData,
      (row) => row["Crash rate per 100k"]
    );

    // Gets the crash rate of the selected cluster.
    const clusterCrashRate = selectedProfile["Crash rate per 100k"];

    // Starts the explanation for the selected cluster.
    let description = `Showing the four feature values for ${getClusterLabel(
      selectedCluster
    )}.`;

    // Compares the selected cluster's crash rate with the overall average.
    if (
      clusterCrashRate !== null &&
      clusterAverage !== undefined &&
      clusterAverage !== null
    ) {
      const difference = clusterCrashRate - clusterAverage;

      // Calculates the percentage difference from the overall average.
      const percentageDifference =
        clusterAverage !== 0
          ? (Math.abs(difference) / clusterAverage) * 100
          : 0;

      // Explains whether the crash rate is above, below or equal to average.
      if (difference > 0) {
        description += ` Its crash rate is ${percentageDifference.toFixed(
          1
        )}% above the overall dataset average.`;
      } else if (difference < 0) {
        description += ` Its crash rate is ${percentageDifference.toFixed(
          1
        )}% below the overall dataset average.`;
      } else {
        description += " Its crash rate matches the overall dataset average.";
      }
    }

    return {
      title: `${getClusterLabel(selectedCluster)} Profile`,
      description,
    };
  }, [selectedCluster, selectedProfile, chartData]);

  // Draws and updates the horizontal bar chart using D3.
  useEffect(() => {

    // Stops if the chart elements are not available.
    if (!svgRef.current || !wrapperRef.current) return;

    // Selects the SVG element and clears the previous chart.
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Stops if there is no data to display.
    if (!displayedData.length) return;

    // Sets the chart dimensions.
    const width = 900;
    const height = 350;

    // Sets the spacing around the chart.
    const margin = {
      top: 20,
      right: 115,
      bottom: 20,
      left: 190,
    };

    // Calculates the available chart width and height.
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Sets the SVG chart dimensions and scaling behaviour.
    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Creates the main chart area inside the SVG.
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Creates a horizontal scale for the bar lengths.
    const x = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, chartWidth]);

    // Creates a vertical scale to position the four features.
    const y = d3
      .scaleBand()
      .domain(FEATURES)
      .range([0, chartHeight])
      .padding(0.38);

    // Draws the background tracks behind each bar.
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

    // Displays the feature names beside the bars.
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

    // Creates the horizontal bars using the assigned feature colours.
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

    // Animates the bars from zero to their calculated lengths.
    bars
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .attr("width", (d) => {
        if (d.value === null) return 0;

        // Calculates the bar length using the feature's maximum value.
        const maximum = getFeatureMaximum(d.feature);
        const ratio = Math.max(0, Math.min(d.value / maximum, 1));

        return x(ratio);
      });

    // Displays the actual measurement beside each bar.
    chart
      .selectAll(".profile-value-label")
      .data(displayedData)
      .join("text")
      .attr("class", "profile-value-label")
      .attr("x", (d) => {
        if (d.value === null) return 8;

        // Finds the position where the value should appear.
        const maximum = getFeatureMaximum(d.feature);
        const ratio = Math.max(0, Math.min(d.value / maximum, 1));

        return x(ratio) + 10;
      })
      .attr("y", (d) => y(d.feature) + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .text((d) => formatValue(d.feature, d.value));

    // Shows the tooltip when the mouse moves over a bar.
    bars
      .on("mouseenter", function (event, d) {

        // Slightly fades the bar when hovered over.
        d3.select(this).attr("opacity", 0.82);

        // Displays the feature name and its value.
        d3.select(tooltipRef.current)
          .style("opacity", 1)
          .text(
            `${d.feature}: ${formatValue(d.feature, d.value)}`
          );
      })
      .on("mousemove", function (event) {

        // Gets the mouse position inside the chart container.
        const [mouseX, mouseY] = d3.pointer(
          event,
          wrapperRef.current
        );

        // Moves the tooltip next to the mouse pointer.
        d3.select(tooltipRef.current)
          .style("left", `${mouseX + 14}px`)
          .style("top", `${mouseY - 12}px`);
      })
      .on("mouseleave", function () {

        // Restores the bar's original appearance.
        d3.select(this).attr("opacity", 1);

        // Hides the tooltip when the mouse leaves the bar.
        d3.select(tooltipRef.current)
          .style("opacity", 0);
      });

    // Stops any unfinished chart animations when the chart updates.
    return () => {
      svg.selectAll("*").interrupt();
    };

  }, [displayedData, chartData]);

  // Displays an error message if the required data is unavailable.
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

      {/* Chart title and introduction. */}
      <div className="profile-header">
        <div className="profile-header-content">

          {/* Small heading above the chart title. */}
          <span className="profile-eyebrow">
            CLUSTER ANALYSIS
          </span>

          {/* Main chart title. */}
          <h2>Cluster Profile Comparison</h2>

          {/* Explains the purpose of the cluster profile chart. */}
          <p className="profile-description">
            This bar chart presents a comparative analysis of
            road-safety characteristics across the identified
            K-Means clusters. It examines four key indicators:
            crash rate per 100,000 population, severe crash
            percentage, wet-weather crash percentage and
            rural-road crash percentage.

            By displaying the average values of these indicators
            across all LGA records, users can identify broader
            road-safety patterns and examine how the different
            clusters vary in their characteristics. Selecting an
            individual cluster also allows users to explore its
            feature values in greater detail and compare its
            road-safety profile with the overall dataset averages.
          </p>
        </div>
      </div>

      {/* Cluster selection buttons. */}
      <div className="profile-selector">

        {/* Label for the cluster selection area. */}
        <span className="profile-selector-label">
          Select a view
        </span>

        <div className="cluster-buttons">

          {/* Displays the overall averages when All Clusters is selected. */}
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

          {/* Creates one selection button for each available cluster. */}
          {clusterOptions.map((cluster) => {

            // Gets the same cluster colour used in the scatter plot.
            const color = clusterColor(cluster);

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

                {/* Displays the cluster's assigned colour. */}
                <span
                  className="cluster-button-dot"
                  style={{ backgroundColor: color }}
                />

                {/* Displays the cluster name. */}
                {getClusterLabel(cluster)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Displays an explanation based on the selected view. */}
      <div className="profile-insight">

        {/* Information icon. */}
        <div className="profile-insight-icon">i</div>

        {/* Displays the insight title and explanation. */}
        <div>
          <strong>{insight.title}</strong>
          <p>{insight.description}</p>
        </div>
      </div>

      {/* Main horizontal bar chart panel. */}
      <div className="profile-chart-panel">

        {/* Chart heading and feature count. */}
        <div className="profile-chart-heading">
          <div>

            {/* Changes the heading based on the selected cluster. */}
            <h3>
              {selectedCluster === "All"
                ? "Overall Cluster Averages"
                : `${getClusterLabel(selectedCluster)} Feature Values`}
            </h3>

            {/* Explains what the current chart is displaying. */}
            <p>
              {selectedCluster === "All"
                ? "Average value of each feature across all LGA records"
                : "Individual feature values for the selected cluster"}
            </p>
          </div>

          {/* Displays the number of features in the chart. */}
          <span className="profile-chart-count">
            {FEATURES.length} FEATURES
          </span>
        </div>

        {/* Container for the D3 chart and its tooltip. */}
        <div className="profile-chart-wrapper" ref={wrapperRef}>

          {/* SVG element where D3 draws the horizontal bars. */}
          <svg ref={svgRef} />

          {/* Tooltip that appears when hovering over a bar. */}
          <div
            className="profile-tooltip"
            ref={tooltipRef}
          />
        </div>

        {/* Explains how bar lengths and measurements are displayed. */}
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
