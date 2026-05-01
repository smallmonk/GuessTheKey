## 2024-05-01 - [Accessibility Improvements]
**Learning:** React toggle buttons did not properly announce their active states to screen readers. Adding `aria-pressed` allows proper semantics. The global `outline: none` CSS on buttons completely broke keyboard focus visibility.
**Action:** When creating new interactive elements, ensure proper ARIA roles and attributes are added to convey the element`s state, and ensure that `:focus-visible` styles are maintained for keyboard users.
## 2026-04-30 - Manual Feedback Retry\nWhen replacing automatic timeouts with manual buttons in an interactive quiz flow, clear the feedback state (e.g., `setFeedback(null)`) prior to retrying or regenerating a question to ensure clean UI transitions without exposing answers.
