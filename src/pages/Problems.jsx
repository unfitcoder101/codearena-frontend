import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE from "../utils/api";

const DIFFICULTY_COLORS = {
  Easy: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  Medium: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24" },
  Hard: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
};

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE}/api/problems`)
      .then((res) => res.json())
      .then((data) => {
        setProblems(data.problems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "All"
    ? problems
    : problems.filter((p) => p.difficulty === filter);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Problems</h1>
          <p style={styles.subtitle}>
            {problems.length} problems · Solve, get judged, get AI feedback
          </p>
        </div>

        <Link
  to="/create-problem"
  style={{
    background: "#6366f1",
    color: "white",
    textDecoration: "none",
    padding: "8px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
  }}
>
  + Create Problem
</Link>

        {/* Difficulty filter */}
        <div style={styles.filters}>
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              style={{
                ...styles.filterBtn,
                background: filter === d ? "rgba(99,102,241,0.2)" : "transparent",
                color: filter === d ? "#6366f1" : "#9ca3af",
                border: filter === d
                  ? "1px solid rgba(99,102,241,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Problem list */}
      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading problems...</p>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ color: "#9ca3af", fontSize: "16px" }}>No problems yet.</p>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
            Add problems via the API or admin panel.
          </p>
        </div>
      ) : (
        <div style={styles.table}>
          {/* Table header */}
          <div style={styles.tableHeader}>
            <span style={{ flex: 3 }}>Title</span>
            <span style={{ flex: 1 }}>Difficulty</span>
            <span style={{ flex: 2 }}>Tags</span>
            <span style={{ flex: 1 }}>Action</span>
          </div>

          {/* Rows */}
          {filtered.map((p, i) => {
            const diff = DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS.Easy;
            return (
              <div
                key={p._id}
                style={{
                  ...styles.tableRow,
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                <span style={{ flex: 3, color: "white", fontWeight: "500" }}>
                  {i + 1}. {p.title}
                </span>

                <span style={{ flex: 1 }}>
                  <span style={{
                    background: diff.bg,
                    color: diff.color,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}>
                    {p.difficulty}
                  </span>
                </span>

                <span style={{ flex: 2, display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {(p.tags || []).map((tag) => (
                    <span key={tag} style={styles.tag}>{tag}</span>
                  ))}
                </span>

                <span style={{ flex: 1 }}>
                  <Link to={`/solve/${p._id}`} style={styles.solveBtn}>
                    Solve →
                  </Link>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "40px 32px",
    background: "#0B0F14",
    minHeight: "calc(100vh - 64px)",
    color: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    margin: 0,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "6px",
  },
  filters: {
    display: "flex",
    gap: "8px",
  },
  filterBtn: {
    padding: "6px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  table: {
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    padding: "12px 20px",
    background: "rgba(255,255,255,0.04)",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    display: "flex",
    padding: "16px 20px",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    transition: "background 0.15s",
  },
  tag: {
    background: "rgba(99,102,241,0.1)",
    color: "#818cf8",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
  },
  solveBtn: {
    color: "#6366f1",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
    padding: "5px 12px",
    borderRadius: "6px",
    background: "rgba(99,102,241,0.1)",
  },
  empty: {
    textAlign: "center",
    padding: "80px 20px",
  },
};