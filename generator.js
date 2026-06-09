const { analyzeDigits } = require("./analyzer");

const weights = analyzeDigits();

function weightedRandom() {
  const entries = Object.entries(weights);

  const total = entries.reduce((s, [k, v]) => s + v, 0);

  let r = Math.random() * total;

  for (let [digit, weight] of entries) {
    if (r < weight) return digit;

    r -= weight;
  }
}

function generateNumber(digit) {
  let num = "";

  for (let i = 0; i < digit; i++) {
    num += weightedRandom();
  }

  return num;
}

function generateLottery() {
  const six = generateNumber(6);

  return {
    number6: six,
    front3: six.slice(0, 3),
    back3: six.slice(3, 6),
    last2: six.slice(4, 6),
  };
}

function getProbabilities(weights) {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);

  let probs = {};

  for (let d in weights) {
    probs[d] = weights[d] / total;
  }

  return probs;
}

function calculateProbability(number, probs) {
  let p = 1;

  number.split("").forEach((d) => {
    p *= probs[d];
  });

  return p;
}

module.exports = {
  generateLottery,
  generateNumber,
  weights,
  getProbabilities,
  calculateProbability,
};
