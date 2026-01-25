import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE from "../utils/api";

export default function Problems() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/problems`)
      .then(res => res.json())
      .then(setProblems);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Problems</h1>
      {problems.map(p => (
        <div key={p._id}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <Link to={`/solve/${p._id}`}>Solve →</Link>
        </div>
      ))}
    </div>
  );
}
