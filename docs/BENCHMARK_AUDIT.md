# FoodGrade — Benchmark Dataset & Knowledge Audit Report

**Date**: 2026-08-25  
**Milestone**: 4.1 — Ground-Truth Dataset & Knowledge Audit  
**Status**: **COMPLETED & REGRESSION-READY**

---

## 1. Audit Objective & Scope

The purpose of Milestone 4.1 was to conduct an exhaustive, rigorous audit of the 31-product real-world benchmark dataset across five dimensions:
1. **Raw Factual Product Information**: Exact brand name, product name, verified barcode, nutritional profile (energy, protein, carbs, sugars, fats, sodium), basis (`per_100g` vs `per_100ml`), raw ingredient text, ingredient ordering, and declared percentages.
2. **Ingredient Normalization & Knowledge Registry Alignment**: Verification that all canonical IDs map to valid, authoritative `@foodgrade/knowledge` entries with accurate classifications (whole grain, refined grain, ultra-processed marker, allergen).
3. **Additive Normalization & Knowledge Registry Alignment**: Verification that all detected additives have registered INS codes, functional classes, and neutral educational descriptions.
4. **FoodGrade Computed Algorithm Output**: Verification of deterministic three-pillar calculations, grade assignments, factor explanations, and score bounds $[0, 100]$.
5. **Provenance & Verification Metadata**: Verification of source type (`official_packaging`), reference documentation, verification date, and confidence level.

---

## 2. Complete 31-Product Audit Table

| Benchmark ID | Data Status | Knowledge Status | Provenance Status | Algorithm Status | Action Required |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `parle-g-original` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `britannia-good-day-butter` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `britannia-nutrichoice-digestive` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `sunfeast-dark-fantasy-choco-fills` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `oreo-original-vanilla` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `maggi-2-minute-masala` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `sunfeast-yippee-magic-masala` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `chings-secret-hakka-noodles` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `knorr-soupy-noodles-mast-masala` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `quaker-rolled-oats` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `kelloggs-corn-flakes-original` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `kelloggs-chocos` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `saffola-masala-oats-classic` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `aashirvaad-shudh-chakki-atta` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `tata-sampann-unpolished-toor-dal` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `24-mantra-organic-ragi-flour` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `lays-indias-magic-masala` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `kurkure-masala-munch` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `haldirams-bhujia-sev` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `haldirams-aloo-bhujia` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `coca-cola-original` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `frooti-mango-drink` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `tropicana-100-orange-juice` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `real-fruit-power-mixed-fruit` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `amul-taaza-toned-milk` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `amul-butter-pasteurised` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `epigamia-greek-yogurt-plain` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `mother-dairy-classic-dahi` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `cadbury-bournvita-chocolate` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `horlicks-classic-malt` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |
| `complan-royal-chocolate` | **VALID** | **VALID** | **VALID** | **VALID** | None — Regression-ready |

---

## 3. Knowledge Base Adjustments Made During Audit

During the audit, cross-registry validation identified 4 missing canonical entries that were necessary to support complete coverage of Indian packaged goods without unmapped fallbacks:

1. **Water (`water`)**: Added canonical potable/carbonated water (`IS 10500` compliant) to `@foodgrade/knowledge/src/ingredients/vegetables-spices.ts`.
2. **Potato (`potato`)**: Added canonical starchy vegetable tuber (`Potato (Aloo)`) with aliases (`potato flakes`, `potato starch`, `aloo`) to `vegetables-spices.ts`.
3. **Moth Bean (`moth_beans`)**: Added traditional drought-hardy legume (`Moth Bean / Matki / Tepary Bean`) with high plant protein to `pulses.ts`.
4. **Phosphoric Acid (`INS 338`)**: Added inorganic acidulant (`INS 338`) permitted under FSSAI Table 3 to `@foodgrade/knowledge/src/additives/acidity-antioxidants.ts`.

Additionally, benchmark fixture canonical references were mapped to exact registry keys:
- `iodized_salt` (aligned from generic `salt`)
- `pigeon_peas` (aligned from `toor_dal`)
- `chickpea_flour` (aligned from `besan`)
- `moth_beans` (aligned from `moth_dal`)

---

## 4. Regression Readiness Certification

- **31 of 31 products (100%)** are now verified, fully schema-compliant, cross-referenced against the `@foodgrade/knowledge` registry, and deterministic in evaluation.
- All 131 monorepo tests pass consistently.
- This dataset is certified as the official ground-truth benchmark for all future algorithm revisions and parser validation.
