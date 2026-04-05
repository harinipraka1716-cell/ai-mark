import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [reg, setReg] = useState("");

  const startExam = () => {
    if (!name || !reg) {
      alert("Please enter student name and register number");
      return;
    }

    localStorage.setItem("name", name);
    localStorage.setItem("reg", reg);
    localStorage.removeItem("events");
    localStorage.removeItem("answer");

    navigate("/exam");
  };

  return (
    <div className="home-page">
      <div className="home-card">
        <div className="home-badge">
          AI Powered • Privacy Aware • Hackathon MVP
        </div>

        <h1 className="home-title">
          Smart Privacy-Aware Academic Integrity System
        </h1>

        <p className="home-subtitle">
          AI-inspired cheating detection for online and hybrid examinations
        </p>

        <div className="home-form">
          <input
            type="text"
            placeholder="Enter Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter Register Number"
            value={reg}
            onChange={(e) => setReg(e.target.value)}
          />

          <button onClick={startExam}>Start Exam</button>
        </div>

        <div className="home-features">
          <div className="feature-pill">Tab Switch Detection</div>
          <div className="feature-pill">Copy/Paste Monitoring</div>
          <div className="feature-pill">Privacy-Aware Review</div>
        </div>
      </div>
    </div>
  );
}

export default Home;