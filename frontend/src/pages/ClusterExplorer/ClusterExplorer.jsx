
import React, { useEffect, useState } from "react";
import ScatterPlot from "../../charts/cluster/ScatterPlot"; // import the chart to here
import ClusterProfile from "../../charts/cluster/ClusterProfile"; // import the chart to here
import "./ClusterExplorer.css"; //styles for webpage to here

//chostname so frontend can connect to backend
const API_URL = `http://${window.location.hostname}:8000`;

function ClusterExplorer() {
  const [points, setPoints] = useState([]); //PCA CORRDINATES STORAGE
  const [profiles, setProfiles] = useState([]);// STORES AVERAGE VALUES USED FOR CLUSTER PROFILE
  const [loading, setLoading] = useState(true);//SEE IF API DATA IS LOADING
  const [error, setError] = useState(""); //ERROR MESSAGE CALLING WHEN API FAIL

  // This function retrive the sactter plot and cluster profile data from the backend API when the component mounts. It uses Promise.all to fetch both datasets concurrently, and updates the state with the retrieved data. If an error occurs during the fetch, it sets an error message in the state.
  useEffect(() => {
    async function loadData() {

      try {
        //fetch data from here
        const [pointsResponse, profilesResponse] = await Promise.all([
          fetch(`${API_URL}/api/clusters/pca`),
          fetch(`${API_URL}/api/clusters/profiles`),
        ]);

        // stop processing if api failed to request
        if (!pointsResponse.ok || !profilesResponse.ok) {
          throw new Error("Failed to fetch clustering data.");
        }

         // if api is a sucess then it turn that into javasccrpt object and store in state
        setPoints(await pointsResponse.json());
        setProfiles(await profilesResponse.json());

      } catch (err) { //displays an error on the broswe console on the backend to help identify whta might be wrong it the file
        console.error("Clustering data loading error:", err);
        setError( //messgae on the web page for users
          "Unable to load clustering data. Check that the backend is running."
        );
      } finally { // stop once api is requested 
        setLoading(false); //see
      }
    }

    loadData(); //run to retrive the data from the backend API when the component mounts
  }, []);

  if (loading) return <p>Loading clustering charts...</p>; //display if api request was a success 
  if (error) return <p>{error}</p>; //display if api request was a failure


  // WEBPAGE CONTENTS / DESCIPRTIONS STATED
  return (
    <main className="cluster-explorer-page">

      {/* PAGE HEADER */}
      <header className="cluster-page-header">
        <div className="cluster-page-header-content"> {/*BOX*/} 
          <span className="cluster-page-eyebrow">
            ROAD SAFETY ANALYTICS
          </span>
          <h1>Cluster Explorer</h1>
          <p>
            Discover how road-safety patterns differ across
            New South Wales Local Government Areas.
          </p>
        </div>
      </header>

      {/* START OF THE DESCIPTION OF RAOD SAFETY PATTERNS , KMEAN CLUSTER AND HOW TO EXPLORE DATA */}
      <section className="cluster-introduction">
        <div className="cluster-intro-heading">
        <h2>Explore Road-Safety Patterns</h2>
        <p>
        Discover similarities, differences and unusual road-safety
        patterns across New South Wales Local Government Areas (LGAs).            This section combines K-Means clustering and DBSCAN to help
        users explore how different areas are grouped according to
        their road-safety characteristics.
        </p>
        </div>

      {/* KMEAN CLUSTER DESCIPTION */}
        <div className="cluster-intro-subheading">
        <h3>Understanding the K-Means Clusters</h3>
        <p>
        K-Means divides the LGA-year observations into three groups
        based on similarities across four road-safety features:            crash rate per 100,000 population, severe crash percentage,
        wet-weather crash percentage and rural-road crash percentage.
        Each group represents a different combination of these
        characteristics.</p>
        </div>


        {/* EACH CLUSTER EXPLAINED WITH WHAT IT STAND FOR */}
        <div className="cluster-intro-cards">
        <div className="cluster-intro-card cluster-card-0">
        <div className="cluster-card-title">
        <span className="cluster-color-dot"></span>
        <h4>Cluster 0</h4>
        </div>

    {/* CLUSTER 0 EXPLAINED */}

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
         {/* CLUSTER 1 EXPLAINED */}

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
            {/* CLUSTER 2 EXPLAINED */}

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

        {/*HOW TO EXPLORE THE DATA ON CHARTS*/}
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

    {/*SCATTER PLOT Passes PCA coordinate data to the ScatterPlot*/}
      <section className="scatter-section">
        <ScatterPlot data={points} />
      </section>

    {/*BARCHART Passes cluster average data to the ClusterProfile component*/}
      <section className="profile-section">
        <ClusterProfile data={profiles} />
      </section>
    </main>
  );
}

export default ClusterExplorer;
