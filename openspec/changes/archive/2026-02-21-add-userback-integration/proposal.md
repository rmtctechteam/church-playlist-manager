## Why

The team needs a feedback and bug reporting channel built into the app. Adding Userback gives users a widget to submit feedback, screenshots, and bug reports without leaving the app.

## What Changes

- **NEW**: Userback JavaScript snippet added to `public/index.html` just before `</body>`, loading the Userback widget on every page

## Capabilities

### New Capabilities
- `userback-integration`: Userback feedback widget loaded on all pages of the app via a client-side JavaScript snippet

### Modified Capabilities

(none)

## Impact

- **File modified**: `public/index.html` — snippet added before closing `</body>` tag
- **No backend changes**, no new dependencies, no build step required
- The Userback access token (`A-SY3S1mMdUoUAIJHvf8qGHWovJ`) is a public client-side token, safe to commit
