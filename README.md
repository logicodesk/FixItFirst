# Fix It First

> "Before you replace it, understand your options."

"Fix It First" is a calm, trustworthy guided decision companion that empowers households, students, renters, and DIY beginners to evaluate broken, worn-out, or unwanted items. Rather than jumping directly to replacement, the app compares six paths: **Repair, Reuse, Repurpose, Replace, Recycle, and Discard**, rates each for practical fit, explains why in plain language, and provides actionable checklists.

---

## Guiding Principles

1. **The app guides, the user decides**: The software offers clear, honest evaluations and never dictates outcomes.
2. **Zero shame**: Practical constraints like budget, time, and safety are respected. "Replace" and "Discard" are framed pragmatically with safe, responsible guidance rather than guilt.
3. **No dead ends**: Accessible breadcrumbs, clear "Back" navigation, and fallback links (e.g., "Still not working? Try Recycle next").
4. **Transparent & deterministic**: Driven by a local rule engine (`/src/data/rules.json`) with no backend dependencies or opaque LLM black boxes.

---

## Technical Stack & Architecture

- **React 19 + TypeScript + Vite**: Responsive client-side application.
- **Tailwind CSS v4**: Strict adherence to the Fix It First design tokens (`--forest #173D32`, `--forest-2 #2C5B47`, `--lime #CBEA72`, `--ink #182B24`, `--muted #66736B`, `--bg #F7F8F2`, `--mint #DCE8DA`, `--sand #F5E9BE`, `--lavender #E8E1F2`).
- **Deterministic Rule Engine (`/src/engine/scoreOptions.ts`)**: Evaluates item category, condition modifiers (Broken, Worn out, Unused), and symptom modifiers.
  - Scores $\ge 70$: **"Best fit"** (Lime badge)
  - Scores $40–69$: **"Worth considering"** (Sand badge)
  - Scores $< 40$: **"Unlikely"** (Lavender badge)
- **Local Persistence with Memory Fallback (`/src/services/storage.ts`)**: Persists drafts and session history in `localStorage`, gracefully falling back to in-memory state if storage is blocked.
- **Client-Side Photo Upload & Optimization (`/src/utils/imageCompressor.ts`, `/src/components/ImageUploader.tsx`)**:
  - Drag-and-drop or device camera upload for user items.
  - Automatic client-side canvas compression (`max 800px`, JPEG quality `0.82`) fitting safely within `localStorage`.
  - Integrates user photos across Step 1 (preview), Step 2 (Quick Check), Step 3 (decision cards & compare view), Option Detail Drawer, and Session History.
- **Accessibility (WCAG 2.2 AA)**:
  - Touch targets $\ge 44\text{px}$.
  - Text + color indicators (never color alone).
  - High contrast ratios ($\ge 4.5:1$).
  - Full keyboard navigability and `prefers-reduced-motion` compliance.

---

## Folder Structure

```
├── index.html                 # App entry point with meta tags & Inter font
├── metadata.json              # Applet metadata
├── package.json               # Scripts & dependencies
├── src/
│   ├── App.tsx                # Main application & routing flow
│   ├── main.tsx               # React root renderer
│   ├── index.css              # Design tokens and Tailwind CSS rules
│   ├── types/
│   │   └── index.ts           # Type definitions
│   ├── data/
│   │   └── rules.json         # Seeded category rules, modifiers, and checklists
│   ├── engine/
│   │   ├── scoreOptions.ts    # Pure scoring & ranking function
│   │   └── scoreOptions.test.ts # Vitest unit test suite
│   ├── services/
│   │   └── storage.ts         # Resilient storage manager
│   ├── components/
│   │   ├── FitBadge.tsx       # Text + color status badge
│   │   ├── Header.tsx         # Top bar with logo and history trigger
│   │   ├── Footer.tsx         # Guiding motto footer
│   │   ├── StepHeader.tsx     # Progress bar & edit summary bar
│   │   ├── Step1Item.tsx      # Step 1: Item input & condition cards
│   │   ├── Step2Problem.tsx   # Step 2: Diagnostic chips & fallback questions
│   │   ├── Step3Options.tsx   # Step 3: 6-option decision cards & comparison
│   │   ├── OptionCard.tsx     # Individual decision card
│   │   ├── OptionDetail.tsx   # Drawer view with meters & interactive checklist
│   │   ├── CompareTable.tsx   # Side-by-side comparison matrix
│   │   ├── HistoryView.tsx    # Session history & impact metrics
│   │   └── GuidesModal.tsx    # Principles and 6-pathway guide
│   └── assets/
│       └── images/            # High-fidelity photographs for items & options
└── tsconfig.json
```

---

## How to Run

### 1. Development Mode
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 2. Run Unit Tests (Vitest)
```bash
npm test
```
Runs unit tests for the demo case (Desk lamp / Broken / Doesn't turn on), unknown item fallback, and ethical framing.

### 3. Build for Production
```bash
npm run build
```
Generates production bundle in `dist/`.
