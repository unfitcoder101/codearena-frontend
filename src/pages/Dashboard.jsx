import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis,
  YAxis, Tooltip, CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_BASE}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#6b7280" }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#ef4444" }}>Failed to load dashboard.</p>
      </div>
    );
  }

  const { stats, vault, scoreTrend, weakPatterns, recentActivity } = data;

  // Use real radar data from API — falls back to zeros if no submissions yet
const radarData = data.radarData || [
  { topic: "Arrays", score: 0 },
  { topic: "Strings", score: 0 },
  { topic: "DP", score: 0 },
  { topic: "Graphs", score: 0 },
  { topic: "Trees", score: 0 },
  { topic: "Math", score: 0 },
  { topic: "Greedy", score: 0 },
  { topic: "Binary Search", score: 0 },
];

  // Score trend for line chart
  const trendData = scoreTrend.map((s, i) => ({
    name: `#${i + 1}`,
    score: s.score,
  }));

  // Heatmap — last 105 days (15 weeks x 7 days)
  const heatmapDays = buildHeatmap(recentActivity);

  return (
    <div style={styles.page}>

      {/* Page title */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Dashboard</h1>
        <p style={styles.pageSubtitle}>Your personal coding progress</p>
      </div>

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        <StatCard label="Problems Solved" value={stats.solvedCount} color="#22c55e" />
        <StatCard label="Total Attempts" value={stats.attemptCount} color="#6366f1" />
        <StatCard label="Success Rate" value={`${stats.successRate}%`} color="#fbbf24" />
        <StatCard label="Vault Problems" value={vault.total} color="#a78bfa" />
      </div>

      {/* Verdict breakdown */}
      <div style={styles.verdictRow}>
        {Object.entries(stats.verdictBreakdown).map(([v, count]) => (
          <VerdictPill key={v} verdict={v} count={count} />
        ))}
      </div>

      {/* Heatmap */}
      <Section title="Activity Heatmap" subtitle="Last 15 weeks">
        <div style={styles.heatmap}>
          {heatmapDays.map((day, i) => (
            <div
              key={i}
              title={day.date}
              style={{
                ...styles.heatCell,
                background: day.count === 0
                  ? "rgba(255,255,255,0.04)"
                  : day.count === 1
                  ? "rgba(99,102,241,0.3)"
                  : day.count === 2
                  ? "rgba(99,102,241,0.6)"
                  : "rgba(99,102,241,0.9)",
              }}
            />
          ))}
        </div>
        <div style={styles.heatLegend}>
          <span style={{ color: "#4b5563", fontSize: "11px" }}>Less</span>
          {[0.04, 0.3, 0.6, 0.9].map((o, i) => (
            <div key={i} style={{
              ...styles.heatCell,
              background: `rgba(99,102,241,${o})`,
            }} />
          ))}
          <span style={{ color: "#4b5563", fontSize: "11px" }}>More</span>
        </div>
      </Section>

      {/* Charts row */}
      <div style={styles.chartsRow}>

        {/* Score trend */}
        <Section title="Code Quality Trend" subtitle="Your last submissions">
          {trendData.length === 0 ? (
            <EmptyState text="Submit code to see your score trend" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Radar chart */}
        <Section title="Topic Strength" subtitle="Based on your submissions">
          <ResponsiveContainer width="100%" height={200}>
  <RadarChart data={radarData}>
    <PolarGrid stroke="rgba(255,255,255,0.08)" />
    <PolarAngleAxis
      dataKey="topic"
      tick={{ fill: "#6b7280", fontSize: 11 }}
    />
    <Radar
      dataKey="score"
      stroke="#6366f1"
      fill="#6366f1"
      fillOpacity={0.2}
      strokeWidth={2}
    />
    <Tooltip
      contentStyle={{
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        color: "white",
        fontSize: "12px",
      }}
      formatter={(value, name, props) => [
        `${value}% accuracy (${props.payload.ac || 0}/${props.payload.total || 0} solved)`,
        props.payload.topic,
      ]}
    />
  </RadarChart>
</ResponsiveContainer>
        </Section>
      </div>

      {/* Bottom row */}
      <div style={styles.bottomRow}>

        {/* Weak patterns */}
        <Section title="Patterns Detected" subtitle="Recurring mistakes from AI analysis">
          {weakPatterns.length === 0 ? (
            <EmptyState text="No patterns detected yet. Submit more solutions." />
          ) : (
            weakPatterns.map((p, i) => (
              <div key={i} style={styles.patternRow}>
                <span style={styles.patternText}>{p.pattern}</span>
                <span style={styles.patternCount}>{p.count}x</span>
              </div>
            ))
          )}
        </Section>

        {/* Recent activity */}
        <Section title="Recent Activity" subtitle="Your last 5 submissions">
          {recentActivity.length === 0 ? (
            <EmptyState text="No submissions yet. Start solving!" />
          ) : (
            recentActivity.map((a, i) => (
              <div key={i} style={styles.activityRow}>
                <div style={{ flex: 1 }}>
                  <span style={styles.activityTitle}>{a.problemTitle}</span>
                  <span style={styles.activityMeta}>
                    {a.language} · {timeAgo(a.submittedAt)}
                  </span>
                </div>
                <VerdictPill verdict={a.verdict} count={null} />
              </div>
            ))
          )}
        </Section>
      </div>
    </div>
  );
}

// ── Helper components ──

function StatCard({ label, value, color }) {
  return (
    <div style={styles.statCard}>
      <span style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase",
        letterSpacing: "0.5px" }}>{label}</span>
      <span style={{ color, fontSize: "32px", fontWeight: "700",
        marginTop: "8px", display: "block" }}>{value}</span>
    </div>
  );
}

function VerdictPill({ verdict, count }) {
  const colors = {
    AC: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
    WA: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
    TLE: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24" },
    CE: { bg: "rgba(156,163,175,0.1)", color: "#9ca3af" },
    PENDING: { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
  };
  const c = colors[verdict] || colors.CE;

  return (
    <div style={{ background: c.bg, color: c.color, padding: "4px 12px",
      borderRadius: "20px", fontSize: "12px", fontWeight: "600",
      display: "flex", alignItems: "center", gap: "6px" }}>
      {verdict}
      {count !== null && (
        <span style={{ opacity: 0.7 }}>{count}</span>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={styles.section}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <p style={{ color: "#4b5563", fontSize: "13px", textAlign: "center",
      padding: "20px 0" }}>{text}</p>
  );
}

// ── Helpers ──

function buildHeatmap(recentActivity) {
  // Build a set of dates that had activity
  const activeDates = new Set(
    recentActivity.map((a) =>
      new Date(a.submittedAt).toISOString().split("T")[0]
    )
  );

  // Count per date
  const dateCounts = {};
  recentActivity.forEach((a) => {
    const d = new Date(a.submittedAt).toISOString().split("T")[0];
    dateCounts[d] = (dateCounts[d] || 0) + 1;
  });

  // Build last 105 days
  const days = [];
  for (let i = 104; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    days.push({
      date: key,
      count: dateCounts[key] || 0,
    });
  }
  return days;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Styles ──

const styles = {
  page: {
    padding: "32px",
    background: "#0B0F14",
    minHeight: "calc(100vh - 64px)",
    color: "white",
  },
  pageHeader: {
    marginBottom: "28px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    margin: 0,
  },
  pageSubtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "4px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  verdictRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  heatmap: {
    display: "grid",
    gridTemplateColumns: "repeat(15, 14px)",
    gridTemplateRows: "repeat(7, 14px)",
    gap: "3px",
    gridAutoFlow: "column",
  },
  heatCell: {
    width: "14px",
    aspectRatio: "14px",
    borderRadius: "2px",
  },
  heatLegend: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "8px",
    justifyContent: "flex-end",
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  bottomRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  section: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "20px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
    color: "white",
  },
  sectionSubtitle: {
    color: "#4b5563",
    fontSize: "12px",
    margin: "4px 0 0",
  },
  patternRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  patternText: {
    color: "#d1d5db",
    fontSize: "13px",
  },
  patternCount: {
    color: "#fbbf24",
    fontSize: "12px",
    fontWeight: "600",
    background: "rgba(251,191,36,0.1)",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  activityRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    gap: "12px",
  },
  activityTitle: {
    color: "white",
    fontSize: "13px",
    fontWeight: "500",
    display: "block",
    marginBottom: "3px",
  },
  activityMeta: {
    color: "#4b5563",
    fontSize: "11px",
    display: "block",
  },
};