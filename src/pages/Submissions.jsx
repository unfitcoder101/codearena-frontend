import { useEffect, useState } from "react";
import API_BASE from "../utils/api";

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login first");
      return;
    }

    fetch(`${API_BASE}/api/submissions/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load submissions");
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Your Submissions</h1>

      {submissions.length === 0 && <p>No submissions yet.</p>}

      {submissions.map((s) => (
        <div
          key={s._id}
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 10,
            background: "#111827",
            color: "white",
          }}
        >
          <h3>{s.problem?.title}</h3>
          <p>Status: {s.status}</p>
          <p>Language: {s.language}</p>
          <p>
            Submitted at:{" "}
            {new Date(s.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
