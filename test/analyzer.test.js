const test=require("node:test");
const assert=require("node:assert/strict");
const {scoreNumber,normalizeArray}=require("../analyzer");
test("normalizeArray sums to 1",()=>{const p=normalizeArray([1,2,3]);assert.equal(Math.round(p.reduce((a,b)=>a+b,0)*1e6),1e6)});
test("score accepts six digits",()=>{const model={position:Array.from({length:6},()=>Array(10).fill(1)),pairs:new Map(),triples:new Map()};assert(Number.isFinite(scoreNumber("012345",model)))});
test("score rejects invalid number",()=>{const model={position:Array.from({length:6},()=>Array(10).fill(1)),pairs:new Map(),triples:new Map()};assert.equal(scoreNumber("12345",model),-Infinity)});