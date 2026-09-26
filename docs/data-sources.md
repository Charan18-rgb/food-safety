# FoodGrade Data Sources & Registry

## SOURCES STUDIED

1. **Open Food Facts** - Used (Primary Bulk - ODbL)
2. **Universe-HTT barcode reference** - Used (Barcode Identity Enrichment - MIT)
3. **Indian Packaged Foods Nutritional Composition Dataset (2026)** - Staged (CC BY 4.0)
4. **USDA FoodData Central Branded Foods** - Staged (Public Domain)
5. **Universal Product Code Database (UPCitemdb)** - Rejected (Proprietary API, no bulk export rights)
6. **FoodSwitch India** - Rejected (Requires Auth/Proprietary)
7. **GS1 India DataKart** - Rejected (Requires Auth/Proprietary)
8. **Keetly packaged-food benchmark** - Staged (Benchmark Only - CC0/ODbL)

## DATASETS

* **foodgrade_barcode_catalog.csv**: Core identity & fallback OCR definitions. Target size ~25k.
* **foodgrade_analysis_dataset.csv**: Filtered subset containing sufficient nutritional metrics and ingredient text for high-fidelity evaluation.
* **foodgrade_snacks_dataset.csv**: Granular subset containing prioritized Indian snacks/wafers/namkeen.

## PIPELINE ARCHITECTURE

The Multi-Source ingestion pipeline uses deterministic field-level precedence:
1. Validates strict GTIN-14/EAN/UPC checksums
2. Normalizes ingredients and text encoding
3. Computes macro-level data completeness metrics (Analysis Ready / Partial / Identity Only)
