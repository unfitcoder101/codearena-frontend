import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exportProgressPDF } from "../utils/exportPDF";
import API_BASE from "../utils/api";
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    Promise.all([
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),

      fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ]).then(([userData, dashData]) => {
      setUser(userData.user);
      setDashboard(dashData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#6b7280" }}>Loading profile...</p>
      </div>
    );
  }

  const trendData = dashboard?.scoreTrend?.map((s, i) => ({
    name: `#${i + 1}`,
    score: s.score,
  })) || [];

  const joinDate = new Date(user?.createdAt).toLocaleDateString(
    "en-US", { month: "long", year: "numeric" }
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Profile header */}
        <div style={styles.profileHeader}>
  <div style={styles.avatar}>
    {user?.username?.[0]?.toUpperCase()}
  </div>
  <div style={{ flex: 1 }}>
    <h1 style={styles.username}>{user?.username}</h1>
    <p style={styles.joinDate}>Member since {joinDate}</p>
    <p style={styles.email}>{user?.email}</p>
  </div>
  <button
    onClick={() => exportProgressPDF(user, dashboard)}
    style={{
      background: "transparent",
      border: "1px solid rgba(99,102,241,0.3)",
      color: "#6366f1",
      padding: "9px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "13px",
      flexShrink: 0,
    }}
  >
    Export PDF →
  </button>
</div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          <StatBox
            label="Problems Solved"
            value={dashboard?.stats?.solvedCount || 0}
            color="#22c55e"
          />
          <StatBox
            label="Total Submissions"
            value={dashboard?.stats?.attemptCount || 0}
            color="#6366f1"
          />
          <StatBox
            label="Success Rate"
            value={`${dashboard?.stats?.successRate || 0}%`}
            color="#fbbf24"
          />
          <StatBox
            label="Current Streak"
            value={`${dashboard?.stats?.currentStreak || 0}d`}
            color="#f472b6"
          />
        </div>

        {/* Score trend */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Code Quality Trend</h3>
          {trendData.length === 0 ? (
            <p style={{ color: "#4b5563", fontSize: "13px" }}>
              Submit solutions to see your quality trend.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#4b5563" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weak patterns */}
        {dashboard?.weakPatterns?.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Patterns to Work On</h3>
            {dashboard.weakPatterns.map((p, i) => (
              <div key={i} style={styles.patternRow}>
                <span style={{ color: "#d1d5db", fontSize: "14px" }}>
                  {p.pattern}
                </span>
                <span style={styles.patternBadge}>
                  {p.count}x detected
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Verdict breakdown */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Submission Breakdown</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Object.entries(
              dashboard?.stats?.verdictBreakdown || {}
            ).map(([v, count]) => (
              <div key={v} style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: v === "AC"
                  ? "rgba(34,197,94,0.1)"
                  : v === "WA"
                  ? "rgba(239,68,68,0.1)"
                  : v === "TLE"
                  ? "rgba(251,191,36,0.1)"
                  : "rgba(156,163,175,0.1)",
                color: v === "AC" ? "#22c55e"
                  : v === "WA" ? "#ef4444"
                  : v === "TLE" ? "#fbbf24"
                  : "#9ca3af",
                fontWeight: "600",
                fontSize: "14px",
              }}>
                {v}: {count}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "12px",
      padding: "16px 20px",
      flex: 1,
      textAlign: "center",
    }}>
      <div style={{
        color,
        fontSize: "28px",
        fontWeight: "700",
        marginBottom: "4px",
      }}>
        {value}
      </div>
      <div style={{ color: "#6b7280", fontSize: "12px" }}>
        {label}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#0B0F14",
    minHeight: "calc(100vh - 64px)",
    padding: "32px",
    color: "white",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "32px",
    padding: "24px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "rgba(99,102,241,0.2)",
    border: "2px solid rgba(99,102,241,0.4)",
    color: "#818cf8",
    fontSize: "24px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  username: {
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 4px",
  },
  joinDate: {
    color: "#6b7280",
    fontSize: "13px",
    margin: "0 0 2px",
  },
  email: {
    color: "#4b5563",
    fontSize: "12px",
    margin: 0,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "24px",
  },
  section: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    margin: "0 0 16px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  patternRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  patternBadge: {
    background: "rgba(251,191,36,0.1)",
    color: "#fbbf24",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "600",
  },
};