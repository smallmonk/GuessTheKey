## 2024-05-24 - [Accessibility]
**Learning:** The feedback overlay (correct/incorrect message) in the flashcard app is a critical interactive state that wasn't being announced to screen readers. Adding `role="alert"` and `aria-live="assertive"` fixes this. Also, the "Try Again" button requires `autoFocus` so keyboard users don't get stuck tabbing through the options again.
**Action:** Always ensure dynamic, assertive feedback states have `role="alert"` and carefully manage keyboard focus (`autoFocus` or programmatic `.focus()`) to maintain user flow after mistakes.
## 2026-05-02 - [Disabled States and Tooltips]
When implementing disabled states for UI elements without adding new CSS classes, use inline styling overrides (e.g., `opacity: 0.5` and `cursor: 'not-allowed'`) alongside the HTML `disabled` attribute to ensure reliable visual feedback. For accessibility, use the native HTML `title` attribute to provide tooltips that explain hidden logic constraints, such as why a specific UI element (e.g., the final active clef) is disabled or cannot be toggled.
## 2024-05-24 - [Accessibility]
**Learning:** Purely decorative icons (like those adjacent to textual labels) are often announced redundantly or unhelpfully by screen readers.
**Action:** Always add `aria-hidden="true"` to UI icons whose meaning is already conveyed by adjacent text, reducing cognitive load for visually impaired users.
## 2026-05-12 - Dynamic Main Heading Context
**Learning:** Updating a single static page heading based on the active state/route is a critical UX pattern. In an SPA, users can lose context when switching between different exercises if the main heading doesn't change.
**Action:** Always ensure the primary heading (`<h1>`) reflects the current context or task to improve spatial orientation and screen reader experience.
## 2024-05-24 - [Accessibility] Dynamic Document Titles
**Learning:** In a Single Page Application (SPA), the page content changes without a full page reload, meaning the `<title>` tag doesn't automatically update. This leaves screen reader users without crucial context about their current state, and makes browser tabs indistinguishable.
**Action:** Always dynamically update `document.title` to reflect the active route, task, or context (e.g., `document.title = \`\${currentContext} | App Name\``) to improve spatial orientation and tab navigation.
