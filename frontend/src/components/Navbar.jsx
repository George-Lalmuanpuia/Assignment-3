
function Navbar({ currentPage, setCurrentPage }) {
  const pages = [
    "Home",
    "Risk Predictor",
    "Cluster Explorer",
    "About / Method"
  ];

  return (
    <nav className="navbar">
      <h2 className="logo">RoadSafe</h2>

      <div className="nav-links">
        {pages.map((page) => (
          <button
            key={page}
            className={currentPage === page ? "active" : ""}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
