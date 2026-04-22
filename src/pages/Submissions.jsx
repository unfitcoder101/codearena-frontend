import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

const VERDICT_STYLE = {
  AC:  { bg: "rgba(34,197,94,0.1)",  color: "#22c55e" },
  WA:  { bg: "rgba(239,68,68,0.1)",  color: "#ef4444" },
  TLE: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24" },
  CE:  { bg: "rgba(156,163,175,0.1)",color: "#9ca3af" },
  PENDING: { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
};

export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    fetch(`${API_BASE}/api/submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.page}><p style={{color:"#6b7280"}}>Loading...</p></div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Submissions</h1>
      <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
        {submissions.length} total submissions
      </p>

      {submissions.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ color: "#6b7280" }}>No submissions yet.</p>
          <Link to="/problems" style={styles.link}>Browse Problems →</Link>
        </div>
      ) : (
        <div style={styles.table}>
          <div style={styles.header}>
            <span style={{ flex: 2 }}>Problem</span>
            <span style={{ flex: 1 }}>Language</span>
            <span style={{ flex: 1 }}>Verdict</span>
            <span style={{ flex: 1 }}>Time</span>
            <span style={{ flex: 1 }}>AI Feedback</span>
          </div>

          {submissions.map((s) => {
            const v = VERDICT_STYLE[s.status] || VERDICT_STYLE.CE;
            return (
              <div key={s._id} style={styles.row}>
                <span style={{ flex: 2, color: "white", fontWeight: "500" }}>
                  {s.problem?.title || "Unknown Problem"}
                </span>

                <span style={{ flex: 1, color: "#9ca3af", fontSize: "13px" }}>
                  {s.language?.toUpperCase()}
                </span>

                <span style={{ flex: 1 }}>
                  <span style={{
                    background: v.bg, color: v.color,
                    padding: "3px 10px", borderRadius: "20px",
                    fontSize: "12px", fontWeight: "600",
                  }}>
                    {s.status}
                  </span>
                </span>

                <span style={{ flex: 1, color: "#6b7280", fontSize: "12px" }}>
                  {timeAgo(s.createdAt)}
                </span>

                <span style={{ flex: 1 }}>
                  <Link
                    to={`/solve/${s.problem?._id}`}
                    style={styles.viewBtn}
                  >
                    View →
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

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = {
  page: { padding: "32px", background: "#0B0F14",
    minHeight: "calc(100vh - 64px)", color: "white" },
  title: { fontSize: "28px", fontWeight: "700", margin: "0 0 4px" },
  table: { border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px", overflow: "hidden" },
  header: { display: "flex", padding: "12px 20px",
    background: "rgba(255,255,255,0.04)", color: "#6b7280",
    fontSize: "12px", fontWeight: "600",
    textTransform: "uppercase", letterSpacing: "0.5px" },
  row: { display: "flex", padding: "14px 20px", alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.04)" },
  empty: { textAlign: "center", padding: "60px 20px" },
  link: { color: "#6366f1", textDecoration: "none",
    fontWeight: "600", marginTop: "12px", display: "inline-block" },
  viewBtn: { color: "#6366f1", textDecoration: "none",
    fontSize: "13px", fontWeight: "600",
    padding: "4px 10px", borderRadius: "6px",
    background: "rgba(99,102,241,0.1)" },
};