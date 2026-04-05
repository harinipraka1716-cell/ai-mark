function Dashboard() {
  const name = localStorage.getItem("name") || "Student";
  const reg = localStorage.getItem("reg") || "N/A";
  const answer = localStorage.getItem("answer") || "";
  const events = JSON.parse(localStorage.getItem("events")) || [];

  const getBehaviorScore = () => {
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

  const getPlagiarismScore = () => {
    if (!answer.trim()) return 0;

    const ref =
      "Artificial intelligence is the simulation of human intelligence by machines";
    const words = answer.toLowerCase().split(/\s+/);
    const refWords = ref.toLowerCase().split(/\s+/);

    let match = 0;
    words.forEach((word) => {
      if (refWords.includes(word)) match++;
    });

    return Math.min(100, Math.round((match / refWords.length) * 100));
  };

  const behaviorScore = getBehaviorScore();
  const plagiarismScore = getPlagiarismScore();
  const integrityScore = Math.max(0, 100 - behaviorScore);

  let risk = "Low";
  if (behaviorScore > 20) risk = "Medium";
  if (behaviorScore > 50) risk = "High";

  const riskClass =
    risk === "Low"
      ? "risk-low"
      : risk === "Medium"
      ? "risk-medium"
      : "risk-high";

  let recommendation = "No action required";
  if (behaviorScore > 20 || plagiarismScore > 30) {
    recommendation = "Manual review recommended";
  }
  if (behaviorScore > 50 || plagiarismScore > 60) {
    recommendation = "High suspicion - verify exam attempt";
  }

  let patternAlert = "";
  if (events.length >= 4) {
    patternAlert =
      "Multiple suspicious activities detected within a short session. Possible cheating pattern identified.";
  }

  let integrityBadge = "Gold";
  let badgeColor = "#ca8a04";

  if (behaviorScore > 20) {
    integrityBadge = "Silver";
    badgeColor = "#64748b";
  }
  if (behaviorScore > 50) {
    integrityBadge = "Red Alert";
    badgeColor = "#dc2626";
  }

  let aiSummary = "";
  if (behaviorScore < 20 && plagiarismScore < 20) {
    aiSummary =
      "The exam session appears normal with minimal suspicious activity. The answer similarity level is also low, so this attempt seems fair and clean.";
  } else if (behaviorScore < 50) {
    aiSummary =
      "Moderate suspicious behaviour was detected during the exam session. The attempt may require faculty review to confirm whether the activity was intentional or incidental.";
  } else {
    aiSummary =
      "High suspicious behaviour was detected during the exam session. Combined monitoring signals suggest this attempt should be verified carefully by faculty.";
  }

  const plagiarismWidth = `${plagiarismScore}%`;
  const behaviorWidth = `${Math.min(behaviorScore, 100)}%`;
  const eventWidth = `${Math.min(events.length * 20, 100)}%`;
  const integrityWidth = `${integrityScore}%`;

  return (
    <div className="dash-page">
      <div className="dash-wrap">
        <div className="dash-top">
          <div>
            <h1>Faculty Integrity Dashboard</h1>
            <p>
              Smart academic integrity report based on behavior monitoring and
              plagiarism analysis
            </p>
            <p className="dash-subline">
              Exam Session Status: Completed • Monitoring Pipeline: Active •
              Review Mode: Faculty Only
            </p>
          </div>

          <div className={`risk-pill ${riskClass}`}>{risk} Risk</div>
        </div>

        <div className="student-hero">
          <div className="student-left">
            <div className="student-icon">👨‍🎓</div>
            <div>
              <h2>{name}</h2>
              <p>Register Number: {reg}</p>
            </div>
          </div>

          <div className="student-right">Faculty Review Ready</div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <div className="stat-head">📄 Plagiarism Score</div>
            <h3>{plagiarismScore}%</h3>
            <div className="progress-track">
              <div
                className="progress-fill fill-blue"
                style={{ width: plagiarismWidth }}
              ></div>
            </div>
            <small>Answer similarity level</small>
          </div>

          <div className="stat-card stat-orange">
            <div className="stat-head">⚠ Behavior Score</div>
            <h3>{behaviorScore}</h3>
            <div className="progress-track">
              <div
                className="progress-fill fill-orange"
                style={{ width: behaviorWidth }}
              ></div>
            </div>
            <small>Suspicious activity weight</small>
          </div>

          <div className="stat-card stat-purple">
            <div className="stat-head">📊 Total Events</div>
            <h3>{events.length}</h3>
            <div className="progress-track">
              <div
                className="progress-fill fill-purple"
                style={{ width: eventWidth }}
              ></div>
            </div>
            <small>Detected suspicious events</small>
          </div>

          <div className="stat-card stat-blue">
            <div className="stat-head">🛡 Integrity Confidence</div>
            <h3>{integrityScore}%</h3>
            <div className="progress-track">
              <div
                className="progress-fill fill-blue"
                style={{ width: integrityWidth }}
              ></div>
            </div>
            <small>Estimated fairness of exam attempt</small>
          </div>
        </div>

        {patternAlert && (
          <div className="panel glass-panel" style={{ marginBottom: "20px" }}>
            <h3>Pattern Alert</h3>
            <p
              style={{
                color: "#b91c1c",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              {patternAlert}
            </p>
            <p className="muted">
              This alert is generated when multiple suspicious events are logged
              during the exam session.
            </p>
          </div>
        )}

        <div className="main-grid">
          <div className="panel glass-panel">
            <h3>Detected Suspicious Events</h3>

            {events.length === 0 ? (
              <p className="muted">No suspicious events detected</p>
            ) : (
              <ul className="event-list">
                {events.map((event, index) => (
                  <li key={index}>
                    ⚠ {event.text || event}
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

          <div className="panel glass-panel">
            <h3>Student Answer</h3>
            <div className="answer-box">
              {answer ? answer : "No answer submitted"}
            </div>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="panel final-panel">
            <h3>Final Integrity Decision Support</h3>
            <p>
              This report combines browser-based suspicious activity detection,
              simulated webcam event monitoring, and plagiarism analysis to help
              faculty review exam integrity.
            </p>
          </div>

          <div className="panel privacy-panel">
            <h3>Privacy-Aware Monitoring</h3>
            <p>
              This prototype stores only suspicious events instead of
              continuously recording the complete exam session, reducing privacy
              concerns.
            </p>
          </div>

          <div className="panel glass-panel">
            <h3>Faculty Recommendation</h3>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                color: "#7c3aed",
                marginBottom: "10px",
              }}
            >
              {recommendation}
            </p>
            <p className="muted">
              Recommendation is based on suspicious behavior score and
              plagiarism score.
            </p>
          </div>
        </div>

        <div className="bottom-grid" style={{ marginTop: "20px" }}>
          <div className="panel glass-panel">
            <h3>AI Integrity Summary</h3>
            <p style={{ lineHeight: "1.7" }}>{aiSummary}</p>
          </div>

          <div className="panel glass-panel">
            <h3>Student Integrity Badge</h3>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "22px",
                color: badgeColor,
                marginBottom: "10px",
              }}
            >
              {integrityBadge}
            </p>
            <p className="muted">
              Badge is assigned based on the overall suspicious behavior level
              detected during the exam session.
            </p>
          </div>

          <div className="panel glass-panel">
            <h3>Evidence Review Status</h3>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                color: "#2563eb",
                marginBottom: "10px",
              }}
            >
              Event-based evidence available
            </p>
            <p className="muted">
              Suspicious browser actions and simulated monitoring events are
              logged with timestamps for faculty review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;