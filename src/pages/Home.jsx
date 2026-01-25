import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="home-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 70px)",
        textAlign: "center",
        padding: "0 20px",
        backgroundColor: "#0B0F14",
        color: "white",
      }}
    >
      <h1
        className="home-title"
        style={{
          fontSize: "56px",
          fontWeight: "700",
          marginBottom: "16px",
          letterSpacing: "-0.5px",
          background: "linear-gradient(90deg, #6366F1, #A855F7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Code. Submit. Get Judged. Instantly.
      </h1>

      <p
        className="home-subtitle"
        style={{
          color: "#9ca3af",
          maxWidth: "620px",
          marginBottom: "32px",
          fontSize: "16px",
        }}
      >
        Practice real coding problems, submit your solutions, and get instant
        feedback — just like professional online judges.
      </p>

      {/* Buttons */}
      <div className="home-buttons" style={{ display: "flex", gap: "16px" }}>
        <button
          onClick={() => navigate("/problems")}
          className="primary-btn"
          style={{
            background: "#6366F1",
            color: "white",
            border: "none",
            padding: "12px 26px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 0 12px rgba(99,102,241,0.5)",
          }}
        >
          Browse Problems
        </button>

        <button
          onClick={() => navigate("/login")}
          className="secondary-btn"
          style={{
            background: "transparent",
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
            padding: "12px 26px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Home;
