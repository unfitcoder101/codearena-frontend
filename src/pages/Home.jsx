import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <div style={styles.page}>

      {/* Hero section */}
      <div style={styles.hero}>

        {/* Badge */}
        <div style={styles.badge}>
          Personal Interview Prep OS
        </div>

        {/* Main headline */}
        <h1 style={styles.headline}>
          Stop using Excel sheets{" "}
          <br />
          <span style={styles.highlight}>
            for interview prep.
          </span>
        </h1>

        {/* Subheadline */}
        <p style={styles.subheadline}>
          CodeArena centralizes everything — problems from any platform,
          your solutions, AI feedback, and progress tracking — into one
          intelligent system that actually helps you improve.
        </p>

        {/* CTA buttons */}
        <div style={styles.ctaRow}>
          <button
            onClick={() => navigate(token ? "/problems" : "/register")}
            style={styles.primaryBtn}
          >
            {token ? "Go to Problems →" : "Start for free →"}
          </button>
          <button
            onClick={() => navigate("/problems")}
            style={styles.secondaryBtn}
          >
            Browse Problems
          </button>
        </div>

        {/* Social proof line */}
        <p style={styles.proof}>
          Built by a developer who was tired of scattered prep.
        </p>
      </div>

      {/* Feature cards */}
      <div style={styles.featuresGrid}>
        <FeatureCard
          icon="⚡"
          title="Run & judge instantly"
          desc="Submit C++, JS, or Java. Code runs in a Docker sandbox with real test cases. Get verdict in under 5 seconds."
          color="#6366f1"
        />
        <FeatureCard
          icon="🧠"
          title="AI code review"
          desc="Every submission gets analyzed by LLaMA. Bug detection, complexity analysis, improvements — not just pass or fail."
          color="#a78bfa"
        />
        <FeatureCard
          icon="🎤"
          title="AI interviewer mode"
          desc="After submitting, an AI interviewer asks follow-up questions. Practice explaining your thinking under pressure."
          color="#22c55e"
        />
        <FeatureCard
          icon="📦"
          title="Personal vault"
          desc="Save problems from LeetCode, Codeforces, anywhere. Attach notes, get AI hints, track what you've solved."
          color="#fbbf24"
        />
        <FeatureCard
          icon="📊"
          title="Progress dashboard"
          desc="Heatmap, topic radar chart, score trend line. See exactly where you're improving and where to focus next."
          color="#f472b6"
        />
        <FeatureCard
          icon="🔍"
          title="Pattern detection"
          desc="The AI tracks your recurring mistakes across submissions. Off-by-one errors, missed edge cases — spotted automatically."
          color="#38bdf8"
        />
      </div>

      {/* VS section */}
      <div style={styles.vsSection}>
        <h2 style={styles.vsTitle}>
          Why not just use LeetCode?
        </h2>
        <div style={styles.vsGrid}>
          <VSColumn
            title="LeetCode / Codeforces"
            items={[
              "Pass or fail — no explanation why",
              "No memory of your thinking process",
              "Can't save problems from other platforms",
              "No personal progress tracking",
              "No AI feedback on your approach",
            ]}
            bad
          />
          <VSColumn
            title="CodeArena"
            items={[
              "AI tells you exactly what went wrong",
              "Every solution + notes saved permanently",
              "Vault saves problems from any platform",
              "Heatmap, radar chart, score trend",
              "AI interviews you about your own code",
            ]}
            bad={false}
          />
        </div>
      </div>

      {/* Final CTA */}
      <div style={styles.finalCta}>
        <h2 style={styles.finalTitle}>
          Replace your Excel sheet today.
        </h2>
        <p style={styles.finalSubtitle}>
          Everything in one place. Actually intelligent.
        </p>
        <button
          onClick={() => navigate(token ? "/dashboard" : "/register")}
          style={styles.primaryBtn}
        >
          {token ? "Go to Dashboard →" : "Get started free →"}
        </button>
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({ icon, title, desc, color }) {
  return (
    <div style={styles.card}>
      <div style={{
        fontSize: "24px",
        marginBottom: "12px",
        width: "44px",
        height: "44px",
        background: `${color}15`,
        border: `1px solid ${color}30`,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {icon}
      </div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardDesc}>{desc}</p>
    </div>
  );
}

// VS comparison column
function VSColumn({ title, items, bad }) {
  return (
    <div style={{
      ...styles.vsCol,
      borderColor: bad
        ? "rgba(239,68,68,0.15)"
        : "rgba(99,102,241,0.2)",
      background: bad
        ? "rgba(239,68,68,0.03)"
        : "rgba(99,102,241,0.04)",
    }}>
      <h4 style={{
        color: bad ? "#ef4444" : "#6366f1",
        fontSize: "14px",
        fontWeight: "600",
        marginBottom: "16px",
        marginTop: 0,
      }}>
        {title}
      </h4>
      {items.map((item, i) => (
        <div key={i} style={styles.vsItem}>
          <span style={{
            color: bad ? "#ef4444" : "#22c55e",
            fontWeight: "700",
            flexShrink: 0,
          }}>
            {bad ? "✗" : "✓"}
          </span>
          <span style={{
            color: bad ? "#6b7280" : "#d1d5db",
            fontSize: "14px",
          }}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: {
    background: "#0B0F14",
    color: "white",
    minHeight: "calc(100vh - 64px)",
  },

  // Hero
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "80px 24px 60px",
    maxWidth: "760px",
    margin: "0 auto",
  },
  badge: {
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.25)",
    color: "#818cf8",
    fontSize: "12px",
    fontWeight: "600",
    padding: "5px 14px",
    borderRadius: "20px",
    marginBottom: "24px",
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  },
  headline: {
    fontSize: "52px",
    fontWeight: "700",
    lineHeight: "1.15",
    letterSpacing: "-1px",
    margin: "0 0 20px",
    color: "white",
  },
  highlight: {
    background: "linear-gradient(90deg, #6366f1, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subheadline: {
    color: "#9ca3af",
    fontSize: "18px",
    lineHeight: "1.7",
    maxWidth: "580px",
    marginBottom: "36px",
  },
  ctaRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  primaryBtn: {
    background: "#6366f1",
    color: "white",
    border: "none",
    padding: "13px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
  secondaryBtn: {
    background: "transparent",
    color: "white",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "13px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
  proof: {
    color: "#4b5563",
    fontSize: "13px",
    margin: 0,
  },

  // Features
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 32px 80px",
  },
  card: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "24px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    margin: "0 0 8px",
    color: "white",
  },
  cardDesc: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "1.6",
    margin: 0,
  },

  // VS section
  vsSection: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 32px 80px",
  },
  vsTitle: {
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "32px",
  },
  vsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  vsCol: {
    border: "1px solid",
    borderRadius: "14px",
    padding: "24px",
  },
  vsItem: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
    alignItems: "flex-start",
  },

  // Final CTA
  finalCta: {
    textAlign: "center",
    padding: "60px 24px 80px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  finalTitle: {
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 12px",
  },
  finalSubtitle: {
    color: "#6b7280",
    fontSize: "16px",
    marginBottom: "28px",
  },
};

export default Home;