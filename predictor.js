const { analyze, scoreNumber, normalizeArray } = require("./analyzer");

function weightedChoice(weights, rng=Math.random) {
  const total=weights.reduce((a,b)=>a+b,0);
  let r=rng()*total;
  for(let i=0;i<weights.length;i++){ r-=weights[i]; if(r<=0) return i; }
  return weights.length-1;
}

function positionWeights(model, i) {
  const row=model.position[i];
  const probs=normalizeArray(row);
  // Blend historical frequency with a small uniform prior to avoid zero-probability digits.
  return probs.map(p => 0.92*p + 0.08/10);
}

function generateCandidates(model, count=20000, rng=Math.random) {
  const seen=new Map();
  for(let k=0;k<count;k++){
    let n="";
    for(let i=0;i<6;i++) n += weightedChoice(positionWeights(model,i),rng);
    const score=scoreNumber(n,model);
    const old=seen.get(n);
    if(!old || score>old.score) seen.set(n,{number:n,score});
  }
  return [...seen.values()].sort((a,b)=>b.score-a.score);
}

function probabilityFromScores(items) {
  if(!items.length) return [];
  const max=Math.max(...items.map(x=>x.score));
  const exps=items.map(x=>Math.exp(x.score-max));
  const total=exps.reduce((a,b)=>a+b,0);
  return items.map((x,i)=>({...x,modelProbability:exps[i]/total}));
}

function predictTop(model,count=10,samples=30000) {
  return probabilityFromScores(generateCandidates(model,samples).slice(0,count));
}

module.exports={generateCandidates,predictTop,positionWeights};