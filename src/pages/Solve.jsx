import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";
import Editor from "@monaco-editor/react";


const LANGUAGES = ["cpp", "js", "java"];

const DEFAULT_CODE = {
  cpp: `#include <iostream>
using namespace std;

int main() {
  // Write your solution here
  return 0;
}`,
  js: `// Read input line by line using readline()
const line1 = readline();
console.log(line1);`,
  java: `import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    // Write your solution here
  }
}`,
};

export default function Solve() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── All useState hooks must be INSIDE the component ──
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(DEFAULT_CODE.cpp);
  const [savedCode, setSavedCode] = useState({ ...DEFAULT_CODE });
  const [verdict, setVerdict] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintLevel, setHintLevel] = useState(1);
  const [loadingHint, setLoadingHint] = useState(false);

  // Fetch problem on load
  useEffect(() => {
    fetch(`${API_BASE}/api/problems/${id}`)
      .then((res) => res.json())
      .then((data) => setProblem(data.problem))
      .catch(() => setError("Could not load problem"));
  }, [id]);

  // Poll for AI analysis after submission
  useEffect(() => {
    if (!submissionId) return;
    if (analysisStatus === "completed" || analysisStatus === "failed") return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE}/api/analysis/status/${submissionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) return;

        const data = await res.json();
        setAnalysisStatus(data.status);

        if (data.status === "completed") {
          clearInterval(interval);
          const fullRes = await fetch(
            `${API_BASE}/api/analysis/${submissionId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const fullData = await fullRes.json();
          if (fullData.analysis) setAnalysis(fullData.analysis);
        }

        if (data.status === "failed") clearInterval(interval);

      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [submissionId, analysisStatus]);

  // Switch language but save current code first
  const handleLanguageChange = (lang) => {
    setSavedCode((prev) => ({ ...prev, [language]: code }));
    setLanguage(lang);
    setCode(savedCode[lang]);
  };

  const getHint = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingHint(true);
    try {
      const res = await fetch(`${API_BASE}/api/problems/${id}/hint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ level: hintLevel }),
      });
      const data = await res.json();
      if (data.hint) {
        setHint(data.hint);
        setHintLevel((prev) => Math.min(prev + 1, 4));
      }
    } catch (err) {
      console.error("Failed to get hint:", err);
    } finally {
      setLoadingHint(false);
    }
  };

  // Run against sample input only — no submission saved
  const handleRun = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setRunning(true);
    setRunResult(null);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/submissions/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problemId: id, language, code }),
      });

      const data = await res.json();
      setRunResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  // Submit against all hidden test cases — saves submission + triggers AI
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    setVerdict(null);
    setAnalysis(null);
    setAnalysisStatus("pending");
    setRunResult(null);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problemId: id, language, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");

      setVerdict(data.verdict);
      setSubmissionId(data.submission._id);
    } catch (err) {
      setError(err.message);
      setAnalysisStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!submissionId) return;
    const token = localStorage.getItem("token");
    setSavingNotes(true);
    setNotesSaved(false);

    try {
      const res = await fetch(
        `${API_BASE}/api/submissions/${submissionId}/notes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes }),
        }
      );
      if (res.ok) setNotesSaved(true);
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (error && !problem) {
    return <div style={{ padding: 40, color: "#ef4444" }}>{error}</div>;
  }

  if (!problem) {
    return <div style={{ padding: 40, color: "#9ca3af" }}>Loading problem...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.grid}>

        {/* ── LEFT: Problem description ── */}
        <div style={styles.left}>
          <div style={styles.problemHeader}>
            <h1 style={styles.problemTitle}>{problem.title}</h1>
            <span style={{
              ...styles.diffBadge,
              background: problem.difficulty === "Easy"
                ? "rgba(34,197,94,0.1)" : problem.difficulty === "Medium"
                  ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.1)",
              color: problem.difficulty === "Easy" ? "#22c55e"
                : problem.difficulty === "Medium" ? "#fbbf24" : "#ef4444",
            }}>
              {problem.difficulty}
            </span>
          </div>

          <p style={styles.description}>{problem.description}</p>

          {problem.constraints && (
            <Section title="Constraints">
              <pre style={styles.pre}>{problem.constraints}</pre>
            </Section>
          )}

          <Section title="Sample Input">
            <pre style={styles.pre}>{problem.sampleInput || "No input"}</pre>
          </Section>

          <Section title="Sample Output">
            <pre style={styles.pre}>{problem.sampleOutput || "No output"}</pre>
          </Section>

          {problem.tags?.length > 0 && (
            <div style={{
              display: "flex", gap: "6px", marginTop: "20px",
              flexWrap: "wrap"
            }}>
              {problem.tags.map((tag) => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Editor + results ── */}
        <div style={styles.right}>

          {/* Language selector */}
          <div style={styles.langBar}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                style={{
                  ...styles.langBtn,
                  background: language === lang
                    ? "rgba(99,102,241,0.2)" : "transparent",
                  color: language === lang ? "#6366f1" : "#9ca3af",
                  border: language === lang
                    ? "1px solid rgba(99,102,241,0.4)"
                    : "1px solid transparent",
                }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Monaco code editor — same as VS Code */}
          <div style={{
            height: "320px",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}>
            <Editor
              height="320px"
              language={language === "cpp" ? "cpp" : language === "js" ? "javascript" : "java"}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Show login prompt if not logged in */}
          {!localStorage.getItem("token") && (
            <div style={{
              padding: "12px 16px",
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}>
              <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                Login to submit code and get AI feedback
              </span>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  flexShrink: 0,
                }}
              >
                Login →
              </button>
            </div>
          )}

          {/* Run + Submit buttons */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}></div>

          {/* Run + Submit buttons */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={handleRun}
              disabled={running}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#6366f1",
                border: "1px solid rgba(99,102,241,0.4)",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                opacity: running ? 0.7 : 1,
              }}
            >
              {running ? "Running..." : "▶ Run"}
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "10px 20px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Submitting..." : "Submit →"}
            </button>
          </div>
          {/* Hint system */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={getHint}
              disabled={loadingHint}
              style={{
                background: "transparent",
                border: "1px solid rgba(251,191,36,0.3)",
                color: "#fbbf24",
                padding: "7px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                opacity: loadingHint ? 0.7 : 1,
              }}
            >
              {loadingHint ? "Getting hint..."
                : hintLevel === 1 ? "💡 Get Hint"
                  : hintLevel === 2 ? "💡 Stronger Hint"
                    : hintLevel === 3 ? "💡 Final Hint"
                      : "No more hints"}
            </button>
            {hintLevel > 1 && (
              <span style={{ color: "#4b5563", fontSize: "12px" }}>
                Hint {hintLevel - 1}/3 used
              </span>
            )}
          </div>

          {hint && (
            <div style={{
              padding: "12px 16px",
              background: "rgba(251,191,36,0.05)",
              border: "1px solid rgba(251,191,36,0.15)",
              borderRadius: "8px",
            }}>
              <span style={{
                color: "#fbbf24",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Hint {hintLevel - 1}
              </span>
              <p style={{
                color: "#fde68a",
                fontSize: "14px",
                lineHeight: "1.6",
                margin: "6px 0 0",
              }}>
                {hint}
              </p>
            </div>
          )}
          {error && (
            <p style={{ color: "#ef4444", fontSize: "13px", margin: 0 }}>
              {error}
            </p>
          )}

          {/* Run result — shows after clicking Run */}
          {runResult && (
            <div style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: runResult.passed
                ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
              border: `1px solid ${runResult.passed
                ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
              <div style={{
                fontWeight: "600",
                fontSize: "14px",
                color: runResult.passed ? "#22c55e" : "#ef4444",
                marginBottom: "10px",
              }}>
                {runResult.verdict === "CE"
                  ? "✗ Compilation Error"
                  : runResult.passed
                    ? "✓ Sample test passed"
                    : "✗ Wrong answer on sample"}
              </div>

              {runResult.verdict !== "CE" && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr", gap: "10px"
                }}>
                  <div>
                    <div style={{
                      color: "#6b7280", fontSize: "11px",
                      marginBottom: "4px", textTransform: "uppercase"
                    }}>
                      Your output
                    </div>
                    <pre style={{
                      margin: 0,
                      color: runResult.passed ? "#22c55e" : "#ef4444",
                      fontSize: "13px", background: "rgba(0,0,0,0.2)",
                      padding: "8px", borderRadius: "6px"
                    }}>
                      {runResult.output || "(empty)"}
                    </pre>
                  </div>
                  <div>
                    <div style={{
                      color: "#6b7280", fontSize: "11px",
                      marginBottom: "4px", textTransform: "uppercase"
                    }}>
                      Expected
                    </div>
                    <pre style={{
                      margin: 0, color: "#22c55e",
                      fontSize: "13px", background: "rgba(0,0,0,0.2)",
                      padding: "8px", borderRadius: "6px"
                    }}>
                      {runResult.expected || "(empty)"}
                    </pre>
                  </div>
                </div>
              )}

              {runResult.error && (
                <pre style={{
                  margin: "8px 0 0", color: "#ef4444",
                  fontSize: "12px"
                }}>
                  {runResult.error}
                </pre>
              )}
            </div>
          )}

          {/* Verdict — shows after clicking Submit */}
          {verdict && (
            <div style={{
              ...styles.verdictBox,
              background: verdict === "AC"
                ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              borderColor: verdict === "AC"
                ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
            }}>
              <span style={{
                fontSize: "20px",
                fontWeight: "700",
                color: verdict === "AC" ? "#22c55e" : "#ef4444",
              }}>
                {verdict === "AC" ? "✓ Accepted"
                  : verdict === "WA" ? "✗ Wrong Answer"
                    : verdict === "TLE" ? "⏱ Time Limit Exceeded"
                      : "✗ Compilation Error"}
              </span>
            </div>
          )}

          {/* AI Interview button — appears after any verdict */}
          {verdict && submissionId && (
            <button
              onClick={() => navigate(`/interview/${submissionId}`)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#a78bfa",
                border: "1px solid rgba(167,139,250,0.3)",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🎤 Start AI Interview about this solution
            </button>
          )}

          {/* AI analyzing spinner */}
          {analysisStatus === "pending" && (
            <div style={styles.aiPending}>
              <div style={styles.spinner} />
              <span style={{ color: "#9ca3af", fontSize: "14px" }}>
                AI is analyzing your code...
              </span>
            </div>
          )}

          {/* AI feedback panel */}
          {analysis && <AIFeedbackPanel analysis={analysis} />}

          {/* Personal notes — shown after AI analysis appears */}
          {analysis && submissionId && (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "16px",
            }}>
              <h4 style={{
                margin: "0 0 10px",
                fontSize: "13px",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                📝 My Notes
              </h4>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setNotesSaved(false);
                }}
                placeholder="Key insight: ... I struggled with: ... Next time I'll: ..."
                style={{
                  width: "100%",
                  height: "100px",
                  background: "#0d1117",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "white",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "8px",
              }}>
                {notesSaved && (
                  <span style={{ color: "#22c55e", fontSize: "12px" }}>
                    ✓ Saved
                  </span>
                )}
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  style={{
                    marginLeft: "auto",
                    background: "transparent",
                    border: "1px solid rgba(99,102,241,0.3)",
                    color: "#6366f1",
                    padding: "6px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    opacity: savingNotes ? 0.7 : 1,
                  }}
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function AIFeedbackPanel({ analysis }) {
  return (
    <div style={styles.aiPanel}>
      <h3 style={styles.aiTitle}>AI Feedback</h3>

      <div style={styles.scoreRow}>
        <span style={{ color: "#9ca3af", fontSize: "14px" }}>Code Quality</span>
        <div style={styles.scoreBar}>
          <div style={{
            ...styles.scoreFill,
            width: `${(analysis.codeQualityScore / 10) * 100}%`,
            background: analysis.codeQualityScore >= 7 ? "#22c55e"
              : analysis.codeQualityScore >= 5 ? "#fbbf24" : "#ef4444",
          }} />
        </div>
        <span style={{
          fontSize: "18px", fontWeight: "700",
          color: analysis.codeQualityScore >= 7 ? "#22c55e"
            : analysis.codeQualityScore >= 5 ? "#fbbf24" : "#ef4444",
        }}>
          {analysis.codeQualityScore}/10
        </span>
      </div>

      <div style={styles.complexityRow}>
        <ComplexityBadge label="Time" value={analysis.timeComplexity} />
        <ComplexityBadge label="Space" value={analysis.spaceComplexity} />
      </div>

      <AISection title="Summary" icon="💡">
        <p style={styles.aiText}>{analysis.summary}</p>
      </AISection>

      {analysis.improvements?.length > 0 && (
        <AISection title="Improvements" icon="⚡">
          {analysis.improvements.map((item, i) => (
            <div key={i} style={styles.listItem}>
              <span style={styles.bullet}>→</span>
              <span style={styles.aiText}>{item}</span>
            </div>
          ))}
        </AISection>
      )}

      {analysis.edgeCases?.length > 0 && (
        <AISection title="Edge Cases Missed" icon="⚠️">
          {analysis.edgeCases.map((item, i) => (
            <div key={i} style={styles.listItem}>
              <span style={styles.bullet}>→</span>
              <span style={styles.aiText}>{item}</span>
            </div>
          ))}
        </AISection>
      )}

      {analysis.hints?.length > 0 && (
        <AISection title="Hints" icon="🔍">
          {analysis.hints.map((hint, i) => (
            <div key={i} style={styles.listItem}>
              <span style={{ ...styles.bullet, color: "#fbbf24" }}>
                {i + 1}.
              </span>
              <span style={styles.aiText}>{hint}</span>
            </div>
          ))}
        </AISection>
      )}

      {analysis.strengthsObserved?.length > 0 && (
        <AISection title="What You Did Well" icon="✅">
          {analysis.strengthsObserved.map((item, i) => (
            <div key={i} style={styles.listItem}>
              <span style={{ ...styles.bullet, color: "#22c55e" }}>✓</span>
              <span style={styles.aiText}>{item}</span>
            </div>
          ))}
        </AISection>
      )}

      {analysis.mistakePattern && (
        <div style={styles.patternBox}>
          <span style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "600" }}>
            PATTERN DETECTED
          </span>
          <p style={{ color: "#fde68a", margin: "4px 0 0", fontSize: "14px" }}>
            {analysis.mistakePattern}
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h4 style={{
        color: "#6b7280", fontSize: "12px",
        textTransform: "uppercase", letterSpacing: "0.5px",
        marginBottom: "8px"
      }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function AISection({ title, icon, children }) {
  return (
    <div style={{ marginTop: "16px" }}>
      <h4 style={{
        color: "#9ca3af", fontSize: "12px",
        textTransform: "uppercase", letterSpacing: "0.5px",
        marginBottom: "8px"
      }}>
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

function ComplexityBadge({ label, value }) {
  return (
    <div style={styles.complexityBadge}>
      <span style={{ color: "#6b7280", fontSize: "11px" }}>{label}</span>
      <span style={{
        color: "#a5b4fc", fontWeight: "600",
        fontSize: "14px"
      }}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    background: "#0B0F14",
    minHeight: "calc(100vh - 64px)",
    color: "white",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    height: "calc(100vh - 64px)",
  },
  left: {
    padding: "32px",
    borderRight: "1px solid rgba(255,255,255,0.07)",
    overflowY: "auto",
  },
  right: {
    padding: "24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  problemHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  problemTitle: {
    fontSize: "22px",
    fontWeight: "700",
    margin: 0,
  },
  diffBadge: {
    padding: "3px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  description: {
    color: "#d1d5db",
    lineHeight: "1.7",
    fontSize: "15px",
  },
  pre: {
    background: "rgba(255,255,255,0.04)",
    padding: "12px 16px",
    borderRadius: "8px",
    color: "#a5b4fc",
    fontSize: "13px",
    overflowX: "auto",
    fontFamily: "monospace",
    border: "1px solid rgba(255,255,255,0.06)",
    whiteSpace: "pre-wrap",
  },
  tag: {
    background: "rgba(99,102,241,0.1)",
    color: "#818cf8",
    padding: "3px 10px",
    borderRadius: "4px",
    fontSize: "12px",
  },
  langBar: {
    display: "flex",
    gap: "6px",
  },
  langBtn: {
    padding: "5px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.3px",
  },
  verdictBox: {
    padding: "16px 20px",
    borderRadius: "10px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  aiPending: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "rgba(99,102,241,0.05)",
    borderRadius: "10px",
    border: "1px solid rgba(99,102,241,0.15)",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(99,102,241,0.3)",
    borderTop: "2px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  aiPanel: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "20px",
  },
  aiTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    color: "white",
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  scoreBar: {
    flex: 1,
    height: "6px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.8s ease",
  },
  complexityRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  complexityBadge: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 14px",
    background: "rgba(165,180,252,0.05)",
    border: "1px solid rgba(165,180,252,0.1)",
    borderRadius: "8px",
    gap: "2px",
  },
  aiText: {
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
    marginTop: "16px",
    padding: "12px 16px",
    background: "rgba(251,191,36,0.06)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "8px",
  },
};