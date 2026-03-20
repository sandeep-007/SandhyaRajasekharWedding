# Sandhya & Rajasekhar Wedding Invitation

## Running without npm (CDN-based React)

This project is configured to run directly in the browser without npm or Vite.
It uses React + ReactDOM from CDN and Babel to compile JSX in the browser.

1. Open `index.html` directly in your browser (no build step required).
2. Ensure `styles.css`, `app.js`, and the `src/assets` folder are in the same directory.
3. If you want to host it, upload `index.html`, `styles.css`, `app.js`, and `src/assets`.

## Notes

- The hero background image is loaded from `src/assets/hero-bg.jpg`.
- On GitHub Pages, Memory Wall media is discovered automatically from the `media/` folder.
- `media/manifest.json` is now only a fallback for local previews or non-GitHub hosting.
- The RSVP form is client-side only and does not submit to a backend.
