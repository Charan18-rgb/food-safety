import { getAllIngredients, getAllAdditives } from '../packages/knowledge/dist/index.js';

console.log('--- ALL INGREDIENT IDS ---');
console.log(getAllIngredients().map(i => i.id).sort().join(', '));

console.log('\n--- ALL ADDITIVE INS CODES ---');
console.log(getAllAdditives().map(a => a.insCode).sort().join(', '));
