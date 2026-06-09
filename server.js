const express = require("express");
const cors = require("cors");

const { analyzeDigits, getTopDigits } = require("./analyzer");
const {
  generateLottery,
  generateNumber,
  weights,
  getProbabilities,
  calculateProbability,
} = require("./generator");

const app = express();

app.use(cors());

const PORT = 3000;

// --------------------
// API
// --------------------

app.get("/stats", (req, res) => {
  const stats = analyzeDigits();

  res.json(stats);
});

app.get("/top-digits", (req, res) => {
  const stats = analyzeDigits();

  const top = getTopDigits(stats, 3);

  res.json({
    topDigits: top,
  });
});

app.get("/random/6", (req, res) => {
  res.json({
    number: generateNumber(6),
  });
});

app.get("/random/3", (req, res) => {
  res.json({
    number: generateNumber(3),
  });
});

app.get("/random/2", (req, res) => {
  res.json({
    number: generateNumber(2),
  });
});

app.get("/predict", (req, res) => {
  const result = generateLottery();

  const probs = getProbabilities(weights);

  const probValue = calculateProbability(result.number6, probs);

  res.json({
    ...result,
    probability: (probValue * 100).toFixed(8) + "%",
  });
});

app.get("/predict/top", (req, res) => {
  const probs = getProbabilities(weights);

  let results = [];

  for (let i = 0; i < 1000; i++) {
    let num = generateNumber(6);

    let p = calculateProbability(num, probs);

    results.push({ num, p });
  }

  results.sort((a, b) => b.p - a.p);

  res.json(
    results.slice(0, 5).map((r) => ({
      number: r.num,
      probability: (r.p * 100).toFixed(8) + "%",
    })),
  );
});

app.get("/predict/top3", (req, res) => {
  const probs = getProbabilities(weights);

  let results = [];

  for (let i = 0; i <= 999; i++) {
    const num = i.toString().padStart(3, "0");

    const p = calculateProbability(num, probs);

    results.push({ num, p });
  }

  results.sort((a, b) => b.p - a.p);

  res.json(
    results.slice(0, 5).map((r, index) => ({
      rank: index + 1,
      number: r.num,
      probability: (r.p * 100).toFixed(8) + "%",
    })),
  );
});

// --------------------
// HTML PAGE
// --------------------

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Lottery AI Dashboard</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial;
}

body{
background:#0f172a;
color:white;
padding:30px;
}

.container{
max-width:1400px;
margin:auto;
}

h1{
text-align:center;
margin-bottom:30px;
font-size:42px;
}

.grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
gap:20px;
}

.card{
background:#1e293b;
padding:24px;
border-radius:22px;
}

.card h2{
margin-bottom:20px;
}

button{
background:#2563eb;
border:none;
padding:10px 16px;
border-radius:12px;
color:white;
cursor:pointer;
margin-bottom:20px;
}

.big-number{
font-size:48px;
font-weight:bold;
text-align:center;
margin:20px 0;
color:#38bdf8;
letter-spacing:4px;
}

.prob{
text-align:center;
opacity:0.7;
font-size:14px;
}

.list{
display:flex;
flex-direction:column;
gap:12px;
}

.item{
background:#334155;
padding:16px;
border-radius:14px;
display:flex;
justify-content:space-between;
align-items:center;
}

.rank{
font-size:12px;
opacity:0.7;
}

.number{
font-size:28px;
font-weight:bold;
margin-top:4px;
}

.stats{
display:flex;
gap:12px;
flex-wrap:wrap;
}

.digit{
background:#475569;
padding:12px 16px;
border-radius:10px;
font-size:20px;
font-weight:bold;
}

</style>
</head>

<body>

<div class="container">

<h1>🎯 Lottery AI Dashboard</h1>

<div class="grid">

<div class="card">
<h2>AI Random Lottery</h2>

<button onclick="loadPredict()">Randomize again</button>

<div class="big-number" id="predict6">
------
</div>

<div class="prob" id="predictProb">Probability: -</div>
</div>

<div class="card">
<h2>Lucky numbers</h2>

<button onclick="loadTopDigits()">Refresh</button>

<div class="stats" id="topDigits"></div>
</div>

<div class="card">
<h2>Top 6 Numbers</h2>

<button onclick="loadTop6()">Reload</button>

<div class="list" id="top6"></div>
</div>

<div class="card">
<h2>Top 3-digit Numbers</h2>

<button onclick="loadTop3()">Reload</button>

<div class="list" id="top3"></div>
</div>

</div>

</div>

<script>

async function loadPredict(){
const res = await fetch("/predict");
const data = await res.json();

document.getElementById("predict6").innerText =
data.number6;

document.getElementById("predictProb").innerText =
"Probability: " + data.probability;
}

async function loadTopDigits(){
const res = await fetch("/top-digits");
const data = await res.json();

const container = document.getElementById("topDigits");

container.innerHTML = data.topDigits.map(d => \`
<div class="digit">\${d}</div>
\`).join("");
}

async function loadTop6(){
const res = await fetch("/predict/top");
const data = await res.json();

const container = document.getElementById("top6");

container.innerHTML = data.map((item,i) => \`
<div class="item">

<div>
<div class="rank">
Rank #\${i+1}
</div>

<div class="number">
\${item.number}
</div>
</div>

<div class="prob">
\${item.probability}
</div>

</div>
\`).join("");
}

async function loadTop3(){
const res = await fetch("/predict/top3");
const data = await res.json();

const container = document.getElementById("top3");

container.innerHTML = data.map((item,i) => \`
<div class="item">

<div>
<div class="rank">
Rank #\${i+1}
</div>

<div class="number">
\${item.number}
</div>
</div>

<div class="prob">
\${item.probability}
</div>

</div>
\`).join("");
}

loadPredict();
loadTopDigits();
loadTop6();
loadTop3();

</script>

</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log("Lottery AI API running on", PORT);
});
