console.log("CortexCop.AI frontend connected to Render backend");

// 🌐 Your live backend base URL — replace with your actual one if different
const API_BASE = "https://cortexcop-ai.onrender.com";

let map;
let markers = [];

window.onload = () => {
  initMap();
  addMessage("bot", "🧠 CortexCop.AI initialized. Ready for crime prediction.");
  fetchIncidents();
  setInterval(fetchLiveUpdates, 10000);
};

function initMap() {
  map = L.map("map").setView([12.9716, 77.5946], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
}

function addMessage(sender, text) {
  const chatlog = document.getElementById("chatlog");
  const div = document.createElement("div");
  div.className = sender;
  div.innerText = text;
  chatlog.appendChild(div);
  chatlog.scrollTop = chatlog.scrollHeight;
}

function askPreset(text) {
  document.getElementById("userInput").value = text;
  sendMessage();
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;
  addMessage("user", "👤 " + message);
  input.value = "";

  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  statusDot.className = "status-dot processing";
  statusText.textContent = "Processing...";

  fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
    .then((res) => res.json())
    .then((data) => {
      addMessage("bot", "🤖 " + data.reply);
      if (data.patrol) drawPatrols();
      statusDot.className = "status-dot online";
      statusText.textContent = "System Online";
    })
    .catch((err) => {
      console.error("Chat error:", err);
      addMessage("bot", "⚠️ System error. Try again.");
      statusDot.className = "status-dot online";
      statusText.textContent = "Online";
    });
}

function fetchIncidents() {
  fetch(`${API_BASE}/api/incidents`)
    .then((res) => res.json())
    .then((data) => plotCrimes(data))
    .catch((err) => console.error("Incident fetch failed:", err));
}

function plotCrimes(crimes) {
  markers.forEach((m) => m.remove());
  markers = [];
  crimes.forEach((crime) => {
    const color = crime.severity >= 4 ? "red" : crime.severity >= 3 ? "orange" : "green";
    const marker = L.circleMarker([crime.latitude, crime.longitude], {
      radius: 8,
      color,
      fillOpacity: 0.6,
    }).addTo(map);
    marker.bindPopup(`<b>${crime.area}</b><br>${crime.type}<br>Severity: ${crime.severity}`);
    markers.push(marker);
  });
}

function drawPatrols() {
  addMessage("bot", "🚓 Patrol units deployed across active zones.");
}

function fetchLiveUpdates() {
  fetch(`${API_BASE}/api/live_updates`)
    .then((res) => res.json())
    .then((data) => {
      plotCrimes(data);
      addMessage("bot", "📡 Live update: new incidents detected.");
    })
    .catch((err) => console.error("Live update failed:", err));
}
