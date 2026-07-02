// Firebase initialization (nu-cybersec-games project, gameResults collection)
const _fbApp = firebase.initializeApp({
  apiKey: "AIzaSyBjpwTbjBnKbD5KKxXmw5eRAx5IOoWI9nY",
  authDomain: "nu-cybersec-games.firebaseapp.com",
  projectId: "nu-cybersec-games",
  storageBucket: "nu-cybersec-games.firebasestorage.app",
  messagingSenderId: "771818733994",
  appId: "1:771818733994:web:152ea862686c76aa912bd3"
});
const _db = firebase.firestore();
const _auth = firebase.auth();

// State variables
let state = {
  playerName: "GUEST",
  studentId: "N/A",
  googleUserEmail: null,
  currentLevelIdx: 0,
  score: 0,
  timeStart: 0,
  timeElapsed: 0,
  gameStart: 0,
  timerInterval: null
};

// Available Operation definitions for drag-and-drop panel
const OPERATIONS = [
  { id: "fromBase64", name: "From Base64", desc: "Decode Base64 payload", params: [] },
  { id: "toBase64", name: "To Base64", desc: "Encode raw bytes to Base64", params: [] },
  { id: "fromHex", name: "From Hex", desc: "Convert Hex digits to String", params: [] },
  { id: "toHex", name: "To Hex", desc: "Convert String to Hex digits", params: [] },
  { 
    id: "xor", 
    name: "XOR", 
    desc: "Symmetric bitwise XOR encryption", 
    params: [
      { key: "key", label: "Key", type: "text", default: "0x30", placeholder: "e.g. 0x30 or key" }
    ] 
  },
  { id: "sha256", name: "SHA-256 Hash", desc: "Generate SHA-256 hash checksum", params: [] },
  { 
    id: "aesDecrypt", 
    name: "AES Decrypt", 
    desc: "Decrypt AES-256-CBC ciphertext", 
    params: [
      { key: "key", label: "Key", type: "text", default: "cpe_iie_secret_key", placeholder: "Decryption Key" },
      { key: "iv", label: "IV", type: "text", default: "iv_init_vector123", placeholder: "Init Vector (16 chars)" }
    ] 
  }
];

// DOM references
const screens = {
  start: document.getElementById("start-screen"),
  brief: document.getElementById("brief-screen"),
  game: document.getElementById("game-screen"),
  result: document.getElementById("result-screen")
};

const topbar = {
  playerDisplayName: document.getElementById("player-display-name"),
  playerBadge: document.getElementById("player-badge"),
  scanlineToggleBtn: document.getElementById("scanline-toggle-btn")
};

const oauthUI = {
  btnSettings: document.getElementById("oauth-settings-btn"),
  modal: document.getElementById("oauth-settings-modal"),
  closeBtn: document.getElementById("close-oauth-modal-btn"),
  clientIdInput: document.getElementById("oauth-client-id"),
  saveBtn: document.getElementById("save-oauth-btn"),
  clearBtn: document.getElementById("clear-oauth-btn"),
  loginSection: document.getElementById("google-login-section"),
  googleBtn: document.getElementById("google-signin-btn")
};

const gameUI = {
  levelBadge: document.getElementById("level-badge"),
  levelName: document.getElementById("level-name"),
  scoreDisplay: document.getElementById("score-display"),
  timeDisplay: document.getElementById("time-display"),
  levelScenario: document.getElementById("level-scenario"),
  hintButton: document.getElementById("hint-button"),
  hintPanel: document.getElementById("hint-panel"),
  hintText: document.getElementById("hint-text"),
  operationsList: document.getElementById("operations-list"),
  recipePipeline: document.getElementById("recipe-pipeline"),
  dataInput: document.getElementById("data-input"),
  dataOutput: document.getElementById("data-output"),
  executionLogs: document.getElementById("execution-logs"),
  submitRecipeBtn: document.getElementById("submit-recipe-btn")
};

const resultUI = {
  evalName: document.getElementById("eval-name"),
  evalId: document.getElementById("eval-id"),
  evalBadge: document.getElementById("eval-badge"),
  evalTitle: document.getElementById("eval-title"),
  evalScore: document.getElementById("eval-score"),
  showCertBtn: document.getElementById("show-cert-button"),
  restartBtn: document.getElementById("restart-button")
};

const certUI = {
  certModal: document.getElementById("cert-modal"),
  closeCertBtn: document.getElementById("close-cert-button"),
  certificate: document.getElementById("certificate"),
  recipientName: document.getElementById("cert-recipient-name"),
  recipientId: document.getElementById("cert-recipient-id"),
  date: document.getElementById("cert-date"),
  hash: document.getElementById("cert-hash"),
  printBtn: document.getElementById("print-button"),
  dismissBtn: document.getElementById("dismiss-modal-button")
};

// Initial setup on load
document.addEventListener("DOMContentLoaded", () => {
  // Load scanline preferences
  const isScanlineOff = localStorage.getItem("scanlines_disabled") === "true";
  if (isScanlineOff) {
    document.body.classList.add("no-scanlines");
    topbar.scanlineToggleBtn.textContent = "CRT SCREEN: OFF";
  }

  // Scanline toggle click listener
  topbar.scanlineToggleBtn.addEventListener("click", () => {
    const isCurrentlyOff = document.body.classList.contains("no-scanlines");
    if (isCurrentlyOff) {
      document.body.classList.remove("no-scanlines");
      topbar.scanlineToggleBtn.textContent = "CRT SCREEN: ON";
      localStorage.setItem("scanlines_disabled", "false");
    } else {
      document.body.classList.add("no-scanlines");
      topbar.scanlineToggleBtn.textContent = "CRT SCREEN: OFF";
      localStorage.setItem("scanlines_disabled", "true");
    }
  });

  // Login form submit prevention
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // Game action listeners
  gameUI.hintButton.addEventListener("click", () => {
    gameUI.hintPanel.classList.toggle("is-hidden");
  });

  gameUI.submitRecipeBtn.addEventListener("click", verifyPipeline);

  // Brief screen: enter lab button
  document.getElementById("start-game-btn").addEventListener("click", initializeGame);

  // Result screen actions
  resultUI.restartBtn.addEventListener("click", () => {
    showScreen("start");
  });
  resultUI.showCertBtn.addEventListener("click", openCertificate);

  // Cert modal actions
  certUI.closeCertBtn.addEventListener("click", closeCertificate);
  certUI.dismissBtn.addEventListener("click", closeCertificate);
  certUI.printBtn.addEventListener("click", () => window.print());

  // OAuth Settings handlers
  oauthUI.btnSettings.addEventListener("click", () => {
    const savedId = localStorage.getItem("google_oauth_client_id") || "";
    oauthUI.clientIdInput.value = savedId;
    oauthUI.modal.classList.remove("is-hidden");
  });
  oauthUI.closeBtn.addEventListener("click", () => {
    oauthUI.modal.classList.add("is-hidden");
  });
  oauthUI.saveBtn.addEventListener("click", () => {
    const id = oauthUI.clientIdInput.value.trim();
    if (id) {
      localStorage.setItem("google_oauth_client_id", id);
      oauthUI.modal.classList.add("is-hidden");
      alert("Google OAuth Client ID saved! Page reloading to apply configuration...");
      window.location.reload();
    }
  });
  oauthUI.clearBtn.addEventListener("click", () => {
    localStorage.removeItem("google_oauth_client_id");
    oauthUI.clientIdInput.value = "";
    oauthUI.modal.classList.add("is-hidden");
    alert("Google OAuth Client ID cleared! Page reloading...");
    window.location.reload();
  });

  // Load drag-and-drop operations templates
  renderOperationsList();

  // Drag-and-drop zone setup for Recipe Pipeline
  setupDragAndDropZone();

  // Load Google Identity Services dynamically
  initializeGoogleGSI();
});

// Switch screens helper
function showScreen(screenId) {
  Object.keys(screens).forEach(key => {
    if (key === screenId) {
      screens[key].classList.add("active");
    } else {
      screens[key].classList.remove("active");
    }
  });
}

// Generate Draggable Operations in the Left Panel
function renderOperationsList() {
  gameUI.operationsList.innerHTML = "";
  OPERATIONS.forEach(op => {
    const card = document.createElement("div");
    card.className = "op-card";
    card.draggable = true;
    card.dataset.id = op.id;
    card.innerHTML = `<div>${op.name}</div><div style="font-size:0.7rem; color:var(--color-text-muted); font-weight:normal; margin-top:2px;">${op.desc}</div>`;
    
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", op.id);
      e.dataTransfer.effectAllowed = "copy";
    });
    
    gameUI.operationsList.appendChild(card);
  });
}

// Setup Pipeline Area Drag & Drop events
function setupDragAndDropZone() {
  const zone = gameUI.recipePipeline;

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("dragover");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    const opId = e.dataTransfer.getData("text/plain");
    const op = OPERATIONS.find(o => o.id === opId);
    if (op) {
      addOpToPipeline(op);
    }
  });
}

// Append an operation card to the center recipe pipeline
function addOpToPipeline(op) {
  const zone = gameUI.recipePipeline;
  
  // Clear placeholder if first card
  const placeholder = zone.querySelector(".pipeline-empty-placeholder");
  if (placeholder) {
    zone.innerHTML = "";
  }

  const card = document.createElement("div");
  card.className = "recipe-card";
  card.dataset.id = op.id;

  let paramsHtml = "";
  op.params.forEach(param => {
    paramsHtml += `
      <div class="param-group">
        <span class="param-label">${param.label}</span>
        <input class="param-input" type="${param.type}" data-key="${param.key}" value="${param.default}" placeholder="${param.placeholder}">
      </div>
    `;
  });

  card.innerHTML = `
    <div class="recipe-card-header">
      <span class="recipe-card-title">${op.name}</span>
      <button class="recipe-card-remove">&times;</button>
    </div>
    ${paramsHtml ? `<div class="recipe-card-body">${paramsHtml}</div>` : ""}
  `;

  // Remove button action
  card.querySelector(".recipe-card-remove").addEventListener("click", () => {
    card.remove();
    if (zone.children.length === 0) {
      zone.innerHTML = `<div class="pipeline-empty-placeholder">Drag operations here to build your recipe...</div>`;
    }
    compilePipeline();
  });

  // Parameter change triggers real-time compilation
  card.querySelectorAll(".param-input").forEach(input => {
    input.addEventListener("input", compilePipeline);
  });

  zone.appendChild(card);
  compilePipeline();
}

// Run the pipeline transformations in real-time
async function compilePipeline() {
  const inputData = gameUI.dataInput.value;
  const cards = gameUI.recipePipeline.querySelectorAll(".recipe-card");
  
  if (cards.length === 0) {
    gameUI.dataOutput.value = "";
    gameUI.executionLogs.innerHTML = `<div class="console-log-line">[SYSTEM] Pipeline idle. Waiting for recipe parameters.</div>`;
    return;
  }

  let currentData = inputData;
  let logHtml = `<div class="console-log-line text-green">[SYSTEM] Executing recipe pipeline...</div>`;
  let stepIdx = 1;

  for (let card of cards) {
    const opId = card.dataset.id;
    const opName = card.querySelector(".recipe-card-title").textContent;
    
    // Extract parameters
    const params = {};
    card.querySelectorAll(".param-input").forEach(input => {
      params[input.dataset.key] = input.value;
    });

    try {
      if (opId === "fromBase64") {
        currentData = converters.fromBase64(currentData);
      } else if (opId === "toBase64") {
        currentData = converters.toBase64(currentData);
      } else if (opId === "fromHex") {
        currentData = converters.fromHex(currentData);
      } else if (opId === "toHex") {
        currentData = converters.toHex(currentData);
      } else if (opId === "xor") {
        currentData = converters.xor(currentData, params.key);
      } else if (opId === "sha256") {
        currentData = await converters.sha256(currentData);
      } else if (opId === "aesDecrypt") {
        currentData = await converters.aesDecrypt(currentData, params.key, params.iv);
      }

      // Check for inline errors
      if (currentData.startsWith("[ERROR")) {
        logHtml += `<div class="console-log-line text-danger">Step ${stepIdx}: ${opName} failed - ${currentData}</div>`;
        gameUI.dataOutput.value = currentData;
        gameUI.executionLogs.innerHTML = logHtml;
        return;
      }

      // Print step stats
      const outputSnippet = currentData.length > 30 ? currentData.slice(0, 30) + "..." : currentData;
      logHtml += `<div class="console-log-line">Step ${stepIdx}: ${opName} completed. Output snippet: "${outputSnippet}" (${currentData.length} chars)</div>`;
    } catch (e) {
      logHtml += `<div class="console-log-line text-danger">Step ${stepIdx}: ${opName} critical execution error.</div>`;
      gameUI.dataOutput.value = "[CRITICAL OPERATION ERROR]";
      gameUI.executionLogs.innerHTML = logHtml;
      return;
    }
    stepIdx++;
  }

  logHtml += `<div class="console-log-line text-green">[SYSTEM] Pipeline executed successfully.</div>`;
  gameUI.dataOutput.value = currentData;
  gameUI.executionLogs.innerHTML = logHtml;
  
  // Auto-scroll logs to bottom
  gameUI.executionLogs.scrollTop = gameUI.executionLogs.scrollHeight;
}

// Initialise Google GSI configuration
function initializeGoogleGSI() {
  const oauthId = localStorage.getItem("google_oauth_client_id") || "69112486306-t7mofej13egi7ape3t2cgs5l19tg6sp7.apps.googleusercontent.com";
  if (oauthId && oauthUI.loginSection) {
    oauthUI.loginSection.classList.remove("is-hidden");

    window.handleGoogleCredentialResponse = (response) => {
      try {
        const payload = JSON.parse(atob(response.credential.split(".")[1]));
        const email = payload.email || "";

        if (!email.toLowerCase().endsWith("@nu.ac.th")) {
          alert("ACCESS DENIED: Google Sign-In is locked to Naresuan University accounts (@nu.ac.th).");
          return;
        }

        state.playerName = payload.name || "STUDENT";
        state.googleUserEmail = email;

        const studentIdMatch = email.match(/^(\d{10})@/);
        if (studentIdMatch) {
          state.studentId = studentIdMatch[1];
        } else {
          state.studentId = "STAFF/INSTRUCTOR";
        }

        // Sign into Firebase with the Google credential (enables Firestore security rules)
        const fbCredential = firebase.auth.GoogleAuthProvider.credential(response.credential);
        _auth.signInWithCredential(fbCredential).catch(e => console.warn("Firebase sign-in:", e));

        // Show knowledge brief before starting the game
        showScreen("brief");
      } catch (e) {
        console.error("JWT credential decode error", e);
        alert("Failed to parse Google sign-in payload.");
      }
    };

    setTimeout(() => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: oauthId,
          callback: window.handleGoogleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          oauthUI.googleBtn,
          { theme: "outline", size: "large", width: 280 }
        );
      }
    }, 800);
  }
}

// Game controller logic
function initializeGame() {
  // Update header HUD display profile
  topbar.playerDisplayName.textContent = state.playerName.toUpperCase();
  topbar.playerBadge.textContent = "🔑";
  document.getElementById("user-badge-container").classList.remove("is-hidden");

  state.currentLevelIdx = 0;
  state.score = 0;
  state.gameStart = Date.now();

  showScreen("game");
  loadLevel();
}

function loadLevel() {
  const lvl = LEVELS[state.currentLevelIdx];
  
  // HUD UI updates
  gameUI.levelBadge.textContent = `${(state.currentLevelIdx + 1).toString().padStart(2, "0")}/${LEVELS.length.toString().padStart(2, "0")}`;
  gameUI.levelName.textContent = lvl.title;
  gameUI.scoreDisplay.textContent = state.score.toString().padStart(4, "0");
  
  // Content values
  gameUI.levelScenario.textContent = lvl.scenario;
  gameUI.hintText.textContent = lvl.hint;
  gameUI.hintPanel.classList.add("is-hidden");

  // Inputs
  gameUI.dataInput.value = lvl.input;
  gameUI.dataOutput.value = "";
  
  // Clear recipe pipeline area
  gameUI.recipePipeline.innerHTML = `<div class="pipeline-empty-placeholder">Drag operations here to build your recipe...</div>`;
  gameUI.executionLogs.innerHTML = `<div class="console-log-line">[SYSTEM] Level loaded. Waiting for recipe pipeline configuration...</div>`;

  // Start timer
  state.timeStart = Date.now();
  if (state.timerInterval) clearInterval(state.timerInterval);
  
  state.timerInterval = setInterval(() => {
    state.timeElapsed = Math.floor((Date.now() - state.timeStart) / 1000);
    const mins = Math.floor(state.timeElapsed / 60).toString().padStart(2, "0");
    const secs = (state.timeElapsed % 60).toString().padStart(2, "0");
    gameUI.timeDisplay.textContent = `${mins}:${secs}`;
  }, 1000);
}

// Verify output string matches targets
async function verifyPipeline() {
  const lvl = LEVELS[state.currentLevelIdx];
  const outputVal = gameUI.dataOutput.value.trim();

  if (outputVal === lvl.target) {
    // Correct! Stop timers and calculate score
    clearInterval(state.timerInterval);
    const levelScore = calculateScore(100, state.timeElapsed, 90);
    state.score += levelScore;

    alert(`CORRECT! Validation Successful.\nLevel score: ${levelScore} points.\n\nExplanation:\n${lvl.explanation}`);

    state.currentLevelIdx++;
    if (state.currentLevelIdx < LEVELS.length) {
      loadLevel();
    } else {
      endGame();
    }
  } else {
    // Mismatch
    alert("VALIDATION MISMATCH: The output string does not match the target verification vector.\nReview your pipeline configuration, parameters, or operation order!");
  }
}

// Finished all levels
function endGame() {
  showScreen("result");
  
  // Compile outcomes
  const scores = LEVELS.map((l, idx) => ({ id: l.id, correct: true })); // verified solved to reach here
  const outcome = evaluateLearningOutcome(scores);

  resultUI.evalName.textContent = state.playerName.toUpperCase();
  resultUI.evalId.textContent = state.studentId !== "N/A" && state.studentId.length > 0 ? `Student ID: ${state.studentId}` : "N/A";
  resultUI.evalBadge.textContent = outcome.badge;
  resultUI.evalTitle.textContent = outcome.title;
  resultUI.evalScore.textContent = state.score.toString().padStart(4, "0");

  saveGameStats();
}

async function saveGameStats() {
  if (!state.googleUserEmail) return;
  const totalSeconds = state.gameStart ? Math.floor((Date.now() - state.gameStart) / 1000) : 0;
  try {
    await _db.collection("gameResults").add({
      gameId: "cyberchef-puzzle-lab",
      playerName: state.playerName,
      email: state.googleUserEmail,
      studentId: state.studentId,
      score: state.score,
      levelsCompleted: LEVELS.length,
      timeTakenSeconds: totalSeconds,
      completedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error("Stats save failed:", e);
  }
}

// Certificate actions
function openCertificate() {
  certUI.recipientName.textContent = state.playerName.toUpperCase();
  let idText = state.studentId !== "N/A" && state.studentId.length > 0 ? `Student ID: ${state.studentId}` : "";
  if (state.googleUserEmail) {
    idText += ` | Account: ${state.googleUserEmail}`;
  }
  certUI.recipientId.textContent = idText;

  const today = new Date().toISOString().split("T")[0];
  certUI.date.textContent = today;

  // Verify hash code compilation
  const rawHash = `${state.playerName}_${state.score}_${state.studentId}_${state.googleUserEmail || ""}_${today}_CYBERCHEF_LAB`;
  let val = 0;
  for (let i = 0; i < rawHash.length; i++) {
    val = (val << 5) - val + rawHash.charCodeAt(i);
    val |= 0;
  }
  certUI.hash.textContent = `SHA256_${Math.abs(val).toString(16).toUpperCase()}_CYBERCHEF_NU`;

  certUI.certModal.classList.remove("is-hidden");
}

function closeCertificate() {
  certUI.certModal.classList.add("is-hidden");
}
