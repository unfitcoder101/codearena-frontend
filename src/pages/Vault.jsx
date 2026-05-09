import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

const PLATFORMS = ["LeetCode", "Codeforces", "GeeksForGeeks", "HackerRank", "Other"];
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Unknown"];

export default function Vault() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, solved: 0, unsolved: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");


  // Form state
  const [form, setForm] = useState({
    title: "", link: "", platform: "LeetCode",
    difficulty: "Easy", tags: "", notes: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchVault();
  }, []);

  const fetchVault = async () => {
    const res = await fetch(`${API_BASE}/api/vault`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setItems(data.problems || []);
    setStats(data.stats || { total: 0, solved: 0, unsolved: 0 });
    setLoading(false);
  };

  const addItem = async () => {
    if (!form.title || !form.link || !form.platform) {
      alert("Title, link, and platform are required");
      return;
    }

    const res = await fetch(`${API_BASE}/api/vault`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });

    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }

    setForm({
      title: "", link: "", platform: "LeetCode",
      difficulty: "Easy", tags: "", notes: ""
    });
    setShowForm(false);
    fetchVault();
  };

  const toggleSolved = async (id) => {
    await fetch(`${API_BASE}/api/vault/${id}/toggle`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchVault();
  };

  const deleteItem = async (id) => {
    if (!confirm("Remove from vault?")) return;
    await fetch(`${API_BASE}/api/vault/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchVault();
  };

  const getHints = async (id) => {
    const res = await fetch(`${API_BASE}/api/vault/${id}/hints`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.hints) {
      setItems((prev) => prev.map((item) =>
        item._id === id ? {
          ...item, aiHints: data.hints,
          aiSummary: data.summary, aiStatus: "completed"
        } : item
      ));
    }
  };

  const filtered = items
    .filter((i) => {
      if (filter === "solved") return i.solved;
      if (filter === "unsolved") return !i.solved;
      return true;
    })
    .filter((i) =>
      platformFilter === "all" ? true : i.platform === platformFilter
    )
    .filter((i) =>
      search === ""
        ? true
        : i.title.toLowerCase().includes(search.toLowerCase())
    );
  if (loading) return <div style={styles.page}><p style={{ color: "#6b7280" }}>Loading vault...</p></div>;

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Problem Vault</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
            Your personal problem library
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? "Cancel" : "+ Add Problem"}
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <MiniStat label="Total" value={stats.total} />
        <MiniStat label="Solved" value={stats.solved} color="#22c55e" />
        <MiniStat label="Unsolved" value={stats.unsolved} color="#ef4444" />
      </div>

      {/* Add form */}
      {showForm && (
        <div style={styles.form}>
          <h3 style={{ margin: "0 0 16px", color: "white", fontSize: "15px" }}>
            Add Problem to Vault
          </h3>
          <div style={styles.formGrid}>
            <input style={styles.input} placeholder="Problem title *"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input style={styles.input} placeholder="Problem link *"
              value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />

            <select style={styles.input} value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select style={styles.input} value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <input style={styles.input} placeholder="Tags (comma separated)"
              value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>

          <textarea
            style={{
              ...styles.input, height: "80px", resize: "vertical", width: "100%",
              boxSizing: "border-box", marginTop: "8px"
            }}
            placeholder="Notes — your approach, key insight, what you learned..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <button onClick={addItem} style={styles.addBtn}>Save to Vault</button>
        </div>
      )}

      {/* Filter */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <input
          style={{
            ...styles.input,
            flex: 2,
            minWidth: "200px",
            padding: "8px 14px",
          }}
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {["all", "solved", "unsolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              background: filter === f
                ? "rgba(99,102,241,0.2)" : "transparent",
              color: filter === f ? "#6366f1" : "#9ca3af",
              border: filter === f
                ? "1px solid rgba(99,102,241,0.3)"
                : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        <select
          style={{
            ...styles.input,
            padding: "8px 12px",
            width: "auto",
            cursor: "pointer",
          }}
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
        >
          <option value="all">All Platforms</option>
          {["LeetCode", "Codeforces", "GeeksForGeeks",
            "HackerRank", "Other"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
        </select>
      </div>

      {/* Problem cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "#6b7280" }}>
            {filter === "all" ? "No problems in vault yet. Add one above." : `No ${filter} problems.`}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((item) => (
            <VaultCard
              key={item._id}
              item={item}
              onToggle={() => toggleSolved(item._id)}
              onDelete={() => deleteItem(item._id)}
              onGetHints={() => getHints(item._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VaultCard({ item, onToggle, onDelete, onGetHints }) {
  const [showHints, setShowHints] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const diffColors = {
    Easy: "#22c55e", Medium: "#fbbf24",
    Hard: "#ef4444", Unknown: "#6b7280",
  };

  return (
    <div style={{
      ...styles.card,
      borderColor: item.solved
        ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)",
    }}>
      {/* Card header */}
      <div style={styles.cardHeader}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginBottom: "6px", flexWrap: "wrap"
          }}>
            <span style={{
              color: "white", fontWeight: "600",
              fontSize: "15px"
            }}>{item.title}</span>
            {item.solved && (
              <span style={{
                background: "rgba(34,197,94,0.1)", color: "#22c55e",
                fontSize: "10px", padding: "2px 8px", borderRadius: "10px",
                fontWeight: "600"
              }}>SOLVED</span>
            )}
          </div>
          <div style={{
            display: "flex", gap: "8px", alignItems: "center",
            flexWrap: "wrap"
          }}>
            <span style={{ color: "#6b7280", fontSize: "12px" }}>{item.platform}</span>
            <span style={{
              color: diffColors[item.difficulty] || "#6b7280",
              fontSize: "12px", fontWeight: "600"
            }}>{item.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {item.tags?.length > 0 && (
        <div style={{
          display: "flex", gap: "4px", flexWrap: "wrap",
          marginBottom: "12px"
        }}>
          {item.tags.map((t) => (
            <span key={t} style={styles.tag}>{t}</span>
          ))}
        </div>
      )}

      {/* Notes preview */}
      {item.notes && (
        <div style={{ marginBottom: "12px" }}>
          <button onClick={() => setShowNotes(!showNotes)} style={styles.ghostBtn}>
            {showNotes ? "Hide notes" : "Show notes"}
          </button>
          {showNotes && (
            <p style={{
              color: "#9ca3af", fontSize: "13px",
              lineHeight: "1.6", marginTop: "8px",
              padding: "10px", background: "rgba(255,255,255,0.02)",
              borderRadius: "6px", whiteSpace: "pre-wrap"
            }}>
              {item.notes}
            </p>
          )}
        </div>
      )}

      {/* AI Hints */}
      {item.aiStatus === "completed" && item.aiHints?.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <button onClick={() => setShowHints(!showHints)} style={styles.ghostBtn}>
            {showHints ? "Hide AI hints" : "Show AI hints"}
          </button>
          {showHints && (
            <div style={{ marginTop: "8px" }}>
              {item.aiSummary && (
                <p style={{
                  color: "#9ca3af", fontSize: "13px",
                  marginBottom: "8px", fontStyle: "italic"
                }}>
                  {item.aiSummary}
                </p>
              )}
              {item.aiHints.map((hint, i) => (
                <div key={i} style={{
                  display: "flex", gap: "8px",
                  marginBottom: "6px", alignItems: "flex-start"
                }}>
                  <span style={{
                    color: "#6366f1", fontWeight: "700",
                    fontSize: "12px", flexShrink: 0
                  }}>H{i + 1}</span>
                  <span style={{ color: "#d1d5db", fontSize: "13px" }}>{hint}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={styles.cardActions}>
        <a href={item.link} target="_blank" rel="noreferrer"
          style={styles.openBtn}>Open →</a>

        <button onClick={onToggle} style={{
          ...styles.actionBtn,
          color: item.solved ? "#ef4444" : "#22c55e",
          borderColor: item.solved
            ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
        }}>
          {item.solved ? "Mark Unsolved" : "Mark Solved"}
        </button>

        {item.aiStatus !== "completed" && (
          <button onClick={onGetHints} style={{
            ...styles.actionBtn, color: "#6366f1",
            borderColor: "rgba(99,102,241,0.2)",
          }}>
            AI Hints
          </button>
        )}

        <button
          onClick={async () => {
            const res = await fetch(
              `${API_BASE}/api/vault/${item._id}/revision`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            const data = await res.json();
            if (data.success) window.location.reload();
          }}
          style={{
            ...styles.actionBtn,
            color: item.needsRevision ? "#fbbf24" : "#6b7280",
            borderColor: item.needsRevision
              ? "rgba(251,191,36,0.3)"
              : "rgba(255,255,255,0.08)",
            background: item.needsRevision
              ? "rgba(251,191,36,0.05)" : "transparent",
          }}
        >
          {item.needsRevision ? "⚡ Needs Revision" : "Mark Revision"}
        </button>

        <button onClick={onDelete} style={{
          ...styles.actionBtn, color: "#6b7280",
          borderColor: "rgba(255,255,255,0.08)",
        }}>
          Delete
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = "white" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px",
      padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px"
    }}>
      <span style={{ color: "#6b7280", fontSize: "13px" }}>{label}</span>
      <span style={{ color, fontWeight: "700", fontSize: "20px" }}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px", background: "#0B0F14",
    minHeight: "calc(100vh - 64px)", color: "white"
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "20px"
  },
  title: { fontSize: "28px", fontWeight: "700", margin: 0 },
  statsRow: { display: "flex", gap: "10px", marginBottom: "20px" },
  form: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px", padding: "20px", marginBottom: "20px"
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  input: {
    padding: "10px 14px", background: "#0d1117", color: "white",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
    fontSize: "14px", width: "100%", boxSizing: "border-box"
  },
  addBtn: {
    background: "#6366f1", color: "white", border: "none",
    padding: "9px 18px", borderRadius: "8px", cursor: "pointer",
    fontWeight: "600", fontSize: "14px"
  },
  filterRow: { display: "flex", gap: "8px", marginBottom: "20px" },
  filterBtn: {
    padding: "6px 16px", borderRadius: "8px",
    cursor: "pointer", fontSize: "13px", fontWeight: "500"
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px"
  },
  card: {
    background: "rgba(255,255,255,0.02)", border: "1px solid",
    borderRadius: "12px", padding: "20px"
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between",
    marginBottom: "10px"
  },
  tag: {
    background: "rgba(99,102,241,0.1)", color: "#818cf8",
    padding: "2px 8px", borderRadius: "4px", fontSize: "11px"
  },
  cardActions: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" },
  openBtn: {
    color: "#6366f1", textDecoration: "none", fontSize: "13px",
    fontWeight: "600", padding: "5px 12px", borderRadius: "6px",
    background: "rgba(99,102,241,0.1)"
  },
  actionBtn: {
    background: "transparent", border: "1px solid",
    padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
    fontSize: "12px", fontWeight: "500"
  },
  ghostBtn: {
    background: "transparent", border: "none", color: "#6366f1",
    cursor: "pointer", fontSize: "12px", padding: 0, textDecoration: "underline"
  },
};