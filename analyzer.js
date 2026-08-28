const fs = require("fs");
const path = require("path");

function loadData() {
  const file = path.join(__dirname, "lottery-data.json");
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return Array.isArray(data) ? data : [];
}

function normalize(value, len) {
  const s = String(value ?? "").replace(/\D/g, "");
  return s.length === len ? s : null;
}

function flattenDraw(draw) {
  const out = [];
  const first = normalize(draw.firstPrize, 6);
  if (first) out.push({ value: first, type: "firstPrize" });
  for (const x of draw.front3 || []) {
    const n = normalize(x, 3); if (n) out.push({ value:n, type:"front3" });
  }
  for (const x of draw.back3 || []) {
    const n = normalize(x, 3); if (n) out.push({ value:n, type:"back3" });
  }
  const last2 = normalize(draw.last2, 2);
  if (last2) out.push({ value:last2, type:"last2" });
  return out;
}

function analyze(options = {}) {
  const data = loadData();
  const decay = Number(options.decay ?? 0.94);
  const position = Array.from({length: 6}, () => Array(10).fill(0));
  const digits = Array(10).fill(0);
  const pairs = new Map();
  const triples = new Map();

  data.forEach((draw, index) => {
    const recencyWeight = Math.pow(decay, data.length - 1 - index);
    const first = normalize(draw.firstPrize, 6);
    if (!first) return;
    for (let i=0;i<6;i++) {
      const d=Number(first[i]);
      position[i][d] += recencyWeight;
      digits[d] += recencyWeight;
    }
    for (let i=0;i<5;i++) {
      const key=first.slice(i,i+2);
      pairs.set(key,(pairs.get(key)||0)+recencyWeight);
    }
    for (let i=0;i<4;i++) {
      const key=first.slice(i,i+3);
      triples.set(key,(triples.get(key)||0)+recencyWeight);
    }
  });

  return { sampleSize:data.length, digits, position, pairs, triples, decay };
}

function normalizeArray(a) {
  const total=a.reduce((s,v)=>s+v,0);
  return total ? a.map(v=>v/total) : a.map(()=>1/a.length);
}

function scoreNumber(number, model) {
  if (!/^\d{6}$/.test(number)) return -Infinity;
  let score=0;
  const posProb=model.position.map(normalizeArray);
  for(let i=0;i<6;i++) score += Math.log(posProb[i][Number(number[i])] + 1e-12);
  for(let i=0;i<5;i++) score += 0.65*Math.log((model.pairs.get(number.slice(i,i+2))||0)+1e-6);
  for(let i=0;i<4;i++) score += 0.35*Math.log((model.triples.get(number.slice(i,i+3))||0)+1e-6);
  return score;
}

function rankDigits(model) {
  const total=model.digits.reduce((a,b)=>a+b,0);
  return model.digits.map((v,d)=>({digit:String(d), score:total?v/total:0}))
    .sort((a,b)=>b.score-a.score);
}

module.exports={loadData,flattenDraw,analyze,scoreNumber,rankDigits,normalizeArray};