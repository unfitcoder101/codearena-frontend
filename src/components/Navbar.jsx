import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(
    !document.body.classList.contains("light-mode")
  );

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setIsDark(saved === "dark");

    if (saved === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
  }, []);

  const toggleTheme = () => {
    const isLight = document.body.classList.contains("light-mode");

    if (isLight) {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    } else {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    }
  };

  return (
    <nav className="navbar">
      {/* LOGO */}
      <h1
        onClick={() => navigate("/")}
        style={{
          fontSize: "22px",
          fontWeight: "700",
          cursor: "pointer",
          background: "linear-gradient(90deg, #6366F1, #A855F7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.5px",
          transition: "text-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.textShadow =
            "0 0 12px rgba(168,85,247,0.6)";
        }}
        onMouseLeave={(e) => {
          e.target.style.textShadow = "none";
        }}
      >
        CodeArena
      </h1>

      {/* NAV LINKS */}
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/problems">Problems</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>

        <button onClick={toggleTheme} className="theme-btn">
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
