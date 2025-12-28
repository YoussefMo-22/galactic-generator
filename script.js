const generateBtn = document.querySelector(".generate-btn");
const jsonInput = document.querySelector(".json-input");
const titleInput = document.querySelector(".title-input");


generateBtn.addEventListener('click', async () => {
  try {
    const jsonValue = jsonInput.value.trim();
    const titleValue = titleInput.value.trim() || "Map Board Game";
    
    if (!jsonValue) {
      alert('Please enter some JSON data.');
      return;
    }

    const questions = JSON.parse(jsonValue);
    if (!Array.isArray(questions)) throw new Error('JSON must be an array of questions');

    questions.forEach((q, i) => {
      
    });

    // توليد HTML
    const htmlContent = generateHTMLFile(questions, titleValue);

    // إنشاء ZIP
    const zip = new JSZip();
    zip.file("index.html", htmlContent);

    // إضافة مجلد assets مع الأصوات وملف three.min.js
    const assets = zip.folder("assets");

    const soundFiles = ['./sounds/laser.mp3','./sounds/pop.mp3']; // ضع ملفات الأصوات هنا
    for (const file of soundFiles) {
      const data = await fetch(`./${file}`).then(r => r.arrayBuffer());
      assets.file(file, data);
    }

    // مثال لإضافة three.min.js (يمكن تعديله حسب مكان الملف)
    const threeJsData = await fetch('./three.min.js').then(r => r.text());
    assets.file('three.min.js', threeJsData);

    // تنزيل ZIP
    zip.generateAsync({type:"blob"}).then(content => {
      saveAs(content, `Map Board Game - ${titleValue}.zip`);
    });

  } catch(err) {
    alert("Error: " + err.message);
    console.error(err);
  }
});



function generateHTMLFile(questions,titleValue){
    const htmlContent =`<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galactic Grammar Battle: Two Teams Mode</title>
  <!--<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>-->
  <script src='assets/three.min.js'></script>
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
      flex-direction: column;
      gap: 15px;
    }

    .player-stats {
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
      font-size: 19.4px;
      font-weight: bold;
      color: #00f7ff;
      margin-bottom: 10px;
    }

    .player2-name {
      color: #ff3366;
    }

    .turn-indicator {
      font-size: 19.4px;
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
      font-size: 19.4px;
      color: #cc66ff;
      margin-top: 5px;
    }

    .incorrect-counter {
      font-size: 19.4px;
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
    <h1 class="menu-title">GALACTIC GRAMMAR BATTLE</h1>
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
      <h1>GALACTIC GRAMMAR BATTLE</h1>
      <div class="subtitle">Answer questions correctly to attack! Teams lose after 5 incorrect answers.</div>
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
          <div class="question-counter">Question <span id="question-number">1</span> of 20</div>
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

    console.log(${JSON.stringify(questions)}[0]);
    // Question sets
    const questionSets = ${JSON.stringify(questions)}[0];

    // Game state
    let currentQuestionSet = 'present_simple';
    let questions = questionSets[currentQuestionSet];
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

    const laserSound = new Audio('assets/laser.mp3');
    laserSound.volume = 0.4;

    const explosionSound = new Audio('assets/pop.mp3');
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
      questionText.textContent = q.question;

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
      const sets = Object.keys(questionSets);
      sets.forEach(setName => {
        const setItem = document.createElement('a');
        setItem.href = '#';
        setItem.className = 'dropdown-item';
        setItem.textContent = "Set: " + setName.replace('_', ' ').toUpperCase();
        setItem.onclick = (e) => {
          e.preventDefault();
          changeQuestionSet(setName);
        };
        questionsDropdown.appendChild(setItem);
      });

      // Add divider
      const divider = document.createElement('div');
      divider.style.borderTop = '2px solid #cc66ff';
      divider.style.margin = '10px 0';
      questionsDropdown.appendChild(divider);

      // Add individual questions
      questions.forEach((q, index) => {
        const dropdownItem = document.createElement('a');
        dropdownItem.href = '#';
        dropdownItem.className = 'dropdown-item';
        dropdownItem.textContent = "Q" + (index + 1) + ": " + q.question.substring(0, 30) + "...";
        dropdownItem.onclick = (e) => {
          e.preventDefault();
          changeCurrentQuestion(index);
        };
        questionsDropdown.appendChild(dropdownItem);
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
    function changeQuestionSet(setName) {
      currentQuestionSet = setName;
      questions = questionSets[setName];

      // Reset the game with new questions
      gameState.currentQuestion = 0;
      gameState.answeredQuestions = [];
      loadQuestion(0);

      // Update log
addLogEntry("Question set changed to: " + setName.replace('_', ' ').toUpperCase(), 'system-log');

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