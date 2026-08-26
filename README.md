# getnocturne.site

Landing page for [Nocturne](https://github.com/RoyalKLP/Nocturne), a lightweight open-source Windows performance monitor.

Plain HTML, CSS and one JavaScript file. No framework, no build step, no package manager, no dependencies. Netlify serves the repository root exactly as it appears here.

## Running it locally

Open `index.html` in a browser. That is the whole workflow.

If you would rather serve it over HTTP - worth doing before deploying, since it exercises the same relative paths Netlify will use:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The entire page. One file, in reading order. |
| `assets/styles.css` | All styling. Design tokens at the top mirror the application's own palette. |
| `assets/main.js` | Scroll reveals, the animated dashboard demo, count-up figures. |
| `assets/favicon.svg` | The crescent, defined once and referenced by `<use>` from the page. |
| `netlify.toml` | Publish settings, security headers, short redirects. |

## Deploying

Connect this repository to Netlify and accept the defaults - `netlify.toml` already specifies an empty build command and the repository root as the publish directory.

For the custom domain, point `getnocturne.site` at Netlify in your registrar's DNS, then add it under **Domain management**. Netlify provisions the certificate automatically.

## Notes for anyone editing this

**The hero dashboard is synthetic.** It is a working miniature built in HTML and CSS, not a screenshot. That is deliberate: a real screenshot would publish whichever processes happened to be running on the author's machine, along with their computer's name. The process names shown are invented.

**The numbers in the copy are real** and should be kept that way. File size, the metric sources, the hotkeys and the licence all describe the actual application. If the app changes, these change with it - a landing page that overstates its product is exactly the problem Nocturne exists to avoid.

**The Content-Security-Policy in `netlify.toml` is tight on purpose.** Google Fonts is the only permitted external origin. Adding an analytics script, an embedded video or a web font from elsewhere means loosening it, which is worth thinking twice about for a project that advertises making no network calls.

**The SignPath credit in the footer is commented out.** SignPath Foundation requires the download page to state that the project uses their service - but only once the application has been accepted. Enabling it before then would be a false claim. Uncomment it when the certificate is in place.

## Licence

MIT, matching the application.
