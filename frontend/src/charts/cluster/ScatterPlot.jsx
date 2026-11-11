
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import "./ScatterPlot.css";

// dropdown component that can be used with the feature below.
function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
}) {

  const [isOpen, setIsOpen] = useState(false); // is dropdown vissible or not
  const dropdownRef = useRef(null); // References the dropdown element.


  // Closes the dropdown when click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);


    // removed when a click is done, so do unessary events running
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Adds or removes an option from the selected values.
  function handleCheckboxChange(option) {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((value) => value !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  }


   {/*displaying dropdown menu */}
  return (
    <div className="multi-select" ref={dropdownRef}>
    
      {/* Displays the name of the filter. */}
      <span className="multi-select-label">{label}</span>

      {/* Button that opens or closes the dropdown menu. */}
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

        {/* Changes the arrow depending on whether the dropdown is open. */}
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Displays the available options when dropdown is open */}
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
  // References to the chart he the container for d3 use
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);

  // Controls the visibility of the chart explanation popup.
  const [showUnderstanding, setShowUnderstanding] = useState(false);


  // Closes explanation popup when  press Escape.
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") setShowUnderstanding(false);
    }
    document.addEventListener("keydown", handleEscape);

    //  removes the event lister for escape key when pressed
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // FILTER STATES
  // Stores the selected filter values.
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedLGAs, setSelectedLGAs] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedDBSCAN, setSelectedDBSCAN] = useState([]);

  // Stores the minimum and maximum PCA axes.
  const [pc1Min, setPc1Min] = useState("");
  const [pc1Max, setPc1Max] = useState("");
  const [pc2Min, setPc2Min] = useState("");
  const [pc2Max, setPc2Max] = useState("");

  // Stores validation messages for incorrect filter ranges.
  const [error, setError] = useState("");

  // CLEAN DATA
  // Converts API values into the correct data types before filtering and plotting.
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
      // Removes records with missing LGAs or invalid numerical values.
      .filter(
        (item) =>
          item.LGA &&
          Number.isFinite(item.Year) &&
          Number.isFinite(item.PC1) &&
          Number.isFinite(item.PC2)
      );
  }, [data]);

  // FILTER OPTIONS
  // Extracts unique years from the dataset and sorts them numerically.
  const yearOptions = useMemo(
    () =>
      [...new Set(cleanData.map((item) => String(item.Year)))].sort(
        (a, b) => Number(a) - Number(b)
      ),
    [cleanData]
  );

  // Extracts all unique LGA names and sorts them alphabetically.
  const lgaOptions = useMemo(
    () => [...new Set(cleanData.map((item) => item.LGA))].sort(),
    [cleanData]
  );

  // Extracts the available K-Means cluster labels.
  const clusterOptions = useMemo(
    () => [...new Set(cleanData.map((item) => item["kmean data"]))].sort(),
    [cleanData]
  );

  // Defines the two available DBSCAN categories.
  const dbscanOptions = ["Noise", "Normal"];

  // COLOUR MAPPING
  // Assigns a consistent colour to each K-Means cluster using Tableau colours.
  const clusterColor = useMemo(
    () =>
      d3
        .scaleOrdinal()
        .domain(clusterOptions)
        .range(d3.schemeTableau10),
    [clusterOptions]
  );

  // APPLY FILTERS
  // Displays only records that match all the filters selected by the user.
  const filteredData = useMemo(() => {
    return cleanData.filter((item) => {
      // Checks whether the record matches the selected years.
      const yearMatch =
        selectedYears.length === 0 ||
        selectedYears.includes(String(item.Year));

      // Checks whether the record matches the selected LGAs.
      const lgaMatch =
        selectedLGAs.length === 0 || selectedLGAs.includes(item.LGA);

      // Checks whether the record belongs to a selected K-Means cluster.
      const clusterMatch =
        selectedClusters.length === 0 ||
        selectedClusters.includes(item["kmean data"]);

      // Checks whether the record is classified as noise or normal by DBSCAN.
      const dbscanValue = item["is noise"] ? "Noise" : "Normal";
      const dbscanMatch =
        selectedDBSCAN.length === 0 ||
        selectedDBSCAN.includes(dbscanValue);

      // Checks whether the PCA coordinates fall within the entered ranges.
      const pc1MinMatch = pc1Min === "" || item.PC1 >= Number(pc1Min);
      const pc1MaxMatch = pc1Max === "" || item.PC1 <= Number(pc1Max);
      const pc2MinMatch = pc2Min === "" || item.PC2 >= Number(pc2Min);
      const pc2MaxMatch = pc2Max === "" || item.PC2 <= Number(pc2Max);

      // A record must satisfy every active filter to remain in the dataset.
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
  // Checks that the minimum PCA values do not exceed their maximum values.
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
  // Clears all selected options and PCA ranges to restore the original dataset.
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
  // Uses D3.js to generate the scatter plot whenever the filtered data changes.
  useEffect(() => {
    // Stops drawing if the SVG or chart container is unavailable.
    if (!svgRef.current || !wrapperRef.current) return;

    const svg = d3.select(svgRef.current);

    // Removes the previous chart before drawing the updated one.
    svg.selectAll("*").remove();

    // Does not draw the chart if there are no matching records or an error exists.
    if (filteredData.length === 0 || error) return;

    // Sets the chart dimensions.
    const width = 850;
    const height = 480;

    // Defines the space reserved around the chart for axes and labels.
    const margin = {
      top: 30,
      right: 30,
      bottom: 65,
      left: 70,
    };

    // Calculates the actual drawing area after subtracting the margins.
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Sets the SVG dimensions and keeps the chart proportional when resized.
    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Creates the main chart group and positions it inside the margins.
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Finds the minimum and maximum PCA values to determine the axis ranges.
    const xExtent = d3.extent(filteredData, (d) => d.PC1);
    const yExtent = d3.extent(filteredData, (d) => d.PC2);

    // Adds 8% spacing around the data so points do not touch the chart edges.
    const xPadding = (xExtent[1] - xExtent[0]) * 0.08 || 1;
    const yPadding = (yExtent[1] - yExtent[0]) * 0.08 || 1;

    // Converts PC1 values into horizontal chart positions.
    const xScale = d3
      .scaleLinear()
      .domain([
        xExtent[0] - xPadding,
        xExtent[1] + xPadding,
      ])
      .range([0, chartWidth]);

    // Converts PC2 values into vertical chart positions.
    const yScale = d3
      .scaleLinear()
      .domain([
        yExtent[0] - yPadding,
        yExtent[1] + yPadding,
      ])
      .range([chartHeight, 0]);

    // GRID
    // Adds horizontal grid lines to make PCA values easier to read.
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
    // Displays the PC1 scale along the bottom of the chart.
    chart
      .append("g")
      .attr("class", "scatter-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));

    // Y AXIS
    // Displays the PC2 scale along the left side of the chart.
    chart
      .append("g")
      .attr("class", "scatter-axis")
      .call(d3.axisLeft(yScale));

    // PC1 LABEL
    // Adds the horizontal axis label.
    chart
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 48)
      .attr("text-anchor", "middle")
      .attr("class", "scatter-axis-label")
      .text("PC1");

    // PC2 LABEL
    // Adds the vertical axis label and rotates it by 90 degrees.
    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -48)
      .attr("text-anchor", "middle")
      .attr("class", "scatter-axis-label")
      .text("PC2");

    // TOOLTIP
    // Selects the existing tooltip element used to display point information.
    const tooltip = d3
      .select(wrapperRef.current)
      .select(".scatter-tooltip");

    // DATA POINTS
    // Creates one circle for each record in the filtered dataset.
    chart
      .selectAll(".scatter-point")
      .data(filteredData)
      .join("circle")
      .attr("class", "scatter-point")

      // Positions each point according to its PC1 and PC2 coordinates.
      .attr("cx", (d) => xScale(d.PC1))
      .attr("cy", (d) => yScale(d.PC2))

      // Gives DBSCAN noise points a slightly larger radius.
      .attr("r", (d) => (d["is noise"] ? 6 : 4.5))

      // Uses the K-Means cluster colour for normal observations.
      // Noise observations are displayed as hollow circles.
      .attr("fill", (d) =>
        d["is noise"] ? "none" : clusterColor(d["kmean data"])
      )

      // Adds a coloured outline to DBSCAN noise observations.
      .attr("stroke", (d) =>
        d["is noise"] ? clusterColor(d["kmean data"]) : "none"
      )
      .attr("stroke-width", (d) => (d["is noise"] ? 3.5 : 0))

      // Sets the default transparency and pointer appearance.
      .attr("opacity", 0.85)
      .style("cursor", "pointer")

      // HOVER EVENT
      // Highlights a point and displays its information when the mouse enters it.
      .on("mouseover", function (event, d) {
        d3.select(this)
          .raise()
          .attr("r", 8)
          .attr("opacity", 1);

        // Displays the selected observation's details inside the tooltip.
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

      // MOUSE MOVEMENT EVENT
      // Positions the tooltip near the cursor while keeping it inside the chart container.
      .on("mousemove", function (event) {
        const wrapper = wrapperRef.current;
        const bounds = wrapper.getBoundingClientRect();
        const tooltipNode = tooltip.node();

        // Stops positioning if the tooltip element cannot be found.
        if (!tooltipNode) return;

        // Gets the mouse position relative to the chart container.
        const mouseX = event.clientX - bounds.left;
        const mouseY = event.clientY - bounds.top;

        // Gets the tooltip dimensions to prevent it from overflowing.
        const tooltipWidth = tooltipNode.offsetWidth;
        const tooltipHeight = tooltipNode.offsetHeight;
        const gap = 14;

        // Initially places the tooltip below and to the right of the cursor.
        let left = mouseX + gap;
        let top = mouseY + gap;

        // Moves the tooltip to the left if it would exceed the right boundary.
        if (left + tooltipWidth > bounds.width) {
          left = mouseX - tooltipWidth - gap;
        }

        // Moves the tooltip upwards if it would exceed the bottom boundary.
        if (top + tooltipHeight > bounds.height) {
          top = mouseY - tooltipHeight - gap;
        }

        // Applies the final tooltip position without allowing negative coordinates.
        tooltip
          .style("left", `${Math.max(0, left)}px`)
          .style("top", `${Math.max(0, top)}px`);
      })

      // MOUSE EXIT EVENT
      // Restores the point's original appearance and hides the tooltip.
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("r", d["is noise"] ? 6 : 4.5)
          .attr("opacity", 0.85);

        tooltip.style("opacity", 0);
      });
  }, [filteredData, error, clusterColor]);



  {/*SCATTER PLOT DESCRIPTIONS*/}
  return (
    <div className="scatter-plot-container">
    {/* TITLE */}
    <div className="scatter-title-area">
        <h2>Road Risk Clustering Scatter Plot</h2>
 {/* INTRODUCTION */}
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
    {/* Provides controls for filtering the chart by year, LGA, cluster, DBSCAN category and PCA coordinates. */}
   
     {/* YEAR */}

    <div className="scatter-filters"> 
      <MultiSelectDropdown
        label="Year"
        options={yearOptions}
        selectedValues={selectedYears}
        onChange={setSelectedYears}
        placeholder="Select years"
        />

       {/* LGA */}
      <MultiSelectDropdown
        label="LGA"
        options={lgaOptions}
        selectedValues={selectedLGAs}
        onChange={setSelectedLGAs}
        placeholder="Select LGAs"
        />

       {/* CLUSTERS */}
      <MultiSelectDropdown
        label="K-Means Cluster"
        options={clusterOptions}
        selectedValues={selectedClusters}
        onChange={setSelectedClusters}
        placeholder="Select clusters"
        />

         {/* DBSCAN NOISE*/}
        <MultiSelectDropdown
          label="DBSCAN"
          options={dbscanOptions}
          selectedValues={selectedDBSCAN}
          onChange={setSelectedDBSCAN}
          placeholder="Select DBSCAN type"
        />

        {/* Sets the minimum PC1 coordinate to display. */}
        <label>
          PC1 Minimum
          <input
            type="number"
            value={pc1Min}
            onChange={(e) => setPc1Min(e.target.value)}
            placeholder="Minimum PC1"
          />
        </label>

        {/* Sets the maximum PC1 coordinate to display. */}
        <label>
          PC1 Maximum
          <input
            type="number"
            value={pc1Max}
            onChange={(e) => setPc1Max(e.target.value)}
            placeholder="Maximum PC1"
          />
        </label>

        {/* Sets the minimum PC2 coordinate to display. */}
        <label>
          PC2 Minimum
          <input
            type="number"
            value={pc2Min}
            onChange={(e) => setPc2Min(e.target.value)}
            placeholder="Minimum PC2"
          />
        </label>

        {/* Sets the maximum PC2 coordinate to display. */}
        <label>
          PC2 Maximum
          <input
            type="number"
            value={pc2Max}
            onChange={(e) => setPc2Max(e.target.value)}
            placeholder="Maximum PC2"
          />
        </label>

        {/* Clears all filters and restores the complete dataset. */}
        <button
          type="button"
          className="scatter-reset-button"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </div>

      {/* Displays a validation message when the PCA ranges are incorrect. */}
      {error && <p className="scatter-error">{error}</p>}

      {/* CHART UNDERSTANDING BUTTON */}
      {/* Opens the explanation popup above the chart. */}
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
      {/* Contains the D3 SVG chart, empty-state message and hover tooltip. */}
      <div className="scatter-chart-wrapper" ref={wrapperRef}>
        <svg ref={svgRef} className="scatter-svg" />

        {/* Informs users when no records match their selected filters. */}
        {!filteredData.length && !error && (
          <p className="scatter-empty">
            No records match your filters.
          </p>
        )}

        {/* Displays observation details when users hover over chart points. */}
      <div className="scatter-tooltip" />
      </div>

      {/* LEGEND */}
      {/* Explains the colours used for K-Means clusters and DBSCAN noise points. */}
      <div className="scatter-legend">
       <div className="legend-section">
          <strong className="scatter-legend-title">
            K-Means Cluster Membership
          </strong>

          {/* Displays the colour assigned to each K-Means cluster. */}
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

          {/* Displays the corresponding hollow marker for each cluster's noise observations. */}
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
      {/* Displays detailed explanations when the user opens the chart guide. */}
      {showUnderstanding && (
        <div
         className="scatter-modal-backdrop"
        onClick={() => setShowUnderstanding(false)}
        >
        {/* Prevents clicks inside the popup from closing it. */}
        <div
         className="scatter-understanding-modal"
         role="dialog"
        aria-modal="true"
         aria-labelledby="scatter-understanding-title"
         onClick={(event) => event.stopPropagation()}
       >
       {/* POPUP HEADER */}
        <div className="scatter-modal-header">
       {/* Closes the popup using the close button. */}
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

       {/* POPUP EXPLANATION CONTENT */}
       <div className="scatter-modal-content">

       {/*  Explains the two PCA axes. */}
       <section className="scatter-guide-section">
         <h3>1. Understanding the Axes</h3>

         <div className="scatter-guide-card">
             <strong>PC1 — Principal Component 1</strong>
              <p> {/*  description on PC1 */}
                 PC1 captures the largest proportion of variation
                 present in the original road-safety dataset. It
                 represents a combination of the original features
                 that explains more variation than any other single
                 principal component.
              </p>
         </div>

                <div className="scatter-guide-card">
                  <strong>PC2 — Principal Component 2</strong>
                  <p> {/*  description on PC2 */}
                    PC2 captures the second-largest proportion of
                    variation in the dataset. It is mathematically
                    uncorrelated with PC1, meaning it represents a
                    different direction of variation in the data.
                  </p>
                </div>

                {/* Explains how PCA reduces multiple variables into two displayed dimensions. */}
                <p>
                  Principal Component Analysis (PCA) is a dimensionality
                  reduction technique. It transforms multiple original
                  road-safety variables into a smaller set of principal
                  components. This chart displays the first two
                  components so that patterns across the original
                  multidimensional dataset can be explored visually.
                </p>
              </section>

              {/* Explains the plotted observations, colours and markers. */}
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
                  <p>{/*  description on K-Means clusters and what each colour represents*/}
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
                  <p>{/*  description on DBSCAN noise */}
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
                  <p>{/*  description on distance between points */}
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

              {/* SECTION 3: Explains the purpose of the visualisation. */}
              <section className="scatter-guide-section">
                <h3>3. Why Is This Chart Useful?</h3>
                <p>{/*  description on the purpose of the visualisation */}
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

              {/* IMPORTANT NOTE */}
              {/* Clarifies that PCA coordinates should not be interpreted as direct road-risk measurements. */}
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

            {/* POPUP FOOTER */}
            {/* Closes the explanation popup after the user finishes reading. */}
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
