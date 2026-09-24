# Medical Recommendation System (v3.0 Final)

An intelligent clinical triage and anatomical recommendation system designed for rapid symptom evaluation, referred-pain differential analysis, and evidence-based pharmacotherapy suggestions grounded in a 55,605-record healthcare dataset.

## System Features

- **Anatomical Routing Engine**: Maps patient complaints to specific anatomical zones (`CHEST/HEART`, `ABDOMEN/DIGESTION`, `HEAD/BRAIN`, `LIMBS/BONES`, `MENTAL_HEALTH`, `SYSTEMIC_COMPLEX`) with priority-based organ evaluation.
- **Referred Pain Intelligence**:
  - *Hepatobiliary Pattern*: Detects right shoulder/arm + right abdominal discomfort (Gallbladder / Cholecystitis / Liver) and differentiates it from cardiac events.
  - *Cardiac Distribution*: Detects left arm/shoulder + chest pressure/shortness of breath for acute myocardial infarction emergency pathways.
- **55,605 Records Healthcare Dataset Analytics**: Real-time statistical evidence from hospital admission cohorts, including patient age distributions, emergency vs. elective admission ratios, and common medications.
- **Clinical Triage Protocols**: Categorizes complaints into `URGENT / EMERGENCY` and `SIMPLE / ELECTIVE`, outputting immediate action steps, home supportive remedies, and clinical precautions.
- **Audit & Consultation History**: Records timestamped patient consultations matching `logs/consultations.txt` with exportable diagnostic records.
- **LLM Synthesis**: Server-side clinical AI recommendation reproducing the Meditron & Llama-3 synthesis workflows.

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons.
- **Backend Server**: Express.js with Vite middleware integration.
- **AI Integration**: `@google/genai` on server side with deterministic local fallback.
- **Port**: 3000 (`0.0.0.0`)

## CI/CD Pipeline (GitHub Actions)

This repository includes automated CI/CD workflows ready for GitHub Actions:

### 1. Continuous Integration (`.github/workflows/ci.yml`)
- **Triggers**: On push or pull request to `main` / `master`, and manual trigger via `workflow_dispatch`.
- **Matrix Testing**: Validates code on Node.js `20.x` and `22.x`.
- **Steps**:
  1. `npm ci`: Clean install dependencies with npm cache.
  2. `npm run lint`: TypeScript strict typechecking (`tsc --noEmit`).
  3. `npm test`: Automated clinical regression test suite testing:
     - Acute cardiac emergency detection & referred pain pathways.
     - Gallbladder / hepatobiliary referred pain differentiation.
     - Outpatient simple cold & sprain triage.
     - Neurological red flags (e.g., stroke slurred speech).
  4. `npm run build`: Production Vite SPA build.
  5. Artifact validation verifying `dist/` production assets.

### 2. Continuous Delivery / Release (`.github/workflows/cd.yml`)
- **Triggers**: Tag push matching `v*` (e.g. `v1.0.0`) or on `main` push.
- **Actions**:
  - Tests and packages production build into an archived artifact.
  - Automatically drafts a GitHub Release with build assets and release notes when a tag is pushed.

### Local Commands
```bash
# Run typecheck/linter
npm run lint

# Run automated tests
npm test

# Build production bundle
npm run build
```
