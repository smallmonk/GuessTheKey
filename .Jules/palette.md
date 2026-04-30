## 2024-05-01 - [Accessibility Improvements]
**Learning:** React toggle buttons did not properly announce their active states to screen readers. Adding `aria-pressed` allows proper semantics. The global `outline: none` CSS on buttons completely broke keyboard focus visibility.
**Action:** When creating new interactive elements, ensure proper ARIA roles and attributes are added to convey the element`s state, and ensure that `:focus-visible` styles are maintained for keyboard users.
