import { describe, it, expect } from 'vitest';
import {
  lookupAdditive,
  lookupAdditiveByINS,
  getAllAdditives,
  defaultKnowledgeBase
} from '../src/index.js';

describe('INS Additive Recognition & Knowledge Base', () => {
  it('contains a substantial verified catalog of Indian packaged food additives', () => {
    const all = getAllAdditives();
    expect(all.length).toBeGreaterThanOrEqual(30);
  });

  describe('INS & E-Number Format Variations', () => {
    it('recognizes INS 621 across all common notation variations', () => {
      const variations = [
        'INS 621',
        'INS621',
        'ins 621',
        'E621',
        'E-621',
        '621',
        '(621)',
        'MSG',
        'Monosodium Glutamate',
        'Flavour Enhancer (621)',
        'Flavour Enhancer 621'
      ];

      for (const query of variations) {
        const match = lookupAdditive(query);
        expect(match, `Should match query: "${query}"`).not.toBeNull();
        expect(match?.detected.insCode).toBe('INS 621');
        expect(match?.detected.canonicalName).toBe('Monosodium Glutamate (MSG)');
        expect(match?.detected.functionalClass).toBe('flavour_enhancer');
        expect(match?.detected.riskCategory).toBe('processing_indicator');
      }
    });

    it('recognizes synthetic colours (INS 102, 110, 122, 133, 150d)', () => {
      const t102 = lookupAdditive('INS 102');
      expect(t102?.detected.canonicalName).toContain('Tartrazine');
      expect(t102?.detected.functionalClass).toBe('synthetic_colour');
      expect(t102?.detected.riskCategory).toBe('caution_load');

      const s110 = lookupAdditive('Sunset Yellow');
      expect(s110?.detected.insCode).toBe('INS 110');

      const c122 = lookupAdditive('Carmoisine');
      expect(c122?.detected.insCode).toBe('INS 122');

      const b133 = lookupAdditive('E133');
      expect(b133?.detected.insCode).toBe('INS 133');

      const caramel = lookupAdditive('INS 150d');
      expect(caramel?.detected.canonicalName).toContain('Caramel');
    });

    it('recognizes artificial sweeteners (INS 950, 951, 955, 960)', () => {
      const sucralose = lookupAdditive('Sucralose');
      expect(sucralose?.detected.insCode).toBe('INS 955');
      expect(sucralose?.detected.functionalClass).toBe('artificial_sweetener');

      const aspartame = lookupAdditive('INS 951');
      expect(aspartame?.detected.canonicalName).toBe('Aspartame');

      const aceK = lookupAdditive('Acesulfame Potassium');
      expect(aceK?.detected.insCode).toBe('INS 950');

      const stevia = lookupAdditive('Stevia');
      expect(stevia?.detected.insCode).toBe('INS 960');
    });

    it('recognizes preservatives (INS 211, 202, 224, 282)', () => {
      const benzoate = lookupAdditive('Sodium Benzoate');
      expect(benzoate?.detected.insCode).toBe('INS 211');
      expect(benzoate?.detected.functionalClass).toBe('preservative');

      const sorbate = lookupAdditive('Preservative (202)');
      expect(sorbate?.detected.insCode).toBe('INS 202');

      const kms = lookupAdditive('Potassium Metabisulphite');
      expect(kms?.detected.insCode).toBe('INS 224');

      const propionate = lookupAdditive('Calcium Propionate');
      expect(propionate?.detected.insCode).toBe('INS 282');
    });

    it('recognizes emulsifiers and raising agents (INS 322, 471, 476, 500, 503)', () => {
      const lecithin = lookupAdditive('Soya Lecithin');
      expect(lecithin?.detected.insCode).toBe('INS 322');
      expect(lecithin?.detected.riskCategory).toBe('neutral');

      const gms = lookupAdditive('GMS (471)');
      expect(gms?.detected.insCode).toBe('INS 471');

      const pgpr = lookupAdditive('PGPR');
      expect(pgpr?.detected.insCode).toBe('INS 476');

      const soda = lookupAdditive('Raising Agent (500(ii))');
      expect(soda?.detected.insCode).toBe('INS 500');

      const bicarb = lookupAdditive('Ammonium Bicarbonate');
      expect(bicarb?.detected.insCode).toBe('INS 503');
    });
  });

  describe('Lookup by Direct INS Number', () => {
    it('finds additives by direct clean number string', () => {
      const add621 = lookupAdditiveByINS('621');
      expect(add621?.canonicalName).toContain('Monosodium');

      const add330 = lookupAdditiveByINS('330');
      expect(add330?.canonicalName).toBe('Citric Acid');

      const addUnknown = lookupAdditiveByINS('99999');
      expect(addUnknown).toBeNull();
    });
  });

  describe('Neutral Explanations & Scientific Tone', () => {
    it('ensures descriptions are informative without unsupported medical claims', () => {
      const all = getAllAdditives();
      const forbiddenMedicalAlarmWords = ['toxic', 'poison', 'cancer', 'deadly', 'dangerous', 'fatal', 'hazard'];

      for (const add of all) {
        const text = (add.neutralExplanation + ' ' + (add.fssaiMaxPermittedNote || '')).toLowerCase();
        for (const word of forbiddenMedicalAlarmWords) {
          expect(text.includes(word), `Additive ${add.insCode} description should not contain alarmist word "${word}"`).toBe(false);
        }
      }
    });

    it('verifies source references are populated for auditing', () => {
      const all = getAllAdditives();
      for (const add of all) {
        expect(add.sourceRefs, `Additive ${add.insCode} should have source references`).toBeDefined();
        expect(add.sourceRefs?.length).toBeGreaterThan(0);
      }
    });

    it('works through defaultKnowledgeBase instance', () => {
      const detected = defaultKnowledgeBase.lookupAdditive('INS 621');
      expect(detected).not.toBeNull();
      expect(detected?.insCode).toBe('INS 621');
    });
  });
});
