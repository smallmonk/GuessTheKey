# App Features: Guess the Key / Intervals

This document outlines the current features and capabilities of the music theory practice application.

## Core Gameplay
- **Multiple Choice Questions:** Users are presented with a musical element on a staff and must select the correct answer from four dynamically generated options.
- **Score & Streak Tracking:** The app tracks the user's score and current streak of correct answers.
- **Interactive Feedback:** Options briefly light up green (correct) or red (incorrect) when clicked, providing immediate visual feedback.

## Practice Modes
The application supports two distinct question types that users can toggle between:

### 1. Key Signatures (Guess the Key)
- **Goal:** Identify the major or minor key corresponding to a given key signature.
- **Mode Toggle:** Users can choose to practice identifying "Major" keys or "Minor" keys.
- **Generation:** Randomly generates key signatures (from 0 to 7 sharps/flats).

### 2. Intervals
- **Goal:** Identify the interval between two notes presented as a harmonic chord on the staff.
- **Generation:** Randomly selects a base note and generates a target note based on a specific interval distance.
- **Supported Intervals:** Includes Minor 2nd, Major 2nd, Minor 3rd, Major 3rd, Perfect 4th, Perfect 5th, Minor 6th, Major 6th, Minor 7th, Major 7th, and Perfect Octave. *(Note: Tritone is intentionally excluded).*
- **Enharmonic Spelling:** Interval generation logic uses diatonic steps to ensure musically correct enharmonic spelling (e.g., a Major 3rd above G is B, not Cb).

## Musical Rendering
- **VexFlow Integration:** Utilizes the VexFlow library to render high-quality, scalable SVG musical notation.
- **Clef Support:** Randomly selects between Treble, Bass, Alto, and Tenor clefs (covering ABRSM Grade 5 requirements).
- **Dynamic Formatting:** Adjusts note positioning, accidentals, and staff layout dynamically based on the generated questions.

## Technology Stack
- **Framework:** React with TypeScript.
- **Build Tool:** Vite.
- **Styling:** CSS with a modern, dark-themed UI.
