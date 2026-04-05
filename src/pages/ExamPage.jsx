import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

function ExamPage() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [events, setEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  const [answer, setAnswer] = useState(localStorage.getItem("answer") || "");
  const [warning, setWarning] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [faceStatus, setFaceStatus] = useState("Waiting for analysis...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const name = localStorage.getItem("name") || "Student";
  const reg = localStorage.getItem("reg") || "N/A";

  const addEvent = (text) => {
    const eventObj = {
      text,
      time: new Date().toLocaleTimeString(),
    };

    setEvents((prev) => {
      const updated = [...prev, eventObj];
      localStorage.setItem("events", JSON.stringify(updated));
      return updated;
    });

    setWarning(text);

    setTimeout(() => {
      setWarning("");
    }, 3000);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addEvent("Tab Switch Detected");
      }
    };

    const handleCopy = (e) => {
      e.preventDefault();
      addEvent("Copy Attempt Detected");
    };

    const handlePaste = (e) => {
      e.preventDefault();
      addEvent("Paste Attempt Detected");
    };

    const handleRightClick = (e) => {
      e.preventDefault();
      addEvent("Right Click Blocked");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleRightClick);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      localStorage.setItem("answer", answer);
      navigate("/dashboard");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, answer, navigate]);

  // Real face detection every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      analyzeCurrentFrame();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const analyzeCurrentFrame = async () => {
    try {
      if (!webcamRef.current) return;

      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) return;

      setIsAnalyzing(true);

      const response = await fetch("http://127.0.0.1:8000/analyze-frame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: screenshot }),
      });

      const data = await response.json();

      setFaceStatus(data.message || "Analysis completed");

      if (data.status === "no_face") {
        addEvent("No Face Detected");
      } else if (data.status === "multiple_faces") {
        addEvent("Multiple Faces Detected");
      }
    } catch (error) {
      setFaceStatus("Backend not reachable");
      console.error("Face analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitExam = () => {
    if (!answer.trim()) {
      alert("Please type your answer before submitting");
      return;
    }

    localStorage.setItem("answer", answer);
    navigate("/dashboard");
  };

  const getCurrentRiskScore = () => {
    let score = 0;

    events.forEach((event) => {
      const text = event.text || event;

      if (text.includes("Tab Switch")) score += 15;
      else if (text.includes("Copy")) score += 20;
      else if (text.includes("Paste")) score += 20;
      else if (text.includes("Right Click")) score += 10;
      else if (text.includes("No Face")) score += 20;
      else if (text.includes("Multiple Faces")) score += 30;
    });

    return score;
  };

  const currentRiskScore = getCurrentRiskScore();

  let currentRiskLabel = "Low";
  if (currentRiskScore > 20) currentRiskLabel = "Medium";
  if (currentRiskScore > 50) currentRiskLabel = "High";

  const riskWidth = `${Math.min(currentRiskScore, 100)}%`;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="exam-page">
      <div className="exam-wrap">
        <div className="exam-top">
          <div>
            <h1>Online Exam Monitoring</h1>
            <p>
              Smart suspicious activity monitoring for online and hybrid
              examinations
            </p>
            <p className="exam-subline">
              Event-based monitoring • Privacy-aware prototype • Faculty review
              support
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div className="exam-status-pill">Exam Session Active</div>
            <div className="exam-status-pill">
              ⏳ Time Left: {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="exam-student-hero">
          <div className="exam-student-left">
            <div className="exam-student-icon">👤</div>
            <div>
              <h2>{name}</h2>
              <p>Register Number: {reg}</p>
            </div>
          </div>

          <div className="exam-student-right">Monitoring Mode Enabled</div>
        </div>

        <div className="exam-privacy-box">
          Privacy Note: This prototype stores only suspicious events and does
          not continuously record full-session surveillance data.
        </div>

        <div className="exam-panel glass-panel" style={{ marginBottom: "18px" }}>
          <h3>🔒 Privacy Transparency</h3>
          <ul style={{ lineHeight: "1.8", margin: 0, paddingLeft: "20px" }}>
            <li>✔ Browser events monitored</li>
            <li>✔ Webcam preview active</li>
            <li>✔ No full video recording stored</li>
            <li>✔ Only suspicious events logged</li>
          </ul>
        </div>

        <div className="exam-panel glass-panel" style={{ marginBottom: "18px" }}>
          <h3>📊 Live Risk Meter</h3>
          <p className="muted">
            Current suspicious activity level during exam session
          </p>

          <div
            style={{
              marginTop: "12px",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            Risk Level: {currentRiskLabel} ({currentRiskScore})
          </div>

          <div className="progress-track" style={{ background: "#e5e7eb" }}>
            <div
              className={`progress-fill ${
                currentRiskLabel === "Low"
                  ? "fill-blue"
                  : currentRiskLabel === "Medium"
                  ? "fill-orange"
                  : "fill-purple"
              }`}
              style={{ width: riskWidth }}
            ></div>
          </div>
        </div>

        {warning && <div className="exam-warning-box">Warning: {warning}</div>}

        <div className="exam-grid">
          <div className="exam-panel glass-panel">
            <h3>🎥 Live Webcam Monitoring</h3>

            <div className="webcam-frame">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="webcam-feed"
              />
            </div>

            <div style={{ marginTop: "14px", fontWeight: "bold" }}>
              Face Detection Status: {faceStatus}
            </div>

            <div className="muted" style={{ marginTop: "8px" }}>
              {isAnalyzing
                ? "Analyzing current frame..."
                : "Automatic analysis runs every 5 seconds"}
            </div>

            <div className="sim-btn-group">
              <button className="sim-btn blue-btn" onClick={analyzeCurrentFrame}>
                Check Face Now
              </button>
            </div>
          </div>

          <div className="exam-panel answer-panel">
            <h3>📝 Answer Submission</h3>

            <div className="question-card">
              <strong>Question:</strong> What is Artificial Intelligence?
            </div>

            <textarea
              className="premium-textarea"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            <button className="submit-exam-btn" onClick={submitExam}>
              Submit Exam
            </button>
          </div>
        </div>

        <div className="exam-bottom-grid">
          <div className="exam-panel glass-panel">
            <h3>⚠ Suspicious Events</h3>

            {events.length === 0 ? (
              <p className="muted">No suspicious activity detected</p>
            ) : (
              <ul className="event-list">
                {events.map((event, index) => (
                  <li key={index}>
                    <strong>{event.text || event}</strong>
                    {event.time && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "13px",
                          opacity: 0.8,
                        }}
                      >
                        ({event.time})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamPage;