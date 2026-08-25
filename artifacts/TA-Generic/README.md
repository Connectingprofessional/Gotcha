# TA Job Search Hub (Generic)

Parallel, **generic** version of [TA Leadership Global Search / TA Command Center](https://github.com/neerajkapil33/TA-Leadership-Global-Search).

Same design and features. Configured for general TA professionals (not a single personal profile).

**Does not mix with the original app** — different localStorage keys, default profile, and credentials.

## Differences from main (personal) app

| Item | Original (main) | This branch (generic) |
|------|-----------------|------------------------|
| Branding | TA Command Center | TA Job Search Hub |
| Default profile | Neeraj Kapil / TerraPay | "Your Name" placeholders |
| Login | `kapilneeraj` / personal pass | `user` / `changeme` |
| Storage keys | `ta_cc_*` | `ta_hub_*` |
| Plan label | Premium | Free |

## Default login (change in Settings after first login)

- **Username:** `user`
- **Password:** `changeme`

## Run locally

```bash
npx serve .
# or
python -m http.server 8080
```

## Deploy on GitHub Pages (separate from main)

1. Push this branch (e.g. `generic` or `public-hub`).
2. Settings → Pages → Source: **Deploy from a branch** → select `generic` / root.
3. Site will be under a path or custom if you use a separate repo / project pages setup.

Or keep on same repo:  
`https://neerajkapil33.github.io/TA-Leadership-Global-Search/` remains **main**.  
For this branch you typically need either:

- A second repo, or  
- GitHub Actions to publish branch to a subfolder / another domain.

Simplest clean separation: create a **new repo** (e.g. `TA-Job-Search-Hub`) and push these files as `main`.

## Features (same as original)

- Live jobs (Remotive, Arbeitnow, Jobicy, The Muse + CORS fallback)
- LinkedIn deep links, Boolean / X-ray
- Country-style resume layouts
- My Profile (save once, reuse)
- Pipeline, alerts, CV match UI, AI assistant panel

## License

Same as upstream — personal / educational use. Generic defaults only; users edit their own profile.
