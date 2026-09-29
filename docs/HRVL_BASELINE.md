# HRVL Epidemiological & Analytical Baseline
**Platform Baseline**: `HRVL-PRODUCTION-BASELINE-2026-09`  
**Git Tag**: `v2026.09-production`  
**Date**: 2026-09-14  
**Status**: APPROVED BASELINE

---

## 1. Core Surveillance Baseline Totals
- **Total Historical Surveillance Records**: 22 records
- **Total Field Outbreak Clusters**: 6 active/monitored outbreaks
- **Total Historical Cases**: 1,021 cases
- **Total Historical Deaths**: 294 deaths
- **Aggregate Case Fatality Rate (CFR)**: 28.80% (294 / 1,021)
- **Zero-Surveillance Records**: 2 records (SR-2026-011 in Kombolcha, SR-2026-012 in Tulo)

---

## 2. Yearly Surveillance Breakdown

| Year | Record Count | Total Cases | Total Deaths | Case Fatality Rate (CFR) | Key Diseases Reported |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026** | 12 | 380 | 145 | 38.16% | FMD, LSD, PPR, CBPP, AHS, Anthrax, ND, Rabies, Zero-Reporting |
| **2025** | 4 | 279 | 38 | 13.62% | FMD, LSD, PPR, CBPP |
| **2024** | 3 | 159 | 32 | 20.13% | FMD, PPR, Anthrax |
| **2023** | 3 | 203 | 79 | 38.92% | FMD, LSD, ND |
| **Total** | **22** | **1,021** | **294** | **28.80%** | — |

---

## 3. Zonal Surveillance Breakdown (HRVL Operational Catchment)

| Zone | Record Count | Total Cases | Total Deaths | Case Fatality Rate (CFR) | Woredas Represented |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **East Hararghe (E/H)** | 12 | 788 | 246 | 31.22% | Haramaya, Dadar, Babile, Girawa, Badeno, Kombolcha |
| **West Hararghe (W/H)** | 10 | 233 | 48 | 20.60% | Chiro, Daro Lebu, Habro, Mieso, Guba Koricha, Tulo |
| **Total** | **22** | **1,021** | **294** | **28.80%** | **36 Authorized Woredas** |

---

## 4. Disease-Specific Baseline Distribution

| Disease Name | Record Count | Total Cases | Total Deaths | CFR (%) | Primary Species |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Foot-and-Mouth Disease (FMD)** | 4 | 227 | 14 | 6.17% | Cattle |
| **Lumpy Skin Disease (LSD)** | 4 | 135 | 8 | 5.93% | Cattle |
| **Peste des Petits Ruminants (PPR)** | 4 | 300 | 57 | 19.00% | Goats, Sheep |
| **Contagious Bovine Pleuropneumonia (CBPP)** | 2 | 54 | 13 | 24.07% | Cattle |
| **African Horse Sickness (AHS)** | 1 | 14 | 8 | 57.14% | Equines |
| **Anthrax** | 2 | 18 | 18 | 100.00% | Cattle |
| **Newcastle Disease (ND)** | 2 | 270 | 173 | 64.07% | Poultry |
| **Rabies** | 1 | 3 | 3 | 100.00% | Swine / Others |
| **None (Zero Reporting)** | 2 | 0 | 0 | 0.00% | Cattle, Goats |

---

## 5. Host Species Baseline Distribution

| Species Group | Record Count | Total Cases | Total Deaths | CFR (%) | Primary Associated Diseases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cattle** | 13 | 434 | 53 | 12.21% | FMD, LSD, CBPP, Anthrax |
| **Goats** | 3 | 177 | 34 | 19.21% | PPR |
| **Sheep** | 2 | 123 | 23 | 18.70% | PPR |
| **Poultry** | 2 | 270 | 173 | 64.07% | Newcastle Disease (ND) |
| **Equines** | 1 | 14 | 8 | 57.14% | African Horse Sickness (AHS) |
| **Swine / Others** | 1 | 3 | 3 | 100.00% | Rabies |

---

## 6. Outbreak Cluster Baseline

| Outbreak Code | Disease | Zone | Woreda | Cases | Deaths | Susceptible | Morbidity (%) | Mortality (%) | CFR (%) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HRVL-OB-FMD-01** | FMD | E/H | Haramaya | 142 | 9 | 2,800 | 5.07% | 0.32% | 6.34% | Active |
| **HRVL-OB-PPR-02** | PPR | E/H | Dadar | 185 | 32 | 1,450 | 12.76% | 2.21% | 17.30% | Active |
| **HRVL-OB-LSD-03** | LSD | W/H | Chiro | 64 | 4 | 1,900 | 3.37% | 0.21% | 6.25% | Investigation |
| **HRVL-OB-CBPP-04** | CBPP | W/H | Daro Lebu | 48 | 11 | 820 | 5.85% | 1.34% | 22.92% | Active |
| **HRVL-OB-AHS-05** | AHS | E/H | Babile | 23 | 15 | 310 | 7.42% | 4.84% | 65.22% | Contained |
| **HRVL-OB-ANTH-06** | Anthrax | W/H | Habro | 9 | 9 | 450 | 2.00% | 2.00% | 100.00% | Active |

---

## 7. Operational Woreda Matrix
- **Total Authorized Catchment**: 36 woredas
  - East Hararghe (`E/H`): 21 woredas
  - West Hararghe (`W/H`): 15 woredas
- **Diagnostic Hub Coordinates**: Hirna Regional Veterinary Laboratory (`9.221312° N, 41.104313° E`, Plus Code `64C3+GP`).

---

## 8. Migration Regression Criteria
In the new Multi-RVL architecture:
- When filter `laboratory = 'hrvl'` (or 'HRVL') is selected:
  - Total records MUST equal **22**.
  - Total cases MUST equal **1,021**.
  - Total deaths MUST equal **294**.
  - Case Fatality Rate MUST equal **28.80%**.
  - 100% of the above yearly, zonal, and disease breakdowns MUST match with 0.00% variance.
