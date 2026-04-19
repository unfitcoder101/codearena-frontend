import { useEffect, useState } from "react";
import API_BASE from "../utils/api";

export default function Submissions() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE}/api/submissions/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(setSubs);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Your Submissions</h1>

      {subs.length === 0 && <p>No submissions yet</p>}

      {subs.map(s => (
        <div
          key={s._id}
          style={{
            marginBottom: 12,
            padding: 14,
            background: "#111827",
            color: "white",
            borderRadius: 12,
          }}
        >
          <h3>{s.problem?.title}</h3>
          <p>Status: {s.status}</p>
          <p>{new Date(s.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
