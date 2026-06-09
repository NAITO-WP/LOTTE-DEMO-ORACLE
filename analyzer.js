const data = require("./lottery-data.json");

function analyzeDigits() {
  let digitCount = {};

  for (let i = 0; i <= 9; i++) {
    digitCount[i] = 0;
  }

  data.forEach((draw) => {
    let numbers = [];

    numbers.push(draw.firstPrize);
    numbers.push(...draw.front3);
    numbers.push(...draw.back3);
    numbers.push(draw.last2);

    numbers.forEach((num) => {
      num.split("").forEach((d) => {
        digitCount[d]++;
      });
    });
  });

  return digitCount;
}

function getTopDigits(counts, top = 3) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map((d) => d[0]);
}

module.exports = {
  analyzeDigits,
  getTopDigits,
};
