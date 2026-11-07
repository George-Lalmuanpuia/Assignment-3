
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import "./ScatterPlot.css";

function ScatterPlot({ data = [] }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);

  // Filter states
  const [year, setYear] = useState("All");
  const [lga, setLga] = useState("");
  const [cluster, setCluster] = useState("All");
  const [noise, setNoise] = useState("All");

  const [pc1Min, setPc1Min] = useState("");
  const [pc1Max, setPc1Max] = useState("");
  const [pc2Min, setPc2Min] = useState("");
  const [pc2Max, setPc2Max] = useState("");

  const [error, setError] = useState("");

  // Convert CSV values into usable data
  const cleanData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      Year: Number(d.Year),
      PC1: Number(d.PC1),
      PC2: Number(d.PC2),
      "kmean data": String(d["kmean data"]),
      "is noise":
        String(d["is noise"]).toLowerCase() === "true"
    })).filter(
      (d) =>
        d.LGA &&
        Number.isFinite(d.PC1) &&
        Number.isFinite(d.PC2) &&
        Number.isFinite(d.Year)
    );
  }, [data]);

  // Available filter options
  const years = [...new Set(cleanData.map((d) => d.Year))]
    .sort((a, b) => a - b);

  const clusters = [...new Set(cleanData.map((d) => d["kmean data"]))]
    .sort();

  // Apply filters
  const filteredData = useMemo(() => {
    const min1 = pc1Min === "" ? null : Number(pc1Min);
    const max1 = pc1Max === "" ? null : Number(pc1Max);
    const min2 = pc2Min === "" ? null : Number(pc2Min);
    const max2 = pc2Max === "" ? null : Number(pc2Max);

    if (
      (min1 !== null && !Number.isFinite(min1)) ||
      (max1 !== null && !Number.isFinite(max1)) ||
      (min2 !== null && !Number.isFinite(min2)) ||
      (max2 !== null && !Number.isFinite(max2))
    ) {
      return [];
    }

    return cleanData.filter((d) => {
      if (year !== "All" && d.Year !== Number(year)) return false;

      if (
        lga.trim() &&
        !d.LGA.toLowerCase().includes(lga.trim().toLowerCase())
      ) return false;

      if (cluster !== "All" && d["kmean data"] !== cluster) {
        return false;
      }

      if (noise === "Noise" && !d["is noise"]) return false;
      if (noise === "Normal" && d["is noise"]) return false;

      if (min1 !== null && d.PC1 < min1) return false;
      if (max1 !== null && d.PC1 > max1) return false;
      if (min2 !== null && d.PC2 < min2) return false;
      if (max2 !== null && d.PC2 > max2) return false;

      return true;
    });
  }, [
    cleanData, year, lga, cluster, noise,
    pc1Min, pc1Max, pc2Min, pc2Max
  ]);

  // Validate coordinate ranges
  useEffect(() => {
    const values = [
      [pc1Min, pc1Max, "PC1"],
      [pc2Min, pc2Max, "PC2"]
    ];

    for (const [min, max, name] of values) {
      if (
        min !== "" && max !== "" &&
        Number(min) > Number(max)
      ) {
        setError(`${name} minimum cannot be greater than maximum.`);
        return;
      }
    }

    setError("");
  }, [pc1Min, pc1Max, pc2Min, pc2Max]);

  // Draw scatter plot using D3
  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const width = 850;
    const height = 480;

    const margin = {
      top: 30,
      right: 30,
      bottom: 65,
      left: 70
    };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    if (!filteredData.length || error) return;

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const xExtent = d3.extent(filteredData, (d) => d.PC1);
    const yExtent = d3.extent(filteredData, (d) => d.PC2);

    const xDomain = xExtent[0] === xExtent[1]
      ? [xExtent[0] - 1, xExtent[1] + 1]
      : xExtent;

    const yDomain = yExtent[0] === yExtent[1]
      ? [yExtent[0] - 1, yExtent[1] + 1]
      : yExtent;

    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .nice()
      .range([0, plotWidth]);

    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .nice()
      .range([plotHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(clusters)
      .range(d3.schemeTableau10);

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip
    const tooltip = d3.select(wrapperRef.current)
      .select(".scatter-tooltip");

    // X axis
    chart.append("g")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale));

    // Y axis
    chart.append("g")
      .call(d3.axisLeft(yScale));

    // Axis labels
    chart.append("text")
      .attr("x", plotWidth / 2)
      .attr("y", plotHeight + 48)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("PC1");

    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -plotHeight / 2)
      .attr("y", -48)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("PC2");

    // Grid lines
    chart.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .tickSize(-plotWidth)
          .tickFormat("")
      );

    // Data points
    chart.selectAll(".data-point")
      .data(filteredData)
      .join("circle")
      .attr("class", "data-point")
      .attr("cx", (d) => xScale(d.PC1))
      .attr("cy", (d) => yScale(d.PC2))
      .attr("r", (d) => d["is noise"] ? 6 : 4.5)
      .attr("fill", (d) => colorScale(d["kmean data"]))
      .attr("stroke", (d) => d["is noise"] ? "#111827" : "white")
      .attr("stroke-width", (d) => d["is noise"] ? 2 : 0.7)
      .attr("opacity", 0.85)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("r", 8)
          .attr("opacity", 1);

        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.LGA}</strong><br/>
            Year: ${d.Year}<br/>
            Cluster: ${d["kmean data"]}<br/>
            PC1: ${d.PC1.toFixed(3)}<br/>
            PC2: ${d.PC2.toFixed(3)}<br/>
            DBSCAN: ${d["is noise"] ? "Noise" : "Normal"}
          `);
      })
      .on("mousemove", function (event) {
        const bounds = wrapperRef.current.getBoundingClientRect();

        tooltip
          .style("left", `${event.clientX - bounds.left + 12}px`)
          .style("top", `${event.clientY - bounds.top + 12}px`);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("r", d["is noise"] ? 6 : 4.5)
          .attr("opacity", 0.85);

        tooltip.style("opacity", 0);
      });

    // Legend
    const legend = chart.append("g")
      .attr("transform", `translate(${plotWidth - 130}, 5)`);

    clusters.forEach((value, index) => {
      const item = legend.append("g")
        .attr("transform", `translate(0,${index * 22})`);

      item.append("circle")
        .attr("r", 5)
        .attr("fill", colorScale(value));

      item.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .text(`Cluster ${value}`);
    });

    const noiseLegend = legend.append("g")
      .attr("transform", `translate(0,${clusters.length * 22})`);

    noiseLegend.append("circle")
      .attr("r", 6)
      .attr("fill", "white")
      .attr("stroke", "#111827")
      .attr("stroke-width", 2);

    noiseLegend.append("text")
      .attr("x", 12)
      .attr("y", 4)
      .text("DBSCAN noise");

  }, [filteredData, clusters, error]);

  // Reset filters
  const resetFilters = () => {
    setYear("All");
    setLga("");
    setCluster("All");
    setNoise("All");
    setPc1Min("");
    setPc1Max("");
    setPc2Min("");
    setPc2Max("");
  };

  return (
    <div className="scatter-container">
      <h2>PCA Scatter Plot</h2>

      <p className="scatter-description">
        Explore similarities between NSW Local Government Areas
        using their PCA coordinates and K-Means clusters.
      </p>

      <div className="scatter-filters">
        <label>
          Year
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="All">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>

        <label>
          Search LGA
          <input
            type="text"
            placeholder="Enter LGA name"
            value={lga}
            onChange={(e) => setLga(e.target.value)}
          />
        </label>

        <label>
          K-Means Cluster
          <select
            value={cluster}
            onChange={(e) => setCluster(e.target.value)}
          >
            <option value="All">All Clusters</option>
            {clusters.map((c) => (
              <option key={c} value={c}>Cluster {c}</option>
            ))}
          </select>
        </label>

        <label>
          DBSCAN
          <select value={noise} onChange={(e) => setNoise(e.target.value)}>
            <option value="All">All Records</option>
            <option value="Noise">Noise Only</option>
            <option value="Normal">Non-noise Only</option>
          </select>
        </label>

        <label>
          PC1 minimum
          <input
            type="number"
            step="any"
            value={pc1Min}
            onChange={(e) => setPc1Min(e.target.value)}
          />
        </label>

        <label>
          PC1 maximum
          <input
            type="number"
            step="any"
            value={pc1Max}
            onChange={(e) => setPc1Max(e.target.value)}
          />
        </label>

        <label>
          PC2 minimum
          <input
            type="number"
            step="any"
            value={pc2Min}
            onChange={(e) => setPc2Min(e.target.value)}
          />
        </label>

        <label>
          PC2 maximum
          <input
            type="number"
            step="any"
            value={pc2Max}
            onChange={(e) => setPc2Max(e.target.value)}
          />
        </label>

        <button type="button" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>

      {error && <p className="scatter-error">{error}</p>}

      <p className="scatter-count">
        Showing {error ? 0 : filteredData.length} of {cleanData.length} records
      </p>

      <div className="scatter-chart-wrapper" ref={wrapperRef}>
        <svg ref={svgRef} className="scatter-svg" />

        {!filteredData.length && !error && (
          <p className="scatter-empty">No records match your filters.</p>
        )}

        <div className="scatter-tooltip" />
      </div>
    </div>
  );
}

export default ScatterPlot;
