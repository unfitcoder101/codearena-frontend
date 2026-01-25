import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Solve from "./pages/Solve";
import Submissions from "./pages/Submissions";


export default function App() {

 useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
  }
}, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/solve/:id" element={<Solve />} />
      </Routes>
    </BrowserRouter>
  );
}
