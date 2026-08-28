import { AdditiveKnowledge } from '../types.js';

export const ARTIFICIAL_SWEETENERS: AdditiveKnowledge[] = [
  {
    insNumber: '950',
    insCode: 'INS 950',
    canonicalName: 'Acesulfame Potassium (Ace-K)',
    aliases: ['950', 'ins950', 'ins 950', 'e950', 'e-950', 'acesulfame k', 'acesulfame potassium', 'ace k'],
    functionalClass: 'artificial_sweetener',
    riskCategory: 'caution_load',
    neutralExplanation: 'Calorie-free high-intensity artificial sweetener approximately 200 times sweeter than sucrose.',
    fssaiMaxPermittedNote: 'FSSAI mandates statutory warning: "Contains Artificial Sweetener". Permitted within specific mg/kg limits.',
    sourceRefs: ['FSSAI Labelling and Display Regulations', 'JECFA']
  },
  {
    insNumber: '951',
    insCode: 'INS 951',
    canonicalName: 'Aspartame',
    aliases: ['951', 'ins951', 'ins 951', 'e951', 'e-951', 'aspartame', 'nutrasweet'],
    functionalClass: 'artificial_sweetener',
    riskCategory: 'caution_load',
    neutralExplanation: 'Low-calorie dipeptide artificial sweetener (~200x sweeter than sugar); contains phenylalanine.',
    fssaiMaxPermittedNote: 'Requires statutory label advisory: "Contains Phenylalanine; Not recommended for Phenylketonurics".',
    sourceRefs: ['FSSAI Standards', 'WHO/IARC 2023 Evaluation', 'JECFA']
  },
  {
    insNumber: '955',
    insCode: 'INS 955',
    canonicalName: 'Sucralose',
    aliases: ['955', 'ins955', 'ins 955', 'e955', 'e-955', 'sucralose', 'splenda'],
    functionalClass: 'artificial_sweetener',
    riskCategory: 'caution_load',
    neutralExplanation: 'Non-caloric high-intensity sweetener synthesized by chlorinating sucrose (~600 times sweeter than sugar).',
    fssaiMaxPermittedNote: 'Requires mandatory statutory declaration under FSSAI.',
    sourceRefs: ['FSSAI Regulations', 'JECFA']
  },
  {
    insNumber: '960',
    insCode: 'INS 960',
    canonicalName: 'Steviol Glycosides (Stevia)',
    aliases: ['960', 'ins960', 'ins 960', 'e960', 'e-960', 'stevia', 'steviol glycosides', 'reb a', 'rebaudioside a'],
    functionalClass: 'artificial_sweetener',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Zero-calorie high-intensity natural sweetener extracted from the leaves of the Stevia rebaudiana plant.',
    fssaiMaxPermittedNote: 'Permitted in specified food categories under FSSAI.',
    sourceRefs: ['FSSAI Food Additives Table', 'JECFA']
  },
  {
    insNumber: '961',
    insCode: 'INS 961',
    canonicalName: 'Neotame',
    aliases: ['961', 'ins961', 'ins 961', 'e961', 'e-961', 'neotame'],
    functionalClass: 'artificial_sweetener',
    riskCategory: 'caution_load',
    neutralExplanation: 'Ultra-high-intensity non-caloric artificial sweetener approximately 7,000 to 13,000 times sweeter than sucrose.',
    fssaiMaxPermittedNote: 'Permitted under FSSAI with mandatory label declaration.',
    sourceRefs: ['FSSAI Standards', 'EFSA']
  },
  {
    insNumber: '965',
    insCode: 'INS 965',
    canonicalName: 'Maltitol / Maltitol Syrup',
    aliases: ['965', 'ins965', 'ins 965', 'e965', 'e-965', 'maltitol', 'maltitol syrup'],
    functionalClass: 'bulking_agent',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Sugar alcohol (polyol) used as a low-calorie bulk sweetener and sugar replacer in sugar-free chocolates and baked goods.',
    fssaiMaxPermittedNote: 'Permitted under GMP; polyols carry advisory for laxative effect in large quantities.',
    sourceRefs: ['FSSAI Regulations', 'JECFA']
  },
  {
    insNumber: '420',
    insCode: 'INS 420',
    canonicalName: 'Sorbitol / Sorbitol Syrup',
    aliases: ['420', 'ins420', 'ins 420', 'e420', 'e-420', 'sorbitol', 'sorbitol syrup', 'd-sorbitol'],
    functionalClass: 'bulking_agent',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Nutritive polyol humectant and sweetener providing ~2.6 kcal/g; helps retain moisture in confectionery.',
    fssaiMaxPermittedNote: 'Permitted under GMP in confectionery and bakery.',
    sourceRefs: ['FSSAI Standards 3.1.20', 'JECFA']
  }
];
