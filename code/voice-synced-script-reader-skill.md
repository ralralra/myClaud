# Skill: Voice-Synced Presentation Script Reader App Builder

## Purpose

Build a web-based presentation script reader app that helps a presenter read a prepared script while tracking the presenter's speech in real time.

The app should work like a smart teleprompter. It displays the script, listens to the presenter's voice, highlights the sentence currently being read, previews the next sentence, and automatically scrolls without requiring manual control during a presentation.

The first implementation must be an MVP. Do not over-engineer the first version.

---

## Product Concept

This app is not a simple text editor and not a normal teleprompter.

It is a voice-synchronized presentation script reader.

The user should be able to:

1. Write or paste a presentation script.
2. Edit the script before starting.
3. Adjust the font size.
4. Press a “Start Presentation” button.
5. See the script converted into sentence blocks.
6. See all non-current text dimmed in gray.
7. See the current spoken sentence highlighted.
8. See the next sentence subtly emphasized in advance.
9. Have the page automatically scroll as the presentation progresses.
10. Stop or pause the presentation.

---

## Recommended Tech Stack

Use this stack unless the user explicitly requests another stack.

- Framework: React or Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- Speech Recognition: Browser Web Speech API for MVP
- Storage: LocalStorage
- Deployment Target: Vercel or static web hosting
- Later Expansion: PWA, Capacitor, Whisper API, mobile packaging

---

## MVP First Policy

The first version must prioritize stability over advanced features.

### MVP Features

Implement only the following in the first working version:

- Text input area
- Paste button
- Editable script
- Font size controls
- Start Presentation button
- Sentence splitting
- Presentation mode
- Current sentence highlight
- Next sentence preview highlight
- Dimmed unread text
- Automatic scrolling
- Browser speech recognition
- Basic fuzzy matching between recognized speech and script sentences
- Stop Presentation button

### Do Not Implement in MVP Unless Requested

Do not add the following in the first version:

- Login
- Cloud database
- Payment
- Multi-user sharing
- AI script rewriting
- Analytics dashboard
- Complex design system
- Server-side transcription
- Whisper API
- Mobile native app packaging
- User accounts
- Real-time audience captions

---

## Important Implementation Principle

The most important technical challenge is not the UI.

The hardest part is matching recognized speech to the correct sentence in the script.

Therefore, design the code around the following pipeline:

1. Receive the original script.
2. Split it into sentence units.
3. Normalize both script sentences and recognized speech.
4. Compare the latest recognized speech with nearby sentence candidates.
5. Select the most likely current sentence.
6. Update the current sentence index.
7. Highlight the current and next sentences.
8. Scroll the current sentence into view.

---

## Text Processing Rules

When comparing recognized speech and script text, normalize text before comparison.

Normalization should include:

- Convert to lowercase where applicable.
- Remove punctuation.
- Remove repeated spaces.
- Trim whitespace.
- Normalize Korean sentence endings only lightly.
- Do not aggressively rewrite the user's script.
- Keep the original script text for display.
- Use normalized text only for matching.

---

## Sentence Splitting Rules

Split script text into sentences using Korean and English punctuation.

Consider these delimiters:

- `.`
- `?`
- `!`
- `다.`
- `요.`
- line breaks

Avoid destroying the original sentence text.

Each sentence object should preserve the original display text.

Example structure:

```ts
type ScriptSentence = {
  id: number;
  originalText: string;
  normalizedText: string;
};