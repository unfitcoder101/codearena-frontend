import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Interview from "./pages/Interview";
import Register from "./pages/Register";
import Problems from "./pages/Problems";
import Solve from "./pages/Solve";
import Submissions from "./pages/Submissions";
import Vault from "./pages/Vault";
import Dashboard from "./pages/Dashboard";
import CreateProblem from "./pages/CreateProblem";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/solve/:id" element={<Solve />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/create-problem" element={<CreateProblem />} />
        <Route path="/interview/:submissionId" element={<Interview />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}