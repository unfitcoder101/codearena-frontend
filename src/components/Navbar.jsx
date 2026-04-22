import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [location]); // re-check on every route change

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <Link to="/" style={styles.logo}>
        Code<span style={{ color: "#6366f1" }}>Arena</span>
      </Link>

      {/* Links */}
      <div style={styles.links}>
        <Link to="/problems" style={isActive("/problems") ? styles.activeLink : styles.link}>
          Problems
        </Link>

        {token && (
          <>
            <Link to="/dashboard" style={isActive("/dashboard") ? styles.activeLink : styles.link}>
              Dashboard
            </Link>
            <Link to="/vault" style={isActive("/vault") ? styles.activeLink : styles.link}>
              Vault
            </Link>
            <Link to="/submissions" style={isActive("/submissions") ? styles.activeLink : styles.link}>
              Submissions
            </Link>
          </>
        )}

        {!token ? (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Get Started</Link>
          </>
        ) : (
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    height: "64px",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(11,15,20,0.95)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(12px)",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "white",
    textDecoration: "none",
    letterSpacing: "-0.3px",
  },
  links: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  link: {
    color: "#9ca3af",
    textDecoration: "none",
    fontSize: "14px",
    padding: "6px 12px",
    borderRadius: "8px",
    transition: "color 0.2s",
  },
  activeLink: {
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
    padding: "6px 12px",
    borderRadius: "8px",
    background: "rgba(99,102,241,0.15)",
  },
  registerBtn: {
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
    padding: "7px 16px",
    borderRadius: "8px",
    background: "#6366f1",
    fontWeight: "600",
  },
  logoutBtn: {
    background: "transparent",
    color: "#9ca3af",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "6px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};