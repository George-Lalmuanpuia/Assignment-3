import Home from "./pages/Home";
import RiskPredictor from "./pages/RiskPredictor";
import { useState } from "react";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("Home");

  return (
    <div>
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="main-content">
        {currentPage === "Home" && <Home />}

        {currentPage === "Risk Predictor" && <RiskPredictor />}

        {currentPage === "Cluster Explorer" && (
          <h1>Cluster Explorer</h1>
        )}

        {currentPage === "About / Method" && (
          <h1>About / Method</h1>
        )}
      </main>
    </div>
  );
}

export default App;

