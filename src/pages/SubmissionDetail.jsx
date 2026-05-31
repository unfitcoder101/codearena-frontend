import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_BASE from "../utils/api";

export default function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    const fetchData = async () => {
      try {
        // Fetch submission
        const subRes = await fetch(`${API_BASE}/api/submissions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const subData = await subRes.json();
        setSubmission(subData.submission);

        // Fetch analysis
        const anaRes = await fetch(`${API_BASE}/api/analysis/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const anaData = await anaRes.json();
        if (anaData.analysis) setAnalysis(anaData.analysis);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div style={styles.page}>
      <p style={{ color: "#6b7280" }}>Loading...</p>
    </div>
  );

  if (!submission) return (
    <div style={styles.page}>
      <p style={{ color: "#ef4444" }}>Submission not found</p>
    </div>
  );

  const verdictColor = submission.status === "AC" ? "#22c55e"
    : submission.status === "WA" ? "#ef4444"
    : submission.status === "TLE" ? "#fbbf24"
    : "#9ca3af";

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Submission Detail</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
            {submission.problem?.title || "Unknown Problem"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            to={`/solve/${submission.problem?._id}`}
            style={styles.solveBtn}
          >
            Solve Again →
          </Link>
          <button
            onClick={() => navigate(-1)}
            style={styles.backBtn}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Verdict + meta */}
      <div style={styles.metaRow}>
        <div style={{
          ...styles.metaCard,
          borderColor: `${verdictColor}30`,
          background: `${verdictColor}08`,
        }}>
          <span style={{ color: "#6b7280", fontSize: "12px" }}>VERDICT</span>
          <span style={{
            color: verdictColor,
            fontSize: "24px",
            fontWeight: "700",
          }}>
            {submission.status === "AC" ? "✓ Accepted"
              : submission.status === "WA" ? "✗ Wrong Answer"
              : submission.status === "TLE" ? "⏱ TLE"
              : submission.status === "CE" ? "✗ CE"
              : submission.status}
          </span>
        </div>

        <div style={styles.metaCard}>
          <span style={{ color: "#6b7280", fontSize: "12px" }}>LANGUAGE</span>
          <span style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>
            {submission.language?.toUpperCase()}
          </span>
        </div>

        <div style={styles.metaCard}>
          <span style={{ color: "#6b7280", fontSize: "12px" }}>SUBMITTED</span>
          <span style={{ color: "white", fontSize: "14px" }}>
            {new Date(submission.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>

        {analysis && (
          <div style={styles.metaCard}>
            <span style={{ color: "#6b7280", fontSize: "12px" }}>
              AI SCORE
            </span>
            <span style={{
              fontSize: "24px",
              fontWeight: "700",
              color: analysis.codeQualityScore >= 7 ? "#22c55e"
                : analysis.codeQualityScore >= 5 ? "#fbbf24" : "#ef4444",
            }}>
              {analysis.codeQualityScore}/10
            </span>
          </div>
        )}
      </div>

      <div style={styles.grid}>

        {/* Left — Code */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Your Code</h3>
          <pre style={styles.codeBlock}>
            {submission.code}
          </pre>

          {/* Notes */}
          {submission.notes && (
            <div style={{ marginTop: "16px" }}>
              <h4 style={styles.subTitle}>📝 Your Notes</h4>
              <p style={styles.notesText}>{submission.notes}</p>
            </div>
          )}

          {/* Error */}
          {submission.errorMessage && (
            <div style={{ marginTop: "16px" }}>
              <h4 style={styles.subTitle}>Error</h4>
              <pre style={{ ...styles.codeBlock, color: "#ef4444" }}>
                {submission.errorMessage}
              </pre>
            </div>
          )}
        </div>

        {/* Right — AI feedback */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>AI Feedback</h3>

          {!analysis ? (
            <p style={{ color: "#6b7280", fontSize: "13px" }}>
              No AI analysis available for this submission.
            </p>
          ) : (
            <>
              {/* Complexity */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <ComplexityBadge label="Time" value={analysis.timeComplexity} />
                <ComplexityBadge label="Space" value={analysis.spaceComplexity} />
              </div>

              <FeedbackSection title="💡 Summary">
                <p style={styles.feedbackText}>{analysis.summary}</p>
              </FeedbackSection>

              {analysis.improvements?.length > 0 && (
                <FeedbackSection title="⚡ Improvements">
                  {analysis.improvements.map((item, i) => (
                    <div key={i} style={styles.listItem}>
                      <span style={styles.bullet}>→</span>
                      <span style={styles.feedbackText}>{item}</span>
                    </div>
                  ))}
                </FeedbackSection>
              )}

              {analysis.edgeCases?.length > 0 && (
                <FeedbackSection title="⚠️ Edge Cases Missed">
                  {analysis.edgeCases.map((item, i) => (
                    <div key={i} style={styles.listItem}>
                      <span style={styles.bullet}>→</span>
                      <span style={styles.feedbackText}>{item}</span>
                    </div>
                  ))}
                </FeedbackSection>
              )}

              {analysis.strengthsObserved?.length > 0 && (
                <FeedbackSection title="✅ What You Did Well">
                  {analysis.strengthsObserved.map((item, i) => (
                    <div key={i} style={styles.listItem}>
                      <span style={{ ...styles.bullet, color: "#22c55e" }}>
                        ✓
                      </span>
                      <span style={styles.feedbackText}>{item}</span>
                    </div>
                  ))}
                </FeedbackSection>
              )}

              {analysis.hints?.length > 0 && (
                <FeedbackSection title="🔍 Hints">
                  {analysis.hints.map((hint, i) => (
                    <div key={i} style={styles.listItem}>
                      <span style={{ ...styles.bullet, color: "#fbbf24" }}>
                        {i + 1}.
                      </span>
                      <span style={styles.feedbackText}>{hint}</span>
                    </div>
                  ))}
                </FeedbackSection>
              )}

              {analysis.mistakePattern && (
                <div style={styles.patternBox}>
                  <span style={{
                    fontSize: "11px", color: "#fbbf24",
                    fontWeight: "600", textTransform: "uppercase",
                  }}>
                    Pattern Detected
                  </span>
                  <p style={{
                    color: "#fde68a", margin: "4px 0 0", fontSize: "14px",
                  }}>
                    {analysis.mistakePattern}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FeedbackSection({ title, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h4 style={{
        color: "#9ca3af", fontSize: "12px",
        textTransform: "uppercase", letterSpacing: "0.5px",
        marginBottom: "8px", margin: "0 0 8px",
      }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function ComplexityBadge({ label, value }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      padding: "8px 14px",
      background: "rgba(165,180,252,0.05)",
      border: "1px solid rgba(165,180,252,0.1)",
      borderRadius: "8px", gap: "2px",
    }}>
      <span style={{ color: "#6b7280", fontSize: "11px" }}>{label}</span>
      <span style={{
        color: "#a5b4fc", fontWeight: "600", fontSize: "14px",
      }}>
        {value}
      </span>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    margin: 0,
  },
  solveBtn: {
    background: "rgba(99,102,241,0.1)",
    color: "#6366f1",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid rgba(99,102,241,0.2)",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#9ca3af",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  metaRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  metaCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "14px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "120px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  section: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "20px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    margin: "0 0 16px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  subTitle: {
    fontSize: "12px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 8px",
  },
  codeBlock: {
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "16px",
    color: "#e2e8f0",
    fontSize: "12px",
    fontFamily: "'Fira Code', monospace",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    lineHeight: "1.6",
    maxHeight: "400px",
    overflowY: "auto",
  },
  notesText: {
    color: "#9ca3af",
    fontSize: "13px",
    lineHeight: "1.6",
    background: "rgba(99,102,241,0.05)",
    border: "1px solid rgba(99,102,241,0.1)",
    borderRadius: "6px",
    padding: "10px 14px",
    whiteSpace: "pre-wrap",
  },
  feedbackText: {
    color: "#d1d5db",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  },
  listItem: {
    display: "flex",
    gap: "8px",
    marginBottom: "6px",
    alignItems: "flex-start",
  },
  bullet: {
    color: "#6366f1",
    fontWeight: "700",
    flexShrink: 0,
    marginTop: "2px",
  },
  patternBox: {
    padding: "12px 16px",
    background: "rgba(251,191,36,0.06)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "8px",
    marginTop: "16px",
  },
};