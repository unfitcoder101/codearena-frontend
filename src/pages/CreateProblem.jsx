import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

export default function CreateProblem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    tags: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
  });

  const [testCases, setTestCases] = useState([
    { input: "", expectedOutput: "" },
  ]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateTestCase = (index, field, value) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc))
    );
  };

  const addTestCase = () => {
    setTestCases((prev) => [...prev, { input: "", expectedOutput: "" }]);
  };

  const removeTestCase = (index) => {
    if (testCases.length === 1) return;
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    if (!form.title || !form.description) {
      setError("Title and description are required");
      return;
    }

    const validTestCases = testCases.filter(
      (tc) => tc.expectedOutput.trim() !== ""
    );

    if (validTestCases.length === 0) {
      setError("Add at least one test case with expected output");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/problems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          hiddenTestCases: validTestCases,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create problem");

      navigate(`/solve/${data.problem._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Create Problem</h1>
        <p style={styles.subtitle}>
          Add a new problem to your CodeArena
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {/* Basic info */}
        <Section title="Basic Information">
          <Field label="Problem Title *">
            <input
              style={styles.input}
              placeholder="e.g. Two Sum"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
            />
          </Field>

          <Field label="Description *">
            <textarea
              style={{ ...styles.input, height: "120px", resize: "vertical" }}
              placeholder="Describe the problem clearly..."
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
            />
          </Field>

          <div style={styles.row}>
            <Field label="Difficulty">
              <select
                style={styles.input}
                value={form.difficulty}
                onChange={(e) => updateForm("difficulty", e.target.value)}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </Field>

            <Field label="Tags (comma separated)">
              <input
                style={styles.input}
                placeholder="arrays, hashmap, two-pointers"
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* Format */}
        <Section title="Problem Format">
          <div style={styles.row}>
            <Field label="Input Format">
              <textarea
                style={{ ...styles.input, height: "80px", resize: "vertical" }}
                placeholder="Describe the input format..."
                value={form.inputFormat}
                onChange={(e) => updateForm("inputFormat", e.target.value)}
              />
            </Field>

            <Field label="Output Format">
              <textarea
                style={{ ...styles.input, height: "80px", resize: "vertical" }}
                placeholder="Describe the output format..."
                value={form.outputFormat}
                onChange={(e) => updateForm("outputFormat", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Constraints">
            <input
              style={styles.input}
              placeholder="e.g. 1 <= n <= 10000"
              value={form.constraints}
              onChange={(e) => updateForm("constraints", e.target.value)}
            />
          </Field>
        </Section>

        {/* Sample */}
        <Section title="Sample (shown to user)">
          <div style={styles.row}>
            <Field label="Sample Input">
              <textarea
                style={{ ...styles.input, height: "100px",
                  fontFamily: "monospace", resize: "vertical" }}
                placeholder="4&#10;2 7 11 15&#10;9"
                value={form.sampleInput}
                onChange={(e) => updateForm("sampleInput", e.target.value)}
              />
            </Field>

            <Field label="Sample Output">
              <textarea
                style={{ ...styles.input, height: "100px",
                  fontFamily: "monospace", resize: "vertical" }}
                placeholder="0 1"
                value={form.sampleOutput}
                onChange={(e) => updateForm("sampleOutput", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* Hidden test cases */}
        <Section title="Hidden Test Cases (used by judge)">
          <p style={{ color: "#6b7280", fontSize: "13px",
            marginBottom: "16px", marginTop: 0 }}>
            These are never shown to the user.
            The judge runs code against all of these.
          </p>

          {testCases.map((tc, i) => (
            <div key={i} style={styles.testCase}>
              <div style={styles.testCaseHeader}>
                <span style={{ color: "#9ca3af", fontSize: "13px",
                  fontWeight: "600" }}>
                  Test Case {i + 1}
                </span>
                {testCases.length > 1 && (
                  <button
                    onClick={() => removeTestCase(i)}
                    style={styles.removeBtn}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div style={styles.row}>
                <Field label="Input">
                  <textarea
                    style={{ ...styles.input, height: "80px",
                      fontFamily: "monospace", resize: "vertical" }}
                    placeholder="Input for this test case"
                    value={tc.input}
                    onChange={(e) =>
                      updateTestCase(i, "input", e.target.value)
                    }
                  />
                </Field>

                <Field label="Expected Output *">
                  <textarea
                    style={{ ...styles.input, height: "80px",
                      fontFamily: "monospace", resize: "vertical" }}
                    placeholder="Expected output"
                    value={tc.expectedOutput}
                    onChange={(e) =>
                      updateTestCase(i, "expectedOutput", e.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          ))}

          <button onClick={addTestCase} style={styles.addTestCaseBtn}>
            + Add Test Case
          </button>
        </Section>

        {/* Submit */}
        <div style={styles.footer}>
          <button
            onClick={() => navigate("/problems")}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating..." : "Create Problem →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h3 style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "16px",
        paddingBottom: "8px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "14px", flex: 1 }}>
      <label style={{
        display: "block",
        color: "#6b7280",
        fontSize: "12px",
        marginBottom: "6px",
        fontWeight: "500",
      }}>
        {label}
      </label>
      {children}
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
  title: {
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 4px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "32px",
  },
  error: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#ef4444",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "#0d1117",
    color: "white",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  testCase: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "12px",
  },
  testCaseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  removeBtn: {
    background: "transparent",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#ef4444",
    padding: "3px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  addTestCaseBtn: {
    background: "transparent",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "#6366f1",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "4px",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "24px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#9ca3af",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  submitBtn: {
    background: "#6366f1",
    border: "none",
    color: "white",
    padding: "10px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};