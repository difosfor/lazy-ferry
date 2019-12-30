# Lazy Ferry

[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://github.com/open-wc)

Helps you catch the next ferry in Amsterdam.

## Scripts

- `start` runs your app for development, reloading on file changes
- `start:build` runs your app after it has been built using the build command
- `build` builds your app and outputs it in your `dist` directory
- `lint` runs the linter for your project

## Scrape

To scrape the timetables from the `gvb.nl` API run:

```bash
node scripts/scrape.js
```

This caches API responses in the `scrape-cache` directory.
If you wish to fetch fresh responses then you can remove this before running the script.

Finally, the responses are summarized and a `components/lazy-ferry/src/journeys.js` module is generated.
