# Context

## Project Stack
- **React Version:** 19.2.4 (React & React DOM)
- **Styling:** Standard CSS (`App.css`, `index.css`)
- **State Management:** React Built-in Hooks (`useState`, `useCallback`, `useEffect`)
- **Key Libraries:** Vexflow (5.0.0) for music notation rendering, Vite for build tooling, Lucide React for icons.

## Component Architecture
- **`App` (Parent):** Manages the global state of the game including score, streak, current question, active clefs, mode, and question type.
- **`StaffDisplay` (Child):** Dynamically loaded (`React.lazy`) component responsible for rendering the music staff, key signatures, intervals, and time signatures using VexFlow.
- **`GameControls` (Child):** Renders multiple-choice options and game settings (question type, major/minor mode, clef selection). Receives options and selection callbacks from `App`.

## Optimization
- **Musical Lookups:** `src/utils/intervals.ts` uses static $O(1)$ lookup tables (`NOTE_TO_SEMITONE`, `ACCIDENTAL_TO_VAL`, `VAL_TO_ACCIDENTAL`) for performance-critical semitone calculations, replacing inefficient sequential string comparisons and $O(N)$ array searches.

## Recent Changes
- Set up automated deployment to GitHub Pages using the `gh-pages` package and GitHub Actions workflow (`.github/workflows/deploy.yml`) on pushes to `main`.
- Configured Vite base path (`base: '/GuessTheKey/'`) and added deploy scripts to `package.json` for proper asset serving on GitHub Pages.
- Implemented dynamic imports and code splitting for `StaffDisplay` and `vexflow` core modules to optimize Vite chunk sizes.
- Added interval generation and multiple-choice handling alongside the existing key signature questions.
- Added the "Time Signatures" question type with rhythm generation, UI integration, and dynamic rendering via VexFlow.
- Added the "Ornaments" question type, mapping 6 ABRSM Grade 5 ornaments to their written-out executions, rendered with VexFlow beaming and rhythm adjustments.
- Added the "Cadences" question type to test functional harmony (Perfect, Plagal, Imperfect) with exactly 2 notes per chord and sequential audio playback.
- Updated VexFlow integration to explicitly load fonts (`VexFlow.setFonts('Bravura', 'Bravura')`) and wrap rendering logic in `document.fonts.ready` to ensure proper rendering without fallbacks.
- Simplified Accidental rendering in VexFlow 5 using `Accidental.applyAccidentals([voice], vexKey)` instead of manual modifier loops.

## State & Data Flow
- **Data Flow:** Unidirectional. State is maintained in `App.tsx` and passed down as props to `StaffDisplay` and `GameControls`. Action callbacks are passed to `GameControls` to update state in `App`.
- **Side Effects (`useEffect`):**
  - **`App.tsx`:** Triggers `generateQuestion` when `questionType` changes.
  - **`StaffDisplay.tsx`:** Manages DOM manipulation (`containerRef.current.replaceChildren()`) and asynchronous VexFlow rendering/font loading whenever staff props (`clef`, `vexKey`, `intervalNotes`, etc.) change.

## Pending Tasks
1. Expand automated test scripts and unit/integration tests (initial unit tests for `timeSignatures.ts` implemented).
2. Improve responsive design for mobile devices and smaller screens.
3. Expand interval generation to support more complex grading rules if necessary.

## Running the App
- **Development Server:** `npm run dev`
- **Build (Production):** `npm run build`
- **Linting:** `npm run lint`
- **Deploy:** Automated via GitHub Actions on push to `main`. Can be run manually with `npm run deploy` (requires `gh-pages` configuration).
- No special environment variables are required to run the current state.

## Coding Agent Instructions
- **Ignore Compiled Packages:** When inspecting or modifying the codebase, the coding agent must ignore compiled directories and package artifacts such as `node_modules/` and `dist/`. Always operate on the source files located in `src/` and other configuration files in the root.
- **Do Not Commit Media Artifacts:** Never commit screenshots (e.g., .png, .jpg) or video recordings (e.g., .webm, .mp4) of the app to the repository. Always remove these temporary files before submitting your changes. However, you *should* still capture and share these media artifacts in the chat when performing frontend verification.
- **Accessibility & Navigation:** Avoid performing changes on keyboard shortcuts and screen reader attributes.
