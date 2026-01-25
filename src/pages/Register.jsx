import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_BASE from "../utils/api";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 👇 THIS IS THE IMPORTANT FIX
        alert(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      alert("Account created successfully. Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Backend unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0B0F14",
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "36px",
          background: "#111827",
          borderRadius: "18px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        <h1 style={{ color: "white", fontSize: "26px", marginBottom: "8px" }}>
          Create account
        </h1>

        <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
          Start coding on CodeArena
        </p>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleRegister} style={buttonStyle} disabled={loading}>
          {loading ? "Creating..." : "Create Account →"}
        </button>

        <p style={{ marginTop: "18px", color: "#9ca3af", textAlign: "center" }}>
          Already have one?{" "}
          <Link to="/login" style={{ color: "#6366f1" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0B0F14",
  color: "white",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "999px",
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};
