import fs from 'fs';
const text = fs.readFileSync('src/lib/full-ready-recipes.ts', 'utf-8');
const m = text.match(/"fivePersonFallback": (\[[^\]]*\])/);
const m2 = text.match(/"repairRule": "([^"]*)"/);
const m3 = text.match(/"supportedParticipantCounts": (\[[^\]]*\])/);
console.log('fivePersonFallback:', m ? m[1] : 'not found');
console.log('repairRule:', m2 ? m2[1].slice(0, 80) : 'not found');
console.log('supportedParticipantCounts:', m3 ? m3[1] : 'not found');
