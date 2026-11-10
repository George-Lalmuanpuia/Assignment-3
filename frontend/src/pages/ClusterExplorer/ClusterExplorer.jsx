
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
        setError("Unable to load clustering data. Check that the backend is running.");
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
      <h1>Cluster Explorer</h1>

      <section className="scatter-section">
        <ScatterPlot data={points} />
      </section>

      <section className="profile-section">
        <ClusterProfile data={profiles} />
      </section>
    </main>
  );
}

export default ClusterExplorer;
