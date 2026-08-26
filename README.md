# getnocturne.site

Landing page for [Nocturne](https://github.com/RoyalKLP/Nocturne), a lightweight open-source Windows performance monitor.

Plain HTML, CSS and one JavaScript file. No framework, no build step, no package manager, no dependencies. Cloudflare Pages serves the repository root exactly as it appears here.

## Running it locally

Open `index.html` in a browser. That is the whole workflow.

If you would rather serve it over HTTP - worth doing before deploying, since it exercises the same relative paths the host will use:

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
| `_headers` | Security headers, including a strict Content-Security-Policy. |
| `_redirects` | Short paths such as `/download` and `/source`. |

## Deploying

Hosted on Cloudflare Pages. Connect this repository and leave the build settings empty:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave blank)* |
| Build output directory | `/` |

There is nothing to compile, so Pages simply serves the files.

`_headers` and `_redirects` use a format shared by Cloudflare Pages and Netlify, so the site can move between the two without any configuration changes.

For the custom domain, add `getnocturne.site` under **Custom domains** in the Pages project. If the domain's nameservers already point at Cloudflare the record is created for you; otherwise add the CNAME the dashboard shows you at your registrar. The certificate is issued automatically once DNS resolves.

## Notes for anyone editing this

**The hero dashboard is synthetic.** It is a working miniature built in HTML and CSS, not a screenshot. That is deliberate: a real screenshot would publish whichever processes happened to be running on the author's machine, along with their computer's name. The process names shown are invented.

**The numbers in the copy are real** and should be kept that way. File size, the metric sources, the hotkeys and the licence all describe the actual application. If the app changes, these change with it - a landing page that overstates its product is exactly the problem Nocturne exists to avoid.

**Bump the asset version when you edit CSS or JS.** `index.html` links them as `styles.css?v=2` and `main.js?v=2`, and `_headers` caches `/assets/*` for a week. Without changing that number, returning visitors keep the old file for up to seven days and see a half-updated page. Increment it in the same commit as the change.

**Test with the real headers before deploying.** A plain `python -m http.server` ignores `_headers`, so the Content-Security-Policy is never enforced and violations only appear once the site is live. Inline `style` attributes are the usual casualty: they fail silently, leaving elements uncoloured.

**The Content-Security-Policy in `_headers` is tight on purpose.** Google Fonts is the only permitted external origin. Adding an analytics script, an embedded video or a web font from elsewhere means loosening it, which is worth thinking twice about for a project that advertises making no network calls.

**The SignPath credit in the footer is commented out.** SignPath Foundation requires the download page to state that the project uses their service - but only once the application has been accepted. Enabling it before then would be a false claim. Uncomment it when the certificate is in place.

## Licence

MIT, matching the application.
