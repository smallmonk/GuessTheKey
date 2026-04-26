# Context

## Project Stack
- **React Version:** 19.2.4 (React & React DOM)
- **Styling:** Standard CSS (`App.css`, `index.css`)
- **State Management:** React Built-in Hooks (`useState`, `useCallback`, `useEffect`)
- **Key Libraries:** Vexflow (5.0.0) for music notation rendering, Vite for build tooling, Lucide React for icons.

## Component Architecture
- **`App` (Parent):** Manages the global state of the game including score, streak, current question, active clefs, mode, and question type.
- **`StaffDisplay` (Child):** Dynamically loaded (`React.lazy`) component responsible for rendering the music staff, key signatures, and intervals using VexFlow.
- **`GameControls` (Child):** Renders multiple-choice options and game settings (question type, major/minor mode, clef selection). Receives options and selection callbacks from `App`.

## Recent Changes
- Set up automated deployment to GitHub Pages using the `gh-pages` package and GitHub Actions workflow (`.github/workflows/deploy.yml`) on pushes to `main`.
- Configured Vite base path (`base: '/GuessTheKey/'`) and added deploy scripts to `package.json` for proper asset serving on GitHub Pages.
- Implemented dynamic imports and code splitting for `StaffDisplay` and `vexflow` core modules to optimize Vite chunk sizes.
- Added interval generation and multiple-choice handling alongside the existing key signature questions.
- Updated VexFlow integration to explicitly load fonts (`VexFlow.setFonts('Bravura', 'Bravura')`) and wrap rendering logic in `document.fonts.ready` to ensure proper rendering without fallbacks.

## State & Data Flow
- **Data Flow:** Unidirectional. State is maintained in `App.tsx` and passed down as props to `StaffDisplay` and `GameControls`. Action callbacks are passed to `GameControls` to update state in `App`.
- **Side Effects (`useEffect`):**
  - **`App.tsx`:** Triggers `generateQuestion` when `questionType` changes.
  - **`StaffDisplay.tsx`:** Manages DOM manipulation (`containerRef.current.innerHTML = ''`) and asynchronous VexFlow rendering/font loading whenever staff props (`clef`, `vexKey`, `intervalNotes`, etc.) change.

## Pending Tasks
1. Implement automated test scripts and unit/integration tests (currently missing).
2. Improve responsive design for mobile devices and smaller screens.
3. Expand interval generation to support more complex grading rules if necessary.

## Running the App
- **Development Server:** `npm run dev`
- **Build (Production):** `npm run build`
- **Linting:** `npm run lint`
- **Deploy:** Automated via GitHub Actions on push to `main`. Can be run manually with `npm run deploy` (requires `gh-pages` configuration).
- No special environment variables are required to run the current state.
