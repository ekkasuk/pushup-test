let count = 0;
let state = "up";
let timeLeft = 30;
let timerInterval;

const timerEl = document.getElementById("timer");
const countEl = document.getElementById("count");
const resultEl = document.getElementById("result");
const startBtn = document.getElementById("startBtn");

const PASS_SCORE = 15; // ปรับตามเกณฑ์ที่ต้องการ

function beepTwice() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  for (let i=0; i<2; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 1200;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i*0.2);
    osc.stop(ctx.currentTime + 0.15 + i*0.2);
  }
}

function startTimer() {
  timeLeft = 30;
  timerEl.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishTest();
    }
  }, 1000);
}

function finishTest() {
  if (count >= PASS_SCORE) {
    resultEl.textContent = "ผ่านเกณฑ์";
    resultEl.className = "pass";
  } else {
    resultEl.textContent = "ไม่ผ่านเกณฑ์";
    resultEl.className = "fail";
  }
}

async function startAR() {
  if (!navigator.xr) {
    alert("เครื่องไม่รองรับ AR");
    return;
  }

  const session = await navigator.xr.requestSession("immersive-ar");
  const refSpace = await session.requestReferenceSpace("local");

  const loop = (t, frame) => {
    const pose = frame.getViewerPose(refSpace);

    if (pose && timeLeft > 0) {
      const y = pose.transform.position.y;

      if (y < -0.25) {
        state = "down";
      }

      if (y > 0.1 && state === "down") {
        count++;
        countEl.textContent = count;
        state = "up";
        beepTwice();
      }
    }

    session.requestAnimationFrame(loop);
  };

  session.requestAnimationFrame(loop);
}

startBtn.addEventListener("click", async () => {
  count = 0;
  countEl.textContent = 0;
  resultEl.textContent = "กำลังทดสอบ...";
  resultEl.className = "";
  startTimer();
  await startAR();
});
