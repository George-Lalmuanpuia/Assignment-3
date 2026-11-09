
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import "./ScatterPlot.css";

function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCheckboxChange(option) {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((value) => value !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  }

  return (
    <div className="multi-select" ref={dropdownRef}>
      <span className="multi-select-label">{label}</span>

      <button
        type="button"
        className="multi-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {selectedValues.length === 0
            ? placeholder
            : `${selectedValues.length} selected`}
        </span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="multi-select-menu">
          {options.length === 0 ? (
            <p>No options available</p>
          ) : (
            options.map((option) => (
              <label key={option} className="multi-select-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
                <span>{option}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ScatterPlot({ data = [] }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);

  const [showUnderstanding, setShowUnderstanding] = useState(false);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") setShowUnderstanding(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // FILTER STATES
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedLGAs, setSelectedLGAs] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedDBSCAN, setSelectedDBSCAN] = useState([]);

  const [pc1Min, setPc1Min] = useState("");
  const [pc1Max, setPc1Max] = useState("");
  const [pc2Min, setPc2Min] = useState("");
  const [pc2Max, setPc2Max] = useState("");

  const [error, setError] = useState("");

  // CLEAN DATA
  const cleanData = useMemo(() => {
    return data
      .map((item) => ({
        ...item,
        Year: Number(item.Year),
        PC1: Number(item.PC1),
        PC2: Number(item.PC2),
        LGA: String(item.LGA ?? ""),
        "kmean data": String(item["kmean data"] ?? ""),
        "is noise":
          item["is noise"] === true ||
          item["is noise"] === 1 ||
          String(item["is noise"]).toLowerCase() === "true",
      }))
      .filter(
        (item) =>
          item.LGA &&
          Number.isFinite(item.Year) &&
          Number.isFinite(item.PC1) &&
          Number.isFinite(item.PC2)
      );
  }, [data]);

  // FILTER OPTIONS
  const yearOptions = useMemo(
    () =>
      [...new Set(cleanData.map((item) => String(item.Year)))].sort(
        (a, b) => Number(a) - Number(b)
      ),
    [cleanData]
  );

  const lgaOptions = useMemo(
    () => [...new Set(cleanData.map((item) => item.LGA))].sort(),
    [cleanData]
  );

  const clusterOptions = useMemo(
    () => [...new Set(cleanData.map((item) => item["kmean data"]))].sort(),
    [cleanData]
  );

  const dbscanOptions = ["Noise", "Normal"];

  const clusterColor = useMemo(
    () =>
      d3
        .scaleOrdinal()
        .domain(clusterOptions)
        .range(d3.schemeTableau10),
    [clusterOptions]
  );

  // APPLY FILTERS
  const filteredData = useMemo(() => {
    return cleanData.filter((item) => {
      const yearMatch =
        selectedYears.length === 0 ||
        selectedYears.includes(String(item.Year));

      const lgaMatch =
        selectedLGAs.length === 0 || selectedLGAs.includes(item.LGA);

      const clusterMatch =
        selectedClusters.length === 0 ||
        selectedClusters.includes(item["kmean data"]);

      const dbscanValue = item["is noise"] ? "Noise" : "Normal";
      const dbscanMatch =
        selectedDBSCAN.length === 0 ||
        selectedDBSCAN.includes(dbscanValue);

      const pc1MinMatch = pc1Min === "" || item.PC1 >= Number(pc1Min);
      const pc1MaxMatch = pc1Max === "" || item.PC1 <= Number(pc1Max);
      const pc2MinMatch = pc2Min === "" || item.PC2 >= Number(pc2Min);
      const pc2MaxMatch = pc2Max === "" || item.PC2 <= Number(pc2Max);

      return (
        yearMatch &&
        lgaMatch &&
        clusterMatch &&
        dbscanMatch &&
        pc1MinMatch &&
        pc1MaxMatch &&
        pc2MinMatch &&
        pc2MaxMatch
      );
    });
  }, [
    cleanData,
    selectedYears,
    selectedLGAs,
    selectedClusters,
    selectedDBSCAN,
    pc1Min,
    pc1Max,
    pc2Min,
    pc2Max,
  ]);

  // VALIDATE RANGES
  useEffect(() => {
    if (
      pc1Min !== "" &&
      pc1Max !== "" &&
      Number(pc1Min) > Number(pc1Max)
    ) {
      setError("PC1 minimum cannot be greater than PC1 maximum.");
    } else if (
      pc2Min !== "" &&
      pc2Max !== "" &&
      Number(pc2Min) > Number(pc2Max)
    ) {
      setError("PC2 minimum cannot be greater than PC2 maximum.");
    } else {
      setError("");
    }
  }, [pc1Min, pc1Max, pc2Min, pc2Max]);

  // RESET FILTERS
  function resetFilters() {
    setSelectedYears([]);
    setSelectedLGAs([]);
    setSelectedClusters([]);
    setSelectedDBSCAN([]);
    setPc1Min("");
    setPc1Max("");
    setPc2Min("");
    setPc2Max("");
    setError("");
  }

  // DRAW SCATTER PLOT
  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (filteredData.length === 0 || error) return;

    const width = 850;
    const height = 480;

    const margin = {
      top: 30,
      right: 30,
      bottom: 65,
      left: 70,
    };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(filteredData, (d) => d.PC1);
    const yExtent = d3.extent(filteredData, (d) => d.PC2);

    const xPadding = (xExtent[1] - xExtent[0]) * 0.08 || 1;
    const yPadding = (yExtent[1] - yExtent[0]) * 0.08 || 1;

    const xScale = d3
      .scaleLinear()
      .domain([
        xExtent[0] - xPadding,
        xExtent[1] + xPadding,
      ])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        yExtent[0] - yPadding,
        yExtent[1] + yPadding,
      ])
      .range([chartHeight, 0]);

    // GRID
    chart
      .append("g")
      .attr("class", "scatter-grid")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(8)
          .tickSize(-chartWidth)
          .tickFormat("")
      );

    // X AXIS
    chart
      .append("g")
      .attr("class", "scatter-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));

    // Y AXIS
    chart
      .append("g")
      .attr("class", "scatter-axis")
      .call(d3.axisLeft(yScale));

    // PC1 LABEL
    chart
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 48)
      .attr("text-anchor", "middle")
      .attr("class", "scatter-axis-label")
      .text("PC1");

    // PC2 LABEL
    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -48)
      .attr("text-anchor", "middle")
      .attr("class", "scatter-axis-label")
      .text("PC2");

    // TOOLTIP
    const tooltip = d3
      .select(wrapperRef.current)
      .select(".scatter-tooltip");

    // DATA POINTS
    chart
      .selectAll(".scatter-point")
      .data(filteredData)
      .join("circle")
      .attr("class", "scatter-point")
      .attr("cx", (d) => xScale(d.PC1))
      .attr("cy", (d) => yScale(d.PC2))
      .attr("r", (d) => (d["is noise"] ? 6 : 4.5))
      .attr("fill", (d) =>
        d["is noise"] ? "none" : clusterColor(d["kmean data"])
      )
      .attr("stroke", (d) =>
        d["is noise"] ? clusterColor(d["kmean data"]) : "none"
      )
      .attr("stroke-width", (d) => (d["is noise"] ? 3.5 : 0))
      .attr("opacity", 0.85)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .raise()
          .attr("r", 8)
          .attr("opacity", 1);

        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.LGA}</strong>
            Year: ${d.Year}<br/>
            Cluster: ${d["kmean data"]}<br/>
            PC1: ${d.PC1.toFixed(3)}<br/>
            PC2: ${d.PC2.toFixed(3)}<br/>
            DBSCAN: ${d["is noise"] ? "Noise" : "Normal"}
          `);
      })
      .on("mousemove", function (event) {
        const wrapper = wrapperRef.current;
        const bounds = wrapper.getBoundingClientRect();
        const tooltipNode = tooltip.node();

        if (!tooltipNode) return;

        const mouseX = event.clientX - bounds.left;
        const mouseY = event.clientY - bounds.top;

        const tooltipWidth = tooltipNode.offsetWidth;
        const tooltipHeight = tooltipNode.offsetHeight;
        const gap = 14;

        let left = mouseX + gap;
        let top = mouseY + gap;

        if (left + tooltipWidth > bounds.width) {
          left = mouseX - tooltipWidth - gap;
        }

        if (top + tooltipHeight > bounds.height) {
          top = mouseY - tooltipHeight - gap;
        }

        tooltip
          .style("left", `${Math.max(0, left)}px`)
          .style("top", `${Math.max(0, top)}px`);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("r", d["is noise"] ? 6 : 4.5)
          .attr("opacity", 0.85);

        tooltip.style("opacity", 0);
      });
  }, [filteredData, error, clusterColor]);

  return (
    <div className="scatter-plot-container">
      {/* TITLE AND INTRODUCTION */}
      <div className="scatter-title-area">
        <h2>Road Risk Clustering Scatter Plot</h2>

        <p className="scatter-description">
          This scatter plot presents the road-safety clustering results for
          Local Government Areas (LGAs) using Principal Component Analysis
          (PCA). Each point represents an LGA, positioned according to its
          PC1 and PC2 values. These two principal components summarise
          patterns and variations across multiple road-safety features,
          allowing complex, multidimensional data to be explored through a
          two-dimensional visualisation.
        </p>

        <p className="scatter-description">
          The colours represent the K-Means clusters, highlighting groups
          of LGAs with similar road-safety characteristics. Hollow markers
          identify observations classified as noise by DBSCAN. By examining
          the distribution of points, users can explore similarities and
          differences between areas and observe how the clustering
          algorithms group LGAs based on the patterns in the dataset.
        </p>
      </div>

      {/* FILTERS */}
      <div className="scatter-filters">
        <MultiSelectDropdown
          label="Year"
          options={yearOptions}
          selectedValues={selectedYears}
          onChange={setSelectedYears}
          placeholder="Select years"
        />

        <MultiSelectDropdown
          label="LGA"
          options={lgaOptions}
          selectedValues={selectedLGAs}
          onChange={setSelectedLGAs}
          placeholder="Select LGAs"
        />

        <MultiSelectDropdown
          label="K-Means Cluster"
          options={clusterOptions}
          selectedValues={selectedClusters}
          onChange={setSelectedClusters}
          placeholder="Select clusters"
        />

        <MultiSelectDropdown
          label="DBSCAN"
          options={dbscanOptions}
          selectedValues={selectedDBSCAN}
          onChange={setSelectedDBSCAN}
          placeholder="Select DBSCAN type"
        />

        <label>
          PC1 Minimum
          <input
            type="number"
            value={pc1Min}
            onChange={(e) => setPc1Min(e.target.value)}
            placeholder="Minimum PC1"
          />
        </label>

        <label>
          PC1 Maximum
          <input
            type="number"
            value={pc1Max}
            onChange={(e) => setPc1Max(e.target.value)}
            placeholder="Maximum PC1"
          />
        </label>

        <label>
          PC2 Minimum
          <input
            type="number"
            value={pc2Min}
            onChange={(e) => setPc2Min(e.target.value)}
            placeholder="Minimum PC2"
          />
        </label>

        <label>
          PC2 Maximum
          <input
            type="number"
            value={pc2Max}
            onChange={(e) => setPc2Max(e.target.value)}
            placeholder="Maximum PC2"
          />
        </label>

        <button
          type="button"
          className="scatter-reset-button"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </div>

      {error && <p className="scatter-error">{error}</p>}

      {/* BUTTON BELOW FILTERS, ABOVE CHART */}
      <div className="scatter-understanding-row">
        <button
          type="button"
          className="scatter-understanding-button"
          onClick={() => setShowUnderstanding(true)}
        >
          <span className="understanding-icon">ⓘ</span>
          Chart Understanding
        </button>
      </div>

      {/* CHART */}
      <div className="scatter-chart-wrapper" ref={wrapperRef}>
        <svg ref={svgRef} className="scatter-svg" />

        {!filteredData.length && !error && (
          <p className="scatter-empty">
            No records match your filters.
          </p>
        )}

        <div className="scatter-tooltip" />
      </div>

      {/* LEGEND */}
      <div className="scatter-legend">
        <div className="legend-section">
          <strong className="scatter-legend-title">
            K-Means Cluster Membership
          </strong>

          <div className="legend-items">
            {clusterOptions.map((cluster) => (
              <div className="scatter-legend-item" key={cluster}>
                <span
                  className="scatter-legend-dot"
                  style={{ backgroundColor: clusterColor(cluster) }}
                />
                <span>Cluster {cluster}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="legend-section">
          <strong className="scatter-legend-title">
            DBSCAN Noise (Hollow Rings)
          </strong>

          <div className="legend-items">
            {clusterOptions.map((cluster) => (
              <div className="scatter-legend-item" key={cluster}>
                <span
                  className="scatter-legend-ring"
                  style={{ borderColor: clusterColor(cluster) }}
                />
                <span>Noise in Cluster {cluster}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHART UNDERSTANDING POPUP */}
      {showUnderstanding && (
        <div
          className="scatter-modal-backdrop"
          onClick={() => setShowUnderstanding(false)}
        >
          <div
            className="scatter-understanding-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scatter-understanding-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="scatter-modal-header">
              <button
                type="button"
                className="scatter-modal-close"
                onClick={() => setShowUnderstanding(false)}
                aria-label="Close chart understanding"
              >
                ×
              </button>

              <span className="scatter-modal-eyebrow">CHART GUIDE</span>

              <h2 id="scatter-understanding-title">
                Understanding the Scatter Plot
              </h2>
            </div>

            <div className="scatter-modal-content">
              <section className="scatter-guide-section">
                <h3>1. Understanding the Axes</h3>

                <div className="scatter-guide-card">
                  <strong>PC1 — Principal Component 1</strong>
                  <p>
                    PC1 captures the largest proportion of variation
                    present in the original road-safety dataset. It
                    represents a combination of the original features
                    that explains more variation than any other single
                    principal component.
                  </p>
                </div>

                <div className="scatter-guide-card">
                  <strong>PC2 — Principal Component 2</strong>
                  <p>
                    PC2 captures the second-largest proportion of
                    variation in the dataset. It is mathematically
                    uncorrelated with PC1, meaning it represents a
                    different direction of variation in the data.
                  </p>
                </div>

                <p>
                  Principal Component Analysis (PCA) is a dimensionality
                  reduction technique. It transforms multiple original
                  road-safety variables into a smaller set of principal
                  components. This chart displays the first two
                  components so that patterns across the original
                  multidimensional dataset can be explored visually.
                </p>
              </section>

              <section className="scatter-guide-section">
                <h3>2. Understanding the Points and Colours</h3>

                <div className="scatter-guide-card">
                  <strong>Each point represents an LGA</strong>
                  <p>
                    Every plotted point corresponds to one Local
                    Government Area (LGA) observation in the dataset.
                    Its position is determined by its PC1 and PC2 values.
                  </p>
                </div>

                <div className="scatter-guide-card">
                  <strong>Different colours — K-Means clusters</strong>
                  <p>
                    Each colour represents a K-Means cluster. K-Means
                    groups observations into a predefined number of
                    clusters based on similarities in their feature
                    values. LGAs assigned to the same cluster share
                    similar patterns according to the variables used
                    for clustering.
                  </p>
                </div>

                <div className="scatter-guide-card">
                  <strong>Hollow markers — DBSCAN noise</strong>
                  <p>
                    Hollow markers identify observations labelled as
                    noise by DBSCAN. DBSCAN identifies dense groups
                    of observations based on distance and minimum
                    neighbourhood requirements. A noise observation
                    does not meet the density requirements to be
                    assigned to a DBSCAN cluster.
                  </p>
                </div>

                <div className="scatter-guide-card">
                  <strong>Distance between points</strong>
                  <p>
                    Points positioned closer together generally have
                    more similar characteristics in the displayed
                    two-dimensional PCA representation. Points farther
                    apart are more different in this representation.
                    However, some information from the original
                    multidimensional dataset may not be visible in
                    only two components.
                  </p>
                </div>
              </section>

              <section className="scatter-guide-section">
                <h3>3. Why Is This Chart Useful?</h3>
                <p>
                  The visualisation helps users identify patterns,
                  similarities and differences between LGAs. It allows
                  users to examine how areas are distributed, observe
                  which LGAs are grouped together by K-Means, and
                  identify observations that DBSCAN considers noise.
                  These patterns can support further investigation
                  of road-safety characteristics across different
                  local areas.
                </p>
              </section>

              <div className="scatter-guide-note">
                <strong>Important Note</strong>
                <p>
                  PC1 and PC2 are calculated coordinates, not direct
                  measurements of road crashes or road risk. A higher
                  PC1 or PC2 value does not necessarily indicate
                  higher road risk. The axes represent combinations
                  of the original variables, and their interpretation
                  depends on the PCA loadings.
                </p>
              </div>
            </div>

            <div className="scatter-modal-footer">
              <button
                type="button"
                onClick={() => setShowUnderstanding(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScatterPlot;
