const express = require("express");
const cors = require("cors");
const { analyze, rankDigits, scoreNumber } = require("./analyzer");
const { predictTop } = require("./predictor");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

function model() {
  return analyze({ decay: 0.94 });
}

app.get("/health", (req, res) => res.json({ status: "ok", version: "2.0.0" }));

app.get("/stats", (req, res) => {
  const m = model();
  res.json({ sampleSize: m.sampleSize, decay: m.decay, digits: rankDigits(m) });
});

app.get("/predict", (req, res) => {
  const m = model();
  const top = predictTop(m, 10, 30000);
  res.json({
    generatedAt: new Date().toISOString(),
    sampleSize: m.sampleSize,
    warning:
      "Statistical ranking only. Lottery outcomes are random; no method guarantees a win.",
    top,
  });
});

app.get("/predict/top", (req, res) => {
  const m = model();
  res.json(predictTop(m, 20, 50000));
});

app.get("/predict/top3", (req, res) => {
  const m = model();
  const all = [];
  for (let i = 0; i < 1000; i++) {
    const n = String(i).padStart(3, "0");
    let score = 0;
    const pos = m.position;
    for (let j = 3; j < 6; j++) {
      const row = pos[j];
      const total = row.reduce((a, b) => a + b, 0) || 1;
      score += Math.log(row[Number(n[j - 3])] / total + 1e-12);
    }
    all.push({ number: n, score });
  }
  all.sort((a, b) => b.score - a.score);
  res.json(all.slice(0, 10));
});

app.post("/score", (req, res) => {
  const number = String(req.body?.number || "");
  if (!/^\d{6}$/.test(number))
    return res.status(400).json({ error: "number must be exactly 6 digits" });
  const m = model();
  res.json({ number, score: scoreNumber(number, m), sampleSize: m.sampleSize });
});

app.get("/", (req, res) =>
  res.send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lottery Oracle 2.0</title>

<style>
* {
  box-sizing: border-box;
}

:root {
  --bg: #020617;
  --surface: rgba(15, 23, 42, .78);
  --surface-hover: rgba(30, 41, 59, .9);
  --border: rgba(148, 163, 184, .14);
  --text: #e5e7eb;
  --muted: #94a3b8;
  --primary: #38bdf8;
  --primary-2: #2563eb;
  --success: #34d399;
  --warning: #fbbf24;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  background:
    radial-gradient(circle at 10% 10%, rgba(37,99,235,.20), transparent 30%),
    radial-gradient(circle at 90% 20%, rgba(56,189,248,.14), transparent 28%),
    radial-gradient(circle at 50% 100%, rgba(124,58,237,.12), transparent 35%),
    var(--bg);
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: linear-gradient(to bottom, black, transparent);
}

.wrap {
  width: min(1180px, 100%);
  margin: auto;
  padding: clamp(16px, 4vw, 36px);
}

/* HERO */

.hero {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 5vw, 42px);
  margin-bottom: 22px;
  border: 1px solid var(--border);
  border-radius: 28px;

  background:
    linear-gradient(
      135deg,
      rgba(30,41,59,.92),
      rgba(15,23,42,.78)
    );

  backdrop-filter: blur(18px);
  box-shadow:
    0 25px 70px rgba(0,0,0,.30),
    inset 0 1px rgba(255,255,255,.04);

  animation: fadeUp .6s ease both;
}

.hero::after {
  content: "";
  position: absolute;
  width: 220px;
  height: 220px;
  right: -80px;
  top: -100px;
  border-radius: 50%;
  background: rgba(56,189,248,.14);
  filter: blur(30px);
}

.hero h1 {
  position: relative;
  z-index: 1;
  margin: 0 0 10px;
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1.1;
  letter-spacing: -1px;
}

.muted {
  position: relative;
  z-index: 1;
  color: var(--muted);
  line-height: 1.6;
  font-size: clamp(13px, 2vw, 15px);
}

.badge {
  display: inline-flex;
  margin-top: 18px;
  padding: 7px 11px;
  border-radius: 999px;
  color: #bae6fd;
  background: rgba(56,189,248,.08);
  border: 1px solid rgba(56,189,248,.16);
  font-size: 12px;
}

.warn {
  position: relative;
  z-index: 1;
  margin-top: 16px;
  padding: 11px 13px;
  border-radius: 12px;
  color: var(--warning);
  background: rgba(251,191,36,.06);
  border: 1px solid rgba(251,191,36,.12);
  font-size: 12px;
  line-height: 1.5;
}

/* GRID */

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 18px;
}

.card {
  grid-column: span 4;
  min-width: 0;
  padding: 22px;

  border: 1px solid var(--border);
  border-radius: 22px;

  background: var(--surface);
  backdrop-filter: blur(14px);

  box-shadow:
    0 15px 45px rgba(0,0,0,.20),
    inset 0 1px rgba(255,255,255,.025);

  transition:
    transform .25s ease,
    border-color .25s ease,
    background .25s ease,
    box-shadow .25s ease;

  animation: fadeUp .6s ease both;
}

.card:nth-child(2) {
  animation-delay: .08s;
}

.card:nth-child(3) {
  animation-delay: .16s;
}

.card:hover {
  transform: translateY(-5px);
  background: var(--surface-hover);
  border-color: rgba(56,189,248,.22);
  box-shadow:
    0 20px 55px rgba(0,0,0,.30),
    0 0 30px rgba(56,189,248,.05);
}

.card h2 {
  margin: 0 0 18px;
  font-size: 18px;
  letter-spacing: -.2px;
}

/* BUTTON */

button {
  border: 0;
  border-radius: 11px;
  padding: 10px 15px;

  color: white;
  font-weight: 600;
  cursor: pointer;

  background: linear-gradient(
    135deg,
    var(--primary-2),
    #0284c7
  );

  box-shadow: 0 8px 20px rgba(37,99,235,.22);

  transition:
    transform .2s ease,
    box-shadow .2s ease,
    opacity .2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(37,99,235,.32);
}

button:active {
  transform: scale(.97);
}

button.loading {
  pointer-events: none;
  opacity: .65;
}

/* ROW */

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;

  padding: 13px 14px;
  margin: 9px 0;

  border-radius: 13px;
  background: rgba(51,65,85,.42);
  border: 1px solid transparent;

  transition:
    background .2s ease,
    border-color .2s ease,
    transform .2s ease;
}

.row:hover {
  transform: translateX(3px);
  background: rgba(51,65,85,.68);
  border-color: rgba(148,163,184,.10);
}

.num {
  margin-top: 3px;
  font-size: clamp(20px, 4vw, 25px);
  font-weight: 800;
  letter-spacing: 2px;
}

.badge {
  white-space: nowrap;
}

/* PROGRESS */

.bar {
  width: 100%;
  height: 7px;
  margin-top: 7px;

  overflow: hidden;
  border-radius: 99px;
  background: rgba(71,85,105,.55);
}

.bar i {
  display: block;
  height: 100%;
  width: 0;

  border-radius: inherit;

  background: linear-gradient(
    90deg,
    #2563eb,
    #38bdf8
  );

  box-shadow: 0 0 12px rgba(56,189,248,.25);

  animation: progress 1s ease forwards;
}

/* LOADING */

.loading-state {
  display: grid;
  gap: 10px;
}

.skeleton {
  height: 55px;
  border-radius: 12px;

  background:
    linear-gradient(
      90deg,
      rgba(51,65,85,.35) 25%,
      rgba(71,85,105,.55) 50%,
      rgba(51,65,85,.35) 75%
    );

  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
}

/* ANIMATIONS */

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progress {
  from {
    width: 0;
  }
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

/* TABLET */

@media (max-width: 900px) {
  .card {
    grid-column: span 6;
  }

  .card:last-child {
    grid-column: span 12;
  }
}

/* MOBILE */

@media (max-width: 620px) {
  .wrap {
    padding: 14px;
  }

  .hero {
    padding: 23px 18px;
    border-radius: 20px;
  }

  .hero h1 {
    font-size: 30px;
  }

  .grid {
    gap: 14px;
  }

  .card,
  .card:last-child {
    grid-column: span 12;
    padding: 18px;
    border-radius: 18px;
  }

  .row {
    padding: 12px;
  }

  button {
    width: 100%;
    min-height: 42px;
  }

  .num {
    font-size: 22px;
  }
}

/* REDUCE MOTION */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
</style>
</head>

<body>

<div class="wrap">

  <section class="hero">
    <h1>🎯 Lottery Oracle 2.0</h1>

    <div class="muted">
      Recency + position + pair/triple pattern scoring + Monte Carlo ranking
    </div>

    <div id="meta" class="badge">
      Loading historical data...
    </div>

    <div class="warn">
      ⚠️ Statistical ranking only. Lottery draws are random;
      no model guarantees accurate predictions or winning results.
    </div>
  </section>

  <div class="grid">

    <div class="card">
      <h2>🔥 Top 6-digit</h2>

      <button id="refreshBtn" onclick="load()">
        Refresh
      </button>

      <div id="top" style="margin-top:16px">
        <div class="loading-state">
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>🔢 Digit Strength</h2>

      <div id="digits">
        <div class="loading-state">
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>🎯 Top 3-digit</h2>

      <div id="top3">
        <div class="loading-state">
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </div>
      </div>
    </div>

  </div>
</div>

<script>

async function load() {

  const button = document.querySelector("#refreshBtn");

  button.classList.add("loading");
  button.textContent = "Loading...";

  try {

    const [p, s, t] = await Promise.all([
      fetch("/predict").then(r => r.json()),
      fetch("/stats").then(r => r.json()),
      fetch("/predict/top3").then(r => r.json())
    ]);

    document.querySelector("#meta").textContent =
      "Historical draws: " +
      p.sampleSize +
      " | " +
      new Date(p.generatedAt).toLocaleString();

    document.querySelector("#top").innerHTML =
      p.top.map((x, i) => \`
        <div class="row">
          <div>
            <small>#\${i + 1}</small>
            <div class="num">\${x.number}</div>
          </div>

          <span class="badge">
            \${(x.modelProbability * 100).toFixed(3)}%
          </span>
        </div>
      \`).join("");

    const mx = s.digits[0]?.score || 1;

    document.querySelector("#digits").innerHTML =
      s.digits.map(x => \`
        <div class="row">
          <b>\${x.digit}</b>

          <div style="width:75%">
            <span class="badge">
              \${(x.score * 100).toFixed(2)}%
            </span>

            <div class="bar">
              <i style="width:\${Math.max(
                2,
                x.score / mx * 100
              )}%"></i>
            </div>
          </div>
        </div>
      \`).join("");

    document.querySelector("#top3").innerHTML =
      t.map((x, i) => \`
        <div class="row">
          <div>
            <small>#\${i + 1}</small>
            <div class="num">\${x.number}</div>
          </div>
        </div>
      \`).join("");

  } catch (error) {

    document.querySelector("#meta").textContent =
      "Failed to load prediction data.";

    document.querySelector("#top").innerHTML =
      \`
        <div class="row">
          <span class="muted">
            Unable to load data. Please try again.
          </span>
        </div>
      \`;

  } finally {

    button.classList.remove("loading");
    button.textContent = "Refresh";

  }
}

load();

</script>

</body>
</html>`),
);

app.listen(PORT, () =>
  console.log(`Lottery Oracle 2.0 running on http://localhost:${PORT}`),
);
