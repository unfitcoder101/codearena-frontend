import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "../utils/api";

export default function Solve() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
  cout << "Hello CodeArena";
  return 0;
}`);
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch problem
  useEffect(() => {
    fetch(`${API_BASE}/api/problems/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load problem");
        return res.json();
      })
      .then(setProblem)
      .catch((err) => {
        console.error(err);
        alert("Could not load problem");
      });
  }, [id]);

  // 🔹 Submit code
  const submitCode = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    setLoading(true);
    setOutput("");
    setVerdict("");

    try {
      const res = await fetch(`${API_BASE}/api/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemId: id,
          language: "cpp",
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setOutput(data.output || "No output returned");
      setVerdict(data.verdict || "");
    } catch (err) {
      console.error(err);
      setOutput("Submission failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  if (!problem) {
    return (
      <p style={{ color: "#9ca3af", padding: "20px" }}>
        Loading problem...
      </p>
    );
  }

  return (
    <div style={{ padding: "24px", color: "white" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        {/* LEFT — PROBLEM */}
        <div>
          <h1>{problem.title}</h1>
          <p style={{ color: "#9ca3af" }}>{problem.description}</p>

          <h3>Input Format</h3>
          <pre>{problem.inputFormat}</pre>

          <h3>Output Format</h3>
          <pre>{problem.outputFormat}</pre>

          <h3>Sample Input</h3>
          <pre>{problem.sampleInput}</pre>

          <h3>Sample Output</h3>
          <pre>{problem.sampleOutput}</pre>
        </div>

        {/* RIGHT — CODE */}
        <div>
          <h2>Write your code</h2>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              width: "100%",
              height: "260px",
              background: "#0B0F14",
              color: "white",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "12px",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />

          <button
            onClick={submitCode}
            disabled={loading}
            style={{
              marginTop: "12px",
              padding: "10px 18px",
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Running..." : "Submit Code 🚀"}
          </button>

          <h3 style={{ marginTop: "16px" }}>Output</h3>
          <pre
            style={{
              background: "#111827",
              padding: "12px",
              borderRadius: "10px",
              color: "#a7f3d0",
              minHeight: "80px",
            }}
          >
            {output}
          </pre>

          {verdict && (
            <h3
              style={{
                marginTop: "8px",
                color: verdict === "AC" ? "#22c55e" : "#f87171",
              }}
            >
              Verdict: {verdict}
            </h3>
          )}
        </div>
      </div>
    </div>
  );
}
