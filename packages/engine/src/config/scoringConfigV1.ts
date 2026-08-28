import { AlgorithmVersion } from '@foodgrade/shared-types';

export interface GradeThresholds {
  A: number; // >= 80
  B: number; // >= 65
  C: number; // >= 50
  D: number; // >= 35
}

export interface NutritionPillarConfig {
  baseline: number;
  /**
   * Scaling multiplier for liquid beverages declared per_100ml.
   * FoodGrade product-design decision (default: 0.50) to reflect larger volumetric serving sizes.
   */
  liquidBeverageMultiplier: number;
  addedSugar: {
    thresholdZero: number;       // 5g
    thresholdModerate: number;   // 12g
    thresholdHigh: number;       // 25g
    penaltyModerateMax: number;  // 12 pts
    penaltyHighMax: number;      // 25 pts
    maxPenalty: number;          // 40 pts
  };
  saturatedFat: {
    thresholdZero: number;       // 5g
    penaltyPerGram: number;      // 1.0 pt per g excess
    maxPenalty: number;          // 20 pts
  };
  transFat: {
    thresholdZero: number;       // 0.1g
    penalty: number;             // 15 pts
  };
  sodium: {
    thresholdLow: number;        // 400 mg (~1g salt)
    thresholdHigh: number;       // 800 mg (~2g salt)
    penaltyLowMax: number;       // 8 pts
    penaltyHighMax: number;      // 20 pts
    maxPenalty: number;          // 30 pts
  };
  dietaryFiber: {
    thresholdSource: number;     // 3g
    bonusSource: number;         // 5 pts
    thresholdHigh: number;       // 6g
    bonusHigh: number;           // 12 pts
  };
  protein: {
    thresholdSource: number;     // 5g
    bonusSource: number;         // 5 pts
    thresholdHigh: number;       // 10g
    bonusHigh: number;           // 10 pts
  };
  caloricDensity: {
    thresholdCalories: number;   // 450 kcal/100g
    penalty: number;             // 5 pts
  };
}

export interface IngredientPillarConfig {
  baseline: number;
  positionDecayPower: number; // 0.5 => 1 / sqrt(i + 1)
  penalties: {
    refinedWheatFlour: number;       // 20 pts
    palmoleinAndPalmOil: number;     // 15 pts
    hydrogenatedFat: number;         // 25 pts
    industrialSweetenerSyrup: number;// 12 pts
    genericUltraProcessedMarker: number; // 10 pts
    maxTotalSyrupPenalty: number;    // 25 pts
  };
  bonuses: {
    wholeGrain: number;              // 15 pts
    millet: number;                  // 15 pts
    pulseLegumeNutSeed: number;      // 10 pts
    coldPressedOil: number;          // 8 pts
    dairyProtein: number;            // 6 pts
  };
}

export interface AdditivePillarConfig {
  baseline: number;
  penalties: {
    artificialSweetener: number;     // 12 pts
    syntheticColour: number;         // 10 pts
    flavourEnhancer: number;         // 6 pts
    preservative: number;            // 5 pts
    emulsifierStabilizer: number;    // 4 pts
    otherIndustrial: number;         // 4 pts
    neutral: number;                 // 0 pts
  };
  deduplicateSameCode: boolean;      // true
  maxTotalPenalty: number;           // 100 pts
}

export interface ScoringWeights {
  nutrition: number;   // 0.45
  ingredient: number;  // 0.35
  additive: number;    // 0.20
}

export interface ScoringConfigV1 {
  algorithmVersion: AlgorithmVersion;
  weights: ScoringWeights;
  gradeThresholds: GradeThresholds;
  nutrition: NutritionPillarConfig;
  ingredients: IngredientPillarConfig;
  additives: AdditivePillarConfig;
}

export const DEFAULT_SCORING_CONFIG_V1: ScoringConfigV1 = {
  algorithmVersion: 'foodgrade-v1.0.0',
  weights: {
    nutrition: 0.45,
    ingredient: 0.35,
    additive: 0.20
  },
  gradeThresholds: {
    A: 80,
    B: 65,
    C: 50,
    D: 35
  },
  nutrition: {
    baseline: 70,
    liquidBeverageMultiplier: 0.5,
    addedSugar: {
      thresholdZero: 5,
      thresholdModerate: 12,
      thresholdHigh: 25,
      penaltyModerateMax: 12,
      penaltyHighMax: 25,
      maxPenalty: 40
    },
    saturatedFat: {
      thresholdZero: 5,
      penaltyPerGram: 1.0,
      maxPenalty: 20
    },
    transFat: {
      thresholdZero: 0.1,
      penalty: 15
    },
    sodium: {
      thresholdLow: 400,
      thresholdHigh: 800,
      penaltyLowMax: 8,
      penaltyHighMax: 20,
      maxPenalty: 30
    },
    dietaryFiber: {
      thresholdSource: 3.0,
      bonusSource: 5,
      thresholdHigh: 6.0,
      bonusHigh: 12
    },
    protein: {
      thresholdSource: 5.0,
      bonusSource: 5,
      thresholdHigh: 10.0,
      bonusHigh: 10
    },
    caloricDensity: {
      thresholdCalories: 450,
      penalty: 5
    }
  },
  ingredients: {
    baseline: 80,
    positionDecayPower: 0.5,
    penalties: {
      refinedWheatFlour: 20,
      palmoleinAndPalmOil: 15,
      hydrogenatedFat: 25,
      industrialSweetenerSyrup: 12,
      genericUltraProcessedMarker: 10,
      maxTotalSyrupPenalty: 25
    },
    bonuses: {
      wholeGrain: 15,
      millet: 15,
      pulseLegumeNutSeed: 10,
      coldPressedOil: 8,
      dairyProtein: 6
    }
  },
  additives: {
    baseline: 100,
    penalties: {
      artificialSweetener: 12,
      syntheticColour: 10,
      flavourEnhancer: 6,
      preservative: 5,
      emulsifierStabilizer: 4,
      otherIndustrial: 4,
      neutral: 0
    },
    deduplicateSameCode: true,
    maxTotalPenalty: 100
  }
};
