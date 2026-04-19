import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  // 🔁 Sync token when login/logout happens
  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token"));
    };

    syncToken(); // on mount

    window.addEventListener("storage", syncToken);

    return () => {
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <nav
      style={{
        height: "64px",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0B0F14",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "white",
          textDecoration: "none",
        }}
      >
        CodeArena
      </Link>

      <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
        <Link to="/problems" style={linkStyle}>
          Problems
        </Link>

        {/* ✅ Show only when logged in */}
        {token && (
          <>
            <Link to="/vault" style={linkStyle}>
              Vault
            </Link>

            <Link to="/submissions" style={linkStyle}>
              Submissions
            </Link>
          </>
        )}

        {!token ? (
          <>
            <Link to="/login" style={linkStyle}>
              Login
            </Link>
            <Link to="/register" style={linkStyle}>
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={logout}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "#9ca3af",
  textDecoration: "none",
  fontSize: "14px",
};