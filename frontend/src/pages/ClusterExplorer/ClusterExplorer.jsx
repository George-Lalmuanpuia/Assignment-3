
import React, { useEffect, useState } from "react";
import ScatterPlot from "../../charts/cluster/ScatterPlot";
import ClusterProfile from "../../charts/cluster/ClusterProfile";
import "./ClusterExplorer.css";

const API_URL = `http://${window.location.hostname}:8000`;

function ClusterExplorer() {
  const [points, setPoints] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [pointsResponse, profilesResponse] = await Promise.all([
          fetch(`${API_URL}/api/clusters/pca`),
          fetch(`${API_URL}/api/clusters/profiles`),
        ]);

        if (!pointsResponse.ok || !profilesResponse.ok) {
          throw new Error("Failed to fetch clustering data.");
        }

        setPoints(await pointsResponse.json());
        setProfiles(await profilesResponse.json());
      } catch (err) {
        console.error("Clustering data loading error:", err);
        setError(
          "Unable to load clustering data. Check that the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading clustering charts...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="cluster-explorer-page">

      {/* PAGE TITLE */}
      <h1>Cluster Explorer</h1>

      {/* OVERALL PAGE INTRODUCTION */}
      <section className="cluster-introduction">

        <div className="cluster-intro-heading">
          <h2>Explore Road-Safety Patterns</h2>

          <p>
            Discover similarities, differences and unusual road-safety
            patterns across New South Wales Local Government Areas (LGAs).
            This section combines K-Means clustering and DBSCAN to help
            users explore how different areas are grouped according to
            their road-safety characteristics.
          </p>
        </div>

        {/* CLUSTER EXPLANATION */}
        <div className="cluster-intro-subheading">
          <h3>Understanding the K-Means Clusters</h3>

          <p>
            K-Means divides the LGA-year observations into three groups
            based on similarities across four road-safety features:
            crash rate per 100,000 population, severe crash percentage,
            wet-weather crash percentage and rural-road crash percentage.
            Each group represents a different combination of these
            characteristics.
          </p>
        </div>

        <div className="cluster-intro-cards">

          <div className="cluster-intro-card cluster-card-0">
            <div className="cluster-card-title">
              <span className="cluster-color-dot"></span>
              <h4>Cluster 0</h4>
            </div>

            <h5>Rural and High Casualty Share</h5>

            <p>
              Characterised by a higher rural-road crash percentage
              and the highest casualty share among the three clusters.
              It also has the lowest wet-surface crash percentage.
            </p>
          </div>

          <div className="cluster-intro-card cluster-card-1">
            <div className="cluster-card-title">
              <span className="cluster-color-dot"></span>
              <h4>Cluster 1</h4>
            </div>

            <h5>Mostly Non-Rural and Lower Crash Rate</h5>

            <p>
              Consists mainly of non-rural areas and is characterised
              by the lowest crash rate among the three clusters.
            </p>
          </div>

          <div className="cluster-intro-card cluster-card-2">
            <div className="cluster-card-title">
              <span className="cluster-color-dot"></span>
              <h4>Cluster 2</h4>
            </div>

            <h5>Rural and Higher Crash Rate</h5>

            <p>
              Characterised by rural-road crashes, the highest
              wet-surface crash percentage and the highest crash
              rate among the three clusters.
            </p>
          </div>

        </div>

        <div className="cluster-intro-note">
          <strong>Important:</strong> Cluster 0, 1 and 2 are numerical
          labels assigned by K-Means. They are not official risk
          rankings. Each cluster represents a different road-safety
          profile rather than a fixed safety level.
        </div>

        {/* HOW TO USE THE CHARTS */}
        <div className="cluster-intro-subheading">
          <h3>How to Explore the Data</h3>

          <p>
            Start with the scatter plot to examine how LGAs are
            distributed and grouped. Use its filters to focus on
            particular years, LGAs or clusters, and hover over
            individual points to inspect their information.
            Then, use the cluster profile bar chart to compare
            the average road-safety characteristics of each group.
            Together, these visualisations help users investigate
            patterns and identify areas that may require further
            attention.
          </p>
        </div>

      </section>

      {/* SCATTER PLOT */}
      <section className="scatter-section">
        <ScatterPlot data={points} />
      </section>

      {/* CLUSTER PROFILE BAR CHART */}
      <section className="profile-section">
        <ClusterProfile data={profiles} />
      </section>

    </main>
  );
}

export default ClusterExplorer;
