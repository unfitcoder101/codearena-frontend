import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_BASE from "../utils/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/problems");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Login to CodeArena</p>

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleLogin}>
          {loading ? "Logging in..." : "Login →"}
        </button>

        <p style={styles.footer}>
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0B0F14",
  },
  card: {
    width: "360px",
    padding: "32px",
    background: "#111827",
    borderRadius: "16px",
  },
  title: { color: "white", fontSize: "24px" },
  subtitle: { color: "#9ca3af", marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    background: "#0B0F14",
    color: "white",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "999px",
    background: "#22c55e",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
  },
  footer: { marginTop: "16px", color: "#9ca3af", textAlign: "center" },
};

export default Login;
