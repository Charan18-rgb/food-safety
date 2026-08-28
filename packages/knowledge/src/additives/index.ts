import { AdditiveKnowledge } from '../types.js';
import { FLAVOUR_ENHANCERS } from './flavour-enhancers.js';
import { SYNTHETIC_COLOURS } from './synthetic-colours.js';
import { ARTIFICIAL_SWEETENERS } from './artificial-sweeteners.js';
import { PRESERVATIVES } from './preservatives.js';
import { EMULSIFIERS_STABILIZERS } from './emulsifiers-stabilizers.js';
import { ACIDITY_ANTIOXIDANTS } from './acidity-antioxidants.js';

export const ALL_CANONICAL_ADDITIVES: AdditiveKnowledge[] = [
  ...FLAVOUR_ENHANCERS,
  ...SYNTHETIC_COLOURS,
  ...ARTIFICIAL_SWEETENERS,
  ...PRESERVATIVES,
  ...EMULSIFIERS_STABILIZERS,
  ...ACIDITY_ANTIOXIDANTS
];

export const ADDITIVES_BY_INS: Map<string, AdditiveKnowledge> = new Map(
  ALL_CANONICAL_ADDITIVES.map(item => [item.insNumber.toLowerCase(), item])
);

export {
  FLAVOUR_ENHANCERS,
  SYNTHETIC_COLOURS,
  ARTIFICIAL_SWEETENERS,
  PRESERVATIVES,
  EMULSIFIERS_STABILIZERS,
  ACIDITY_ANTIOXIDANTS
};
