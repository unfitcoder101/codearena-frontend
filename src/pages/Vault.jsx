import { useEffect, useState } from "react";
import API_BASE from "../utils/api";

export default function Vault() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [platform, setPlatform] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [notes, setNotes] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchVault();
  }, []);

  const fetchVault = async () => {
    const res = await fetch(`${API_BASE}/api/vault`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setItems(data);
  };

  const addItem = async () => {
    if (!title || !link) return alert("Fill required fields");

    await fetch(`${API_BASE}/api/vault`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        link,
        platform,
        difficulty,
        notes,
      }),
    });

    setTitle("");
    setLink("");
    setPlatform("");
    setDifficulty("");
    setNotes("");

    fetchVault();
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1>My Problem Vault</h1>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Link" value={link} onChange={e => setLink(e.target.value)} />
        <input placeholder="Platform" value={platform} onChange={e => setPlatform(e.target.value)} />
        <input placeholder="Difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} />
        <input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={addItem}>Add</button>
      </div>

      {items.map(item => (
        <div key={item._id} style={{ marginBottom: 15, background: "#111827", padding: 12 }}>
          <h3>{item.title}</h3>
          <p>{item.platform} • {item.difficulty}</p>
          <a href={item.link} target="_blank" rel="noreferrer">Open Problem</a>
          <p>{item.notes}</p>
        </div>
      ))}
    </div>
  );
}