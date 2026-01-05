const generateBtn = document.querySelector(".generate-btn");
const jsonInput = document.querySelector(".json-input");
const titleInput = document.querySelector(".title-input");

async function fileToDataURL(path, type = 'audio') {
  const data = await fetch(path).then(r => r.arrayBuffer());
  const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  const ext = path.split('.').pop();
  return `data:${type}/${ext};base64,${base64}`;
}
generateBtn.addEventListener('click', async () => {
  try {
    const jsonValue = jsonInput.value.trim();
    const titleValue = titleInput.value.trim() || "GALACTIC BATTLE Game";
    
    if (!jsonValue) {
      alert('Please enter some JSON data.');
      return;
    }

    const questions = JSON.parse(jsonValue);
    if (!Array.isArray(questions)) throw new Error('JSON must be an array of questions');

    const htmlContent = await generateHTMLFile(questions, titleValue);

    // تنزيل ملف HTML مباشرة
    const blob = new Blob([htmlContent], { type: "text/html" });
    saveAs(blob, `${titleValue}.html`);

  } catch(err) {
    alert("Error: " + err.message);
    console.error(err);
  }
});



async function generateHTMLFile(questions,titleValue){
  const threeJsData = await fetch('./three.min.js').then(r => r.text());

  // تحويل الأصوات إلى Data URLs
  const laserDataURL = await fileToDataURL('laser.mp3');
  const popDataURL = await fileToDataURL('pop.mp3');
    const htmlContent =`<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galactic Battle</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Orbitron', sans-serif;
      font-size: 21.6px;
    }

    body {
      background: linear-gradient(135deg, #0a0a2a, #1a1a4a, #0a0a2a);
      color: #e0e0ff;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
      perspective: 1000px;
    }

    header {
      text-align: center;
      padding: 15px 0;
      background: rgba(0, 0, 20, 0.7);
      border-bottom: 2px solid #00f7ff;
      box-shadow: 0 0 20px rgba(0, 247, 255, 0.3);
      z-index: 10;
      position: relative;
    }

    h1 {
      font-size: 2.52rem;
      margin-bottom: 5px;
      text-shadow: 0 0 15px #00f7ff, 0 0 25px #0066ff;
      letter-spacing: 3px;
      background: linear-gradient(to right, #00f7ff, #0066ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 21.6px;
      opacity: 0.9;
      max-width: 800px;
      margin: 0 auto;
      color: #a0f0ff;
    }

    .menu-screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 20, 0.95);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .menu-title {
      font-size: 2.7rem;
      margin-bottom: 30px;
      text-shadow: 0 0 20px #00f7ff;
      color: #00f7ff;
    }

    .menu-buttons {
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
    }

    .menu-btn {
      background: linear-gradient(to bottom, #00f7ff, #0066ff);
      color: white;
      border: none;
      padding: 15px 40px;
      font-size: 21.6px;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 5px 20px rgba(0, 247, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: bold;
      min-width: 300px;
    }

    .menu-btn:hover {
      background: linear-gradient(to bottom, #00ffff, #0088ff);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 247, 255, 0.7);
    }

    .game-container {
      display: flex;
      flex: 1;
      padding: 15px;
      gap: 20px;
      position: relative;
    }

    #game-canvas {
      flex: 1.4;
      background: rgba(0, 5, 15, 0.8);
      border-radius: 10px;
      border: 2px solid #0066ff;
      box-shadow: 0 0 30px rgba(0, 102, 255, 0.4);
      position: relative;
      overflow: hidden;
      height: calc(100vh - 180px);
    }

    .control-panel {
      width: 248px;
      background: rgba(0, 10, 30, 0.85);
      border-radius: 10px;
      padding: 20px;
      border: 2px solid #ff3366;
      box-shadow: 0 0 20px rgba(255, 51, 102, 0.3);
      display: flex;
      flex-direction: column;
      gap: 20px;
      z-index: 5;
      max-height: calc(100vh - 180px);
      overflow-y: auto;
    }

    .right-panel {
      width: 234px;
      background: rgba(0, 10, 30, 0.85);
      border-radius: 10px;
      padding: 20px;
      border: 2px solid #cc66ff;
      box-shadow: 0 0 20px rgba(204, 102, 255, 0.3);
      display: flex;
      flex-direction: column;
      gap: 20px;
      z-index: 5;
      max-height: calc(100vh - 150px);
      overflow-y: auto;
    }

    .control-panel::-webkit-scrollbar,
    .right-panel::-webkit-scrollbar {
      width: 8px;
    }

    .control-panel::-webkit-scrollbar-track,
    .right-panel::-webkit-scrollbar-track {
      background: rgba(0, 10, 30, 0.5);
      border-radius: 4px;
    }

    .control-panel::-webkit-scrollbar-thumb,
    .right-panel::-webkit-scrollbar-thumb {
      background-color: #ff3366;
      border-radius: 4px;
    }

    .player-info {
      display: flex;
      flex-direction: row;
      gap: 15px;
    }

    .player-stats {
      flex: 1;
      min-width:0;
      background: rgba(20, 30, 60, 0.85);
      padding: 12px 15px;
      border-radius: 10px;
      border: 2px solid #00b4ff;
      transition: all 0.3s;
      text-align: center;
      position: relative;
    }

    .player-stats.active {
      border-color: #00ff88;
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
      transform: scale(1.05);
    }

    .player2-stats {
      border-color: #ff3366;
    }

    .player2-stats.active {
      border-color: #ff0066;
      box-shadow: 0 0 15px rgba(255, 0, 102, 0.5);
    }

    .player-name {
      font-size: 12px;
      font-weight: bold;
      color: #00f7ff;
      margin-bottom: 10px;
    }

    .player2-name {
      color: #ff3366;
    }

    .turn-indicator {
      font-size: 11px;
      color: #00ff00;
      animation: pulse 1s infinite;
      margin-top: 5px;
    }

    @keyframes pulse {

      0%,
      100% {
        opacity: 0.5;
      }

      50% {
        opacity: 1;
      }
    }

    .question-section {
      background: rgba(30, 15, 50, 0.85);
      padding: 18px 20px;
      border-radius: 10px;
      border: 1px solid #cc66ff;
      box-shadow: 0 0 18px rgba(204, 102, 255, 0.3);
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .question-counter {
      text-align: center;
      color: #cc66ff;
      font-size: 18px;
      font-weight: 500;
    }

    .question-text {
      font-size: 17.5px;
      margin-bottom: 12px;
      color: #ffffff;
      text-align: center;
      line-height: 1.5;
    }

    .answer-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .modal-answer-options {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 20px;
      margin-top: 20px;
    }

    .modal-answer-btn {
      background: linear-gradient(to bottom, #3a3a3a, #1e1e1e);
      color: #fff;
      border: 2px solid #666;
      padding: 10px 16px;
      font-size: 16px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.25s;
      width: 100%;
    }

    .modal-answer-btn:hover {
      background: linear-gradient(to bottom, #6a6a6a, #4a4a4a);
      border-color: #cc66ff;
      transform: translateX(5px);
    }

    .modal-answer-btn.correct {
      background: linear-gradient(to bottom, #00ff88, #00cc66);
      border-color: #00ff88;
    }

    .modal-answer-btn.incorrect {
      background: linear-gradient(to bottom, #ff3366, #cc0000);
      border-color: #ff3366;
    }

    .modal-answer-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }


    .answer-btn {
      background: linear-gradient(to bottom, #3a3a3a, #1e1e1e);
      color: #fff;
      border: 2px solid #666;
      padding: 10px 16px;
      font-size: 16px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.25s;
    }

    .answer-btn:hover {
      background: linear-gradient(to bottom, #6a6a6a, #4a4a4a);
      border-color: #cc66ff;
      transform: translateX(5px);
    }

    .answer-btn.correct {
      background: linear-gradient(to bottom, #00ff88, #00cc66);
      border-color: #00ff88;
    }

    .answer-btn.incorrect {
      background: linear-gradient(to bottom, #ff3366, #cc0000);
      border-color: #ff3366;
    }

    .answer-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .next-btn {
      background: linear-gradient(to bottom, #cc66ff, #9933cc);
      color: #fff;
      border: none;
      padding: 10px 25px;
      font-size: 16px;
      border-radius: 22px;
      cursor: pointer;
      align-self: center;
      box-shadow: 0 4px 15px rgba(204, 102, 255, 0.4);
      transition: all 0.3s;
    }

    .next-btn:hover {
      background: linear-gradient(to bottom, #dd77ff, #aa44dd);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(204, 102, 255, 0.7);
    }

    .next-btn:disabled {
      background: #555;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .combat-log {
      background: rgba(0, 0, 25, 0.7);
      padding: 15px;
      border-radius: 10px;
      border: 1px solid #ffcc00;
      overflow-y: auto;
      max-height: 180px;
      min-height: 120px;
      scrollbar-width: thin;
      scrollbar-color: #00f7ff rgba(0, 0, 25, 0.6);
    }

    .combat-log::-webkit-scrollbar {
      width: 8px;
    }

    .combat-log::-webkit-scrollbar-track {
      background: rgba(0, 0, 20, 0.6);
      border-radius: 4px;
    }

    .combat-log::-webkit-scrollbar-thumb {
      background-color: #00f7ff;
      border-radius: 4px;
    }

    .log-title {
      text-align: center;
      margin-bottom: 8px;
      color: #ffcc00;
      font-size: 18px;
      font-weight: 600;
      text-shadow: 0 0 4px rgba(255, 204, 0, 0.5);
    }

    .log-entry {
      padding: 6px;
      margin-bottom: 5px;
      border-radius: 5px;
      font-size: 15.5px;
      animation: fadeIn 0.5s;
    }

    .player-log {
      background: rgba(0, 100, 255, 0.2);
      border-left: 3px solid #00b4ff;
    }

    .enemy-log {
      background: rgba(255, 51, 102, 0.2);
      border-left: 3px solid #ff3366;
    }

    .system-log {
      background: rgba(255, 204, 0, 0.2);
      border-left: 3px solid #ffcc00;
      font-weight: bold;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .back-btn {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid #00f7ff;
      color: #00f7ff;
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 21.6px;
      z-index: 100;
    }

    .back-btn:hover {
      background: rgba(0, 247, 255, 0.2);
      transform: translateY(-2px);
    }

    .stars {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }

    .star {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      animation: twinkle var(--duration, 5s) infinite ease-in-out;
    }

    @keyframes twinkle {

      0%,
      100% {
        opacity: 0.2;
      }

      50% {
        opacity: 1;
      }
    }

    .game-over {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      border: 3px solid #00f7ff;
      z-index: 500;
    }

    .game-over h2 {
      font-size: 2.25rem;
      margin-bottom: 20px;
      color: #00f7ff;
      text-shadow: 0 0 20px #00f7ff;
    }

    .game-over p {
      font-size: 21.6px;
      margin-bottom: 30px;
      color: #ffffff;
    }

    .restart-btn {
      background: linear-gradient(to bottom, #00f7ff, #0066ff);
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 21.6px;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s;
      margin: 0 10px;
    }

    .restart-btn:hover {
      background: linear-gradient(to bottom, #00ffff, #0088ff);
      transform: translateY(-2px);
    }

    .hidden {
      display: none;
    }

    .weapon-info {
      display: flex;
      justify-content: space-around;
      margin-top: 10px;
      font-size: 19.4px;
    }

    .weapon-info div {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .laser-indicator {
      width: 12px;
      height: 3px;
      background: #00aaff;
      border-radius: 2px;
      box-shadow: 0 0 10px #00aaff;
      font-size: 12px;
    }

    .missile-indicator {
      width: 12px;
      height: 12px;
      background: #ff3366;
      border-radius: 50%;
      box-shadow: 0 0 10px #ff3366;
    }

    .team-score {
      font-size: 11px;
      color: #cc66ff;
      margin-top: 5px;
    }

    .incorrect-counter {
      font-size: 11px;
      color: #ffcc00;
      margin-top: 5px;
    }

    .progress-container {
      height: 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 5px;
      margin: 8px 0;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #00f7ff, #0066ff);
      border-radius: 5px;
      width: 0%;
      transition: width 0.5s ease;
    }

    .player2-stats .progress-bar {
      background: linear-gradient(90deg, #ff3366, #ff0066);
    }

    .right-panel-btn {
      background: linear-gradient(to bottom, #cc66ff, #9933cc);
      color: white;
      border: none;
      padding: 13px 17px;
      font-size: 18.4px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
      margin-bottom: 15px;
      width: 100%;
      box-shadow: 0 5px 15px rgba(204, 102, 255, 0.3);
    }

    .right-panel-btn:hover {
      background: linear-gradient(to bottom, #dd77ff, #aa44dd);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(204, 102, 255, 0.5);
    }

    .dropdown {
      position: relative;
      display: inline-block;
      width: 100%;
      margin-bottom: 15px;
    }

    .dropdown-content {
      display: none;
      position: absolute;
      background: rgba(0, 10, 30, 0.95);
      min-width: 100%;
      box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.5);
      border: 2px solid #cc66ff;
      border-radius: 10px;
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
    }

    .dropdown-content::-webkit-scrollbar {
      width: 8px;
    }

    .dropdown-content::-webkit-scrollbar-track {
      background: rgba(0, 10, 30, 0.5);
    }

    .dropdown-content::-webkit-scrollbar-thumb {
      background-color: #cc66ff;
      border-radius: 4px;
    }

    .dropdown.show .dropdown-content {
      display: block;
    }

    .dropdown-item {
      color: #e0e0ff;
      padding: 10px 14px;
      text-decoration: none;
      display: block;
      font-size: 18.4px;
      border-bottom: 1px solid rgba(204, 102, 255, 0.3);
      transition: all 0.3s;
    }

    .dropdown-item:hover {
      background-color: rgba(204, 102, 255, 0.2);
      padding-left: 20px;
    }

    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 20, 0.95);
      z-index: 2000;
      overflow-y: auto;
      padding: 20px;
    }

    .modal-content {
      background: rgba(0, 10, 30, 0.95);
      margin: 50px auto;
      padding: 30px;
      border-radius: 15px;
      border: 3px solid #00f7ff;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-content::-webkit-scrollbar {
      width: 10px;
    }

    .modal-content::-webkit-scrollbar-track {
      background: rgba(0, 10, 30, 0.5);
    }

    .modal-content::-webkit-scrollbar-thumb {
      background-color: #00f7ff;
      border-radius: 5px;
    }

    .close-modal {
      color: #ff3366;
      float: right;
      font-size: 32px;
      font-weight: bold;
      cursor: pointer;
      margin-top: -10px;
    }

    .close-modal:hover {
      color: #ff0066;
    }

    .question-review-item {
      background: rgba(30, 10, 40, 0.7);
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 8px;
      border: 1px solid #cc66ff;
    }

    .question-review-item.correct {
      border-color: #00ff88;
    }

    .question-review-item.incorrect {
      border-color: #ff3366;
    }

    .review-question-number {
      color: #00f7ff;
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 21.6px;
    }

    .review-question-text {
      color: #ffffff;
      margin-bottom: 10px;
      font-size: 21.6px;
    }

    .review-answer {
      color: #ccff00;
      font-size: 21.6px;
    }

    .review-answer.correct-answer {
      color: #00ff88;
    }

    .dropdown-header {
      color: #cc66ff;
      padding: 8px;
      font-weight: bold;
      border-bottom: 2px solid #cc66ff;
      font-size: 18.4px;
    }

    .winner-cup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 20, 0.95);
      padding: 50px;
      border-radius: 30px;
      text-align: center;
      border: 4px solid #ffcc00;
      z-index: 10000;
      box-shadow: 0 0 50px rgba(255, 204, 0, 0.5);
    }

    .cup-icon {
      font-size: 120px;
      color: #ffcc00;
      margin-bottom: 20px;
      text-shadow: 0 0 30px #ffcc00;
    }

    .winner-message {
      font-size: 32px;
      color: #ffcc00;
      font-weight: bold;
      margin-bottom: 30px;
    }

    .finish-btn {
      background: linear-gradient(to bottom, #ffcc00, #ff9900);
      color: #000;
      border: none;
      padding: 11px 27px;
      font-size: 18px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      width: 100%;
      margin-bottom: 10px;
    }

    .finish-btn:hover {
      background: linear-gradient(to bottom, #ffdd44, #ffaa00);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 204, 0, 0.5);
    }
  </style>
</head>

<body>
  <!-- Background elements -->
  <div class="stars" id="stars"></div>

  <!-- Main Menu -->
  <div class="menu-screen" id="menu-screen">
    <h1 class="menu-title">GALACTIC BATTLE</h1>
    <div class="menu-buttons">
      <button class="menu-btn" onclick="startGame('single')">Single Player</button>
      <button class="menu-btn" onclick="startGame('teams')">Two Teams</button>
    </div>
  </div>

  <!-- Game Screen -->
  <div class="game-screen hidden" id="game-screen">
    <button id="muteBtn"
      style="position: absolute; top: 20px; right: 30px; cursor: pointer; z-index: 1000; background-color: #1a1a4a; border-color: #00ffff; border-radius: 5px;">🔊</button>
    <header>
      <h1>${titleValue}</h1>
      <div class="subtitle">Answer questions correctly to attack!</div>
    </header>

    <button class="back-btn" onclick="backToMenu()">← Back to Menu</button>



    <div class="game-container">
      <!-- Control Panel moved to left side -->
      <div class="control-panel">
        <button class="finish-btn" onclick="finishGame()">Finish Game</button>
        <div class="player-info">
          <div class="player-stats" id="player1-stats">
            <div class="player-name" id="player1-name">Team 1</div>
            <div class="team-score">Correct: <span id="player1-score">0</span></div>
            <div class="incorrect-counter">Incorrect: <span id="player1-incorrect">0</span></div>
            <div class="progress-container">
              <div class="progress-bar" id="player1-progress"></div>
            </div>
            <div class="turn-indicator hidden" id="player1-turn">YOUR TURN</div>
          </div>

          <div class="player-stats player2-stats" id="player2-stats">
            <div class="player-name player2-name" id="player2-name">Team 2</div>
            <div class="team-score">Correct: <span id="player2-score">0</span></div>
            <div class="incorrect-counter">Incorrect: <span id="player2-incorrect">0</span></div>
            <div class="progress-container">
              <div class="progress-bar" id="player2-progress"></div>
            </div>
            <div class="turn-indicator hidden" id="player2-turn">YOUR TURN</div>
          </div>
        </div>

        <div class="question-section">
          <div class="question-counter">Question <span id="question-number">1</span> of <span id="total-questions"></span></div>
          <div class="question-text" id="question-text">Loading question...</div>
          <div class="answer-options" id="answer-options">
            <!-- Answer buttons will be populated here -->
          </div>
          <button class="next-btn hidden" id="next-btn" onclick="nextQuestion()">Next Question</button>
          <div class="weapon-info">
            <div>
              <div class="laser-indicator"></div>
              <div style="font-size: 11px;">Plasma Cannon</div>
            </div>
            <div>
              <div class="missile-indicator"></div>
              <div style="font-size: 11px;">Quantum Torpedo</div>
            </div>
          </div>
        </div>

        <div class="combat-log">
          <div class="log-title">BATTLE LOG</div>
          <div id="log-entries">
            <div class="log-entry system-log">Advanced fleets initialized. Prepare for intense battle!</div>
          </div>
        </div>
      </div>

      <!-- Canvas in the middle -->
      <canvas id="game-canvas"></canvas>

      <!-- Right Panel with buttons -->
      <div class="right-panel">
        <button class="right-panel-btn" onclick="resetGameFromBeginning()">Reset Game</button>
        <button class="right-panel-btn" onclick="showQuestionModal()">Answer Question</button>
        <!-- Review Questions Button -->
        <button class="right-panel-btn" onclick="showReviewModal()">Review Questions</button>
        <!-- Choose Questions Dropdown -->
        <div class="dropdown" id="questions-dropdown-container">
          <button class="right-panel-btn" onclick="toggleDropdown('questions-dropdown-container')">Choose
            Questions</button>
          <div class="dropdown-content" id="questions-dropdown">
            <div class="dropdown-header">Select Question</div>
            <!-- Question set items will be populated here -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Game Over Screen -->
  <div class="game-over hidden" id="game-over">
    <h2 id="game-over-title">Game Over!</h2>
    <p id="game-over-message">Final results will be displayed here</p>
    <button class="restart-btn" onclick="restartGame()">Play Again</button>
    <button class="restart-btn" onclick="backToMenu()">Main Menu</button>
  </div>

  <!-- Winner Cup Screen -->
  <div class="winner-cup hidden" id="winner-cup">
    <span class="close-modal" onclick="resetFromWinnerCup()"
      style="position: absolute; top: 20px; right: 30px; cursor: pointer;">&times;</span>
    <div class="cup-icon">🏆</div>
    <div class="winner-message" id="winner-message"></div>
    <button class="finish-btn" onclick="closeWinnerCup()">See Results</button>
  </div>

  <!-- Review Questions Modal -->
  <div id="review-modal" class="modal">
    <div class="modal-content">
      <span class="close-modal" onclick="closeReviewModal()">&times;</span>
      <h2 style="color: #00f7ff; margin-bottom: 20px; font-size: 1.8rem;">All Questions Review</h2>
      <div id="review-questions-container">
        <!-- Questions will be populated here -->
      </div>
    </div>
  </div>

  <div id="question-modal" class="modal">
    <div class="modal-content" id="question-modal-content">
      <span class="close-modals" onclick="questionModal.style.display='none'">&times;</span>
      <div class="answer-options" id="answer-options">
        <!-- Answer buttons will be populated here -->
      </div>
    </div>
  </div>



  <script>
    // Create starfield background
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 500; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      star.style.left = Math.random() * 100 + "%";
star.style.top = Math.random() * 100 + "%";
star.style.width = Math.random() * 3 + "px";
star.style.height = star.style.width;
star.style.animationDelay = Math.random() * 5 + "s";
star.style.setProperty('--duration', 2 + Math.random() * 3 + "s");
      starsContainer.appendChild(star);
    }

    // Question sets
    const questionSets = ${JSON.stringify(questions)};

    // Game state
    let questions = questionSets;
    const totalQuestionsEl = document.getElementById("total-questions");
    const totalQuestions = questions.length; // get total questions dynamically
    totalQuestionsEl.textContent = totalQuestions;
    let gameState = {
      mode: 'single',
      currentQuestion: 0,
      currentPlayer: 1,
      player1Score: 0,
      player2Score: 0,
      player1Incorrect: 0,
      player2Incorrect: 0,
      maxIncorrect: 5,
      gameOver: false,
      answered: false,
      correctAnswer: false,
      answeredQuestions: [] // Track answered questions for review
    };

    // DOM elements
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over');
    const questionText = document.getElementById('question-text');
    const answerOptions = document.getElementById('answer-options');
    const nextBtn = document.getElementById('next-btn');
    const questionNumber = document.getElementById('question-number');
    const player1Score = document.getElementById('player1-score');
    const player2Score = document.getElementById('player2-score');
    const player1Incorrect = document.getElementById('player1-incorrect');
    const player2Incorrect = document.getElementById('player2-incorrect');
    const player1Progress = document.getElementById('player1-progress');
    const player2Progress = document.getElementById('player2-progress');
    const player1Stats = document.getElementById('player1-stats');
    const player2Stats = document.getElementById('player2-stats');
    const player1Turn = document.getElementById('player1-turn');
    const player2Turn = document.getElementById('player2-turn');
    const player1Name = document.getElementById('player1-name');
    const player2Name = document.getElementById('player2-name');
    const logEntries = document.getElementById('log-entries');
    const gameOverTitle = document.getElementById('game-over-title');
    const gameOverMessage = document.getElementById('game-over-message');
    const reviewModal = document.getElementById('review-modal');
    const questionModal = document.getElementById('question-modal');
    const questionModalContent = document.getElementById('question-modal-content');
    const reviewQuestionsContainer = document.getElementById('review-questions-container');
    const questionsDropdown = document.getElementById('questions-dropdown');
    const winnerCup = document.getElementById('winner-cup');
    const winnerMessage = document.getElementById('winner-message');

    // Dropdown management
    let activeDropdown = null;

    function toggleDropdown(dropdownId) {
      const dropdown = document.getElementById(dropdownId);
      if (activeDropdown === dropdownId) {
        dropdown.classList.remove('show');
        activeDropdown = null;
      } else {
        // Close any open dropdown
        if (activeDropdown) {
          document.getElementById(activeDropdown).classList.remove('show');
        }
        dropdown.classList.add('show');
        activeDropdown = dropdownId;
        // Populate dropdowns if needed
        if (dropdownId === 'questions-dropdown-container') {
          populateQuestionsDropdown();
        }
      }
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (event) {
      if (activeDropdown && !event.target.closest('.dropdown')) {
        document.getElementById(activeDropdown).classList.remove('show');
        activeDropdown = null;
      }
    });

    // Sound effects
    let soundEnabled = true;

    const laserSound = new Audio('data:audio/mp3;base64,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qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    laserSound.volume = 0.4;

    const explosionSound = new Audio('data:audio/mp3;base64,//vQxAAD6aoQzAPjXsYywhmBLXfYPPPPf1PFYOwoAQJA0Gg3G43G43G43G43Gg0EQHA6N0MGgvEQgY3/////888/CUOw7ksw5qGGdv3bzuSh/JTF2YJWCEpEcCAT1MoWBLRNQFH1zFoGsongUKA+1DFmjTQUgnOsEZmBEFsFsFimNJlKZQr3ZW3IBDQfAKzjEHPnnrBIxoam7sF9wEMAhRrTkZJSU/d9/8MMM69PTxuNv+/7lrsTkAAQWAJDpuK0tussyBAICKYAAoap4bpEWhMmhNGTAxhcBgR5QSMgiNAMaCICBmhBhRoseNREOI0DmAwaORUCNAqGNypMeZNajR+C5EWNmCKGogHexH9jjx5uIoYNtCNkMLrmIcG8JImGfrnfbgYOAlZqrguUNvHN2pOtoO0QNrTJr4WIm9imrFmLUmxKtJBAgwwAsgW0LkIBEHEiEi0x0x1TqnVOu9r8/Xp86SSSSSSSSKJiQEFbJ1FFFJJJJJJJJJFGZA5H1BJDVSSSSSSSKKKKKKKKKSSSSSSSSSKKKKKKKKKSX6NZ9oGfV3ZbS1H+gpdzXnaa040RouzS5h9wOXn8D3D/imAfgL6D2g7kB7wC10AQhwkced3EWsjGAniPSFrTqBeyrkq5jtWxDkE5IHbmAqGCBnREgtYisJtHjClhFFlqtoEqJFJDBLBkzwiC0rmiyxxxpaWlpaWlrU2WWVampqblxaQFH0u0icBR7MAwEMCR3Lss5R5BR/ihIGOQ0mMQymDY5l+h5EFMh5CTH8AxI+xGPoGAJAMYAjmY6lKYwoUYug6YCEIZEEaY/j0GIMaQAQCSMCiRGTROmcoPmbYRmDwRma4ZmZ4amaYVgJvzPE4DCo1DCoKTNcJzOMAzPo/DPoAQM66exn2ABncfJnWbhhMFJmqj5vyAZnkcpnEhSOZgSjRvMKxu8Hxo2Dxm0a5hGhhwRDAQ8Bn0exnweiDq6Xdh2Mwy/rsv8/0PRqNRqGn+f6M2eND93spX1UvCMcAZHGDI4aX1Vf11e9tu9ale9v6Lq/vssJt/qK1oLoqd0Am3+uEm/xdWy1ppII3RTRmSa0U63fVZDXvUl1PrTspq3apNSLIoVoqL6f/70sQqA9Hp6pQLXZnGKrzTgW9/2NSLI0wj6WHGMzY0CfpUXTFjQ1OBXpZIorypUGtH3luw6LSWhq2EFUuabNSmp4SD4dWT2pcVnR6/EjqqP/A3xPj//4RXwEV8QivmEUhgaQ0hBSRIRSGBpCSF+v1dv///2///ylmb///////8qxOnE7E4VInCuJ04nInP/zidid2VxOliJ0sROYHE7E4Uid8LEThYicK4nSxE4VxOFiJw4nYnSuJwsROFiJ0sRO/5YidOJyJw4nInTicicLEThxOxOd8ricKsThYicLETn5FcTvlcThYic//LETn+WInfOJ2J3yuJ3/x//8sRO98sROlInPliJ0sFmX//lZZl/PKyzIqlmZULMissy8yzJaCKFmQsFmRWWZmWZFmRVLMuGWZFmRYLMjWgizM1oNaCNaCLMjLMloMyzIsyKFmcyzMsyNaDLMzWgyzMsFmZlmRZkWCzMyzJaCJFoI4dNaC4VpdRpdCXSVy+J8e0viWEugrS6fNLoS6zS6Uugrl8Tl8JfHzS6ZfErS6yuXxK5fE0uhLrNLol8DS6kussS+BYl8Dl8Euk5fBLpK0uk5fBLpOXxS6+FaXQaXQl0HL4S+JpdMviaXWl0ml0JdVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVXMJayJoh+eufGXzJy5qMQ/zlzMy13FJr1stumiv6SR8xPgyRTS//vSxBKD2BnmjgDdnwJQPBKBYF+ICciqkaGk2hKRSCpFSEZFVI0QCUiomDyKsvKX3BkikWU3CpFLNwqRTgcipIqBGRTNk1WrSUi1GiYmqv0nSSSosmixx+iWi8bmxHhL0sY1OhP0tLjhL0rBr6WAfpX6Vl0umoV6WAP0t9KyQBP0tRHPJIF+lQxIjR85JpNMXcaPxJEk8B08MSd5YLReB8sTUxD1c+QBCFaQyFdp5IsnbUvwPTmnf/qX/////1fq/CTEeDGJBOjCLEgDGI5bzi0YMYj4UxIwkxHhJiQUv6ASYjgkxHsFMRyEWJFJ0W/1L///9XbhF/ihF/ihF/iKQLf4puE3+JEKf4rhJ/jRCB/iA3+N/jWoIX+IHf4gU/xgN/jf4gaP8QR/4y+Bv8b/GwQv8VdH61MqipGp60UFOpTTIQ1ftUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbYyJ45JftmwIds/5FHPYzHZcBAH4xz3kDRa00qzqSdnQU1S9kglIqogcipIqKmFMnQhkVDM3dMDkU5FVEGkiqsqhG8kLrBV5LetbQe8lhBeSIpWPrXVq0mXVen1INQQbpL7n///+9LEMgPYteSMAN/+wzi9EwAb/2j3+/uB7Fe9S2D9LfSwf6VLOj9K/So/Sz0tJfS2JSQd9Le0mAx6VFPSuQ+lg30ts9HPSwY9LSnpYJ+li9JYPguVXc+YYRKTfH4btfSQ5DlJi3STWIbV22+8YIlORcTcSAkUVpu/9/Hvze//5sct37eDB413v3r68GGYnCJmJBhmLCJmLhEzFfCjMVhFCYCKEwpS8IoTDNCkJiwGhMITAUhMQYhMowihMPU6DK3rUrt///fT7W7f/ff/X4eVt/lqx/43Sq3+Z2yjf4Nv9b/CRv9Nv8b/dm3+t/nm3+N/ht/rf7gVt/pRv9E+Bebf63+m3+N/pYb/Lxt/rf7/Snpb2U9K27lP3hY9LZTa2fpZ6WV6e2SelZP0tUkyS+lm9n6W+lZT0qlPS3b1UKelSUY2H9GtTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVe0QoKeypHFzI5OQ9xEeaKWT9VH8KHjC0XXalo/NlLpru+gp6mSs96BwGN/jKUosgxv8QrdqlBNv8gxv9cJt/m+pagi3+Okpt9J7M+p9l7XfR/xw//ucKf/70sQrg90x6JQA3/tCdT1SwWunOCKfIlkVPK5FX+bLEilkVyKpXIpFJFOVJFUnIpCkipt1bdLREkikcinIqEZFKcirIqcORVkVDkU5FMqyKZyKcipfuEPpaR9LVfyv0rK/S0seluqh+lXpaV+llR0Sp6Wlj0qK/Sw/Sz0qFPS3M/S30sH+la/m5R+lXpaM+lRT0sZH6W+ltIVfS0/Sv0tKvpW4ZXQu/wjp0I6d1/4HRKiX+r////+3X/////+EUuhwml0AxLqrhFLpCKXUi6CoGl1pdDBFLpQWn0UnXf1qu7N01fq//+9SvUEX+JSM2LRrnQd/iopFYKf4jBF/iA3+N/iNybCL/GBv8b/GBv8b/GDH+Iugb/E/xhT/GCB/iWBv8X/E4G/xP8X50x6VRZqbMakVcPDskbMf8RJDyZR5Yhaz+IlMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVW4Ss8900KpqJqsFMnr6dujdeyaX/pyc9nq1L9XTUmiEZFUGSKZJnAgkVFGRsoGSKQVIpAgkVVmrFIIyKjBUilBrIpmrgyR//vSxCMD2NXmjAFcfwK7ONLAEN44VMAlIpG4HIpSKRaRqRCMimFSKmDJFU8k0zTCcikFSKZ26//bW3VVZeopGzrCPpaD+lgqHT4T9LTpaL4P6WQS9KjdQR9LAj6Wgfpb6VA09LCJAr0sgn6VA09LB8hB6Wg19LQX6WwP0q9LGHpjpEzLDDnoEChAuK5P+OFK4Y6xTatYLI84Fm8vz5Yx/v//7/PUgb8vMfkBPwBSXRVSBiXUE0ugGJdbAxLrCKXW5uiDEutJqak3BiXWBpdaXVQCSXQiEkusKS6YUl11wil0KCkumFJddThFLqTWmEUuqiv9f////oUUQY/xwd/imaAO/xwp/jFYIH+NCiBv8b/GED/EEX+JQTf4gN/jf4gm/xBJ/jCL/GEf+MJP8QRf4kwN/if4tXXyySSywU2J80FRxfqDaj7XC8E/bnaXMklrED0Urig1XqTnP2V0VTD4M+I8+JfiNV7YkTYkFXo0+IPiNfhf4TSYzDo2I5V6Mw4JIzP4z+My+MfjJC+I0+M/jLBfEZ/EXxFUfjMw5JIzGDwvgySIw4MYOC+TH4x+Mw+IPiLAfGY/GPxlQfiA/xPiCL4wP8b4wm+IDfE+IKfHCL4gY+IIvjBj41hN8QMfEBvjfHA3xvjCL4gp8QDfG+MDfE+IDfE+MDfG+NADfG+MGUTA6JUSCqJAOidEwlRIKokQwOiVEglRMKonA9OacBmnAPTunQPTunQPTmnArTsD05pwGacA9O6dTTCenMI0TgyiYHRKiSASomFUTLCdEmCVEoHROiYTokDKJAyiYMokB0SomDKJBOiYRokDKJAyicKolA6J0TgyiYVRKmFUSBVEwMomDKJAdE6JgyiYMomEaJYSokEaJqCqJAZRMJ0TCdEwOidEgqiQJUTgdEqJhGiQMomgEaJAyiYRokB0TomEaJwZRMGUSQQqb9v0G/6DdYTLMjRrQmWZIMFFmWESzODCzOpYSLM0HUEizJSOEizMGFmYMLM3T16CabwY/x4Mf44Rf4oxZBiXFyH5QR5xUPmmuGO0Y9JUhgQDVmSERmZiRQZ8JpVm20aUY1ghZgMCgmFkAaY6gy5oxjpmLGHGYMQ0ZgMhPGD/+9LE/4F4kcSoD9r1x1q9G9Xt0rieCcYQg1hihgvGDqI0YLwgpgaAvmBkDQYJ4QhgZgMGF0CeYOgRBWBAFAdTCIEEKwSzNDQ7JfOJDTDXQ14gCBs59PMZGTGJ859OOeGAOFGZNJpyca8GBV1K8czZ1MgnDdXUw3HN1IQjrChCESxr5AYZumvYxuoaaUQmlpZhpAcTEnEhppXic7jGlxJWQnjGppcQeOQnjuhYDDDLM15KPxszSsYyBfMNdTNSE3QMMMIAqQhDca86GQL4UiDSl4142CpAbqlhQ1LBobqamQBoQMHEhppxkcKnmMDJW0mMGYETi0hYTzMk408ZAk8d0MGnp5YTjumgDM5mYycIMFpiwMlpjM0/zGBgxgzLDQYwZgQyAxgBBkDTwFhQKMGntJtLSbSnm0JxpwyBmcCDAFM02QMzAbRNpGS0gMOAZ06BnToROAdg4EbAMsBE4BnDgMO/////+EV4MX4RXwivwivCK4GLgNcvgxcEV4MXwYuBi7BmMI4gZiBmOEcWDMeDMcGY8Dx44HjxBHEDMQRxgeLGB48YMxYRxhHHhHEEcQMxVTbva6MhgbMxzBjjJGDZMWAHUylwzjRvP1Mz0qIwoAoCsFkw4whzDjHyNAMQYyKgUTDOAZMfj8xCIDEKaMshM1AQDf4pMUEA1AQDRJBMUikyAtjTAHOMBgrVZiooGUVUYZDBnQxGdDEZjVRgY6GUIOYaGxjYpGtQaACmZ9MJm5MG3m+Z9N5jZvgK1mUiIZSFBjZMmpkUcKTJkVamG1qYaPpqIyWJgxhQO9mAygCx8Z/VHV+psSibqDGoMZsRUCIg0ESLBSefEnnlBoHMCUAylBOJQDcBI4lxMSiDEygEIJrYWZkFGthZYCjgYEsaJYqTCzM1oyKworMzC4A1oKMzgTqVszKAKwo7DkNLFiwlmlC52KWV8pviWYs+lb6aULGlpZYFiwLmLC5pT6V2JYSisWLAsaWlG+CxiwsYuLmLi5pdh5i6UWBY31KMXSzFnwxYXMXSzS3wxcXK0srSjfBYxd8NKFjFxYrSjS0ssJZi4saULmLJRvj6aULGlpflhKNLSysWKxcrFysW///////////////70sTJA/1h5N4Pc22H6jRYgr9gAP//8sEhWS///5YJfLBL5WSeWCUsEvmSkpWSf5WS+WCUrJPLBIVkhkpIZKSlhS8rUiwpf/lakVqf/5Wpf5YUywpf5YUytTK1IsKRqal5YU/LCmVqX+akpFhTN8QZkTMuVeUzwVC1Md1BkTFihYoyzJ2UPE90UjPTzDgwuINjMZjCYjCtgrYxCBOuNerEpTLxyWcrCQzCegS4wyECJMPGEbANCI+gNCLKQOH7KANCLKAMphTAOEMIQZCEDKYrYDlKkIDSFKQDlLwUDlIkMDlJKUDNwbkDrE4wDcYbgDccbkDNybgDce4wGG5CLjQibgIm4AzcuNgbjzcgdYzcgw3ARNwETcgZuHHgZuKxgbjjcBFxwGbk3IM5wBuONwDF8ga+F8hFfIRweB4OXwB4OXyB4OXxBi+ANfK+QPB2DwYvgDSFKQDSEkIGJDBiQgOUspYMSGEUhAaQkhBGUoMSHA0hylA0hJCgaQkhAxIQGkJIQGkJIeBpCSGBpCSHA0hpDgaQ5SBFIYGkNIQGkJIYGkJIQMXyBr5XwDF8BFfMDXwvgIr4Bi+IMXyBr5XzA18r4A18L5A18L4A18L4A18YPA18r54RlKDEhQYkIIpCA0hpCA0hJDCMpQYkIGJC8GJDA0hJDBiQgNISQwYkIDSEkKBpDSEDEhBFIUDVsUwIlMBhTAMpitgYU0DVuUwDKaU0DKaraESm////BhTeDCmgZTSm8KKYBhTYMKYDCmgwpoGUwpoGU0poGUwpoRKYBlNKaESmwYU0GFMBhTAYU0IlMCZTQYUzCJTFMfkGEwNxGBpXIwRQTjcRA+NYJvIyEwxTAkDcMcEG4wGw0jSUJ+MfkfkwtQRgSAqYWYDJgKgMGZ6VKYuIEJgBAIohl2zADACNR8k0x5igAMAQHBHGB+BKYFAG8EGBSBEYzAGRodmSmFUfYWAKQqASBgLzAQAQLTEoCIEACBADpojFCG3SNKbPExRwdHrGAEAuYEYAbrgYCJnBQC4YAgBoMAOMCQA8wDwOTS2UmNghgg1JihDiqUmMaVScHAYg4AQwDgDgYAGomWAAn9C4DpgOAGpAAYCkwFAFTUnK//vSxG2AP/Hq+BnvAAbSL2MDO9AAFKyFTIUGkLAYZt0MEGiMJoDQAhgAMHADFgAMYADMA8A8GAHiMBpAiX6MCgA0wGgGgCAaWSMaUTU2CEtjL0GkMFIFMz1jZjL0GkKwwi+rZWyiMAxdi7i/K7C/BgBgBJ6qMA0AMYAOGgMkAwOAFMA8A4w5gkDCQCQMJADgxlRPTA5A4MJADgw5w5ysJErA4THDADCsAcwBgB1OwuAMYA4AxgDgDhgBqn/LAA6YwXAHTFCwA5WAOmIYAwA5WAP/mAmCCYIIFIKAnMEECkFATlYCRgUgJqIAoFAFAT////////////////////////////////lgAssAFlgArzAKAK8sAFlgAv/LABX//////////lgAvysArywAX/mAWAUWACvLABRYAKNSbOMIywOBMWMP2GPxkyMpzQNfgCNngPLEem1TVmcbDGKAVGgoomS5VGZ9wG8JemTDMGlYomFD2GC6SmB54gwejAczzM9BjM8UTSoYjhcmDIcdDAZ8jc94TBgUDD8qjIY9TKoKzoWPDIdcjSqKzhacjYZTjYZmTHSqDasKz5ePDhcGStTjU4hjeFGTWBGTBiFzRgGTiuPDU9KzKsmTT1vDBkYzQZcjPVzzPUKjSqBTPRvDD9Kjb0hjRgPjM4mTM8qzLxBzJkUAuKIXGMyYCoyqGMwHBk48ioyGRkw+IczOCs09GMyGJk0GAYwYIcxiL0LkyVkyYoDGVjEY6F4YMlWZMF4aeh+YfAyaDh8aMDEYMGeYxFWY6CgYVmea5jEWAYMvA+MfQNMDQpMfQ3Mbh8EYGIExINTBsKCyZgOMRh8DAYY5h8Z5gODBgyAxgwFYWCowZAcw+CsrBgxQGMwrFExRD4LAOp8w/D8w+BkFBKWAAQmLiRUbdcS8m4zXg0ORoHTA8D0AoOB0wDANPaDYOcnwcDgOAQrBgwDBkHA8olBqeiAT//////////////////7v/SfrM8nJsjRVBD4yukrpMw0DITIYwuIwWIfiMFiKYzHYxWMw3UKRMSkDdTGXgdUxbghRMJoFxDGnR3QwLsacMEvFEzDxwS4wdUJ6NCFCA1iitzWLFNNYpvX/+9LEKwP13TT4Hf8ABogmnwH/eAAw+g+jMoMpMyghEyEDKDG5G5MbkbkxuRuDG4G4KzjzL4L5Mvgvgy+GDywwebBhfBl8l8GokomaiSiZYpDOkJRMsUhGon7kdIaiR0hqJGonSEVVEywokaiSiZqJUhlaiRRROdIVIR0hUhmonSEUpDGolSEUUSnSHSGdIVIZXSEaiaiZqJUhlikIrUTNRJRMrUSKz4iwfGZ8R8RnxnxGfEfEZ8R8RWfEZ8Z8ZWfEZ8b8ZWfEWH4ywfGZ8Z8ZYL5Mvlg4y+GDywweZfBfJYL5MvkvgrL4Ky+P4ZfJfBYYPLBfBl8F8mweXwVl8GXyXwWC+SwXwZfBfP+WC+CwXwVl8mweXwWGDisvgy+S+DL4L58sF8/5l8l8FZfPlgU0ytxTTFMFNMUwU0xTCt/MUwUwsCmmKYKb5WKb/lYpnmKaKYVimf////5gxgxeYMYMRgxgxGDGDF/lYMXlYMRjei0GYhAN6nhojYaNi3JrVkZGOg2kZ4+GhiXrcm/EjEYsZ8ZkhFuGNWSGZGQ6Bi2pBmUqLaZNIXZWaCZoCdxjItOmMiTQYXRNJk0hdGH0QgZCJCJofofmH2H35khkhmSGSEVkhGSGlIVnHmNyNyY3JxhYG4NWJWMxuBufK1EywokdIaiRqJKJGonSEV+57KrTpW06bTrTpXqsWGnT1XacNp3VcpqtK2nTacadNROkI1EqQzUSUSLCiR0h0hGokomaiSiRYpCK1E/LFIZqJKJaNRKkMrUTLCiX+aiaiZqJKJmokokVqJlaiRYUTNRJRM1E1EjL5L4KpfJyRMHebBxfJsHF8lbB/lgvgy+S+DYPL4Ky+CwXyZfBfJYL5LDB/mSElKZIZIRpSEhmSGlKZITghkhkhFgkMyQ0pDSkJCMkIkIsEhGSGSH5khEhlgkIyQiQywSEVkhmSESGVkhFgkPzD7D6LBCJWH0Vh9+YfQfXmH0H2Vh9mH0H2Vh9+YfYfRh9B9eVh9FgPsrD6Kw+ysPr///8sBE//mESEQVhEFYRBWEQMCVRoxtzRjLDDuM8w4sxfhfjLpHnMOQ7YygBfjK0MbMhkecxSQ+DAyALBQE5hQh/GAmFuf/70sQaA/BpMwoPd5qGbSZgAe9yeIjAvxglhYGKUKUZQomphhjSmJoJqViaFgMMrE0MTUaUwUwwywCmYYYYRgpCamGGCl5iDiDmDqDoYOgOpiDiDGDoDoYzAgxYF+KxfjF/F/MX8X8zGzGjMaF+MX8xo2VBfitLcsC/GY0L8Yv4vxYF/8zGxfysxsrF/MX8xs1/X4sL+WF+Nf1/Nf8bNf1/Nfl+NfsaNf8bLC/FjGzX9fzSFICvnSuXzSBICwkBpCkJYSE0hSEsJCWEgK0gNIEhK0h8rSA5eSE0gl7zSFIStIStICwkP//+VpCVpAWEhLEvHBoMWDoVnQzqdTg0GODnU8zBzg51ODHUzqdCxBjOh0LB0M6HQzrBywdSwdTOh0KzqZ1OpnU6GU2GbDKZWUysplZTLBTKymVlMymUispFgpFZS//LBS8sFL/8rKZWU/8wUCjBQKLAKMFArzBYL8sDMwUCjpDerLCNppxHxmbG/EYVBrRrVDomLYqQbm5fBi2KkmLaLaaEIVJpziFmkEOgWC+CwRkaCxoJriJ3mTSMgY6pPZiXhEGT0OoYRBPZiXiXlgnowiB1TCJCJMUwU0sCmFgUwytitiwKYYppW3lZWximFbGhCKYZWwppWfF/lg+IsPxmfGfGZ8b8ZvxnxGXwwcbB5fJyRyRFgvgrkjKy+TYOL5K2DzYOL4Mvkvk/434jfjfi8z4z4is+IrPiM+M+Iz4n4zPjPiM+I+LzPiPiMbkbkrOPNWI48zj1YjOMOPMbhzksDceVjcFZx5YG4Mbg48xuRuSwNwWBuTG5G5MbgbgsDcGNyNz/lY3BnGDcFgbkxuRuSwNwVjclgbksDc/5YFNMrZCExTBTDFNFNNCEU0xTBTSsrYxTBTCsUwsCmGKaKaYpoppimFbGKaKYVimFYpvlgU0sCmGKaVv55BdFeRNdZAsLo10uytdlhdGul0WF35WuytdFa7/zXa7NdrorXf+WF15rtdFa78rIvmRSIZFVBYIpYIhWRDIpEMiEWj7ZfywWBh+5hi4TRly15h8HxqcTJnGTJpoXJtcexh+Z5nElRi6EJqmLpYAE1KH0yxLExLBcyBDMwKKgz4KgsECY0BIY//vSxCID7n0zFg7zXIWqpuJB33MI0hIZVjSYSlWYliUViUY+iUYllgY+FiZVjQYSlWZVpiZ3BKZ3lWaYjSZsGyZsuaWLCM2DYM2XNM2DYNzDYNzbCLEvnL6QmkEvFaQlhIDSBIStISxLxWkBy+kJ9vYZWbBmybPm5psFZsFg2Tc02TNg2TcxzCw5hYNk1CoTUNdNQKE1CoSwoCxXDUFdLChOuKAsKEsKA1AoCtQFdcKzqWDoVnXzOp0KzqWDoZ1Ov/5YOpWdCs6mdYOVnU4OdTHKRNIDgsJExwOSwkDHA4Mcjk0iOCtImOByaQHBjhIGOByaQHJjgceVjgxyOCsclgclgclZYrLmXLFiUZcuZcsZYsVlisscosVlvMuXMuWKy5YLeWC5WX8rLFguWCxly5li5WAMAAMCAMCAKwJYAlYAwIErAn5KhmDhJHRLTGCDTGeA0mXQMG6p5nLoIGyKSmGRqmJYbhDxmeQeGeZimCLTGFBrmNwUFg+zBwzTBxCTMxCDMwWDBwWDFhfDM0WTB0kywRJkQRJkQRJYIgyJS4rIgsESVpcZEkSVpeZEESVn0Z9n2Z9QgZ9n0Z9H2VwgcIQgWIQMPsPo1Vg+iwQh5h9B9lgPow+w+vMhAhErD7MZEZE0FiaTC7C7MZELoxkSaTC7GQMZELsrGRMLsZEwuxkTC7GQMLsZA0SiSxLzl6JNEy40SiCtEFcuK0QaJRBWiSwiDRCJLCJOXog0SiStEmiZeaJRJWiCtE//+aJRPlhEH1JcaIRBolEFhEmqIUVkQyIRTVJELCoMiwo1SqCtUeVkUrInmqSIZFVJkUilZEMikQrIv+ZEIvlgXlgXmLxeYvFxno9GLj15WL/LAuMXC4rF/mLhf5WLvLAv8rF3lYv/y0haZNktJ/lpi0qBRadNijUCvOLkQzyayICGXBmYvMZoR0GfSiZLBJhIXmFSgcFBpiIGmghGYhBxkBCmDhmZlD5yAcZqpjooVRlHMwZtMYEhZ3DF0gRSJoMPADHwcDKZE7GgBpg7uCWo18eNFTDUjgI2jrog6XbPuLT2+41IpPvtStSOX2DMjIwwCHiQESxvwYb7jmJVAJATd1E1fANGMjdxk1n/+9LESgPpOTciDm9PxXGmYoHeb1BNAimY+dGuQps5yaI8mjaQUJzkEUxKINqXwM1LxMYRTHl0yxsNTPjDgYCGhkBeYaQGMTiSowYkydIwc005M3CljZuTQLEmpHGVTK3nQTGJggRMc0+aC8nKLJ3BBJgCgCEMOB0dx0mYEGa8yQmwSPICYRBFm5jxAjAiRkgMmBDr4A0FdxlRCUib67QwwCQIGIKFOmstS1JERAIYfKONwkLD8Iy9UMvS6MYhx/p1/aCd//////6FKM+aGNcRaMACbNzGuMcG7BRZnBZNmmpsGZ5Qm0RngINzKcbjSAgDApITDM0TEoFjLA5TOQsDKsqzKsaDCQqzGgJDOYkSs5zDkODDkkDDg5iwSBp6HJWSJkgHBoMOhjoOpWOhYQcx0QY0HQY3NNkzYNgzZNgzYNgsOadhWEVuaWDYM2DYNzLCOwrDLBs//lZsm5hsGbJsm2OaWOafN5pthsFfNPmtksNksNkr5pW2TbLZ8rUJ11Qmoa6dcrpqFQmoVAWFCWFAVqHytQlddNQKA66oSwdDOkGK4OcHOpYOhYOhwY6+Z0OhYOpYOhYg5wY6lg6lg6+Z1OpqakakpmpKZWpFan5qSkakpGpqflhTNTUzUlIsKZ4amVqZYUitTNTUyvCK1IrFjFks3xLLCUaWLmLi5WLGLJRpaWYsLlgW8rFysXLAuVi/mLC3/5YFvKxfy5BchRAuWoh6bSbSbdUrWZvI5mMhkeRuxpyCmDZcb+NZoI1BVEmxpeaTMRvI5GaV0ZoDAGnxigUGbyWa1SBj0eGmGKVmsx48zTIQMeJgx6EDNYQNJFgsBwrLBpIsGHA4ZEIhYVJYVBqlUGqVQZFtpmMxlgxlgxlgxG4rGZj8RW4jcTjOxWIr8RmIxlZjLBjK3EbjMZYMfljxm4zEZicZmJxljxm4zEbjMRuIxFgxFZiMxmMrMZmNxmqVQaoIh21UGRFSZEIhWqPMiEQyIqCsilhUeZFIv+b0Xm9vZvWMVvRlz2WC8sPRl5cWHr/Ky8y8uKy8y56Ky4rXGuXGvXGuXFhca9eVrzXrjXrix6K1xrvZr15YXFhca5d5r15WuLC81y4sSzCKDUhTUP/70MSOA+kFMRoOb14FZaajAd5vSBCwEMIFMKFMIFMKEKwnlYUwgTywE8sBDChP8rCFYXywF9nbOXxfB8GcqIJImQSJmARBGfRrmfWCmvQ1HRC9G/qtmeAZihHmQRzGJRjBUDCsiQqBhi8WZkyNRnmHpnkNRYB00IMwzNJMxZMwypQosCIYiiIVoWWAcMkgcKxZLAsmDosFYiGIq2mVAilZUGVK2GVCFmlyXFhLiwRBpel5pcRJWlxkQRJkSl5kS6h+Ml5z2lxpclxkSlxkSRJYIg0vIk3UIkrS4sdQ0SiDRCINEIg5eiD6qJK0SVy45eiDlyINEIgrRJmMxFgxGYzEVmIzEYywYisxGY3EVuMrMZmIxFgxm4jEWLEbHxnx8ZsbF5Wx+VsRYYyviK2M2NjLDEbGxFfEbExGxsZY4zx3oy8vLBcWC8y96MuezLnsy96N7LjLy8sPRl5eWC4sF5YLzei4rLzLi/ywXlgvMdWSsdNZHfMdHPKx0sDvmODhYHSsc8sDhYHTHR3/////9FVFT1G1G/RX9ThRpTLyINEVg0JrDu0KNdcY62njWUyMJpI12GDXQZMvA02MXi0hhhdmM10bWJRm4UmkEgYEJRikCFaRNIG41QRCtUGRCKVqgz2ejFzGLAuKz0YuPZqkiFZFMiKkyIRDVKpK1QZdF2WC7Mui6LBdeZdTQVl0bIF2ZdF0VzQbIl0WC6NkC7Muy68y6ZErmk2RLosOoVpcZEpcZEkQWEuLCX+WCJKyILBEml5EmlxEmxsRsbEbExGxsflbEWGLyviNiYzY2I2PiLDGVsZWilhFK0UrqCwildSV1BWimiohotSaKimiVJoqIdSiGiVBolSdSiHJyZXJmOrJjo6VjhrCyaysGOrBjo4VjhrA6Y4OFY75YHSwOeVjhjo6WBwx0cMpBTKSkygFLBQYKClgF8rBDBQQwUE8sApYBCwClgEKwUwUFMEBSwC+VgpYBCsE8wQETYLTf6BXpsGeAiwaxKBpo2MvnCjSEbcZsRoxJxGrFPEZsaMZnklRlZUZlKDoGnOXwYlwRJk9uCmjaZCZNDTpoLLimMgTSYpgppoQIQGhCKaZW4ppWKYZW5W5lbj/+9LE1APqdS8aDnd2hnymn8Hrd8CmmhAKaZCJCJWQiWA+jIQD7MhAhErOMM44bgxuVYywNyZxpxxjcDcmfGfGZ8Z8RWfGb8T8fm/HfGZ8R8RvxHxFg+I/4z4zPjPjLB8fDPjPiN+M+Iz4n4zPivjKHxjfiPiM+I+Mz4j4is+Mz4j4it+Mrfi8z4z4iwfH0sHxGSG4IZISUppSpSlgkIrJCMkMkI0pCQyskMyQ0pStKQyQiQywSGZIaUpWSEDF8wivgGL4CK+QYvgIr4A18r5hHB0Ir5Bi+QZg4DXzg4I4PA8Hr4Pjm5NuG5PjW5NuG4NuePLDcFbcebccYbcNwbctybcNybcNyWG4NuG4K25NuG5LDclbclbceWC6LDIlZdGXRdFZdmXRdlZdlgu/Muy7LBdFZdeVl0WC78sF0Vl2Vl35WXRWXf//lgqTEURSwIpYEUrEQxFEUrEQxFEUxFEVMIQ7MQggMMheBi0iBAzL9aDaEWDJwNjOcZTKgLRCCJioG5gWNZhkCBg2Qxl8hxicAhlEJBjsJJkmTJn6SZieBYCQEgBswRLgxkF4wzI0WFozXAsxJDIxwEksEkYqkmYCCeYNGgDqaMMhIMWA9MLScMkg9BiYmj8/m+JamaJtmtCeGXInkU2GX4TmgZRGOwWGdo4GG5Ag4qzNsezZY/TT0vzNcFTBsdzFULTLQ2qIxZHExeQ80IDcxxDcwhCAxVLU8pDOoLDucQ3YUPhQjELU3E3Nx2jTxU4E9AU8ZNGHGExhSSZM9GKjR1N+ZtOmkLAgITyzcOezXgoWFzMxQyAsMmgQcbkSAdQWkTyKLxoZ4ZOFiqSukPMzWRs2pCBxqZ4CGKwJmaEaEZGIOxiJAbWsGWnohBDTwsHMxCWCoUKExipOAk8wsFMUBY2zIteDgsOFg4rMEFSyQsbNWBxU6Ra0OCkEDorndQQggDYCyCyABKCdiVioFpCyHp/////////////lvy0wHCLDMYF9NcSSI5I60D4uJoOtGSM1E1EzrpMgMdAKk0IFqjJCAuMykyg1uEbDUTRtM8ZRMzKZsjZuIQMPsyksJSmSG4KVuCm4LLOZWwppimIQlaxZimoQFg+Iz4z4vP/70sTyA/Ch4xoO7bzGx6afAe/6wM+I+I34j4zPiPjK34vM+I+MqPxGfG/GWBpwrGnSwarGNOGq5jTo06bWUNOFY06ZqsarlaiZqJUhnSGokWFEzUTpDK1EitRM1E1EzUSpCNRKkIqUhlhRI1E6QjUTpDKKJSukIrUSOkJRIrUSK1EjUSUTOkNRM1ElEyiiY1E1EvLCiRWomaiaiRWomWFEitRIrUSLCiRWomWFEvM+I+Mz4j4ywfEVnxGfEfGZ8R8XlZ8XlZ8flZ8ZnxHxGfEfEZ8R8ZnxnxFZIRpSEhGlIlKVpSGlKSEVkhlZIZkhpSFgkIyQiQjJDJC80pCQjSkJDKyQ/8yQiQzJCJCLBIRkhJSlYfRYD7MPsPow+yETD6D6MPsPssB9FYfRh9h9mH2H35h9B9FgPorD6Kw+jD7D6MPoPow+w+/MPohErD6LAfflYfZYD6LARPlgIgrCJ8rCJLARP+VhEDN1PBMas8Ex0RCzYOZwMmOeMz424jZfEuNwUyAzYj4zjiNiMtw8E08BXzJpkjMmhpwwuk7zC7JoNBYLo1xDQDK3b1KytjFMK3NYqF8yEEPjIRQ/MPpD80PzKDFMK2NCErcytxTCsU0xTBTDL4L4MvgvgrL4LEkZl8sHFgvgrUTNRNRIrUTKKJTpCpCOkKkMrpDK6QvOkL3M1ElEyukIrUTLCiZqJKJFhRIsKJGokomWFEixSGaiaiRqJqJGokokWFEjUTUTNRNRIsUhlaiRWomWFEyw/Ed8T8Znxnx+Z8b8RnxnxGfGfGZ8T8RWfGVnxGfGfH5nxnxlb8ZkhEhGSGSEZIRIZuCkhGSGSGWCQzJCJCMkIkMyQyQywSGaUqUpkhEhGlISEaUpIZkhJSlaUhWSEZIRIflhKQrSlMkMkIsEhFZIZYJCKyQyskMrJCKyQiwSEVkhlaUvlgkL/LBIZWSGWD7OEIROED6LB9lZ9lg+is+iwfRn0fXlg+/M+j6K4R8rPrys+ywfXlZ9FZ9lg+v/zGIYisY/KxiLAxFgYzI0IQMhELQx9y3TLcPBMBw8kyaBCTLcETM3QkIzdBXjH2GrMX0Xwx8hCCwLaZfIhRkZlKmMiTQVrilgZEw4//vSxO4D88Eu/A97s8X6JmEB7mPQxYzDiFjMWMOIw4w4jEvJ7KxLysIgxLxLywF0YXYyBhdBdFgLsyaAujFMFN8sCmlZW5imlbFaEBjcjcmrGcaY3I3JWNwZxxxhjcnGGNycYWDjzOOG5M48bgxuDjCwNwVjcFY3BYG4Mbg48rG4K3ODG4OOLBxhjcDclY3BjcDclgbgzjxufMbkbgzjBuTG5G4Mbgbk0IBTfMrYUwrFMKxTfMrYUwxTRTSsU0rFN/zFNK2MUwUw6ZTSxTSumFimHTaadNphYppYpvnTKYdNph0ymeWKadMpp02mldMNdrs8iujyGR810uitdla6NdLo12uzXS7K12a7yBWuitdFhdGu13/+VrrywRDIpEMiEQrIpWqDIhFLBELBF8yKRDVBFMikQrIvmRSL5WRP8sEUrIhYIhWRf84ROMCxDyxAsQ8sQOEKAAAjQNAvN51dUx1KQjcFerNOMmI4Yn4jhjRiMOJOM0DEDTJCN1NOMOM1Y0YjRsUTMdVwUyejIDnJQgMU1vQxTW9TIQQ/MhAyg1Vw+jD7ZuNYorYytlijK3K2KytzK2QgMrcUwytytjK2K2KxTSsvky+S+DL4L5LDBxl8l8mweXwZ8T8XTfj/jLD8RvxPxeb8b8RUPjMvkvgy+GDywXwbB5fB+nF8GweweZfLBxWwcZfBfJl8sHGfG/EZ8Z8RW/GVnxG/FfEZ8Z8RnxvxmfEfGVnxGfEfEZ8R8ZYvjNKQkMyQkpSw4KVkhGSGSGaUpIZpSkhFgkIsEhmSESEaUpIRkhkhFgkMrSkMvkvgrL5Ky+CwXwZfBfBl8l8lZfBl8l8FZfBYL5Ky+CwXx5WXwZfBfJWXwVl8GcYNyY3DnBYG4Mbk40sKxFgbkzjxuDG4G4MbkbkxuBuCwcaWBuCsbnzG5G4MbgbnysbkrG48sDcwOmU0DptMBlNCNMgymgym4RpnA6bTQZTPwjTcDMRihExAZjMYGYjHhEx//+jo9BmcRBt2cxr8cptlDJhIuR8UNJscTRnsTRnIPhyav5kAkJvOBZpg/BhKNBx6EhWOp6YzJjqzJkgHBkgnhvWypp4SBimKRmGYZimmhWYRpqKRpq3/+9LE9wPzhTD6T3qz1kCmoYHfdsApppChpqYZYFMzZcwrNg3NcwzYcw3Ncw+3NkrEhMSESArEgMSBNs02znDJeJfM5xNs2GSXytID5znSuXzl9IDSBITl5ITSBIStIPOXpfLCQGkEvHzsvnL6QnLyQlhIfNIEhK+dK0gK0hOXkgMnobMoChMoSgLCuGUCulgofMoFcNXVdMoCgMoChMoIaNXCgLCueVlAVlCVlCauK6Vq6WCgLBQlauFZQFZQGUBQFZQGriuGUKuGUKuGUBQGKQpGYQpGKRhGKQpGKZhmKYpFZhmKZhFYplgUzFMUzFIUzFIwzFMwzMMUzTQUzFIUisUywKXlYpGEoSFgaPMJRoMJQkMJQlLA0lYSlgJDCQJDGgJSsJDCUJSsJCsJSsJDCUJCwEpYCX/MJAlKwl8sBKVgCYAhAVgAWAAKwAMIAB//KwBqMM0twxQzyDOOAcND5WIxEiQziCN0MFkBwzyBfDBYFCMxkJMw4gYzXiHjLCNpjqKJGJeZAY6ItpiFDoGOiOgY6g6hiXE9GEQJeYlxkJh9B9lYfZkIoflgPoyQiQzJDJDKyQiskIyQyQzJCJDLBIZkhJSGlIlIaUiUpkhkhmSGSGZITgpkhJSGSElIaUnFJyzOCmlKSEZISUhW4IVkhmSGlIaUpIZWSF5khkhlZIRYJDMkIkI5ZkpTSkSlLBIRkhkhlhKQ0pSQzJCJDLBIZYJDLBIZYJCNKVwQ0IW9SwhCWCtjFMFMLAppimlbGKaVuYppWxlbimGKaKZ5WKYYppW5WKYdbVuamVuWFNNTa3NTK3NTVMLCmmpimlhTCwphYUwsVsdb1uamVsamKYamqb5YhEz6ygrPoz6Poz7hHys+iwfZYPssH2Vn0Vn0Z9n0Z9wh5n0fXmfR9HCB9mfZ9efGxebGxFbEVsRYYzYmMsMRWx+VsRYYywxGxMRYY/NiYywxFbH/lbGVsflbGY6OeWB3ywOmOjpWOGMSVGcZ6mC0mGcjZmVDMnB1DGLMNGRJzmVaMmDJxmDADmHxVGEhVm2z8GVZ3GIBEmIAslgoDEsFjHw5TBcSzH0fDKsJDO8JTKsaDKoJSsaTCQaDGgJTGkqzKv/70sT4A/K9LwAPd35GqLJiQd9u0IaTEoFjEo5TLAsTH05DBdSjLA5TB8B9MLEUosDZGAucEYpQvxjzCMmigXMZdIjJhyhylYWBiMCMlYchkMBylgEow5A5DAXAXMBYHwwfQFzEYCwMRgHwwFwsTCxEZMLALEx5gFjB8GzMH0LAw5QSjBKB9KwSjCxGzMKWzWvg6mAOp0TWqk1ozNb0TWjMwqBMyMzqIA4AzNbWzWoEsGZrYWcCtmZLZY0SuBMyWjCtEzIKMzqSwZFgKOAgT+KgzJaMKMzC6kyB8M/fDfT8z5dN9PzAT45s/NcXDIT8rPjAD8yE+M+fDfT8yEAKyArXDP1wz8/MhADXQAz5dKyAyEhMAADAAAyEBMAATAQAwEBMhICsBMhITASEwEAMhACsAKwHywAFYAWAEsABYASsB9TyYynfpiqdKe9Tv///////////////////////////////okxBMRUY8xFSKTAWDlMUo040UiwzExRTMD4kcwfQuDBjDPMRgLwxIQgDIPCAMwUfkwJRczCrExMLAOQx5wsDBKAXMZUTwwOAkTE9HrMJEDgsApGCmCmY0oYZjSCalYUBhQBQFgKEsCuGK4FCWBXTCgFcMVwKEyGhXTFcChMKAKArEgKyXjOdEgMl8l8rOdM5wl8sOrFZL5w2UJq5DRWrpq6rpq6UBlCrhq6UJYKEsFAZQq4fOpAcvy+aQJAWJfOX0hNIEhNIUgK5fLCQFaQmkKQlhITsI2DNlzCtzTNk2TNg2Ss2Cs2SwbJmybJmybBWbBWbBmybHmUBQmUKuGUBQmUBQmrpQFZQlhXPMoVdMoSgK1cLBQ/5Wrpw2UJXDZWOhjoOhWg5YHU0HQbzQYdCwOhjqOpYHUrHTzHUdDHUdSwOhWOhWOhjog5WOpjoOnnKLGWL/5WXKyxlixlyx/SxlixlyxYLGWLFZf/LBYyxf/Ky5WX8rLFZYsASsAWAHmBAeYEAWABgQAjFg5wQxpnEOpoMTBsOAxqeVRseLpk2PpowQ5gwXpiyohq6RJswuJkApJmiaJlwEJk2EBj6XJhmGRgWaBlSVJhmkJgULZYIEsC0YtmgYtAWZoC2ZAmiWCAM//vSxO6DsIUzCg93WQYhtCJF3kMqCxaMuT3NFT2MISbM2U0MAFxNFQ+MuEUMPi4MITYNzRdM901MfeZNzU0OKFSOarg6mmzH+OM+j43uIDPtTMQLkxAPzPiaLFSMuTQ1y2Cs+mPhAb2qZn3mGAIoVrgxCADEMUN7AA00mjf0XNnHA2ctjRBYBSCMUhMxStzWxZBJAM4nAEBMyycDW4SNQEAyCiTCZAMUhIEikywEzLBZNQBMyAKDOBwBJYMJkAzgiDLJABKJBASOuCkyCWAudTH4/DPSGH8zqBzDBiMVioxWYww/hYoFgDmYgwZQFYXDJgYMhgOMDlAxUBgwqBcVmBgOY+A5gYVGKwOGFUrDCYqYqY4YDkxExQuGVOzA4GLAHTEU6U6U+mMp2mIp0mImKBhA1A1A0BiDEGAGP//////+d8/56hkLzRxvzL15DJYJDLQjj0VATS42xk0AF7phwhJnYphlChBnGR5r6L5iESxm2CRjicRiGS5oSOJgkexjSR5m0zBgStJjSXplCY4YhBiqEphyEpomHBoAJZoABBkcdpl6dpg6CZpy9xq8VZl6VRiEhJrmPZw6OJiElxm00RiEjp5jX5qYcZjmcHo5ifu1ZzlaHtIAbHIR3OXGjjSb2LxhwqHhEca8dp0OmmqzSfaFxquJHVjSZfPZlVjm7VCMF445ADoQkNVi80sEgEJTQqFMlEoziXzISOOJmgJOQRCzCQ5M9Jc0cJTF6FMExMBcUBL00vCAAODVZVMEqAy8jzBJKMvHsyExzDhUNHCQy+2zdpVARwN7CQxcEwFtAoewEODPYcKwSY5QphMchCXNCEpAkYvHIwcDNAlMElUyqQzNBKMlC8AhIYCQ0EjCZULdGLhwYSBJgkSGJASYTF4yEwgkmCAQYJBCEAABAwHQAEhoTqNhATVWMEAgt+rCAgkW6BPAAbABNBEgFOIwAwAngKQM3////////////4zx1xmjPjOYLGQxmJxCMZjL4T0YEQR7mM2nk5jwiKoYhCGtmGtCEBjL5CiYT0BEGQljThl1IaAYMgSRmGfgyJYBkDFxALsxcUNBMJoCaDBTArcrFizFixYsxvQWLMmkLsyaCaDGQGT/+9LE/4Pz5ecODvG5RrCmXsH/djgMLomgrK3MrcU0xTBTDK2FNMUwrc0pUpCwlIWEpCxLMbgpIRkhkhlg+IrPiO+J+I34z4in8c/4/4zfjPiO+I+My+ZIyoXybB8kRUL4Ng8vg2Di+SsvgrL4Ky+Ssvgy+cOOmweXybBxfBWXyZfJfJl8yRmweXyWC+DkjL5Ng5g42DpIjSkJCMkMkMyQ0pCwSEZIaUhWSEWCQywSGVkhGSESGZIRIZYSlNKUkIrJDMkIkPzJCJD8yQiQzJDJDKyQiwSGZIRIZpSEhlhKUyQyQzJCJDNKVKQrJCMkMkPytuDbhuDbnjiw3BXxx8e3Bty3Bty3BXxxYbgsNwVtybctwVtyVtyV8cbcNwVtybcNybcNybcNz5l2yBl2XRYLoy6Lsy7Lsy6ZDywXRl2XX+Vl0Vl35l0XZYLvywXXlZdeWC7/zEQRCsRf//8xEEQrESoxFgWTG6ASMkwbMsFAmBylCYypopieJQGlCMoYkIGRjflDmBKFWY2425hhIjmXoCkYKYmhjKlMmEiBwYcwypgphhGbMGEYKYKZiahhGXqNIYKYYZhhgpmCkJqWAdDEGB1MHQQcrEHMZgiswoAoDFcFdKxXDFdFcMKAKArFdMSEl8yXhIDEgOdMl9hkrEgNNsl8yXznDOcYZNKwNksDmGOaOaY5o5hnbhsGGwGz5jmhslgc0w2RzTl/nDl+XjSFIDSFITSBITSFIDl6XytICtICwkPliXjV0oTKCGywrhq4UHmrhQFauFZQGUJQmrqulaueWChMoCgMoChNXChNXSgMoShK1cKygMoCg8ygKAygKErKArKErKErKA4bKA1dKEsFD/mOiDlgdDHRBywg5jqOpjqOnlgdSsdCwOhjoOpjqOpjoOhjqg5YQcrHQx0HUsIOVjoZJVGSEptDR5W0GSkpkhKZKSlZKWCXywSlZKZKSFZKVkhkhJ5YJf8sEnmSEvmAgJWAGAgJWAFgA8wAAKwExrwPzILB8MXEZkwWiDjQQNHMO9BEx8ghjGYCYMZgKkxcSNjKHAyMecg4rEwMbY0cxdBtjGkDCMoUTQy9QwjE1GkMvUFMxpRpDDDE0MZgHQsDMv/70sTxA/H5MQYPd3rGRqZgge7vIGIMDqVg6GK6K6WBXTChIbMKEKExXAoCwJCViQFgSAyXyXzEhJfMl8SEsEvFg5wyXyXjEhEhMl5hkrJfNNo5wyXhIDtcoTVy1ytXDKG1jKBXDKEoDV1XCwrpYhssFCVy8WEhNIEhNIEgK0gNIedK0gK5fLCQmkHOmkPO+ZsGyVuaVuYVuYVmyZsmyWDYK3MKzZM2TYM2TZNzHMLBseVlAZQFAVlAWCh8ygKHzV0oTKAoTKEoDKFXCwUBlAUJYKEyhhs1choyhV02ZQcx0HUrHUx1QYsDoWB1MdUGKx080HHQsDoY6jqY6DoWB1Kx1K0GLA6lY6FgdSsdTHUdDJSUySqLBKWGgyQlLBIZISlZKbQSmSEpkpKWCUraDJCQsEpYJCwS+WGkrJCwSmSkvmSknlgAMBACwAmAgJYASwA/5WA1M9wMnDTr06822RI4Mc5V5SBwrKHuI3D0vgM8mGbjOBhYszgY4HNBlV5DDjzLg1A4y4MViUDzK5A40qIMpnR5lwYcaSHFgOPMkPHOTK5BWIqBx5WDcmDchx5isYceYccDcGNOGqxqCJquY04armarjThWarFgsyMsyLMzLMyzMotBjWgyzIyzIsyM6POjjOjnTozo507Kp0ebp11J0x9SR0ebp26dmoIDThmq406Y04NOmarmq5jTg04Y06armNODThYNVjUETVcxp01WMicInDRVSJ00VRoONFVRVCwROGROEThkTiKqZE4ROFZE4ZE60HGRONB5WiqGomomdISiZ0hqJFhRM1E1EiwomVqJFaiZqJUhmomokUUTmomomVqJmokokVtOnqu04Uadm07qsWGndG0406bTuqxtOtOFhpwsNO/56rtOFbTptOtOFGnR0hqJlhRI1E6Q/NRNRM1ElEitRPytRM1E1EitRI1E1EiwomaiSiRWomVqJFFExWokaiaiflhRMDXwvkDXyvgDwevgGL4ga+F8gxfGEV8wYvgIr5/b8DKYUyDCmwiU3u//+3/+sAjUTmdOPZbkrC5NBfi85+sgTTuJpNONOIz4rYzpDZeMS5wQx1JnTW5UTMZE0A2nVxTJoadMZBBYwu07//vSxPeDtnEs5g/63IbHph5J73Y6jQWGRMbg4w3ODjzOOkONWM44xTCtysUwxTUITWKFNKEhjJFcEMkIkIyQiQzJDSlKy+DYPYONg4vg2Dy+DYPL5KMHTfifiKh8Zvxvxn/H/Ef8b8RO+Md8d8RUvi8sPxGfGfGZ8T8ZnxPxmfGfGWD4jPjPiKz4zPiPiLB8ZnxnxmfE/EWD4ywfEWD4jPiPiN+K+MrPiM+N+Iz4n4jfiPjNwVKQ0pSQiwlKZIRIZpSEhlgkIyQyQjJCJCLBIRWlIZIZIRWlKZIaUpWSEVl8GXwXyWC+CsvjywXybBxfBYL4LBfBl8l8mXywcZfLBxl8F8FbB5l8F8/58a3JW3Jtxxxtw3JXxxty3JYbgrbk254425bk24bk25bnytuCw3Jty3Bty3Bty3BW3Hm3LcmXRdFbImXRdmXTImXRdmXRdFguywXXlbIlguysuzLsuitkSwXRl2XZWXRWXRl2XflZdFZdFgu/8sCKYiiKWBF8xFEUrEXysRP/r/3KLC6pj7mUHM4jadIRkBriXUnP2F0c8asZuxKxGLGXEZsTsRofZ8GzeZQZsZMZmxmxGjGjEbToXZhdBdlgmkyECEDMpIRMhFD8yETKCs4wxuBuDViG5MblzgzjTjjVjG4NWI44zjhuTOPOPMvkvgy+C+SwwcWGDjL5YPNg+SI34j4iw/GVnxld8R3xXxm/H/EVvx+aUiUhpSJSGlISGbgrghpSJSGSESEZIaUhYJC8sJS+ZIRIZkhkhmlIlKWEpDSkJDNKVKQ0pHBSwSEaUqUpkhpSGSElKZx5x5jcnHmcaNwY3A3BjcDcmNyNyWBuSsbgrG58xuDjywcYY3I3BYG5CKQwikKBpCSEBpDSGBpCSHBiQgNISQoGkNIUGJChFIQHKVIYGkJIRqYphXWxqappYU063Uw1MU01NUw1NUwsKaWFMOtlMK1MK1NLCmlamFamFhTTU1TSwphqaphYU00vS4yJS8yIdUyJIksEQVpeWCI8yIInzIkiTIkiDIkiDIkiDS4iCwRJYIgsEQZEkSWCJ/ywRBYIgrInysRCsRDEURf8rETysRTIgA7cxaBMLMUDI/jGuBZUw53/+9LE3AP0uTL2D1u+BsqlnUH/dyAdWNFGRRDMxTMUzMQ/8MJfGGDSgkAYyxAiVM2MIlTDnTY0xhgOcMTbHVjH8AX4wxoZUMZUJjDEERiYsDExlKoxOVCD0yD0g9MxrEECsQQMH5EECwGzGGzjdBWGzmN0jdJjdIbOaM0LllYuUYuWLlmLli5Ri5YuWVi5ZWealB4yVFt41t881NbeW3jW31t4x4pbf8r81N414w/NXijeMeMK3jDeNeMN414w3jHjSw8aVXjfK3jCt403jXjCw8Yfmrxp+avGm8a8aWPNSp5obxjxhvGPGmbJTaWDZjNmNmNuk2YzZjZys2crbo8zZjZjNnNnM2c2bytugzZzZiwuWVrlFa5XmuUuWa5a5ZWuUa5S5ZYXKNcpcorXKNcpcsrXK8ruyLC5ZYXKMpkpkymCmDKZKZMpkpgymSmDKYKYLBTJlMKmlZTJlMlMGqYUwZTJTBlMFMlapnmUwqYWCmTKZKYKymPKymDX5fitfjxtf/K1/81/X/ywvxYX41/X7ywv5r+v5Wv/+Vr+a/L//+WF+K1/8ygKArKEyhJ8sFAVlAaulDU1iS3TYgTwM78QoyM4wDEaDwMDcNo1xdVzGRTuNg8dAylXNzTvhLOfqSIxLiezZfEuNGxGwwxykTFeAvMV8fc1VjKSshErMpKzKTD7MpND4yk0PyECwQgZCJlJWQiVh9GH0QiVmUFgvgsF8ebB7BxYL5Mvlg8y+WDjYPkjOSP085IvTzkjL5MviSMy+cOCtg8ythTTK2QhLBW5imlbmKaVuaEIppYFMMrYrYxTRTTK3K2LCUpWSEWCQzJCSlMkMkMyQyRSwSGZIRIRkhOClZIZWlIaUhIRkhkhmlKSGZIZIZYSkMkMkIrJDMkMkMyQiQywSGWCQyskIrJCK0pTJDJDMkNKUrJDLBIRkhpSmSElIaUpIZYJCKyQjJDJCNKQkMyQyQ/NKUkIsEhmSGSGaUpIRWSF5XW/lhTCwppqbW5XWxqaphWppqbWxqYphYU062U01NUw1NrYsKYVqZ5YU0rUwrUw0vS4yJIjysiDIgiCt1SsiDIkiSsiTIgiDIkiP8sJeWCJKyIKyJKyI//MiP/70sTHA/TZMvQPe7HGyCYeAf9yeCI8sET/lgLjC4LjC4LiwFxhcF/mF4XlgLjF1ARIxYkFfMPiIYjH4g+IxwUhRMw1B1THNwvkxg4KUMWKBTTBTENoxO8TvMhKCaCwLcGHjB45hPYeMYhCTkmIQEL5YCtjB1QIgrDxjBLwyAwyEUTMFMCtzCtxCAxvUQgMFMBTSsvkrL58sF8GXzJEZ8R8ZYPiM+M+Mz4n4zPjPjM+I+M3434jPifjM+I+M34r4zfiPjN+P+I34z4yj8XzL4L5LBfJsHMH+ZfDBxWXyWC+SwXwbBxfBl8l8GwewcZfJfBYYPKy+POSIvk2Di+TYPYOLEkRWXx5YJDK0pTSlJD83BEpCwSGZIZIRkhkhFhKQsEhFZIRWSF5khEhmNyNwY3KsZqxnGlY3BjcDclg48sDcmNwNwVjclZx5jcjcGNyNwY3Bx5nHjclhWIsDclgbgytxTDQhFMKxTSsU0ytytisUwsCmlgU0sFbmKYKaWCtjFMK2KxTfMrYUwxTBTSsU0rFMMUwU0xTBTTFMFMNdrsrXRrvIFa7NdrssLorXZWuiwuywuitdleQNdrorXRYyJrpdeWF2VrosLrywuvK12VrsrIhWRCwRTIpE8yIRPLBFTFxD5Mg5IsyFDZjdZZ5Mjw80wJRMDG2H4M0Y4oxB1AjRwNMMX8eYx5gFzIVDCMvUhQwwgwjK6IqMHQQYxBhmDB0B0MisQcyuhBjGZK6LBDRhQBQGQ2K4ZDQrpiuBQeYUIrhYIaMhoVwxICXysSAyXiXzJeJeM5wSAyXyXisX8xfjGjF+MbMxuygxfhfjS2MaMX8xsxfktytBArH4Kx+TH5H4Kx+DH4H4MfgfnzH5H5Kx+DX5fyxjXleNla/Gvy/Gv2Nmv6/ljGixjZ43jRWvxY7czYNkzYsIzYNkrNkrc3zNg2CwbBmybJmy5pua5pmybBYc02xzTbLYNsNg2y2Sw2Sts+bZbJthsFhs+Vtgr5htnmlhsG2WwbYbJwc6FcHM6HUzqdDOp0M6HQzrBzOh0K4MWDoZ0OpWdSs6liDGdIMZ0OhYOhXBjgx0M6nQrOhWkTSA4KxyVjgxykCwOCscFgcmOEg//vQxLID8tUy/g93mkZbpR5B73Y4WBwY5HJWODHI4KxyWBwY5HJjgclY4LA4LA4Kxx5YHJYHJYHBhYLFYX/ysLFYXLAW8rC5l8iFmqSIWbL9IRuC4aHnxNmVs3nJFquYyBoBh9PCnnzE4bMSsRjxkxGJctwZkCNpqJiXmneTSZoAyJk0GgGZSh8ZlCHxmUh9GH2H0Zx5xpnHjcGNyNwY3JxpkIEImQgH0ZCJCJh9h9mH2H0Z8Z8RnxHxlZ8Znx/xHfG/GZ8Z8ZWXyZfEkZsH4clMOBsHl8nhwwebB5fBl8MHmSESEZIZIXmSElKaUqUpWSGWCQitKUyQyQjJDJDMvgvksF8mXwXwckRfBl8MHFgvkrL4K2DjL4L4K5IjYPYOK2DjSlSlKyQiwSEWEpCwSH5YJDMkMkIyQiQjJCJCLBIZkhkhGSESGaUqUhnHjcGNyNyZxysRnHjclg4wzjxuDG5G4MbkbksDcFgbjzOOOMM48bgzjzjTG4G4LA3JYG5K1NNTa2LCmGpqmFamFamlhTStTP81MU01NUwsKaWFMNTVMLCm+VqZ5WpnlZdmyBdlguywXRYLrzLouvLBdGXZdlZdFZdlgujLouitkSsu/Ky7////8sCKWBFMRREKxFUx5iXjAKKuMkE502qSmTK1F+MxoH0yfywjOKPNMaQ9Y2CFmCsLgwuBrjPXKEMFMTUxNChTKYDmMZUDkxlRPTDnDmMT0OcwkAkSwJ4Yg5FRg6CDlZFZg6iDmByEgYHAHBhIBImEiJ4YHISJhshsmOaGyY5gbBhsDmmWGWEY5o5pjmjmmGwWEVjmGWGlYaVrS5YLCKxzTDYDYNzLCNzDYLBslbmmbDmlg2DNmwyw5hmy5pmy5hmw5pmwbBuY5hmwbJmybJYc03NcwzZNk7CsM+2sIrsMrNg1cV0ygVw1cV0yhKA1cKE1dKAygKErKAsFCWCgNXVdNXCgKygLCuFhXDhsoDKAoDKEoThuGyuGjVxXDhooDVxXfMoCh8rKEygKArKAsK4ZQlAY6DoaDIMY6jqVjqWB1Kx1NBx0LA6GOg6lgdSwgxYQYx0HUsDqY6DoWB0Kx08sDqVjoVjoaVIVpCwkNLpNIv/70sSyA/GlNP4Pd1kGHqXfwe7vGELGjytL/mkSGkSGkSFaUrSeVpTSpPK0n/5YS+CSabXlyfTbTbTbLlKIGJ4tIZTInhpKj8GPwcWWAFys4MzRBPDRICRM95rgxBxmDUCB0LAgxi/AlFgLExfxGDH4F0MGgKowqgqjChFdMKEhozlRXDIbFdLAmpkKhhGNKGEWAUjNMEHMQYHQxBhmSwDqYzAgxiQCQFYkBiQCQGm0m0ZzokBWS+YkAkJnOnOmJAJCbDBzhnOiQGm0c6YkJL5kvCQHzqQHL6QFaQFaQHzkvGkKQFhIDSFICtICwkJmy5hmy5hmwbBYcwrNgrNk3Ncw+2NgzY7Y3Mc0rsIzZNnyxYRmybJmybJWbJYcwzYNgrNgrNg3Ncz/LDmmbLmmUBQGUBQmrpQmrhQGUMNlZQGUJQGUFrHDaumUJQFZQlgoDKBXSsoCsoDKAoCtXSvCPCUzU8I8NTK1I8NTLCmWFIsKRqSkeEpHhqRqamVqRYUiwp+akpGpqXlhSNoaTJWgrJTJCQsEhWSFgk8rJSskLBIVtJkhIbQSmSEvlZJ5WSFglMlJPMkJf8rACsAMBATIAArASsAMAAUxjVMzCII2oNcwFcow8Xo2nU0wiEIyjRMDPEZqicZ9muVmuYME8YnF2ZCngWAyMAxCMMhTMIgjMIwzMUgzMUwiLAsGDoOmZoOFgkywDhkkZhiyDhYFkxYMwyYGo0eGswRUww8JYzzBEsGIZ5nkY1giZ5kwcXL0VjWaPKaaPmIY1o+ZMAgYeGKYejWY1h6bqDWYIgiVjUY1DWYIEwZih6ZijUZMAiWAQLA1mNZiGYhiGTI1mHiPlZiGTIIm05MGNRMGUJRpSWaUlmlpZgiWbclGlJRWCGlgpgqWZQUmCAhlJQVgppZSaVIlbeZSCmC2plH2cjIm3pR/dqYLIGCpRgpQVlBpQIYIUnIlBlJQaenAROMyGSwMAacLSARPA0+BRlAsxgZAzIBRgCDCbIEMjGRgDGRmZmBp9AsxkYMYGfAgwmwBjJAtNktMVjKBRaYtJ5YGU2U2E2C0paX0C/LSJsgnojAjQjIjPHX///////lhX5WWFsrMRkGIwPhvDCfB//vSxL8D7omjDA7tvMW7pmDB7vG4YMaMM4xsjgzCwJMMSwM8x0wEjBTIUNScFMwiQKDDPEsMOURgw5RSzDkCwMfCxK1LM5DkMsFKNGQXMSwXNGSwM5iQMOU9Kw5MkQ4NpRTKxTLApFgUywKRq6UJYKDzKFXDV2GzKEoCwrpk/DRlDDRw3ypw2rhq6rp2urhq4UBYKHzKFXCwrhlAUBYVwrKArKEsK75lAUHmrqumUBQGUJQlZQmUENmrkNmrquGUENFgoCwUBnTMGdIMZ1OnmdDqVnTywdSs6lg6FZ1M6nQrg5nQ6lcGLB1M6wcrg5YgxYOpwaDGdIMWIOZ1g5nSDeVnTzOh1KzoWDoWByVjk0iODHI4McDgsDksJExwOPMcDksDgxyOTSI4McjgxyOPLA48rHJWOPNADMxmCzBZbKwUYzGZjIFGCgUWAUVgowUCisFGCwUVjMsAowWCzBYKKwX5WCisFlYLKwUVgv/U+VgZTtTtMZMZMT1PKjH4RTMbZBAzZgwzZ5PXNfsu8w5imDIPKHMXAUg1pBlTNEDnNKAZUw5ymTBbBaMSAAoxmQgDCQGVMpgT0sBIGMwIOVjMGRURUZXQOpkVA6GIOMyYzAOpkVg6FgKArChKwoDFdCgMKAKHywL8WBfzF/F/NLcX4sGNGPygiaCCCJWxN5sToImPyPyVoImPygibmOYWHNM2TZNzXNK3NK3MNzDZM2DZ8sGyZsGyVmwWDZ8zYNg3Nc0rcwrNgzZ7Y3NsMsOaZsGwZsuabmGybmuaZsuYWHNLBs/5mybBYc0zYc0zYNkzZNk3MNg1cKAsFAZQFAdrK6auq6VlAZQq4ZQlAZQq4auFCdrFCZQK4ZQK4WCgK1cMoSgLCuGUCuGUJQFgoPMoSgLBQGUBQmUBQeWCgLBQlgoSsoP8rKAsFAWCg8rKEyhKAzmQLBwVnBWcFg4M4kPLBwVnBYOPKzgzg4M5OTkTkzk58sHP////lgXLAv/mLixi4uYXZd5itDWmF0guYairRk0F3Gp89WYDBXBmgqEmPGXcY/hTxg6hjFYY4GLsAoGZiFjWgUNQx4g1DFACfMGgVowaB/DHGKfMp8BkxChCjBODVMXYSUz/+9LE5IPujSz8D3d5Bxw8H8HuzyinhQDGtEKME8DIwnwGTCfGRME8IQyGATzDwFAMUESUx/A8DBpDUAgTxititGU8SYYDBJhkMv9m6yOOYNIkpjxHIGPEK2eFk8ZCkKZChkZqKCaFHiYZLsbxKAatpIa7K2BBoM8DVM8FbMujUNC4YMumsM1UKMn1bNd39Nx9AM8XjA4ZHDBqHoBPGQitmJ7WGTwMmQigmNJPmNIngaFQIapWuxhmXRuOXYEIU1aUEyFDIzwNQ1aDIzUSUwYE8CsgagE+ZdniZ4IUdBl0BqBMTi6MnlbMhXGAwZmeJdmu4MG4w0magZmGSgGapPmJx4AQTisuzBghTGkaDBk8TE4aDDIGQMGJicT5gwJxl2TxicJwGNEDGkYZgwZPhmY0CcBQyMGBpMhQZMTgzAwymNAZGDInlpS04GGQwyBgChmYMgwWAyAwYFgTjDIMwIDPpsFpy0qbJYBkDxgGwYDYMDDYYYMODYP///////////+F1v/C63C61TBOELMUAPEDH9mMgEIYVIIhpzhUGYiS6Y6gphoGDVGNUW6YiXwWBFNfTNNfSSNfBZMxwuN9h6MewuNCkKNC0KNbCpMqCpLC2FgqTEQRDKgRTQsRSsRTKlCzKkRDKgqCsuvMumQLBdmyDIlZdGfR9FZ9FcIFjKSxlB5TlBYPoz6hE5fLjREuOXS45ciSwiTRCJOXIk5eiSuXmiEScvlxWiTRCIOXIksS45ciDl0vLCINES45ciCwiSxLywYysxm4zGWHEZiMRmIxGYjGWHGVmMzEYysxlhxGYzGWDEaIRBolEHL0SWJcWESaJRJy+XljqmiZefVRJYRBy9EHLkSaIRBy5EFaILCJLBF81QRDIpF8rIpYIhYIpkUimRCIVkQyIRSwRCtUlgi+VkQyIRSsilgiGRCIVlgrDphwOFgOmHQ55YDpYDnmHA6VhzysOlYdKw6YdDhh0OlgOFYd8rDv//oFFp02E2S0ibKBZg6otyZccHjGEWCPJgvoGYaKoROmKrBCJmfAzaYqueTGOCh45hkJCiYtwBEFgW5MDiD4zEYgOIwWMTjMDjDYzBYgeMw+MHjMK2BTTFigU0wrYf/70sTeA+1NLwIPd4nG1Sadwf92OGLKwrYythTDK3FMNCAUwrb1K1Y/MbkbksDcGcYNyWCQvLBIZpSOCFaUpWSGZ8T8RvxPxlg+M/434jPifjP+N+M74j4it+M0pCQzSlJCMkJKUsEhGSElIVkhGSGSEVkhlZIZYJC8rL4Ng8vg2Dy+fMvgvjywXwckZfJsHMHGXwXwZfEkZYK3NCErYxTCtzWKFNMrcUwxTStywKYYpqEJimCmFYphimimFYppYFMMrYUwsEhmSESEVkhGSGSGWCQywSGZISUpkhkhmlISGaUpIXmSESEVpSmlISGZIZIRYJCMkMkIrU0rUw62UwrUw1NrcrUwsKaVqb5qYppYrcrrcrU01MUzywphYUwsKaVqYamKadbqaVkQZEJcZEESZEJeZEkQVkSWCILBEmRBEmlxElZEFgiPNLyJMiCJKyIKyI8yJIkrIksESVkR5YInysRTEURTEURCsRSwIhiKIpYEQrEXywIqMnGBMIBeOAzEMxK3OV3uONEcNE8oML5DMTnGMn0KNhS0NHBLMbi0NHD7M1wpM+hKMkApMSxKMkwdMkkJMzAcLAsGF5jGPQ9GPSJmiQ9GVBUlgRSsqTKgqTEURSsYzGNYzGI4itYzWMYjWIYjdVLjdV1DdVLjdVLjIkiDyF1Ct1Tnt1DicSLB6MXHo2MLzFx7M9C4sRMz0ezFzHMXHosIk0SiPNEInzl6JLCILHUOXS8rRJonqmiJebiMZWYysxmYjGbiMZWYysxFgxGYzGZiMRYMZmMxGYjEVmIyKRCwqDIhEKyIZFIpWRTIioMiKkyLCjVMKK1SVkQyKRTIhFKyKVkUyIRTWJIxyTNYWDHR0sDprKyY6OmsDpYHSsdKxzzHVgx0dMdHSwOFY6WBwsDpWOlgcNpMwKM+VjIGMS06bAFGS0haZNktOWlLSlgY9AsDGXlpC0xaVNj/VMqdUvqnau1b2rNXKwuMyOIbiMmzTgzHhEm00VQMpMrLM+DDKBdUwfYJCMJ7IUTBLykMwaoMpMLbBqzEbAyEwyARsMCJDxzAuhO4xO8NBMJoFxTGbwhAwhAIRMIRA+zCEQPoxKQlmMSkEpTEpSWYsBIp//vSxOWD7KE1Bg7zeMawpZ0B/3cQiUgSGVhIZiUglIYlKEh+WB+IoPxCsfiMfjH4jD4g+IsD8RWUhGUhlIZiiZSGZSEe5Ge5KUZqURSEYokKJmUhlIZvxvxm/EfGWD4zfiPiM+J+IsHxGfGfGWD4zPiPjM+M+MrPiM+M+Mz4j4zPjPjN+M+I74z4jPjfjM+N+M3474zPj/iN+J+Iz4j4iwXwWGDisvgrL5Ky+DL4L5MvkvkrL5Mvgvgy+C+DL5L5LDB5sHl8lZfJX8RY+MsfEWPiP4vi8/j+Ir+IsfEWPjK/jLHxFfxlfxlj4z+L4ix8R8Y3B8fxptxxxYbk24bgsNwWG5NuG48sNybctyVtwbccaWG5K25LHHeVtwVtyVtyWG48z6Psz6Psz6PorPsrPsz7Poz7Pvys+iwfZWfXlZ9+Z9H0Z9H1/+Vn0Vn0WD7/ysYjGIYisY/8sDFVMaWQKjErSmsxhkTbNd7TwTQKw7Yy2BArNLZa+DgYxU82aczFMmNGVDGGTssxNsiVMMaGVDLKD/wwxoMbMQRMazEECDwylUH4MYYDnDJ0hhkqhL5hzpEqYqYKmmVcFXJhTAUyWBUwxcsXKLAuX5l2YuWZdmLlmPGjxpYHjTHjR4wx4081M81HjDHjR4wrHjTPNDzQx4seNMeNPNDPNB4wx41bfM81W3zHjVt84/o/jRxRw8sR/HH8jhs4/0cCtHA0cUcTj+Rx83jHjTeNeNKPGzeM80KPGjeMeNK3jeljzQqPGlfmpx/o4mjhsb5o4x/laOHlhHA0cEcTRwRxNHBHE0cEcTRxj/NHBHEsI4FaOJo4I4Gjgjj5YRxK0cSiOIsI4lhHE0cEcTRxRxLCOBo4I4GjjH8aOKOJYj/8ymSmSspgsFMFgpgsFMlgpgsFMlgpj/MpkpgrKYKymTVMKZKymCwUwUKZFgpn/85fSArSAsJAaQJAaQJAaQpB5pAkPlaQlhIDSFIPLCQHL0vlaQGkCQFaQ//+WEhK0h/zKEoCwUBWUH+WCgKygKygMdFOczvAqTx+kjPIBcYzQdVzrRXFNl5l4zIezDTun7NpxpwwiVEzRsUSNRIdU2XzxjHVHVNcVBY2nRkTJpH/+9LE9AP1QTLkD/u5BmKmHYHrd8CQLDehoQFbGsWVsYpixZh9ofGZQQiZCJlBh9mUGNwNwY3A3BYG5MbhWIxuDjywfEZ8Z8Znxnxm/E/Gb8R8RYfjN+J+Iz434jfjfiO+N+I7434jPjPjP+N+Iz4z4zSkJDLBIZpSEhGSGSF5pSpSGlISGZIRIRpSJSG4ISGZ8Z8RWfH5nxHxmfEfGWD4iwfGZ8Z8RYPi8z4n4zPiPjLDgpkhkhGlIlIWCQzJCJCMkIkLzJCJC8yQyQjJCJCMkIkP/CK+AivmEV8Aa+F8Aa+V8BFfEDXwvkGL4Bi+QPB6+QivkDXwvgGL5hFfJqbW5qaphYrYrUwsKaVqYam1sVqZ/+VqYdbqaamKaamqaWFMNTVMNTFMNTFNK1NLCmlguvMuy7LBdGXZdmXbIlZdmXZdGXbIFguvKy7Muy7Muy6Ky6/ysu/8y6Lr/Ky6LBdFYi+YiCL5YEQxEEUrEUsCIgAAIzjXrzIsdzPGNuM74lYzhQRtOPZRM2YnYjXjDiNvWckrycM+JeMw41YjPjDjMWNWIw4yYzQ+VWMyl4QzKSECwQiZCBCJkIB9GH2qsZCAfRWh+VqrmH0ZSYpopplbFbGKaKaYpopplbFbFZfBWXwZfBfBWwcckUkZl8F8FbB5sHsHnhzJGeHMkZ+nl8GXxhyeHMkZl8F8GlIlKVkhmlISGVkhGSESGZIaUpkhJSGSESH5khkhlbB3+WC+SsvgsSRFhg4rL4LDBxWXyZfJfBYL4Mbk4wzjzjzVjG5KxuCwNz5WcaVjc+Y3A3PlY3JjcDcFg44xTBTTK2K3KxTSwVsYpophimCmGKahAZW5WximimmKaKaYpophYK3MU0Uw0IBTSsU0ythTSsUwz6Poz7Psz6hEsH0WD6LB9Fg+jPo+jPo+/LB9lcInCJ9lZ9mfZ9mfR9FZ9HCB9lZ9lg+iwfRkSlxYIgyIIgyIIk0vS4sET5kSRP+WCILBEFZEFgiTIkiTIgifKyJLBEFgifMiSI//Kx7LAXFgLywF5WF/mFwXmFwX//p+0DHimOOLuYeAyJgMigmbqSGaxAiZoQIQGUohCZURNBhmEWGBmF2WA1TGEDWMJP/70sTqA7TRMO5Pe7HWTLRgAe7SeAG8wSgtDEJEIMFgbgwHRCTDHESLAFxg9AXmD2ImYVAVJi2giGCKFSYtgtprEMRYOMrGMxiOI1iOMrGIrGM5jmI1jOM3iWMziOIzjGI1iWM5i2I1jGI1j+M1iuM/jOIrOIyoKgrEU0KKk0KKkypEQ1sQoypEQyoEUrKg0KEUxjWIxiOIsDGaxjEcxTGcxrGaxnEWFjM4zjLAxm8UxG8RxlgRDQoRDEQqSwIplSIhWVJiIhRiIIhiKVBiIVBlSIpWIhraIplQInmVBUFaFFYilhC/LBUGVIiFgqCwthiKIplShZiIVJiIVJiKVJoUVBWIhmOPRYHox7C4x7C4wvC8x6C4x6C4sBeVheYXBd5YC/ywFxhcF/mF4XGFwXlgLvKwvAyL0DIEAMiQAyBEIkAYQCJAGEQMiRAyBEDIEAYRAyJEGEAMg9gZAiBkSGESEGEMGwaF1guvDDQw4YcLrf///////4rPis0yXQ8jCXK2MUwR8zbSiDQhNaNg8Kky45YjHjHiMD0i4yiA8jF9G4MMwqIxTB1DA8CYMMQMUxXwezFeJDMkIHsw4gYzBjBjMGMGIx4g4jFjDiKx4iwDEYcYMZh9h9GH0QiYfQfRh9h9mH0H0YyIXZhdDIFYXZoLDIGF2F2ZNAXZYD6MPsPozKSETIRZtObN4Q1Vw+jMpQ+KzKDhHKDPs+zPqEfLB9mfcIFZ9liECxCBn2fXlg+jPuEDhGEDPrKCvKDPs+yxlBn3CBn2fRn3CJ5RCJzQXZl0XRzQXRl2XflguzLpkSwXXlguzZAuysujLsuywyJrtdlhdHkF0Vro10uzXa6K135rvIljIHkF0WF0WF2eRXRYXZYXXlhUGRSIZEIhWRTIhEMiEQyIRSwRTIpEMiETysiHClQZEIhkUiFapKyKVqkyIRDIpFLBFM9C8xeLjF56M9i4xeLzFwu8sC4xeL/KxcZ6F5WLvLAv8rF/////+mwmwmx5aXy0qBSBSBRh3wziYkGBUGLFHA5mTi0EacEIfGM3ETphx4ccbbKZcmKehbRi6gSEZWiGgmDIDTpYG9DFizJ0xYsK2MQ/EPzA+hD4yssVWMOO//vSxOSD7/00+g93mIbPJFyB/3cgFYjFYxWIw44OMKxzkyWYJDMJCEpDEpQkMxwQJCMPjD4zD4g+Mw+IPiMPjD4jD4x+MsEThkThE6VkThYaDiwROGROETpkTqKqZE4iqGiqoqhkTiKoZE6ROmiqNBxQicmROETpvxnxmfE/GVT4ys+Mz4j4zPjPiKz4yw/GZ8Z8RnxPxmomokWFEzUTpCLCiR0hUhHSFSEVaQjUSUTK1Eyv3I1E1EjUSUTLBfJWwf5sHl8mXyXz5l8F8mXwXyWC+CsvgrL4Ky+SwXyZfJfBl8l8lgvgy+S+DL4L4Ky+TYPL4Ng4vgrYOMvhg/zYPL4LBfJWXwVsHGXyXyUL4eVimmVuKYWBTCsUwsFbGKaKYVimlYppWVsWCtjFNK3MU0U3zQhK2MrYrYrFNMrYrYytxTDFMFNMrcrcsCmnCJ9mfZ9GfcImfZ9GfR9Fg+ixCBYPssH15YPrzPo+is+ys+jPs+ys+ys+v///ywfZn0faAIwSxlzA2BKMJYJYsHjmD0UcYiSBhhJo8GTQL6YfRPZh9BamI8QGYpgHph9hrmH0EgYN4JRmIHhWTJqYCJmYhJmahBg6oZmYZhYGIziGMsDEYxLGVoWaFCKWCpKxFMRELM4jjM4xiMYhiM47iMYziMYhiMiCIMiSJMiHVKyIK8gPIEuPxnUMiSIMiCJMiCJN1UuKyJMiXUKyJLBEmRBEmRJEFgiTIlLzIgiCwRJWRBYIgyIS80vS4sESZEkSWEuKyIMiCIK+I+NjNj4zYmMsMZWx+WGMrYytjK2I2Ji8scR8XGfExlhiLDGbGxebHxmxMRsTEWOI2NjNiYz42M+JiK2MsMRWxlhEK0QsIpoiL51CIVohYRSwilaKaLUlaKaIieVonmiohWi+VovmUghlIIZSCGCghggIVghWUFYIYICGCgpggKVlJgoKYKUmUAhgoJ5goIYICFYIWAUsAhWC/6BflpU2S0ybKbCbP////////////////////////////////////qNmiwp4Z4Ir53xpxmDEPEZuo+xngrEGy8Jeb1YRBixoxGjGDEZMScZpxoxmTSaAbupoBoLDImT2ZAWAiTH/+9LE4gOxDaEAL3dtxqgmXYHrb8jUCIND5Vc0P0PzIQMoNVchEzKCECsPsyECETQ+MoMhAPoyETKTMoMpMhEhAyETKCsrYxTStjb0b0OckrYytlizb0WKKyQzJDlmLBIZ3jOCFiWY3BJZz4oJCNKRKUxTStjK3FNNYsrYxTCtzFMK3MrdCA0IRTDFNFNLApplboQmSESEVkhFgkPzJDJCNKRKQrcFNKUkIyQ0pTSkJCMkNKQ0pUpTONOPMbk44xuTjys48rG4Kzj/KzjvM48bgrG4KxuSsbgsHHAw3IMNwDDcAZuTcgxxkGG5CJuAi44GG5A3GViA3HViCLjwibjhEXYGZAXQMF3AxdmQgwXQGLsyIGLsXQGLoXQMF2Bi6MgERdAYuxdAYujIAaaBdgYuhdhEXYRF0ERdBEXR1FQWEQ0SpLCIV1J1KIdQimi1J1KKaKiFhFNFRCupK0QsInmiIhoiIWEUsIpoqIWEU0RFNERP8x0c8sDhYHDHB0xwcMcHCwO1MwS1MFRfNxlbMu0kMHajNfMYPydSOLSSMaDwM8TxNWgzMn1AMxQ9MmCZNHjEKwQLA1GNR5FgWTB0kzJNCDFkkjRILzMcLzC4xysejIkiSwRJkQRJYIksJcZEkQVkQZEkQbqkSWEuLCXmlyXlZEFZEmRE9H46XGRM9G6rq+ZxDGYxDGWDjKziM4hiMYjjMYxiMYxjMYxjLAxGsYxlgYjGM4/8xiOIxjOIxiOIrOIzjGMxiOIxiGMsFxvZeWHsrLzenoy8uLBeWC7ysvMueyt7LBeWC4y4uMueyw9GXlxl5eVl5vT0Vl5YLysvMuxzei4y4uN7LysvMvLywXFhErQPxA0ETQQNFE0EDQRLCJWgVoH6gVoGggfqJooGgh5YRLCJYQTZQLQK82GE2S0haUCsIF+gUmwmyWlQKAjKBSbKbCBZaX/TZVL7VfVJ7VmqhMB7EWTC3AfcyckszNOuJyTKygPs0mwIROZmOjjV5Q44w+IXiMhjBYzDKQhEyssZsMIRJszInAhEwPsQ/MViFYzHOSQ8yQ8c4MFNEIDBTRYoxCAFMMb0EIDGDhg4ySMYOKwvgxg4L4MkNKU0pCQzJCJDK//70sTgA6mlMQQO7zxG0yYcRf9yeEpSwlIaidIZqJKJGonSEaiSiRXSEaiSiZ0hKJn7kokdIdIRqJ0hFj3M1Evcj9yUTKKJSt+IsHxG/EfEVnxGfG/EVnxm/GfEWD4yt+LyofGZ8T8ZYPiN+I+Iz434j/ivjLB8ZnxHxFg+Iz4n4jvjPjN+M+My+GDisvgy+C+SwXwZfBfBWXwZfBfJl8l8FZfHlgvk2D2DjL5L4Ky+SwXyVl8GXyXyVl8+Vl8mXwXyVl8GXxJGVl8mXyXyWC+Ctg4rL5Ng4vgy+WD/KyQywSH5WSEVkhmSGSGZIRIRkhEhGSESEZIZIZYJC8rJDMkIkLzSlJC//MkMkIsEhleRNdroryJrtdGul2a6XRrtdFhdla78ryH+a7XZYXRYXRrtdGul2VrrytdFhdGu12VrrywY/MxGIzEYywYjMZiKzEVmP//7v9wxGIHjMvjK4zFxB3Qyfo/cMcFEpDXqns4yukpDMRsKQjPBC6kyfoQXMMpGbys4RMszEIDCtxYsyzMhfMK2FijG9ScgxYoK3Kwbgw44G4LBIeY5yHHmSHisZhxoccYrGDcGKxhxhh8Y/EWA+MsB8Rh8QfEY/EPxlgUTLAokZSGe5FYokZSGe5lYomY06NOmNOmq5jTpqsaggNOmNODTpjTigiY04NOmarGq5XSEaiVIZqJ0hGokokWFEzUTUTK1EywomVqJGokomWFEjpCUTLCiZqJKJGokokaiVIRRROWKQzUTpCP3OkMrUSNRNRI5Iy+TYOL5Mvgvgy+S+DL4L4MvgvkrL5Mvkvky+WDvLBfBRg8ZfJfBWXwVnxFZ8ZnxHxG/GfH5WfGZ8R8Zvxnx+b8Z8RvxnxFZ8ZWfGWD4ywfGUPi+ZIRIRkhpSFZIZkhkheZIaUhkhkhFZIRYJDLBIRWSEZISUpkhEhmlISGZIZIRWlL5YJDKyQywSF5WppqZW5Wpp1sphWphqappYUw1MUwrrfzU1TP//K1NLCmf5WppWpv+WFN/ywRJWRPlgiCwRJWRJYIiA1iyLjNtJdN2I2I+Y4YzCIEuNl+FA0F7qTadn7NCAdE0gy+DKVO/NOdaoylBbDEKVIMvkjMx0BbT//vSxPaB9nkw4A/7uQaIMx2V7teQKVKVMKgdEy4xYjNjFiMOMOIw4h4jEvMgMS4IkwiBLjEuHUMUwUwrFMNCEUwxTRTDFNK3M4wbgrOOLBxxucDcmcdIcY3A3JjcHHGNwrEbnKsZucjcHXKcabnEhxucjcFY3BrFCmGsWKYZWwphYFNNCAUwrFNMUwrYythTSsrfywceY3BxpjcjcmNycaZx6sZYG5NWM44xuFYjOOOMM4044zjjjDOOOOOtlMNTVMOt1NOtlMNTVMLFblhTTU1Tf8rUwsVsamqYWFMOtlMNTVNLCmlamldbGplbeWFMOt1MNTVNLFbFitzrdTTU1TTU1TDUxTfK4RK4QLB9lZ9mfR9Fg+ywfZn0fRn1CJYPssH35WfZWfRn2fZWfZn0fRWff/4RMYRcYGYjEBmIxAwxAZjMYRMQRMYRMQRMQRMYGYjHCJjAzEYgiY8ImKETH4GLxeBi4XAwXgwXwYL4GLxfBgu///////wiHfCIdjD+DYMGoMAwMgnjDwHiMEQQsylVSTJoBYMxkbkyeQbjAoBLMNYPsxHASzB0AhMCEF4w3QXjJEbjAUkDJAbzBEPTGtHjJgxDJg8jD08zGsazJgPDDwPSsHDFkWSsWDJMWDFkWDGI4is4iwcZYGIsHEYxjEZxLGZxjGWDjNYliP43jM4piKziM4zjKxFMRULLBU+ZUlSYiCKYiiKYioUYiCIVlSWBjMYxjLAxGMYxGsRxmMZxmcQxlYxGcRxlgYzGMYjOMYzzJIx1YNYWTWRw1lZK1gx1YMcWTHRwx0cMdHTHFgrHCwsGsLJrCwY6OFawY6OlaycksmOrJYWDHVgx0cNYWCsdMcHTWB0rWDHBwrHSwOlgcMcHTHRwx0cLA6WFgsDpYHfMcHSwslY4VjpWOFgdMdHSsd8x0dAxggWWl8rGSsYTZ9AstImwgWgWgUgWmz6BSBSbP+mx6BXvkoizhnL5/7O3yNODGbDOEEmw4OcVjMy4SOjHYx2IymMJhO0SHBzS6BwU2VcFMNJEPcDJsyJwyJ0rLMRtCejKQxGwwdUJ7NCJQiTHBDigxKUJCMJCEpDLxy8YxKQJDMlmEpTJIzDkxg8L5Kz/+9DE4wPsmTUCD3dtxu6l20H/dyBg8rC+CsPiMfiH4zD4x+Iw+IPjLA/EUInBkThE6WEVU0VcicKyJ0rInTInSJ0yJ1oPNoOaDjRVWg80VYibMicInDRVCJ0sNBx3xPxmfG/Gb8Z8ZnxvxnfG/Eb8R8ZWfHsz4j4jPjfiLFIRqJ0hGomokaiSiRqJ+5monSGdISiRYUSwNRKkMrUSNRKkI34j4jPiviM+N+Mz4z4jPjPjM+I+Mz4j4jPiPiKz4zPjfj8sPx+b8R8RYPiKz4ywfGZ8R8Xm/GfEVvxlh+I/4j4zfjPj834j4jfifiLB8RYPj8z4j4ywlKWCQzJDJDKyQyskIyQyQjJCSkMkIkQrSlMkIkLyskIyQiQ/MkIkPyskMyQyQiskPyskIrU0sKYamKaWFNK1MLCmlamlhTStTCxWxWppqaphWppqYppYU3ytTCwpn+amqb5qapnlhTTLsu/MumQKy68sF0Vl1//9FTJeCBMb4PgxsxszPpJNMTBBAzih+DIUfLNLZggxvhIDKvIPMeskAzRQ5jIPD4MXAIEwWhSDGUDmMJApkxPRPDEGB0MQcQYxmTTTIqEGMZg94xBhmDEGEGMHQQYxIRIPMSASAxIBITEgEgMSASArJeMl4l8znSXisSAsEvGJAS8YkAkJiQiQGS8c4bDBzpkvCQGJCc4ViQGbLmG5psGbJseZsub5WbBmybBmw5pW5ppAkBpBLxXL5y+kBWkBpBL584kJpCkJy8kJXL5pAkJpAkBuY5hYsIzZNkzYNgzZNgsGz/lg2SwbHlg2Cs2TNk2DNk2CwbBW5hWbBmybBYNgzYNksGwVmyVuYWDZKzZKzZM2DZ8sGyWDZPDUzUlI1JT/zUsMrU/K8M8JTK1MsKRqSkampFakakpFeF/lal/lYsWBcrFjFkorFzFhY0oWLAuYsLf5pQuaWLFgXKxbzSxcsJRWLeVixYFywLlYsVgJgBAYCAGAgJgAD/lgB8rATNbnpMdFzc49h1DcFmdMynhA5slVjuPzbOkJRI2uDwTJFPBMKg74xCkIDPiHiMmI2Iz4iYjadC7MZBBcxkTQSsPozKSEDQ+IQNVdD40ICtjQhFNNCEUw//vSxOmD74k09A93eMagJt0B62/IytxTfNWMbkzjDjzG4OMKxuDSkSkLBIRkhEhGlKlJ5uCpSmlISEWHBDvGJDLEsx8UpSmlKSGbgks5YcFLCH5WH0ZCAfZkIEIGQgH2ZCIfRkIh9mQiH0WCECsPsyQiQjJDSkMkMkMyQiQjJCcELEsxpSkhGlK4KWCQitKU0pSQytKUsHHGrEccVnGmNwNyVjcGNwNyWBuCwcaY3I3BWNwY3I3BWNyWBuCsbgGFMAymK3BhTYRKYBq2KYBlMKYBlMVuBq3KaBq2VsDCmgdiymAZTCmAatymAZTSmAZTSmAwpgMH0BoRQhCI+wMfQ+wYPoIj6gwfYMH1CI+sGD6gwfYMH2EUIQiPo2JjK2M2NjPjYjY2MrYzYmM2NiLDGWGMsMZsbEWGI2NiLHF5sbEbExFbGbExlhiLDEVsRWxeY4OFgdLA6Vjpjo4Vjhjg4WBzysdKxxUyAg5zGNC3MDlKEyQQ5jYmNMOP9ic2eT1ys2Yw7htjMFG2MRkoAxGSGDBaBaMPkDIwgBcTCqEwMTEGkxcgJDAlDuMO8CQwaRMTBoCqKwoSwFCYrorpiuhQGIOIMWAdDEGEHLAgxg6g6GGyGyWBzDDZDYMcwc0sBsmOaWGYbIbBhsBslgNgsFhmOatCY5gbJhslhGGwOaVjoaDjqY6oObMDqaDjqVjoY6DoY6DoVjoY6jqZsmyZsmyWDZLBslZsn27meZsuYZsuaVuaWDYLBs+WB1NBh1NBh1Kx0NBh1MdR0Kx0LA6mOo6eY6oOaDoOY6DqY6DoY6jqWB0LA6Ggw6FgdDHUdDQYdTQYdTHVBiwOvlgdCwOhjoOpjqOhYHUrkCwcFg5M4ODODkrkfKzkrOCs4LBwVnJnBwZwcmcHBnJx5nBwVnJYOSwcmZrXmFmRhYWYUFlgKLAX/lgLLAWWDMrCzCwswsKLAUVhRhYUYUFFgL8woK/zCgsFEnqIFy/LlFgSLlmE0Bxhg3Ah8Yy+KJmV0B45p1xk6Y3qhtmUlEL5hfAOiYNUCJGIsieBjTpdQYF0J3mE9hkBh44EQY4KI2GKrhlJiqwQiYqsM3lghAzKCETQ+MpMhFVYyEA+zIT/+9LE7oPwVTD4D3d4xrcl3MH/dfhIQMhEPo0PiETJDJDMkIkIrJCMkMkMyQkpTL5YOMvgvk2D5Iisvky+C+DYPL4LD8ZWfEZ8V8Zvx3xGfF/Gd8Z8ZWfEZ8R8ZYJDNKUkIyQ0pDJDSkKyQzJCSlNwRKUrJDLCUhkhkhGSESGZIRIRpSkhGlISEZIaUpuCEhG4KSEaUpIRkhpSmSElIVuClZIZYG4MblWIxuBuSsbkzjRuTG4G5KxuSsbksDceY3I3BnGHHlY3PlhuCw3PlbclbceWG4K+ONuW5NuW4Pj24K24K24NuW5824bksccWIROED7K4QK4RKz6Kz7LB9liESs+zPqECs+is+is+vM+z6M+z6M+4QLB9lZ9Fg+iwfRWRBkQRBYS80vIkyJIgyJIkyIIgrIjysiCwRBWRJkQRPlgiSwRBWRBWRHlZEFZElZEeWCIKyIKxEKxEMRBFMRBEMRREMRBELAiqMesoQxrywjIqNNM03Pow5xlDPzRJMRgOUygT6TLDLDMXUO80oQOCwEiYEo/Jj8D8mT+BKZsw0hYDDMTQFIxpBpTDCE0MFIoUwwxNTDZHMMNkNkxzA2f8xICXysSAxIBIDEgJf8rF/MxsX8xfxfjS3MbKxfzF/MbMxsxo0tktjZUMbNLcxszGjGjF/F/KxfjDZLCMNgNkyww2Sscww2Q2TDYHNKxzDDYDZ8w2A2CsSAxICXisSEyXxITEhJfMl450yXznDJfOdMSESAsCQFYkPlahNQ1w1BXDUChNQKA1CoStQ+WFAagrpWoDUKgOuKE1AoStQlhQFahLFcK66ahrhqGumoK4VqE1AoDrigNQ1wrUJYrhWoCwoTUKhOaFMymUiwUzKZSK2EZTYZlIpmUikWCl5WUzKZSKykZSKRlMpGUikZSKZYYRWUzKTCKymWNJWkLCQ0qU0iQ0qQ9CQr0laQrSlaUrSlhJ5XpK0vlhKVpSwkK0nmkSlaXzFCywLMUL8rFmKFmLFFYvysWZSwVZheBxGUwUybf5+ZojCaGzw3QaJJopokn5GBKcWY/IVRmikgGJ4PWYfIQBikgFmKSBkYpYchg+glmL+CWYKQYZgpApGGEGGY0oYRYA5P/70sTtg/FlNPIPc1yGJSXewe7vGMDgOYwkBPTCQA4MHQHQxBgdDB1EHKxBisHUsCQFgSAxIRIDEhEgMl450xIRITEgEhMSEl4sHOmS8JCVnOlgl802iXjEhOcOwzZNzTYM2TZOwjYNzDZK7DM2DZLBsGbJslg2CwkJYSA5fSEsJD5y/zhYl80gl80hl8sJAcvpAVpAY6oOY6joY6IOY6jqY6oMY6DoY6jqWB0MdR0MdR08rQY0GHXzFIwzFIwjFIwzFMUzMIUzMMU/K00MUhSLBhGmgpmYYplgUzFIUjFIwywKZikKRWpGpKXlhTK1MsKXlakampFhTNSUjU1IrUvNTwyvDNTUzU1IrUywp+YUZFgLMKCisKKwowoKK1owsK8sBZhYUVhZmRmWAozILMKCiwFFgLKwswoLLAWVhRWFGFhXlgBKwH/KwEsABWAVTEFNRVUyOMZiMZiEYjGXiFEyFEroMQhTrjG9BYo0jpQONmQJDzG9Sck1oIFNMhLFxDJIhp0xD8idMQ+L4DCERm8xD8ZvMVWHhDInQhExYsFMMb0CtjEIRYswrcheKwkIsCUpYHBDEpAkMxwQJDKBIcsCUphIYSGYSGJSlYokWBRIsKUZiiR7mZSGUhGUhCiZiiR7mZSEe5GUhCiRYFEzPcxRIz3M9yNnTKQzKQj3Iq4cmweXwZfDB5VL4Ng4vgrL5MvkvgsF8FZfBWXwWD4yw/EZ8b8ZYPiM+P+Mz474zfjviM+M+Iz434jPifiLB8XlZfJl8F8+ZfDBxsHl8+WC+f8sF8FZfBl8yRmweXyVl8FZfBl8sHmXyXwbBxfBl8F8GXyweZfBfBl8F8mXyXyZfJfJl8F8GXxJEZfBfBYL58y+WDjL5L4PjG4824bksNwWG5K+PNuG5NuG5/zbhuCw3Pm3DcFbcFbcG3LclhuDbluf/zLsuisuisuiwXRWXRYZHysu/Mui6NkC6Ky6Ky7LBd//mXZd+Zdl2ZdF0Vl0WC6LBdGcQxmMQxFYxGMQxlYxlYx+WBiMXoR4zEB1TFNHUMuUD0zYgYzFifjND8xkzUiLTEfFNMR8dUxJA1TDwCeMMwX0wWB8zDMEJMC4MYx9xEzFeDHM//vSxPgD9gkw3g/7uMW7pt8B7euIQopUwqAqTBEBELAIphxgxmDGDEY8YMZixAxmDGPEYsYMRWHGWA4jFiDjLAXRWF2WBkSsLoxkBkTC6GQLAXRhdE0mncTQWBkTGRC7MLo0AwuhkDGQJpLAXZhdBdlgLorC6MLsLosBdFYXfmF2F0WAuiwF2YXYXfmF2MiWAuzGRQXMLsLowuiaTGRC6MLomnysLs+NiPi4ytjLDGVsZWxlbGbGxGxMRXxFhiLHGfGxGxMZWxFhjPj4jY2PzY2MsMRsXGfExGxsRY4yvi8sMZsTGWOMrYzixDixSuKcSKVxfOJFK4pYiFcXziRSxFLEQriecSIcWIWIpxYpXEKzJWZLTIFFpk2Csx/lpi0wEMFpwIZTZTZTYTYLSFp/LTJsoFFpFOAgyo2ir6nCK6jSnHqcqjJsybMwyg4RMGRPBTK0RpwyJxSaMmyWyjbJBmwzyYVXM9yCezFEyFEwygZvMVWJszE7hBYxcUC7MGRHdDEFxO8wZATvKxcQzjxuTOOOOM44bgxuZDzFNFMMU1CAxTCtjK3b1LBxpucDclgbgzjjjSs48rPj/zPjfjK34zPjPjN+M+I74/4j/jPiP+O+I7474zPjvjM+O+Mz4z4jL4L5Mvlg4sF8mXyweZfBfBYL4MvkvksF8mXwXyZfBfJl8sHGwcXwZfBfJl8MHnJEXweHDB5WXwVyRmXywebBzBxYYOMvkvkzjDjDG5G5MblWMsDcFY3PmNyNyWBuTG4OPMbkbkrG5M40bkxuRuDG5OPK74O+L5LF8Fi+PK74O+b4/yu+Su+Dvm+fK74K75K75O+b4LFbHW1bmpqmlameVqaVqaamKaWK3K1MNTVNNTVNK1MOt1NNTFMNTFMLCmFamFamlammpqmFaXmRJEFZElZElgiCsiTIkiCwRJWRBkQRBWRJWRJkSRJkSRJYIgrIgrIkyJIjzIkiCwRH+WCIKyJLAiFYimIoiGIoilgRfKxFKxEKxFAMw2YGkMWZJizLszqcxQ4o4MdJDTDSrTY00xQOVMaIFyzJkB9oxiYGYMF0EEDB+AjwxEYIVMNmAwzD1w9YxHEK6MNMDTTBmQZgxK0LCMP/+9LE/4O2ETLiD/uvxvwr3Mn+05q3CwzErAcwsA5hh24duYOYDmmBsgbJgbAOaYc6EvlYS/5hLwm2YS8CQFYUyVhTBipgqaVkAZhTIqaYUyKmmFMEAZippAEYqaFMGKmIEZoEYqaUCmZYFTDCmApgxlQZUMS2BfjDGgX4xLcF/8sBjZgvwL+WAxswX4F/KwX4sA/JYB+TB+AfkrB+DB+BiYwfkQRMQREETGJxicwfkH4LAPyViCBYEETSDnSxLxpCkBy8kBpAkBYSArSEsJAaQpAaQJCaQpCaQpCWEhNIZf80gSArSA5eSErSA0hl8sJAaQJAWEgK5fOXpeOX0gK0gLCQmkKQFhIPM2XMKzYM2HNM2DYKzZKzYM2DY8zZNgzZNnys2f8zYNnywbBmwbBmwbHlbmlgwysUjFIwzMMUysUiwKRmGKZWKRYFIrFIxSFIrFLzFIUysUzFMUzFIU/MUhS8xSFMsCl5WKRWKUDcOAi4gxwEXARchFz///58Vy6zSpZeuaow+SDzEgKGMu4JA1+wkTIYF/MEoukyDiXzFJCBM50pkxlAODE0EUMc0HwwCgCjFICBMFoNEwPwXTB9C5MHwFwwaAqjCrDuKw7jCrF0MJAOYxPQkDA5CQMDgOcwOAkCwByYSISBYA5MDgT0w2Q2PLAbJhsnbGGwGwY5gbBhsDmGOYWEY5pYRjmDmmGyGwY5gbBhsDmFY5hXBjOh0M6nUsQcsQczqdTOkH8zodCwdDUCgOuqDzUFdK1CagUJXXTrieOuqA1DXTUFdOuqAykwzYTDMplMykUzKRSKyn5YKZWUiwUzKZSKykZSKRlIpGwimZTYZlMplZTLBTMplMykwjKbDKymZSKRWUithHNCmZTKRYKRWwywUzSKQK0gWByVjjywOSscFY4Kxz5WOPLA4KxyVjksDksDgsDnywOSwOCsQlgAFYgMQgEwAATAABLABLABKwAYAABiEAFYBMACAwAAfLAB8wAATAABKwAYBAJYABWAPMAgAGEDAIoGkGH////////wYGls3QY0qkxjzjZGkKSaZFJXRrKURHL57Ke9ZyhnKwBnL4cqYd5YZkejbmaYRWZ757xg6EVGWsQ0Zf/70sTfA/CdmvgPchlGOKacwe7vkKyh5nKkNmduGyZYZYZjmnblZYRptHOmm2JAZL5LxkvkvmY0lsYvxjRmNC/lZjRYMbM2Y2csGzlZsxUNmLBs5mzt0GbMbOZs7dBt0mzHvdvee+FNhmzN0mbObOWG6SwL+WBfjMbF+MxpLcsC/GL8L+Yv4v5YF+MX8X8zGzG/KymTKYKYLCpplMFMlhU04AimDVMVNKymfNU0pgymCmSxL5pBLxy9zpy/LxYl/zSGXitISwkJy+kJYSEsS+aQS+aQy8WJfK0hNIEhK0gK5eNIUhLCQlcvf5WkJWkBpAkBpCkBy/L3laQG5hsmbJslZslZsGbBsmbBsmbBslg2DNg2DNlzPLBs+VmyZsGz5YNkzYNgrNksGyVmwVqR4SkVqRYUiwpGpYRYwjU1LytSNTwywpFakVqXmpKflhT/ytTLCmampGpqRYU/8rOSs48zk4M4OTOTnys4MJiG4zD4gOIyfo4uMQWEFjM+Cso0mxA+M1WJ+jFxR3QxO8TvMkiGnDBCgKkw1oVIMETCjjCQwRMwfcMpMDjE4jDYgOMweINiMLomgzQBkTTuJoMLomksGUmh+H2YfaHxkIB9mKYVsaxYppYFMMrZCAxTBTPKz4is+Iz4n4zfjfjM+M+MsHxG/E/GVnxm/H/EWH4zPiPiK74jPifjKzjysbksDcmNyceZxg3BYOPM4w48xuRuDG5G4LA3HmXwXyVl8lgvky+JIywXwbB5fBYL5Ng4vgrL5Ng4vkrL5MkJKUyQyQyskMrJDK0pPMkMkIsEhFZIRYJD/yskIsEheWK2OtlNLCmmpimGpqmGpim+V1uV1sWFMOt63LCmGptbldbmpimFamFZ9liEThA+ys+is+jPs+is+jPs+is+zPo+ywfRn2fRWfZYPosH2WD7M+z7M+z6Kz6Kz6Kz7K0uKyJLCXf5YIkyIIkyIInzIkiTIgiCwRBkQRJkQRJWRJYInysif8rIn///KxELAiFYilYilgRDEURDEURDISwmgzH4acM6OHODHOGZExKUvGN7PoUzQ2wrczgZOuMDjGYzFYwGMybIMoMeEInCwNOGNOhNBhNAF2YKaIQGLFE5//vSxO0D8vEw5A/7r8ZKpluB/3cYBQK2GIQAphiEIhCZC+CmFYsWZJGMHmMHhfPmSRDBxYJIzGDhg8wvgYPKxg7zFExRLzKQykIoKJDKQxRMrFEis1XMadUESoarlVQQKDTgrGnTGnTVYxpwadLD8RnxnxmfE/F5WfGZ8R8ZYfi/ys+IrL5Ng8vg2D2DzL4YPNg6SM5IpIj9PL4Ng6SI8OC+DL5YPNg8vksF8FhKUrJDNKVKUyQyQiskIrJC8sEhlZIRkhJSGSGSF5khpS+ZIZIZkhEhmSElKZIZIZWlKVkhlaUvmSESEWCQzJCJDMkJKUsJSmSGlIVkhlgkLzbhuTbhuD41uf824bgsNybcNwWONLDcG3Lc+Vtx5ty3BYbgrbgrbgr40scZ5n1CJn0fZYPsrPosH15YPvywfRYPorPr/Kz6//Kz68sH2WD7/ywfflgiSsiSsiTIkifMiSILBElZElZE1QAAIw8YUSMUSI9isD7MMoThDDKThEzyceEMuOGXzI9hRIw8kAdMIsAkjD4huIwWMPiMQhClTClAQowjMBFLAXRoLBdGguaAZCIfZkIkImH0H0aHwfXmhCKaaEJW5oQCmGKYKYVlbmKaVuYpgpplblbFZfBl8l8GXwwebBxfJl8sHmXyXwWD4ywfEZ8Z8XT/iPjK74is+MsHxlgbgsDcFZx5jcHHlgbgzjhuSsbkrG4KxuDG4G4KyQiskMsEh+WEpTJCSkLDgppSkhlaUpWlIVpSFZIRqaph1upp1tW3lamGpimlam+WFN81MUw1NU01NU0sKaamKYdbKaVqYamqb5WpvmpimlamFameWFMK1NLCmmpqmlamebIl0bIMiWC7NkC6Muy78y6LsrLsy6LvywXZYLorLrytkDLsuzLsujLoujLoujLsuywXRlSIplSIhiIVBWInlYi+ViKYiCIYiCL/+YiiJ5iKInlYimIoiGIoilgRSsRSsRPLAimIoilgRSwIvlYieYiCL5WIn//oNFVL4TPJyJ0o0GzHBDikyzIQgMszTrjrEVXs1XpV7M4HOBjSRRYoxvQycKz3AxD4D6MMoHhDInSJ0xwQ4oMcFCQzLxxwUxwU4pMJCCQzEpT/+9LE7wOxwTLmT/ut1pqmWwH/dxgkMwkUlnMYPC+DC+Bg4ySIYPMkiJIzGDxg4sDB5jB4XwYXwF8FBg6UNVpjTo05wxp01XNQQGnCsac8oWZTWg1oIotBqcrWgii0F8z4n4zfjviM+P+IrfjM+I+MrPjKz4is+Iz4z4zPjPiNRNRI1E1EywokVqJlaiRVUTK/cjUTpCOkNRI6QlEitRIrUTLD8ZWfFoz4j4ywfEZ8Z8ZnxnxFZ8Xlg+Iz4j4ywfEWD4jPiPiMvlg8y+C+CwXwVl8lgvk2Di+DL5L5LBfBl8F8lhg4y+GD/8sF8FgvksF8FZfJtxxx8e3Jty3Bty3Jtzx5Y40sNwbcNyVtyV8aWG5K25K24NuG5K248rbg254024bkrbk25bksH2WIRLB9lcIlZ9lg+vKz6Kz7M+4R//M+z7LB9lg+//ys+/Kz7Kz6LB9mfR9+Vn2Z9n15WfRYPorPvys+v/3///9CNRon4ywjRzEGB0OZAioymS7zVMZROZFZUyKj3zEYAqMJgLwwkESTE8KYMbYTEyPAaDAlJ/MOYpgwkQOTDmA5MFMaUwwgwysTQxNAwjGYIqMHUQYxBxBysHUwoAoDFcChMKEVwxXAoDChFcMc0c0rHMLA5hlhBsmOYWGY5obJkvEvFgSEyXnViwJAYkDDBkvEvmS+S8WBICwGyYbAbBYDZLAbHmGyGwWA2CwGz5YDYKw2DHNDZMc0Nkw2RzCwOYZYQbBnbjmGGwGwVjmmGwOaZYQbBhsBsnBzqWDqcGgxnU6lg6mdDoZ1Ohwc6Fg6lg6HB4MWDoZ0OvlahNQ1wsKEsKA1CoPLCgLCg81AoSwoCwoCtQlhQFddLCgNQqA0ikDHI4LA4NIDkxwkCwOTSA5KxwY4HHlY48sDkrHHlhIFhImOEgVjgrHHlgs88zzKK8isoryLBRWWWCzKz8yijLLK8ywWVlmUUeRZlFmWUWCiwUWCywX5XCYAJYBMEEwAfMAErBMx/FxDFxCSI0jkVjNXkXuzJyArY1RgK3NtlZkTSO0GUxCEYPMTnHmDCEDyYxD4MoMDiE4jF4w2IxWIFjMK2G9TFihvQxvUnIMeEA+zCEQygwPsQ+MVXP/70sTsA/AxMPAPczyGVyXbgf93CCEDDjhzgrDjjDjQ4wxzkViMfjD4zD4w+IrD4/MfiH4ywNOeUGnBqCBqsY04NOmNODTpWNO4FZqubWWNOmNONZZjTg04Y04NO+Z8T8fmfGfEVnxlZ8ZnxHxFZ8flZ8RWfEVnxGfEfGWD4ys+Iz4j4jPjviP+I+Iz434ys+MsPxG/G/EVnxnfF8ld8Fi+PLF8Fd8nfN8Fi+CxfJYvj/O+b5LF8lfHm3LcnxrcG3HHnxrcebcNwbctwVtyWONLDclbcG3LclbcFfHG3PHm3HHlamlitytTTU1TCtTCtTCtTSwpnlitvNTFMK1MLCmFdbmpqmnW6mFhTfLCmGpqmmXRdGXRdlZdmXZdGXZdGXTIFguisuiwXRYLsrLorLrysuvMui6LBdlgujLsuiwXflZd+Vl0ZdF0VkR5WRPmRJE+WCIqTEFNRTMuMTAwqqoAAAAcx2IniMFjHYzEPlbMwykVWMVWSbemGgk/ZYFxDD4geMxmITiMTiBYzE4xWIwWwIzMIzEIDCMg1ozvh0THRIyMEUdAwiBLjHUEvKx1DEvMhKzQCtBcwuhkTC6C6KxuTG4ONKxuDG4G4Mbg48y+GDzL4L5Ky+SwXyZfDB5WXybBxfJyRF8GwfhyZfJfJTDkVl8GXyXyZfBfBimFbGKaVsZWwphimimGVuVuVim+WBTDFMFMMUwUwxTBTDFMFNKxTDFMFNMrZCExTStjFNFNMUxCExTBTDK2FMMUwU0rK3LFbGpqmmpqmFameamqb5YUw1NUwrUwrU3zUxTDU1TTPs+yxCJwhCBYPsrPsrPoz6hD/M+z6LB9mfR9lZ9mfR9mfZ9HCB9HCB9Gl5EGRJEm6hEGlyXmRJEmlxEeVkSZEkQZEkQWCIMiCJKyJLBElaXlaXlZE+VkSZEER5YKgyoEQxEEQrEUsCJ5WIpiKIhYEUsCKYiCKYiCJ5WIhiIIpWIhiIIpYEUxFEXywIhWIhYEUsCKWBFLAX+YXheYXhd/lgL/MLwv/////////////e9/vX//auye1Qta0mafxqaxDeaOgIZIvcdutycWIQc0eScWTQahjqYGAYatDSatkKYMniZP//vSxPID921w5m/7rcVfph8B3eeIDQYnkKYInkaPHmZMjWaEiyahoSYskmYsA6YXImaJmMY9q+Y9GMaJD0ZjImY9hcWDHMex7MYjjLAxlg4jOI4zOMYjOMYjLpkTZEujLpkD0DQTZAuiwXRl2XZWyJoUIplSVBiIIhlQIpiIIpYEUxFEQsFQYilQVlT5peRJWRJWRBkQlxYIkyJdUyInvzIkiCwRBWRJjqyayOlY4Y6OnmDhjg6VrJrI6aysFgdNZkisdMcHTHFgsFxWXG9FxWXmXF5lxcb2XmXF5l5eZcXFZcZcXlb0Ze9lb0Ze9FZefiPn54VomgiaCBoImgiV+eaKJYQNBA0EDRRP1A0ECv00UStEsIGyx5YZA2KbJWwgWWkAjPlpvTZQKLSpspslp02C0ybJaby0ybBaRNktMWl9Nj0C6jMnF+w0NoK2MG5MuTdOpmc0IkvHNVKvdDrEWI42JE9PMhiD4zE4geMyckheNDaIXzE7iEoxcQTvMn7CaDGbAhExm8IQMQ+A+ysFMMK2G9TG9ArcwUwK3MkjC+DGDwvgwvgL4ML4GDjD4g+Mw+MfiLA/EZfEfxGPxn8ZjTo06aggNOGarGq5www04Y04armNODTpjThquY04oImarjThmq7WUY06NOFY04UGnRYGnTfjfjN+M+Mz434ywfGWD4iwfGZ8Z8ZWfEZ8Z8RnxXxlaiRqJKJeVqJHSGomWFEjpD9yOkP3I1EqQytRMrUTNRJRMy+WDjYPYOMvgvkrL4Ky+fLBfBWXwVl8mXwXwWC+TYPL5LBfBl8sHlgvgrL5Ky+SwXyZfJfPlgvk2Dy+PLBfP+Vl8GXyXyVl8mXwXyZfJfBWVuaEKEBimCmmKaVsZW6EBWKaWBTDFNFNKxTTFMK3KxTTFNFNMUwU0ythTCsU0rFMMUwU0xTBTSsUwxTStjFMFMK115YXRrvImu10a6XRrvImu12Vro12uywuitdeVrsrXZWuytdla6LC7NdrvywuywujXa780QiStE+VogsIjytElaJM52Fg6YRPTCh6nLChxnKKHmcppabpB7xnvPtGiMUIbrImhgpF6GzyXoZyorpkNENm0SoeVlCmXqJqYmr/+9LE/4P4aTDYD/uZBicmnIHu75A0plhDmGOYGwY5pYZYLDM5wl4xIBITJfOdLAkBj8D8mPyggWB+SwPyY/A/BWqYappTJlMlMmqZAEcAUARwBFMFapplMqmnVzAGcASphXAEaphTBlMlMlZTBWlsZjZjZi/C/GL+L8VmN+ZjQvxi/i/mY0L+VmNmL8L+Vi/FgX4xfhfzMbMbKzGjS3F+Mxsxsxf0tisxsrF+MX8X41/X8rX41/X7/K1/81/X8rX/ywvxYX/ytfywkJpAkJYSDytITSBIDSBIDSFIStICwkJWkHnL6QlaQGkKQFhIDSBICtXSwrplAUJWUJYKArKEsFAVlAZQFD/lgoSsoP8sFAZQFAVlCVlAVlCVlCcicHISJnBwWJEzk4ORkTOTgzg4K5EsSJWceVnBWc+ZycmcSJyJyVnPlZwWDgsHHmcHJkhIWCUyQlMlJTJSUyQlMkJP8yQlM80n40EVGjLC5AOXaXcy1qOTaIo4MNl407YSwzLCCqMKpBAx+A7zRTAlLBepiakKGCkQqZChQhiaGzmUINKYmpCpkKDSmJqNKY0gYZjmBslgsIywxzSwOYVjmmOaGwY5o5pjmBsGGyGwVj8FhBEsD8mgiPybEw/Jj8D8GUwUz5Uq5NUyAIymSmTKZKZMphUwymCmTEhEgLAkBYEh8xISXjEhEhMl8l8xIRITEgEgKxICwJAVkvGc4JAVkvmS8c6ZLzqxkvurmS8c4YkDDJiQkvlgSAxICX/Kw2Sscww2Q2TDZDY8w2Q2DLDHNKxzPKw2CsNkw2BzTDZDYLDZNstg2w2Sw2Cw2CtsebYbJtlslbYNsNk2y2fLDZNstgsNksNk4OdTOsGM6nUsHUsHUzodTgx0KzqWDoVnUsHQsHUsHUzqdPKzoVnQzodPLB0KzqV6CtKaVIWNB6UhpdBXpNKkK0p6dJWlLCU9KTzSpCtKVpTSpTSpfNIkLCQrSmkSnoSlaQsJTS6CtIaVKWEpWlLCXytIAZmqw04ZJEILGcDrQRnuI3oYZQVlmVlF8BkzgT2Zm2LcmcXC4pk/QuIYOiEZGGtAIpicQTEYPECxmDxBMZjwoquYQiB9mM2iqxh4wOqYOv/70MTwg7I9NOgPc15GmCacCf9yOIHjmKJCNhgl4ZAaH5CJYIQMhEPow+w+jVjOPMbkbkrG5KzjTG5OPKy+DL5L5MvmSM5IpIjYPYPKy+DL5L4Ng/Dk8OZIz9PYPOSPDgy+C+DL4YPKy+CwNwZxo3BWccY3A3JYONM44bgxuRuTG5G4LA3BjcHGmNwNwWBuTOPG4MbgbkrG4M49zkzjFYjVjVjMbgbkzjjjjVjViM44bgrOPMbkbksDc+WBuSwNx5YG5MbkbgsHHGNyNyY3I3BWNwVjc+WBTTFMFMMUwUwsCmGKaKYYphW5YFMKxTP8xTBTCwKYYppW5YQgLApnleQPILorXRrpdGush5rrIla6NdLrywuitdea6XRWujXS7K10WF0Vrs10uytdHLkSVogrRBohEGiER/laILCIK0T/lhEGiER5YRHmiESWER/lhElhEf5YF/lYvMXMfzF4v8rFxi8XGLhf/9Oz6dM34x4zdiDjM0C6k7qXdT4QVWPyYhE0bB1Tj3EvMntRIye3qzZwKUMKgEUx8gkjG5DMMiwXwylRbTCpFsMQoWwyYiYjDjDiMGIWMx4hYjC7NBMLsmgsBdGTSMiWA+iwQiYfYfZkIEImZSQgWDjjOPOMKxuTViOPK1YzG4G4MbgbkxuVYjOOVjMblzgsHGFgbgsDcGcaccZCAfRkIh9GQgH0YfZCJh9h9+WCESwH0YfYfZYD6LApv/5lbimmKasWZWwppYFMMU0rcxTStiwVuVimn1OoaJRJYRJy5EGiUQcuRJy+XliXFiXmiUR5ohEFaJNEog10uytdFhdGusiWF2a6XZrpdGu12Vro10ujXa6LC7Ndrs10uzXa7LC7Ndrs2JiPi4yti82LjPjYiti8sMZY4j42IrYitiK2I+JiK2M2NjNjYyti8sMRYx/N7L/LBf/lZeb0XeWC4rLvMvLjLi7ysuMvLjL3osF5YejLy7ysuKy8x0cKx0xwdNZHCwOmOrJjg6ABzE4geIx+INjMQ/InDRVjyYzgcb0OBqFizGbED8xm8ZuMx/HdTCaQmgyEoGQMacBkDFxALswZAd0MTvDQTMpQ+MPsykyEWbzWLK3NYsUw1ixTDQj/+9LE64OwTS7oD3N8RtWw283/dbkK2MUwrcythTDK3WKMUxCErYOMvkvky+S+SwXyWGDzUSpCLFIRWomfuaiZWokWFEzkjYONg9g8pJGOSNg8pJHNg4vksF8mwewcZfLB5l8l8mXywcVl8lZfP/5YL4LBfJkhEhFhKUyQiQjSlSlMkMkM3BXBStwQ5Z0pSskPytKQrJCNuG582543zbhuDbluStuCw3Jty3Jtw3BW3BYbgrbgrbg1NUwsVuVqYamqaWFMOt1NK1MNTFMNTFMLCmGpqmmpqmFityxWxYUzzrdTTPuETPs+jPuESwfZYPsrPsrPrywfRn0fZn0fXmfR9lZ9GfR9+WD7LB9+Vn0Z9H2ZxDEWBiMYhjKxjKxjMYxiKxiMYhjLAxmMYxFYxmMYxFYxFZxmMYxf/mMQxeVjEWBiLAxf5WMZjEMRYGMrGLzGIYiwMfmMQxf////////////3nabm+b//w7e33+fz7WM37EuSaSsc0w9yRzF/GyMhk4IsIoHjgQ0bqiJBn5jKGHKIyZjRp5mNkMmIwFiY9YSJl3jKGEgJ4YVQ2xiYD8mFWFWYnocxgcBzmHMByYyoHBhhkKFZChjShhFYmhWbBYNk3MNksOaWDYNIUgNIJeOX0hK5eOX5fOXkhNXVdNXbWPlVdPlFcPlbWO1ihLBQnDZQmrpQGrpQlhXTVwoTKEoDKEoDKFXSsoDKAoCsoCs2Ss2SwbJW5hYcw+2cwsWEVuaWDZM2XNKzZKzYMwhTMwk1KxTKxSMUzDLApeWBSMUhTLApGYQp+YpikYpCmYpikWBTLApGYQpFgUisUzFMUiwKZWKZimKXmKQpmKZhGYSalYpmKYpmmopGSIcmSBIGHIcmHAcFZImHAcFgOPKw4LAcmHAcmHAcGHBI/5WHJWHH+VhyYcBweRZ5lFZZllGUWWM/MvIyyiwUZZflgsyyjLLMsosFFZZllmUWV5mWWZRXmWV5YBMAEsAmAB5ggGACYAJYAAIySIn6MacBkTMOG6U5OesTNBkDjjfEAbk1UuqyN7PQiDFxCSMy6k8FM8nA+DDKB4QxWIc5M6OHODHOCQ4zLgkOKxWMzLgOPMw4C+TGDgvkwv/70sTnA6+ZNPAPdzPHLbEaiftXmvgL5KEkUx+MfjMfiD4jD4z+Iw+IfiMUSKQjFEykMykIUSLBSEZ7kKJFUUSMUSKQjFEz3Iz3J8DNnTFEvMadUETNV1BEooIOFQadMacNVisac8xp0adMacGnfMacGnSsacKxpwxpwacLA06Y04NOGNOjTpjTg04WBp0sDThjTpqsUNV5mqxquWFBAzVcacMadNV+FBp0Y06NOgb4vxQN8b4wi+MGPiA3xvihH8QRfFCL4wN8b4wN8T4wN8b4wOUqQwNIUpQjKQIpDBiQwZKQDSEkIGSlBiQgNISQwYkIGJCA5SylA5SJCA5SJDhFIQMSGB8ESGDEhAaQkhwNIaQgYkMDSGkIIpCA0hpD4RSHBiQwNIaQgikMGJDBiQgNISQoGU0pgRhCBq2KaESmAZTCmAwpkIlMwiUwDKaUwIlNBhTAYUwIlMCJTcGK2wiUwIlNBiJCMvgyXAcvRMGIkGIgIogDRCJ///pqUo0U2tOxlT3Uo4aEInioxv//9qorBuMLUe8yjwLjWJQMMJkrYyXAajDMQ/MbkFgwaxpzFNEeMR0csw+wSiwBQYWgfZWDcZ5kyYeAgZih6ahIQZJg4YOiwYsmYYiiKYiCIViIWELNClsMRCoKyoMqCoMqSoMuy7Muy6NkNALBdGyLIFZdmMbxnMTxH8axmsUxGsRxGMRxlZxGsYxmIhUmVIilZUFgRDEQqSwIhYKgrEUrEUrEUxiGIziGIsDGWDjM4hjMYhjMYxjLBxmsRxFgYywcRjGMZYWPNZWDHR0x0dMdWSwOFgdMdHDHRw1gc8xwdLA6aysFY6Y4OlckcmsGODhYHDWBwsDhjg4WFksDprKwY6sGsLBrKwVrBgpSYKCGlAhlJQYIUmUgvlgpLAIYIClZSZSCmUlBghSYICeYICGUAnlYKWAQCjJWMFgZTZTZLSeWkLSpsFpE2C06BRaYtP6BaBaBabKbCBXpsKcqNf6KvoqKNorqNf///////////////////////////////oF//psoFghYagoUb+l2caQiaOp+aPS6Yey4bq3KdbKYafGsaOmsZJgkZZCGBgzM8BOMhC7LAZGT//vSxNoBsD2g+A93bcWOM59Z3VOYwnGNAMGeQemNRilgPTDwPTFkHDBwWDJMWDFkWCwRBkQRJkQlxWRJWRBpel5WRBuqlxpeRBpel5YS7zS9LzIhLjS8iTnpLysiSsiSwRHmYw9mPYXGPQXFYXlgLywF5hcF5WPZj2F3lYxFgYzGMYywMZrEcZnE8ZYGMxjGMxjGMrOIxjGI13o164168rXlhf5r1xrl5rlxYXGvXGvXla4sLjOHfM7YKzpWdM6dLB3ywd8sHSs6Zw4WDhWdM6dLBwwoUwik1AQsBDCKTChCsKVhSsKWAhqVBWFK1BYCGFCFYQrCFYUwoQrClhQWDAGZmYMAbOBTJaZAszJgtMBmYGZlp02QMxLTlpkC0CvLTFpk2UC02PAwoQGBQMIEAwoQGKAMIECIWBhAgGECf///////8LrVMpKHNzEIRnA1JpFUNSbPJzTghm8yJwicMHUHBDHBCkMxpwn7MM/ISzE5hIIwW0YPMAcBuTBQwX0wqIF8MFjBYzCYweMxuIJiMQ/A+zDKQhAwykD7MIQCETIQIQMPoykyESEDMoQ/LBlJqrkImZQQiYfRCJmUmUmqsQiWCETVW4QObNmwyEYnDQ+D6ND5D4yEA+zmy4RMhFm05sw+jD7VXMhEPs0PzKTD7MpMPsygw+w+zIQIRMyghEsB9GQiH0ZCBCJkIEIFghEzKCETIQD6MhEhAw+0PzMpIRMyghAyEUPjIRIRMyhD4yESEDmyQ+MPohEw+w+zMoD6MPoPsrIQMhEPsrD6MPoPsyEA+isykw+yETIQD7LAfZh9h9mH0H0ZCIfRh9EImH0H2ZCAfZWH0YfYfRWH0YfYfRh9B9mH2H0WA+ysPsyEA+zD6D7Kw+zD6IRMPsPoDl3VA5ciAZLwNEIgDRCIA0RLgOXoiDJeEUQBolEgxEgaIRIRRAHL0SBohEwiiQYiQjLgNEogIogIogDRCIA0SiANEogIogDRCJA0QiAiiIGiESBolEgaIREGImEUSDEQEUTA0SiANEIkGIgGIiDFQBkQigZEIsIkQDIhFCJFhEi////////////CL7//wY+jGjKRMmEHE26XWDu8Z4M9chUyFHWTRxz/+9LE/oP8seDeD/qxxcGm3YHu7xBoNZRiYxpVJzIUUnKygTHmIZMXAIExIBITEgAyMeoJEsBzmHOEiVkKmQqGEYYYYZkKhhmFAQ0VkNGQ0WsVhQGOYGyWBzTHNHNLAbBhsDmmJCJAZLxL5Wc6ZL5LxiQHOmJCJCWDGjF+F/Mxoxo2VTGjMaF+MxoxssC/FYvx2sUJYKAygV01cKE1dKAyhKAyeV0ygKEsK6VlAaQpD5pCkBWkJpCkBpDzhy/Lxy/L5WkJWkBWkPna5QlgoTKFXCsoDKEoCsoSwUJYKD/KyhKygMoSh8roSxQldB50FB5XQlig/yxQnQUJ0FCV0J0FAWKAroDkJE5E4PmOTOTksSJnBwVnJYOPKzgsSBnBz5YODODkrOTODjywcFg5OQOPK0s0tLKxbytLLAt5YF/8xYW8rFzFhcsCxiyWYsLFYuWEv/KxfywLGZhRmQWVhRhQWWAswsKKwosBZWF+VhY1HiGTF/FKNK3FU+QJdzKEPWODtLY26GCTRHIVMTE0cxt0ETOdOcMT0DkxvhIDEhEhMSAZgwkQ5jDmE9MpkpgzZwUjE1L0MMMvQrBTMV0howoBXDFcIaMKEVwxIBITEgEhKxIDEgEgMl8l8sC/mY2Y2YvyW5i/i/GlulsYvwv5YMbMX9LYzGktiwL8ZjQv5WL8Vi/FYvxmw5hmwbJmy5pmw5pYc0zYNgrNkrNk3NNnywbJYNk3NNkzYcwrNkzZsIsduWO3M2DZKzZM2HNKzYMoVcMoYaLCuGrpQf5WUJWUBYKDytXDKAoTKAoSwUJYQYx1HUrQcsIP5WOhjqOhWg5jqOpYHUrHUrHU0HHUrHU0GHUrHUx0HUsByYchyVhyYcByVhyVkiYcByVhz5YDnzJAOTJAOSwHBhwHJWHJYDgyRDgyQDgw4Dkw4DgGFgMtLA5RYGSwYXAyxYDLlwMuXAyxYIlwYWAyxYDLFwMvKwYWCMsDLlgMsWAy0oIlgMuWCJYIlgMuWAy5YIlgYWCJcDLlgMsWBhcGF//////wYWCJaDC/wMuWhEuES3wiWM9dnkxNQUzLuLvNU0JExt1GzG3AlNEku8xlC7jKADkMrQH0w+BSDBbG+P/70sTrA/V5oOoPdpkF7TReQe7SOMNkNgwmhNTGRDYMRkOQwfQsTDkEZKyFTE1BSMMITUrBTMwzCKzCMw008yhKE1cKEygVwyhKArVwzYcwzZcw7C7Y7DNgzZc0zZNg7DNksWEdh2EVuaZsOYWHMM2TZKzZMwzCMUhSKxTLApGKYpeYpin/mKaaf5YNksGybmGybmmyV2H5mybJYNkzZNkzZNkyQDksByZzBwWA48yQDkw4DgyRDgyRDgw5DksBwZIhyYcBwWA5MOA4LAcGHBImHAcGHAcFgOCwHJYDgyQDgw5Dkw4JH/MOQ4Kw5LAcGHAcgZcvAyxcDLSwYWgZcsBlywRlBEsBlpYRLgwuES0DLFgjKgZYsESwRLhEUBi2YGKZgYoXgwWDBcGCoGLFcDFigMULBgoIioRFgYoXAxQoGCgbhBuIG44BSQOEDcAZQOGDcf//////CICDAP8DAAAYAwYACIAzJCrjAyD5M4NB006w5DAlNHM4sn8wJFoDSWSXMX4X8x5hSgSGeYf4ohhUh8mN8BmYfIpJiQCQmECBmYQIQJhVC5GDQBIYmIdxh3BVGFWDSVgSGBKDQYEouRg0g0mHeBIYVYmBh3A0GBKDQYEpHpjbC5GNuDSZYRHhmCiYGLoHeYdxHpiYnmGPyBIYEpYZjbA0GR4DSVjbmLmFWcwNJu4SmaRIZoEpqs0mJVUYkVZYNBmhVGaTQbvEpiR3GaDSZomJiWYnMbqaqmJ3I0HtlUZoVRqt3FYlNVKozS7jNIk/zEpoKzSYlVZmgSmJTQYlNJmkSFgSmJRKZpEhiUSGaDSZoEpWJfKxIYlEhWaTEhoMSiQsCQxIaSwJSt3maBKViUDLSgMtKA5ZYDLSwMvLA5RYDLlgjLA5RcIlwMtKCJYDLFgMuXAyxYIlwOUXBhcGFwMsXAyxYDFigMUKCIsGCwiLAxYoDZCgMWLhEXBgoDZCwMUKAxQsIioGKF4RZwMWLCIsDFiwYABgEGAAiBBgAIgAiACIADAgQMCB//////////gxL/+EUmEUoMSfCKWBpUkGJTA1EbMMYHQx0XmTO9KVMLsVsxJCGDDXGpMe4CkyaQHDHyF8MNIBMwEwozCc//vSxO8D9kHm8A9ymMXiNF8B7um4ANMMcA0wIQsjG4tTLUBDJA1zUwPTGsPTD0ETBEESsxysLzMZEzHsejEURTKkqDERCzEQRSwIhlQIpYEQ1tdEyo78rdExEKkxjOMzjOIxjGM1jeIxjGMrOMziOMxiGMzGHswvC4wuC4sD2WB6LAXGF4XlgLzC8eiwFxjGMRWMRjEMZWMZWMZrGcZXMRrGMRjEMZYGLysYzXrzXrjXLzX+ytca9f5rl5rlxr13mvXFa41y83hArIGRIG8ImQIFZA3pEyBArIlggZAgWCBWRMgQLBEyBAyJEwoTysKWFBYCGFCmFCGEUlYQwoUwgUwikwoT/8wgU1AUwoQ1IQsBE2UCi05aX0C02C06BZaZApAstOgUWlLT/5af0CkCvLT+Wl9Nn/QKTZ9Nn/////////////////////9Rv/9Rr/RW/1OP/1GvU4U5U4Ub/1OaMPHLjjAiAS8xVYD4NWzGbzLjjNsxGxNXMQhMnTG0iYczNsUTMMhFEjFExwQxbkMhMIyBbTBbAQowdAVJMQXDQDFxQmkwmkNAMQWBkDEFgLssBoJWBdmHHg3Jg3INyVhxhhx4rGYXyF8FYXyWBg/zC+AvkwkMSlMSlEpTHBBKQziklmMSlHBCsJDKxKQxKQSlMvGEpDJZxKUwkMSkKxKUwkMJDKwkMwbkG5LAccVg3JYBufKwbkw44OPMOPBuPLANyWAbkwbkOMKwbkrDjywHHGDcjnJWHHFgOPMG4BuSwDcGDcg3Jg3ANycIQgcIn0V5SZ9wgcIH2Z9wgZ9n0WD7LEImfR9FiETPo+is+zhGEPM+z6M+j6Kz7Kz6M+j7M+j6LEIlg+zPo+/M+z68z7Poz7Poz6PsrPorIkrIgyJIkyJIgyJIksEQZEJcZEEQVkSVkQVkSaXEQVkSZEEQZEESVkSZEkR5kQRBWRJkQRBYGIsDF5jEMflYxlgYjGMY/KxiKxjMYhjLAxeVjEYxDGVnEVjF5WMZWMZjGMZYGIrGP4MXQP2uBi+Br14GuXBFeDF3//////BkQGRAjECMX+DIoMiBGKDIpYSFMukLEyww7zPMNGMk0oEwSh5jVfNGNFMbYzj/+9LE8QP4raDgD/acxa8mnkHu7bghSzGyCxMSEecw0A+DA/CaMAACEwmxNDGltytMTbYJTJAkDDgODOc5jeokCs5zJBPSskTJA5ysoTKAoCwrplCUBq7DZmybP+fbWEdhOYZsGwZsmwZsWEbmWEZsuYZsuYZsmyVmwWDZMwxTLBhmYYplgUzMMwysUisUjFMUiwKZimYZjqOhoMgxWOhYHUx1HQ4qZg4qQcx1HUx1HQrHUx1HQx0QcsHByJwZxIFg5LEgVnJnBwZycGcHBWclg4KzjzODkzk4KzkrODkDjzOTkzg4M4OfKzgzg4M4OTODgziRKzkr5ixImSEhYaPLBJ5YJPLBKZKSGSEpWSlZJ5WSf/lglMlJPKyQwABMAACwAFZAWAAyAAMBASwAGQgJgIAVgJgACYAAFgAMAASwAFgAKwAwEBMgASsBMAASwAmAgJgIAXILAmm16iIKJy5KiCiKbdUzyRfDQCQ/MXwbkzjgkzGQTvPwetE9Yk4zdiRjNeIOIrFiNUkW0zvhCjFDKiMbgQkwzAWSwJcZ44RJk9jqGRmCIYIghRYFtMdAQssCxmHELGYcY8ZixgxFYfZYD6MPohAw+w+ywH0Y3A3JjcjcGcarGch5x5ucHGlgbgsLFmKYhAaEAphrFlbFZWximimGVsVsWBTDFNFMLApvlgU0xTBTSsU0sCmFYpvmKaKZ5imCmlYppimCmlgrc1ixTDK2FNLAphimCmeYppW5lbimGiUQaIRBolE+aIRBWiDRCIK0SWJeWEQaJRJWiCwiSwiDY+MsMZWxGxcZWxHxMZ8bGfFxmxMZYYjY2P/Ni4jY2IrYixxljGLD2ZcXG9F5lz0Zc9lgvLD2ZeXFZcZcXFguMuezei8y8uMuLywXlguKy4sF5W9eY4OGOjpYHTHRwx0d8xwdMcHTHR0rHSsdKx0x0dMcHTHB01kcKxwsDprA75YHCtYKx0rHDPRAxEQMRESwIFgQ8xARMREDEBEzqYXKMuyNLDJdlegx40iBMUPHRDJfDqgxaA1KM5BHjTMVSXYymoprME0D1jCFBScxK0DZMl3BzDCwgc0w7YDYMDYGlzA2Qc0sBLxibYS8YJCHOmEvh//70sTvg/EhMugPc3wGx7wbgf9WODpptEvFZLxptnOmc6S+ZzhLxkvkveZL5LxkvnOG6um0WCXjYYTbM52JU+yTnDTbiUMSF1csJtmJAm2YkLq5zpkvGm0S+ZLwkBnOiQGJCS+YkAkJkvEvlgl4yXxIDEhEgKxISsl8yXyXiwJCYkJLxiQkvlgSAxITnDEgYYNNt1c3VjnTJeOcM505wyXiXzJeJeMSA50sEv+ZLwkJiQkvGS8JCYkAkJiQCQlgSExICXjEgEgMl8SHzEgEhMSASExIBIPLAkJWJCWBICwJAYkIkJiQCQmJAJAYkIkBWJCYkBL5iQCQGJCJB/mJCJCEWyDGyDGwBtlsQi2Qi2IG2GwDGyBthscGNkDbDYA2w2Qi2YG2WzAzpBgidAidQYdQM6nQGQYGHSDDqETqBnQ6Aw6hE6YMOsInWETrAzqdIROsInQInUInUGHQGHUGHXBh1//////////////BkghGQjZ5L1MoUTQxBhBzj+UCMiqP8xmXSz5ALDM7csI2eQwjGkL0KyhTNnDCMDkkExPCQTGVKZMXIGkwqxczDuF0MTwJErDnMDkJEwOB6jGZB1KwdTB1EHMisZkxzA2DDZDYLAbJYHMMcwc0sGNmL8L8YvzKhi/GNmL8L+ZjQv5pAkBy+kBWkJpDLx87znnL8vHL6QFauHDSuGrhQmrpQFauFgoDKBXCsoDKCGzKAoTc1zTNg2TNk2TNhzCxYRuZYZ9s5hmybJuY5hmybBmybBmybB5g6FZ0LB1LB1LB0LB1LB0LGYM6HQzodCs6/5nQ6nBzqWDocGOhnQ6mdDoZ1OhnQ6GdDoZ1gxnQ6GdIMZ1Onlg6lg6FiDGdToY4HBXPfLA4NIpErHBjhImORz5YSJWkCtIFgcFgcGOByWBwVjkrSJjgclgc+Y5SJWOCsclY4KxwY5HBWOf8sDgxyOTHI5LA4LA48sDgrHJjgclgcGORz/lgceVjgwWMjBQzMZgowUCjBYLLAKLALMZgowWCjBQLKzhAyJ0z5MNANVzHdCSMy8aXxMJCQiDfEEjszo5XkMuoCaDFxR3QyJ0z5MrLEPzCaAmkxcQXEMQWAujhfQhOchCE0IUI//vSxOmD8cE06A93locfNFrB/3W4TSlJDNKVKQyQkpDSlvHMvhg42DpIzYOL4K2DzfjPiM+I+Mz4j4jPjfiM+N+I1E6QjpDUSNRNRI6QqQjUSpCNRNRMsHxGfH/GVH4jPjPjM+J+Iz4z4is+MsHxFg+MsHxlg+MrPj8rPjM+M+IrPi8rPjMvgvgrL5Ng4vk2Dy+CwXwfp7BxYkiLBfBsHl8mXyXyZfJfBWXwbcNybctyWG5K24K24LDclbceWG48254/yw3BW3BYkLyuQyxIXnIUhlchFchFiQixIZXIRXIZXIZYkI5CkIsSEchyGcIZSVwj5wgfZn1CBn0fZWfRYPssH0WD7M+z7M+4RKz6Kz6M+j7M+j7LB9GfR9GfcIlcIf5WXRWXRl2XXmXRdmXRdFhkSsuisuisuywXXmyJdGXZdFZdGXZdFguzLou/Ky6LBdf5l0XRnEcRWMRjEcZYGIsHGYxjEVjGYxjEVjEWBiKxi/////////////////////////ywXf+Vl0WC68sF1///+Vl35YLqM1MfMxfB8zICOYMMQ5gxCkgzKUTmMakR0yER7zCTBZMbkbgwkgMjCDCTMJ8QoxJQTjAzCFNJsw9wHTDhYLAdNms00mHTDodLAQLA8LA9MepgsEUsKg1QqTVBELBFNxGMzEYyxYz8bjOxOIsGMsS85f1Dl/ULHVOXy40QiTRKINEokz0Liweys9FYvMXi8xcLzFwv8xeLzPQuKzGWHGZicZuJxmY3EZj8ZYMZX4ywYiwYiwYjMRiK7BYOGdOHZsGcOlZ3yuyZw6dk6Z06VnTsHfM4dOwdM6cLBwsHCuyVnTOnDsHPLB0rOlZzys6Zw4dg4WJZqQphApYCGpCmpClhSWApYCFYUwoQwgUsKCwFMIF8wgQ1AUrCGFCFgIWAphQhhQhhApWFLAQsBP8rCmFCFYUsBSsKYQL5YCeYQIVhPLAQsBPLATzGjPUaMaNU5UbRURUMN1GIDEWQasw2IPiMljC4jT4p+M7+KvjOBoSRTLMizMysoQ/MicQPzSbDycx4QMoMd1HdDFxRcQxp0hKMhfFijCtxCEyF4szMkPJDjDjQ48xzgc5LBIcZhyb/+9LE1gPqSTL0D3NNxwUmmYH/dngcGMHhfBYC+DGDxg4rSlNKVKQsJSm4IlKaUiUpqJKJmokomaiSiZ0hUhnSEon5nxPxn/F/Gf8T8ZQ+LjiVD4jPjPi/zL4L5Mvgvky+C+SwXwZfJfBl8MHmwcXz5qJqJGomokWFEzUSUTNRNRIqKJnSFSGaiVIR0hUhlaiRqJqJGomokaUpIRWSGZIRIfmSElKaUqUhkhkhmlIlKZIRIZWSEWCQiskMyQiQzJCJDMkMkIyQyQiwSGVkhFZIZkhEhlZIRkhkhFZIZkhkheZIZIRkhkhGSGSEZIZIRkhJSlaUhjcqxFZxhnHnHGNycaZxw3JYG4KxuTG4G5MbkbgrG58sDc+Vjc+Y3I3BWNyY3BxpjcDc+Y3I3BqaphWppYU01MU0rUwsKYVqb5YUw1NUz/K1NNTFNK1MLCmmpqmGpqmmpimlhTCtTf8sKaWFMOEIRM+j6Kz7M+j7M+4QOET6M+oRKz6Kz7M+z6pMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/70sQAA95l6JQMvv0AyrnTgBBfwAAyDrTDKGHQ8E5bjDPA3IFCHSAFEFBxYGbUBVmCAktXvfVTFrgJAVqxaSkKwZeKzZfCVMnuQktykzM0LAgZsaYLXV20D7QfII1BLktkSGU21EHanlFU6V0rINFhViXy9oZi2VqdIK0l9Ml5BQ1sQpcub2RXRlc5MJoxk8tPeXUlqhFeJyhKeOqN1K4q27LDdN6hgEqf3i1mjWfPYvfQp4MXUFWw1D/m1lMrorEzMUaCwvYtt/Ore1c6+v9+Eg6n2cunWoOiqtJ6SSKIV6WtbAz0sUkix8Gelpsmii2kq7NnSAIKWiWCdS1dFBzUvMBYiApLAvwr//V6/JnCTX//IRhw///S36v0/X//+///3///////WpNBBRspBZmo+z//4M9K/gz0tTEFNRTMuMTAwqpMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//vSxAADy83OkADc/wFfudIAEF+AL6mD/5al1+v/T/78/9///1f8IyKX4MkU34RkUlPt//9v9e2r//1Nv+86f1E2hvmBOAz0qCPpWDPS0xIubg/paBfpVCXpYEPpYC/S2EvSxtvf1EwArJcKhI3ywjoufR06jD8vp1L7/v/v+//7f/X5x/UbeYsl7/27fdTfazf/7dX2/YGelvCPpb9AI+lgP6WTI2IimD+lkH9LaIP6VAX6WQV6VAP0t9Khkz239rMpus8nRH6CHQYTEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+9DEAAPD7aaWAIL9AOA0UoAQXdj/////////l///1H+XbdRkn0ga+lijpgdUsH9LJ/+hH//Xr//+v9///t//9///+v//9v/1f///9vUnnDQ4UQX6VEM+ag19LTyzMvmagP0q9LD3U7DH8z3JiCmopmXGJgYVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/ZbkX1j5Xf65vu/1/z/+X9X/ofagnQpIN5prM03UmfPJMg1qCDOlVroaav//Tdq3+nut8wCvSqbmJXB/S24H6//vSxCADz3HmkADdPwPRvRNBa/+oW+lgS9LDMwWEPpamD+lgvF0D9K/S0I+lgP6VUiDKEiAkcII2jRChC8RivQ2rsEmdnkzeaoyChVAcfZ6Lf///17////+/gx8QMfH7fX6/2/4ROjlfwYdHQYdHwidHwYdH+DDo/CJ0eETo4GHR4MOjgkdHAw6PBh0cBnRx0fBh0cETo/wM6POj4MOj2wYdHf///widH9e24RS69YTS6tQSS6Qil0gxLrCKXUFJdMKS6oUl0zFQGl1JdARS6oMS6ANLpS6S8EkugKS64Gl0pdZRA0uhLrCkukEpfDpv8b/GVH+IsP8ZW/xm/xP8Zv8b/H5v8T/F0rf4zf4n+Pyw/xlh/i0WP+IqP8Zv8b/Gb/G/xlH+OUf45Yf4z/43+Pzf43+MsP8f/5W/xlh/iK3+Mrf49KlJSSiMSzld/1hETAAEGHRJiAcYYGGvhAKBFNGXz//hqbi7SDAQUSBwoDGEAC9Krts7a+4ksxlcbf+Ny/PdPT09vP9c7/5509PT26sbYGkW6SxFyAQAV6AgRvX/cuRpGGBAS3QKBmBwCKQaWoGmOoOy+L1HbZ2xNr8P5Qw1hnDE3fn5hrC7FSLscSecBLxAIgETojKlYBAEwQBQwcCgw+Fwx2k0x6GIxIDYwwDYxAEA59qAEAMp5YAAAAWQLaKaSZ20xEVEiF0SB91M0h0w1cSCA1h0x0x11v3MMPUDTHWO/ccXIkIigj+0+aXIhILkF4FNJAwAuAYAAEYBAAWYUsFQFMEwbMHwdMNA6MVh8MoMFMpiMMbhcMWBeMciQMrL/MphuMXw7MQRHMPwtMGQHUCMCAUMIAwMShsMiCEMzThOzkFO5CdMP9bPjsxPN+CEgFCnFGWVwnOiwmoNiHv2pxraamgmXjJMBgwIMQEDHRcxURMLBUk18AQCMGCjCgowgABwO560AQAGCAxhAQYMEGEAReBHowIGMqbDlnQdezm28y0HBwOlQAQUwsLMLCzCQMvnAychZQBAACB0AbT3gRMLYFkC4jJIAdywRn481WjTtOUzqzBAFQTGLis+SdLeyCMylrMO0tLKWAqCvGCAg4LkKBKDMSfq/WdpynKh6/X/+9LE/4J5PhC6Dfd/BsjCFxWOb+BjL+xqXZbq0tLZxyyyy7urKYZjUPUbSUxWWw6voss2ZnUDTLKWmrKAIgMZ0C4RcZTaLRFrK7V2uVFrrstZZy113Z2ZdlnLOWuxWaa0sMsKsVrtIypE4wCBjAoCMCgKBCEGGRTQNKMykaTIgNAoeAxWMcFcEjMx4D2Eg4AzDpISi7xeJYsmdJYZMZQZiUWiLKlTKmYlFoiuVMVIViUDR1hqgKYqxXFlDSVAUVUiWWyhW4u8WWQCqaxRSoCgQwSBAKAjCYWSjJQcZbRwGb5n5MmZA+KBQy2jBJ3GfFiZVABhoHgwFmIheYuFpiwWhA9MIiQxWcDTTPNHBg1+/DdKgMUmU2o/zahnMZtA5zOjLRWNRpI4uONtGjChkxQjMuLTJCExoTLtKKmABJhgaYYFmDAaGsMIZFnTAgMwQDAwCnS9BaowUKMRGDEBkxodJikyteNzXBJTMaJTIiExwdMLCC9T7l/QABmBAYCBS4rBYJR5LYlpUALBYMR6LZKCwLxMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==');
    explosionSound.volume = 0.5;


    // Initialize game
    function initGame() {
      gameState = {
        mode: gameState.mode, // Retain mode when restarting
        currentQuestion: 0,
        currentPlayer: 1,
        player1Score: 0,
        player2Score: 0,
        player1Incorrect: 0,
        player2Incorrect: 0,
        maxIncorrect: 5,
        gameOver: false,
        answered: false,
        correctAnswer: false,
        answeredQuestions: []
      };
      updateScores();
      updateTurnIndicator();
      updateProgressBars();
      loadQuestion(0);
      logEntries.innerHTML = '<div class="log-entry system-log">Advanced fleets initialized. Prepare for intense battle!</div>';

      // Close any open dropdowns
      if (activeDropdown) {
        document.getElementById(activeDropdown).classList.remove('show');
        activeDropdown = null;
      }
    }


    document.getElementById('muteBtn').onclick = () => {
      soundEnabled = !soundEnabled;
      document.getElementById('muteBtn').innerText =
        soundEnabled ? '🔊' : '🔇';
    };


    // Start the game
    function startGame(mode) {
      gameState.mode = mode;
      // Update player names based on mode
      if (mode === 'single') {
        player1Name.textContent = 'Player';
        player2Name.textContent = 'Computer';
        player1Turn.classList.add('hidden'); // No turns in single player
        player2Turn.classList.add('hidden');
        player1Stats.classList.remove('active');
        player2Stats.classList.remove('active');
      } else {
        player1Name.textContent = 'Team 1';
        player2Name.textContent = 'Team 2';
        // Reset current player to 1 when starting teams mode
        gameState.currentPlayer = 1;
      }
      menuScreen.classList.add('hidden');
      gameScreen.classList.remove('hidden');
      initGame();
      initThreeJS();
    }

    // Back to main menu
    function backToMenu() {
      gameScreen.classList.add('hidden');
      gameOverScreen.classList.add('hidden');
      menuScreen.classList.remove('hidden');
      // Show header when going back
      document.querySelector('header').style.display = 'block';
    }

    // Update turn indicator
    function updateTurnIndicator() {
      if (gameState.mode === 'teams') {
        if (gameState.currentPlayer === 1) {
          player1Stats.classList.add('active');
          player2Stats.classList.remove('active');
          player1Turn.classList.remove('hidden');
          player2Turn.classList.add('hidden');
        } else {
          player1Stats.classList.remove('active');
          player2Stats.classList.add('active');
          player1Turn.classList.add('hidden');
          player2Turn.classList.remove('hidden');
        }
      } else {
        player1Stats.classList.remove('active');
        player2Stats.classList.remove('active');
        player1Turn.classList.add('hidden');
        player2Turn.classList.add('hidden');
      }
    }

    // Update scores
    function updateScores() {
      player1Score.textContent = gameState.player1Score;
      player2Score.textContent = gameState.player2Score;
      player1Incorrect.textContent = gameState.player1Incorrect;
      player2Incorrect.textContent = gameState.player2Incorrect;
    }

    // Update progress bars
    function updateProgressBars() {
      const player1ProgressPercent = (gameState.player1Incorrect / gameState.maxIncorrect) * 100;
      const player2ProgressPercent = (gameState.player2Incorrect / gameState.maxIncorrect) * 100;
      player1Progress.style.width = player1ProgressPercent + '%';
      player2Progress.style.width = player2ProgressPercent + '%';
    }

    // Load question
    function loadQuestion(index) {
      if (index >= questions.length || gameState.player1Incorrect >= gameState.maxIncorrect || gameState.player2Incorrect >= gameState.maxIncorrect) {
        endGame();
        return;
      }

      gameState.currentQuestion = index;
      gameState.answered = false;
      nextBtn.classList.add('hidden');
      questionNumber.textContent = index + 1;
      const q = questions[index];
      questionText.textContent = 'Q' +(index + 1)+ ": " + q.question;

      // Clear previous answers
      answerOptions.innerHTML = '';

      // Add new answer options
      q.options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.classList.add('answer-btn');
        btn.textContent = option;
        btn.onclick = () => checkAnswer(i);
        answerOptions.appendChild(btn);
      });
    }

    // Check answer
    function checkAnswer(selectedIndex) {
      if (gameState.answered) return;
      gameState.answered = true;

      const q = questions[gameState.currentQuestion];
      const isCorrect = selectedIndex === q.correct;
      gameState.correctAnswer = isCorrect;

      // Store answered question for review
      gameState.answeredQuestions.push({
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correct],
        selectedAnswer: q.options[selectedIndex],
        isCorrect: isCorrect,
        questionNumber: gameState.currentQuestion + 1
      });

      // Update button styles
      const buttons = answerOptions.querySelectorAll('.answer-btn');
      buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct) {
          btn.classList.add('correct');
        } else if (i === selectedIndex) {
          btn.classList.add('incorrect');
        }
      });

      // Process game logic based on mode
      if (gameState.mode === 'single') {
        if (isCorrect) {
          addLogEntry('Player answered correctly! Launching devastating attack!', 'player-log');
          gameState.player1Score++;
          attack(2); // Attack computer
        } else {
          gameState.player1Incorrect++;
          addLogEntry('Player answered incorrectly! Shields weakened!', 'player-log');
          attack(1); // Computer attacks player on incorrect answer
          if (gameState.player1Incorrect >= gameState.maxIncorrect) {
            addLogEntry('Player has too many incorrect answers! Fleet destroyed!', 'system-log');
          }
        }
        updateScores();
        updateProgressBars();
      } else {
        // Teams mode
        if (isCorrect) {
          if (gameState.currentPlayer === 1) {
            gameState.player1Score++;
            addLogEntry('Team 1 answered correctly! Launching assault!', 'player-log');
            attack(2); // Attack team 2
          } else {
            gameState.player2Score++;
            addLogEntry('Team 2 answered correctly! Launching assault!', 'enemy-log');
            attack(1); // Attack team 1
          }
        } else {
          if (gameState.currentPlayer === 1) {
            gameState.player1Incorrect++;
            addLogEntry('Team 1 answered incorrectly! Shields weakened!', 'player-log');
            if (gameState.player1Incorrect >= gameState.maxIncorrect) {
              addLogEntry('Team 1 has too many incorrect answers! Fleet destroyed!', 'system-log');
            }
          } else {
            gameState.player2Incorrect++;
            addLogEntry('Team 2 answered incorrectly! Shields weakened!', 'enemy-log');
            if (gameState.player2Incorrect >= gameState.maxIncorrect) {
              addLogEntry('Team 2 has too many incorrect answers! Fleet destroyed!', 'system-log');
            }
          }
        }
        // Switch player for next question
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateTurnIndicator();
        updateScores();
        updateProgressBars();
      }

      nextBtn.classList.remove('hidden');
    }

    // Next question
    function nextQuestion() {
      // Simply advance to the next question in the array
      // The turn is already switched in checkAnswer
      // The game ends when all questions are exhausted or max incorrect reached
      loadQuestion(gameState.currentQuestion + 1);
    }

    // Attack opponent with enhanced weapons
    function attack(targetPlayer) {
      // Multiple ships fire with enhanced effects
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (targetPlayer === 1) {
            const firingShip = enemyShips[Math.floor(Math.random() * enemyShips.length)];
            const firingPlane = enemyPlanes[Math.floor(Math.random() * enemyPlanes.length)];
            const targetShip = playerShips[Math.floor(Math.random() * playerShips.length)];
            const targetPlane = playerPlanes[Math.floor(Math.random() * playerPlanes.length)];

            // Enhanced laser attacks
            createEnhancedLaser(firingShip.position.clone(), targetShip.position.clone(), 0xff3366);
            createEnhancedMissile(firingPlane.position.clone(), targetPlane.position.clone(), 0xff3366);
          } else {
            const firingShip = playerShips[Math.floor(Math.random() * playerShips.length)];
            const firingPlane = playerPlanes[Math.floor(Math.random() * playerPlanes.length)];
            const targetShip = enemyShips[Math.floor(Math.random() * enemyShips.length)];
            const targetPlane = enemyPlanes[Math.floor(Math.random() * enemyPlanes.length)];

            // Enhanced laser attacks
            createEnhancedLaser(firingShip.position.clone(), targetShip.position.clone(), 0x00aaff);
            createEnhancedMissile(firingPlane.position.clone(), targetPlane.position.clone(), 0x00aaff);
          }
        }, i * 150);
      }
    }

    // Add log entry
    function addLogEntry(message, type) {
      const entry = document.createElement('div');
      entry.classList.add('log-entry', type);
      entry.textContent = message;
      logEntries.appendChild(entry);
      logEntries.scrollTop = logEntries.scrollHeight;
    }

    // Determine winner for cup display
    function determineWinner() {
      if (gameState.player1Score > gameState.player2Score) {
        return gameState.mode === 'teams' ? 'Team 1' : 'Player';
      } else if (gameState.player2Score > gameState.player1Score) {
        return gameState.mode === 'teams' ? 'Team 2' : 'Computer';
      } else {
        return "Tie";
      }
    }

    // Finish game - FROM CODE 1
    function finishGame() {
      const winner = determineWinner();
      winnerMessage.textContent = winner === "Tie" ? "It's a Draw!" : winner + " Wins!";
      winnerCup.classList.remove('hidden');

      // تحديد الفريق الخاسر للطائرات
      let loserPlanes = [];
      if (winner === "Tie") {
        loserPlanes = [...playerPlanes, ...enemyPlanes];
      } else if (winner === "Team 1" || winner === "Player") {
        loserPlanes = [...enemyPlanes];
      } else {
        loserPlanes = [...playerPlanes];
      }

      // تحديد الفريق الخاسر للسفن
      let loserShips = [];
      if (winner === "Tie") {
        loserShips = [...playerShips, ...enemyShips];
      } else if (winner === "Team 1" || winner === "Player") {
        loserShips = [...enemyShips];
      } else {
        loserShips = [...playerShips];
      }

      // عمل الانفجارات لطيفة + صوت للطائرات
      loserPlanes.forEach(plane => {
        createKidExplosion(plane.position, 0xffff66);
      });

      // عمل الانفجارات لطيفة + صوت للسفن
      loserShips.forEach(ship => {
        createKidExplosion(ship.position, 0xff6666); // لون مختلف شوية عشان تميزها
      });

      // تصفير القوائم بعد قليل (بعد الانفجارات)
      setTimeout(() => {
        // إزالة الطائرات من المشهد
        loserPlanes.forEach(plane => scene.remove(plane));
        // إزالة السفن من المشهد
        loserShips.forEach(ship => scene.remove(ship));

        // تصفير القوائم
        if (winner === "Tie") {
          playerPlanes.length = 0;
          enemyPlanes.length = 0;
          playerShips.length = 0;
          enemyShips.length = 0;
        } else if (winner === "Team 1" || winner === "Player") {
          enemyPlanes.length = 0;
          enemyShips.length = 0;
        } else {
          playerPlanes.length = 0;
          playerShips.length = 0;
        }
      }, 3500); // نفس مدة الانفجار
    }


    // Close winner cup and show results
    function closeWinnerCup() {
      winnerCup.classList.add('hidden');
      // Hide header when showing results
      document.querySelector('header').style.display = 'none';
      endGame();
    }

    // Reset from winner cup (X button)
    function resetFromWinnerCup() {
      winnerCup.classList.add('hidden');
      gameScreen.classList.remove('hidden');
      gameOverScreen.classList.add('hidden');
      // Show header when going back to game
      document.querySelector('header').style.display = 'block';
      initGame();
      addLogEntry('Game reset! Starting fresh battle!', 'system-log');
    }

    // End game
    function endGame() {
      gameState.gameOver = true;
      gameScreen.classList.add('hidden');
      gameOverScreen.classList.remove('hidden');

      const winner = determineWinner();

      if (gameState.player1Incorrect >= gameState.maxIncorrect && gameState.player2Incorrect >= gameState.maxIncorrect) {
        gameOverTitle.textContent = "Mutual Destruction!";
        gameOverMessage.textContent = "Both teams reached the maximum incorrect answers!";
      } else if (gameState.player1Incorrect >= gameState.maxIncorrect) {
        gameOverTitle.textContent = gameState.mode === 'teams' ? "Team 2 Dominates!" : "Computer Victory!";
        gameOverMessage.textContent = gameState.mode === 'teams' ?
          "Team 1 reached 5 incorrect answers! Team 2 wins!" :
          "You reached 5 incorrect answers! Computer wins!";
      } else if (gameState.player2Incorrect >= gameState.maxIncorrect) {
        gameOverTitle.textContent = gameState.mode === 'teams' ? "Team 1 Triumphant!" : "Player Victory!";
        gameOverMessage.textContent = gameState.mode === 'teams' ?
          "Team 2 reached 5 incorrect answers! Team 1 wins!" :
          "Computer reached 5 incorrect answers! You win!";
      } else {
        gameOverTitle.textContent = "Battle Complete!";
        let message = "Final Score - " + (gameState.mode === 'teams' ? 'Team 1' : 'Player') + ": " + gameState.player1Score +
              " | " + (gameState.mode === 'teams' ? 'Team 2' : 'Computer') + ": " + gameState.player2Score;

if (gameState.mode === 'teams') {
  message += "<br>Team 1 incorrect: " + gameState.player1Incorrect + " | Team 2 incorrect: " + gameState.player2Incorrect;
}

if (winner !== "Tie") {
  message += "<br><br>🏆 " + winner + " is the Winner! 🏆";
} else {
  message += "<br><br>🏆 It's a Tie! 🏆";
}

gameOverMessage.innerHTML = message;

      }
    }

    // Restart game
    function restartGame() {
      gameOverScreen.classList.add('hidden');
      gameScreen.classList.remove('hidden');
      document.querySelector('header').style.display = 'block';

      // Remove all planes and ships from scene
      gameState = {
        mode: gameState.mode, // Retain mode when restarting
        currentQuestion: 0,
        currentPlayer: 1,
        player1Score: 0,
        player2Score: 0,
        player1Incorrect: 0,
        player2Incorrect: 0,
        maxIncorrect: 5,
        gameOver: false,
        answered: false,
        correctAnswer: false,
        answeredQuestions: []
      };
      updateScores();
      updateTurnIndicator();
      updateProgressBars();
      loadQuestion(0);
      logEntries.innerHTML = '<div class="log-entry system-log">Advanced fleets initialized. Prepare for intense battle!</div>';

      // Close any open dropdowns
      if (activeDropdown) {
        document.getElementById(activeDropdown).classList.remove('show');
        activeDropdown = null;
      }
      initThreeJS();
      createAdvancedPlane();
      createAdvancedShip();
    }


    // Reset game from beginning (new function)
    function resetGameFromBeginning() {
      initGame();
      addLogEntry('Game reset! Starting fresh battle!', 'system-log');
    }

    // Populate questions dropdown with question numbers
    function populateQuestionsDropdown() {
      questionsDropdown.innerHTML = '<div class="dropdown-header">Select Question</div>';

      // Add question set selector
      

      // Add divider
      const divider = document.createElement('div');
      divider.style.borderTop = '2px solid #cc66ff';
      divider.style.margin = '10px 0';
      questionsDropdown.appendChild(divider);

      // Add individual questions
      questions.forEach((q, index) => {
      const item = document.createElement('a');
      item.href = '#';
      item.className = 'dropdown-item';
      item.textContent = 'Question ' + (index + 1);
      
      item.onclick = (e) => {
        e.preventDefault();
        changeQuestionSet(index);
      };

      questionsDropdown.appendChild(item);
    });
    }

    // Change current question
    function changeCurrentQuestion(index) {
      if (index >= 0 && index < questions.length) {
        gameState.currentQuestion = index;
        loadQuestion(index);
        addLogEntry("Jumped to question " + (index + 1), 'system-log');

        // Close dropdown
        if (activeDropdown) {
          document.getElementById(activeDropdown).classList.remove('show');
          activeDropdown = null;
        }
      }
    }

    // Change question set
    function changeQuestionSet(questionIndex) {
      
      gameState.currentQuestion = questionIndex;
      loadQuestion(questionIndex);

      addLogEntry(
        "Moved to Question " + (questionIndex + 1),
        'system-log'
      );

      // Close dropdown
      if (activeDropdown) {
        document.getElementById(activeDropdown).classList.remove('show');
        activeDropdown = null;
      }

      // Update dropdown
      populateQuestionsDropdown();
    }

    function showQuestionModal(questionIndex = gameState.currentQuestion) {
      questionModalContent.innerHTML = '';

      const q = questions[questionIndex];

      // زر الإغلاق الأحمر
      const closeBtn = document.createElement('span');
      closeBtn.className = 'close-modal';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => { questionModal.style.display = 'none'; };
      questionModalContent.appendChild(closeBtn);

      // نص السؤال
      const questionTextModal = document.createElement('div');
      questionTextModal.className = 'modal-question-text';
      questionTextModal.textContent =
        "Question " + (questionIndex + 1) + ": " + q.question;
      questionModalContent.appendChild(questionTextModal);

      // خيارات الإجابة
      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'modal-answer-options';

      q.options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'modal-answer-btn';
        btn.textContent = option;

        btn.addEventListener('click', () => {
          if (gameState.answered) return;
          gameState.answered = true;

          const isCorrect = i === q.correct;
          gameState.correctAnswer = isCorrect;
          questionTextModal.textContent = "Question " + (questionIndex + 1) + ": " + q.question;

          // تخزين الإجابة
          gameState.answeredQuestions[questionIndex] = {
            question: q.question,
            options: q.options,
            correctAnswer: q.options[q.correct],
            selectedAnswer: option,
            isCorrect,
            questionNumber: questionIndex + 1
          };

          // تحديث الـ left panel
          const leftButtons = answerOptions.querySelectorAll('.answer-btn');
          leftButtons.forEach((btnLeft, j) => {
            btnLeft.disabled = true;
            if (j === q.correct) btnLeft.classList.add('correct');
            else if (j === i) btnLeft.classList.add('incorrect');
          });

          // تحديث المودال
          const modalButtons = optionsContainer.querySelectorAll('.modal-answer-btn');
          modalButtons.forEach((btnModal, j) => {
            btnModal.disabled = true;
            if (j === q.correct) btnModal.classList.add('correct');
            else if (j === i) btnModal.classList.add('incorrect');
          });

          // تحديث النقاط واللوج
          if (gameState.mode === 'single') {
            if (isCorrect) {
              gameState.player1Score++;
              addLogEntry('Player answered correctly! Launching attack!', 'player-log');
              attack(2);
            } else {
              gameState.player1Incorrect++;
              addLogEntry('Player answered incorrectly! Shields weakened!', 'player-log');
              attack(1);
            }
          } else {
            if (isCorrect) {
              if (gameState.currentPlayer === 1) {
                gameState.player1Score++;
                addLogEntry('Team 1 answered correctly! Launching attack!', 'player-log');
                attack(2);
              } else {
                gameState.player2Score++;
                addLogEntry('Team 2 answered correctly! Launching attack!', 'enemy-log');
                attack(1);
              }
            } else {
              if (gameState.currentPlayer === 1) {
                gameState.player1Incorrect++;
                addLogEntry('Team 1 answered incorrectly! Shields weakened!', 'player-log');
              } else {
                gameState.player2Incorrect++;
                addLogEntry('Team 2 answered incorrectly! Shields weakened!', 'enemy-log');
              }
            }
            // تبديل اللاعب
            gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
            updateTurnIndicator();
          }

          updateScores();
          updateProgressBars();

          // زر التالي داخل المودال
          const nextBtnModal = document.createElement('button');
          nextBtnModal.textContent = 'Next Question';
          nextBtnModal.className = 'next-btn';
          nextBtnModal.onclick = () => {
            questionModal.style.display = 'none';
            nextQuestion();
          };
          questionModalContent.appendChild(nextBtnModal);
        });

        optionsContainer.appendChild(btn);
      });

      questionModalContent.appendChild(optionsContainer);
      questionModal.style.display = 'block';
    }





    // Show review modal with all questions
    function showReviewModal() {
      reviewQuestionsContainer.innerHTML = '';

      // Add all questions from current set
      questions.forEach(function(q, index) {
    var answered = gameState.answeredQuestions.find(function(aq) {
        return aq.questionNumber === index + 1;
    });

    var questionItem = document.createElement('div');
    questionItem.className = "question-review-item " + (answered ? (answered.isCorrect ? 'correct' : 'incorrect') : '');

    var html = '<div class="review-question-number">Question ' + (index + 1) + '</div>';
    html += '<div class="review-question-text">' + q.question + '</div>';
    html += '<div class="review-answer">Correct Answer: <span class="correct-answer">' + q.options[q.correct] + '</span></div>';

    if (answered) {
        html += '<div class="review-answer">Your Answer: ' + answered.selectedAnswer + ' ' + (answered.isCorrect ? '✓' : '✗') + '</div>';
    } else {
        html += '<div class="review-answer" style="color: #ffcc00;">Not answered yet</div>';
    }

    questionItem.innerHTML = html;
    reviewQuestionsContainer.appendChild(questionItem);
});


      reviewModal.style.display = 'block';

      // Close dropdown if open
      if (activeDropdown) {
        document.getElementById(activeDropdown).classList.remove('show');
        activeDropdown = null;
      }
    }

    // Close review modal
    function closeReviewModal() {
      reviewModal.style.display = 'none';
    }

    // Initialize Three.js with enhanced graphics
    function initThreeJS() {
      // Create scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000011);

      // Create camera - adjusted for centered ships with more space
      camera = new THREE.PerspectiveCamera(
        75,
        document.getElementById('game-canvas').offsetWidth / document.getElementById('game-canvas').offsetHeight,
        0.1,
        1000
      );
      camera.position.set(0, 18, 45); // Adjusted for centered view and more space
      camera.lookAt(0, 0, 0);

      // Create renderer with enhanced settings
      renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        antialias: true,
        alpha: true
      });
      renderer.setSize(
        document.getElementById('game-canvas').offsetWidth,
        document.getElementById('game-canvas').offsetHeight
      );
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Enhanced lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
      directionalLight.position.set(0, 50, 30);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const blueLight = new THREE.PointLight(0x00aaff, 4, 150);
      blueLight.position.set(-30, 15, 0); // More space in the middle
      scene.add(blueLight);

      const redLight = new THREE.PointLight(0xff3366, 4, 150);
      redLight.position.set(30, 15, 0); // More space in the middle
      scene.add(redLight);

      // Enhanced starfield
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.8,
        sizeAttenuation: true
      });

      const starVertices = [];
      for (let i = 0; i < 25000; i++) {
        const x = (Math.random() - 0.5) * 5000;
        const y = (Math.random() - 0.5) * 5000;
        const z = (Math.random() - 0.5) * 5000;
        starVertices.push(x, y, z);
      }
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // Create larger fleets - 6 spaceships and 4 planes for each side
      playerShips = [];
      enemyShips = [];
      playerPlanes = [];
      enemyPlanes = [];

      // Create player fleet - adjusted positions for centered view with more space
      for (let i = 0; i < 6; i++) {
        const ship = createAdvancedShip(true);
        const angle = (i / 6) * Math.PI * 2;
        const radius = 14; // Larger radius for more space
        ship.position.set(
          -30 + Math.cos(angle) * radius, // More space in the middle
          Math.sin(angle) * radius,
          Math.sin(angle * 2) * 4
        );
        ship.rotation.y = Math.PI / 2; // Face right (towards enemy)
        scene.add(ship);
        playerShips.push(ship);
      }

      // Create player planes - adjusted positions for centered view with more space
      for (let i = 0; i < 4; i++) {
        const plane = createAdvancedPlane(true);
        plane.position.set(
          -30, // More space in the middle
          (i - 1.5) * 8, // Adjusted spacing
          -10 + i * 5 // Adjusted depth
        );
        plane.rotation.y = Math.PI / 2; // Face right (towards enemy)
        scene.add(plane);
        playerPlanes.push(plane);
      }

      // Create enemy fleet - adjusted positions for centered view with more space
      for (let i = 0; i < 6; i++) {
        const ship = createAdvancedShip(false);
        const angle = (i / 6) * Math.PI * 2;
        const radius = 14; // Larger radius for more space
        ship.position.set(
          30 + Math.cos(angle) * radius, // More space in the middle
          Math.sin(angle) * radius,
          Math.sin(angle * 2) * 4
        );
        ship.rotation.y = -Math.PI / 2; // Face left (towards enemy)
        scene.add(ship);
        enemyShips.push(ship);
      }

      // Create enemy planes - adjusted positions for centered view with more space
      for (let i = 0; i < 4; i++) {
        const plane = createAdvancedPlane(false);
        plane.position.set(
          30, // More space in the middle
          (i - 1.5) * 8, // Adjusted spacing
          -10 + i * 5 // Adjusted depth
        );
        plane.rotation.y = -Math.PI / 2; // Face left (towards enemy)
        scene.add(plane);
        enemyPlanes.push(plane);
      }

      // Start animation
      animate();

      // Handle window resize
      window.addEventListener('resize', onWindowResize);
    }

    // Create advanced ship with more aggressive design - INCREASED SIZE
    function createAdvancedShip(isPlayer) {
      const ship = new THREE.Group();
      const color = isPlayer ? 0x00aaff : 0xff3366;
      const accentColor = isPlayer ? 0x0088ff : 0xff1144;

      // Main hull - more angular and aggressive - DOUBLE SIZE
      const hullGeometry = new THREE.ConeGeometry(2.4, 20, 8); // Doubled from 1.2, 10
      const hullMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 150,
        specular: 0x444444
      });
      const hull = new THREE.Mesh(hullGeometry, hullMaterial);
      hull.rotation.x = Math.PI / 2;
      ship.add(hull);

      // Armored cockpit - DOUBLE SIZE
      const cockpitGeometry = new THREE.SphereGeometry(3.0, 16, 16); // Doubled from 1.5
      const cockpitMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111,
        shininess: 200,
        transparent: true,
        opacity: 0.8
      });
      const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
      cockpit.position.set(0, 1.6, -8); // Adjusted for double size
      cockpit.scale.set(0.6, 0.6, 1);
      ship.add(cockpit);

      // Aggressive wings with weapon mounts - DOUBLE SIZE
      const wingGeometry = new THREE.BoxGeometry(14, 0.4, 6); // Doubled
      const wingMaterial = new THREE.MeshPhongMaterial({
        color: accentColor,
        shininess: 100
      });
      const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
      leftWing.position.set(-4, 0, 2);
      leftWing.rotation.z = 0.2;
      ship.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
      rightWing.position.set(4, 0, 2);
      rightWing.rotation.z = -0.2;
      ship.add(rightWing);

      // Enhanced weapon pods - DOUBLE SIZE
      const weaponGeometry = new THREE.CylinderGeometry(0.6, 0.8, 4, 8); // Doubled
      const weaponMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 80
      });

      const leftWeapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
      leftWeapon.position.set(-6, 0, 2);
      leftWeapon.rotation.x = Math.PI / 2;
      ship.add(leftWeapon);

      const rightWeapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
      rightWeapon.position.set(6, 0, 2);
      rightWeapon.rotation.x = Math.PI / 2;
      ship.add(rightWeapon);

      // Enhanced engine glow - DOUBLE SIZE
      const engineGeometry = new THREE.CylinderGeometry(1.4, 2, 4, 8); // Doubled
      const engineMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7
      });
      const engine = new THREE.Mesh(engineGeometry, engineMaterial);
      engine.position.set(0, 0, 8);
      engine.rotation.x = Math.PI / 2;
      ship.add(engine);

      // Add glowing engine core
      const coreGeometry = new THREE.SphereGeometry(1.2, 16, 16); // Doubled
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.position.set(0, 0, 9);
      ship.add(core);

      // Armor plating details - DOUBLE SIZE
      for (let i = 0; i < 4; i++) {
        const plateGeometry = new THREE.BoxGeometry(1.8, 0.2, 3); // Doubled
        const plate = new THREE.Mesh(plateGeometry, wingMaterial);
        plate.position.set(0, 1 - i * 0.6, -4 + i * 2);
        ship.add(plate);
      }

      return ship;
    }

    // Create advanced plane with sleek fighter jet design - INCREASED SIZE
    function createAdvancedPlane(isPlayer) {
      const plane = new THREE.Group();
      const color = isPlayer ? 0x00aaff : 0xff3366;
      const accentColor = isPlayer ? 0x0088ff : 0xff1144;

      // Sleek fuselage - DOUBLE SIZE
      const bodyGeometry = new THREE.CylinderGeometry(0.8, 1.2, 12, 8); // Doubled
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 150
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.rotation.x = Math.PI / 2;
      plane.add(body);

      // Pointed nose cone - DOUBLE SIZE
      const noseGeometry = new THREE.ConeGeometry(0.8, 4, 8); // Doubled
      const nose = new THREE.Mesh(noseGeometry, bodyMaterial);
      nose.position.set(0, 0, -8);
      nose.rotation.x = Math.PI / 2;
      plane.add(nose);

      // Delta wings - DOUBLE SIZE
      const wingGeometry = new THREE.BoxGeometry(16, 0.4, 8); // Doubled
      const wingMaterial = new THREE.MeshPhongMaterial({
        color: accentColor,
        shininess: 100
      });
      const wings = new THREE.Mesh(wingGeometry, wingMaterial);
      wings.position.set(0, 0, 0);
      plane.add(wings);

      // Tail fins - DOUBLE SIZE
      const tailFinGeometry = new THREE.BoxGeometry(6, 4, 0.4); // Doubled
      const tailFin = new THREE.Mesh(tailFinGeometry, wingMaterial);
      tailFin.position.set(0, 2, 5);
      plane.add(tailFin);

      // Cockpit canopy - DOUBLE SIZE
      const canopyGeometry = new THREE.SphereGeometry(1.4, 16, 16); // Doubled
      const canopyMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        shininess: 200,
        transparent: true,
        opacity: 0.6
      });
      const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
      canopy.position.set(0, 1, -3);
      canopy.scale.set(0.7, 0.8, 1.2);
      plane.add(canopy);

      // Engine thrusters - DOUBLE SIZE
      for (let i = -1; i <= 1; i += 2) {
        const thrusterGeometry = new THREE.CylinderGeometry(0.8, 1, 3, 8); // Doubled
        const thruster = new THREE.Mesh(thrusterGeometry, bodyMaterial);
        thruster.position.set(i * 3, 0, 6);
        thruster.rotation.x = Math.PI / 2;
        plane.add(thruster);

        // Thruster glow
        const glowGeometry = new THREE.CylinderGeometry(0.6, 0.8, 2, 8); // Doubled
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.8
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(i * 3, 0, 7.5);
        glow.rotation.x = Math.PI / 2;
        plane.add(glow);
      }

      // Weapon hardpoints - DOUBLE SIZE
      for (let i = -1; i <= 1; i += 2) {
        const weaponGeometry = new THREE.BoxGeometry(0.8, 0.8, 3.2); // Doubled
        const weaponMaterial = new THREE.MeshPhongMaterial({
          color: 0x333333,
          shininess: 80
        });
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weapon.position.set(i * 6, -0.4, 0);
        plane.add(weapon);
      }

      return plane;
    }

    // Create enhanced laser beam
    function createEnhancedLaser(startPos, endPos, color) {
      const points = [startPos, endPos];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3,
        transparent: true,
        opacity: 1
      });

      if (soundEnabled) {
        laserSound.currentTime = 0;
        laserSound.play();
      }

      const laser = new THREE.Line(geometry, material);
      scene.add(laser);

      // Add glow effect
      const glowGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const glowMaterial = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 8,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Line(glowGeometry, glowMaterial);
      scene.add(glow);

      lasers.push({
        line: laser,
        glow: glow,
        startTime: Date.now(),
        duration: 500
      });
    }

    // Create enhanced missile
    function createEnhancedMissile(startPos, endPos, color) {
      const missileGeometry = new THREE.ConeGeometry(0.4, 1.5, 8);
      const missileMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.7,
        shininess: 100
      });
      const missile = new THREE.Mesh(missileGeometry, missileMaterial);
      missile.position.copy(startPos);

      // Point missile toward target
      missile.lookAt(endPos);
      missile.rotation.x += Math.PI / 2;

      // Enhanced glow
      const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      missile.add(glow);

      scene.add(missile);

      missiles.push({
        mesh: missile,
        startPos: startPos.clone(),
        endPos: endPos.clone(),
        startTime: Date.now(),
        duration: 2000,
        color: color
      });
    }

    // Enhanced animation loop
    let time = 0;
    let scene, camera, renderer;
    let playerShips = [], enemyShips = [];
    let playerPlanes = [], enemyPlanes = [];
    let lasers = [], missiles = [], explosions = [];

    function animate() {
      requestAnimationFrame(animate);

      // Update time
      time += 0.01;

      // Update player ships with more dynamic movement
      playerShips.forEach((ship, i) => {
        ship.position.y += Math.sin(time * 2 + i) * 0.04;
        ship.rotation.x = Math.sin(time + i) * 0.08;
        ship.rotation.z = Math.cos(time * 1.5 + i) * 0.05;
      });

      // Update enemy ships
      enemyShips.forEach((ship, i) => {
        ship.position.y += Math.cos(time * 2 + i) * 0.04;
        ship.rotation.x = Math.cos(time + i) * 0.08;
        ship.rotation.z = Math.sin(time * 1.5 + i) * 0.05;
      });

      // Update player planes
      playerPlanes.forEach((plane, i) => {
        plane.position.y += Math.sin(time * 3 + i) * 0.06;
        plane.rotation.z = Math.sin(time * 2 + i) * 0.12;
        plane.rotation.x = Math.cos(time * 1.8 + i) * 0.06;
      });

      // Update enemy planes
      enemyPlanes.forEach((plane, i) => {
        plane.position.y += Math.cos(time * 3 + i) * 0.06;
        plane.rotation.z = Math.cos(time * 2 + i) * 0.12;
        plane.rotation.x = Math.sin(time * 1.8 + i) * 0.06;
      });

      // Update enhanced lasers
      for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        const elapsed = Date.now() - laser.startTime;
        if (elapsed > laser.duration) {
          scene.remove(laser.line);
          scene.remove(laser.glow);
          lasers.splice(i, 1);
        } else {
          const opacity = 1 - (elapsed / laser.duration);
          laser.line.material.opacity = opacity;
          laser.glow.material.opacity = opacity * 0.3;
        }
      }

      // Update enhanced missiles
      for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        const elapsed = Date.now() - missile.startTime;
        const progress = Math.min(1, elapsed / missile.duration);

        missile.mesh.position.lerpVectors(
          missile.startPos,
          missile.endPos,
          progress
        );

        // Add rotation for more dynamic effect
        missile.mesh.rotation.z += 0.2;

        if (progress >= 1) {
          scene.remove(missile.mesh);
          missiles.splice(i, 1);
          explosions.forEach((e, i) => {
            e.mesh.position.add(e.velocity);
            e.mesh.material.opacity -= 0.03;

            if (Date.now() - e.startTime > e.duration) {
              scene.remove(e.mesh);
              explosions.splice(i, 1);
            }
          });

        }
      }

      // Update explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        const elapsed = Date.now() - explosion.startTime;
        const progress = Math.min(1, elapsed / explosion.duration);

        const scale = progress * explosion.maxSize;
        explosion.mesh.scale.set(scale, scale, scale);
        explosion.mesh.material.opacity = 1 - progress;
        explosion.mesh.rotation.x += 0.1;
        explosion.mesh.rotation.y += 0.15;

        if (progress >= 1) {
          scene.remove(explosion.mesh);
          explosions.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }

    // Create enhanced explosion
    function createKidExplosion(position, color) {
      for (let i = 0; i < 12; i++) {
        const star = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 8, 8),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 1
          })
        );

        star.position.copy(position);
        scene.add(star);

        explosions.push({
          mesh: star,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ),
          startTime: Date.now(),
          duration: 4000,  // مدة أطول شويه
          maxSize: 18      // حجم تكبير الانفجار
        });
      }

      if (soundEnabled) {
        explosionSound.currentTime = 0;
        explosionSound.play();
      }
    }

    // Handle window resize
    function onWindowResize() {
      camera.aspect = document.getElementById('game-canvas').offsetWidth / document.getElementById('game-canvas').offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        document.getElementById('game-canvas').offsetWidth,
        document.getElementById('game-canvas').offsetHeight
      );
    }

    // Close modal when clicking outside
    window.onclick = function (event) {
      if (event.target == reviewModal) {
        closeReviewModal();
      }
      if (event.target == questionModal) {
        questionModal.style.display='none'
      }
    }
  </script>
</body>

</html>`

    return htmlContent;
}