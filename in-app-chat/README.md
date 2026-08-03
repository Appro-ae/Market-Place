# Ask Reem — In-App Chat (deployment-ready prototypes)

Self-contained static prototypes for **"Ask Reem"**, Reem Bank's in-app
conversational chat & digital lending assistant (per the Ask Reem BRD v1.1).

Both files are fully self-contained (all CSS/JS/PDF library inlined — no
backend or external requests), so they run as a plain static site on GitHub
Pages.

## Layout

| Path | Prototype |
|------|-----------|
| `index.html` | **Mobile Web** app — Reem assistant inside a Safari/iPhone mock (root URL) |
| `app/index.html` | **Mobile App** prototype — "Reem Bank — Virtual Assistant" |
| `.nojekyll` | Tells GitHub Pages to serve files verbatim (skip Jekyll) |

## Intended deployment

These files are the intended **root** of a dedicated `Appro-ae/in-app-chat`
repository, giving:

- `https://appro-ae.github.io/in-app-chat/` → Mobile Web prototype
- `https://appro-ae.github.io/in-app-chat/app/` → Mobile App prototype

A `?x=...` query string may be appended to any URL; the prototypes ignore it
(no functional dependency).

> Staged here under `in-app-chat/` in the Market-Place repo only to preserve
> the work in version control. The live deployment target is the separate
> `in-app-chat` repo.
