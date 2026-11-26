// window.APP_CONFIG = {
//   API_BASE: "/api",
//   PASS_MARK: 10,
//   EXAM_MINUTES: 8,
// };

const isLocal =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost";

window.APP_CONFIG = {
  API_BASE: isLocal
    ? "http://127.0.0.1:8000/api"
    : "https://vicman-quiz.onrender.com/api",
  PASS_MARK: 10,
  EXAM_MINUTES: 8,
};

// const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
//     ? "http://127.0.0.1:8000" 
//     : "https://onrender.com"; // Paste your exact Render URL here

  // Do this for new.html, new_login.html, quiz.html, and results.html as appropriate.
// 4. In every JS file, replace hardcoded URLs:
// const API_BASE = window.APP_CONFIG.API_BASE;
// Then use ${API_BASE}/signup/, ${API_BASE}/login/, etc.