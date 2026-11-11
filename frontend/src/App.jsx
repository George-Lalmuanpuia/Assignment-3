import Home from "./pages/Home";
import RiskPredictor from "./pages/RiskPredictor";
import { useState } from "react";
import Navbar from "./components/Navbar";
import "./App.css";

import ClusterExplorer from "./pages/ClusterExplorer/ClusterExplorer";
import About from "./pages/About/About";

function App() {
  const [currentPage, setCurrentPage] = useState("Home");

  return (
    <div>
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="main-content">
        {currentPage === "Home" && (
        <Home setCurrentPage={setCurrentPage} />
            )}

        {currentPage === "Risk Predictor" && <RiskPredictor />}

        {currentPage === "Cluster Explorer" && <ClusterExplorer />}

        {currentPage === "About / Method" && <About />}
      </main>
    </div>
  );
}

export default App;

