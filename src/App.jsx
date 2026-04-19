import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import API_BASE from "../utils/api";

import Vault from "./pages/Vault";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Problems from "./pages/Problems";
import Solve from "./pages/Solve";
import Submissions from "./pages/Submissions";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/solve/:id" element={<Solve />} />
        <Route path="/submissions" element={<Submissions />} />
      </Routes>
    </BrowserRouter>
  );
}
