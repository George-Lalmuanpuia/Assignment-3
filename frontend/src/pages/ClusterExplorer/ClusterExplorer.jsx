import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import ScatterPlot from "../../charts/cluster/ScatterPlot";
import "./ClusterExplorer.css";

function ClusterExplorer() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    d3.csv("/data/lga_cluster_points.csv")
      .then((data) => {
        setPoints(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load clustering data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading clustering data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="cluster-explorer-page">
      <h1>Cluster Explorer</h1>
      <ScatterPlot data={points} />
    </div>
  );
}

export default ClusterExplorer;