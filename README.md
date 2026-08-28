# LOTTE-DEMO-ORACLE v2.0

A statistical lottery analysis and ranking demo. It uses historical data to rank number candidates; it does not guarantee future lottery results.

## Features

- Recency weighting
- Position-based digit frequency
- Pair and triple pattern analysis
- Bayesian-style smoothing
- Monte Carlo candidate generation
- Top 6-digit ranking
- Top 3-digit ranking
- Digit strength analysis
- Number scoring via `/score`
- Health check via `/health`
- Node.js built-in unit tests
- Git-safe data handling with `lottery-data.json` excluded from commits

## Important

Lottery draws are random. Statistical analysis can rank candidates from historical patterns, but no model can guarantee an accurate prediction or a winning result.

## Requirements

- Node.js 20 or newer

## Run

```bash
npm install
copy lottery-data.example.json lottery-data.json
npm test
npm start
```

Open `http://localhost:3000`.

## Data

Add verified historical results to `lottery-data.json` using the schema in `lottery-data.example.json`. More clean historical data gives the analysis more information to work with.

## API

- `GET /health` - service health and version
- `GET /stats` - historical statistics and digit ranking
- `GET /predict` - ranked 6-digit candidates
- `GET /predict/top` - extended 6-digit ranking
- `GET /predict/top3` - ranked 3-digit candidates
- `POST /score` - score a six-digit number

## Project Structure

```text
LOTTE-DEMO-ORACLE-v2.0/
├── analyzer.js
├── predictor.js
├── server.js
├── lottery-data.example.json
├── test/
│   └── analyzer.test.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```
