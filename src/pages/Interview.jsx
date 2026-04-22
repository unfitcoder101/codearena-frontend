import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

export default function Interview() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const bottomRef = useRef(null);
  const token = localStorage.getItem("token");

  // Start or load interview on mount
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    startOrLoadInterview();
  }, [submissionId]);

  // Auto scroll to bottom when new message appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startOrLoadInterview = async () => {
    setStarting(true);
    try {
      // Try to start — if already exists returns existing one
      const res = await fetch(`${API_BASE}/api/interviews/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ submissionId }),
      });

      const data = await res.json();
      if (data.interview) {
        setInterview(data.interview);
        setMessages(data.interview.messages || []);
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !interview) return;

    const userMessage = input.trim();
    setInput("");

    // Optimistically add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/interviews/${interview._id}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: userMessage }),
        }
      );

      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (starting) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={{ color: "#9ca3af", marginTop: "16px" }}>
            Starting interview session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>AI Interview Mode</h1>
          <p style={styles.subtitle}>
            Answer like you're in a real technical interview
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={styles.backBtn}
        >
          ← Back to Problem
        </button>
      </div>

      {/* Chat container */}
      <div style={styles.chatContainer}>

        {/* Interview tip at top */}
        <div style={styles.tip}>
          Tip: Explain your thinking out loud. Talk about trade-offs.
          Ask clarifying questions. Treat this like a real interview.
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === "user"
                  ? "flex-end" : "flex-start",
              }}
            >
              {/* Avatar for AI */}
              {msg.role === "assistant" && (
                <div style={styles.aiAvatar}>AI</div>
              )}

              {/* Message bubble */}
              <div style={{
                ...styles.bubble,
                background: msg.role === "user"
                  ? "rgba(99,102,241,0.2)"
                  : "rgba(255,255,255,0.04)",
                borderColor: msg.role === "user"
                  ? "rgba(99,102,241,0.3)"
                  : "rgba(255,255,255,0.08)",
                borderRadius: msg.role === "user"
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
              }}>
                <p style={{
                  margin: 0,
                  color: msg.role === "user" ? "#e0e7ff" : "#d1d5db",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </p>
              </div>

              {/* Avatar for user */}
              {msg.role === "user" && (
                <div style={styles.userAvatar}>You</div>
              )}
            </div>
          ))}

          {/* AI typing indicator */}
          {loading && (
            <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
              <div style={styles.aiAvatar}>AI</div>
              <div style={{
                ...styles.bubble,
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.08)",
                borderRadius: "18px 18px 18px 4px",
              }}>
                <div style={styles.typingDots}>
                  <div style={styles.dot} />
                  <div style={{ ...styles.dot, animationDelay: "0.2s" }} />
                  <div style={{ ...styles.dot, animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}

          {/* Auto scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={styles.inputArea}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
            style={styles.input}
            rows={3}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              ...styles.sendBtn,
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}
          >
            Send →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#0B0F14",
    minHeight: "calc(100vh - 64px)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    padding: "24px 32px",
  },
  loadingContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid rgba(99,102,241,0.3)",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
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
  subtitle: {
    color: "#6b7280",
    fontSize: "13px",
    marginTop: "4px",
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
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    overflow: "hidden",
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
    height: "calc(100vh - 200px)",
  },
  tip: {
    padding: "12px 20px",
    background: "rgba(99,102,241,0.06)",
    borderBottom: "1px solid rgba(99,102,241,0.1)",
    color: "#818cf8",
    fontSize: "12px",
    textAlign: "center",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  aiAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(99,102,241,0.2)",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "#818cf8",
    fontSize: "10px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.2)",
    color: "#22c55e",
    fontSize: "10px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "70%",
    padding: "12px 16px",
    border: "1px solid",
  },
  typingDots: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "4px 0",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#6b7280",
    animation: "bounce 1.2s ease-in-out infinite",
  },
  inputArea: {
    padding: "16px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "white",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    padding: "12px 20px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    flexShrink: 0,
  },
};