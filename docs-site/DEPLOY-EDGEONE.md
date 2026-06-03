# Deploy the docs site to Tencent EdgeOne Pages (China-fast)

GitHub Pages (`seacen.github.io/omem`) is the global/海外 deployment. For fast
access **inside mainland China**, mirror the same site to **Tencent EdgeOne
Pages** — it connects to this GitHub repo, builds on every push, and serves from
a `*.edgeone.app` domain that needs **no ICP filing**.

The Astro config is already environment-driven, so the *only* thing that makes
EdgeOne serve at the domain root (instead of `/omem`) is one build-time env var:
**`DOCS_BASE=/`**. Everything below is done once in the EdgeOne console — you
click, the agent can't log into your Tencent account.

---

## One-time setup (≈5–10 min, all in the EdgeOne console)

### 1. Sign in / register
Go to **<https://edgeone.ai/products/pages>** (or the China console
**cloud.tencent.com → EdgeOne → Pages**). Sign in with your Tencent Cloud
account (email registration is fine; no card needed for the free default-domain
path).

### 2. Create a new Pages project from GitHub
- Click **Create project / 创建项目**.
- Choose **Import from Git / 从 Git 导入** → **GitHub**.
- Authorize EdgeOne to access GitHub (OAuth popup), then pick the **`seacen/omem`**
  repository. Branch: **`main`**.

### 3. Set the build settings — these are the values that matter
| Field | Value |
|---|---|
| **Framework preset / 框架预设** | **Astro** (if offered) — or "Other / 自定义" |
| **Root directory / 根目录** | `docs-site` |
| **Build command / 构建命令** | `npm ci && npm run build` |
| **Output directory / 输出目录** | `dist` |
| **Node version** | 20 or 22 |

### 4. Add the one environment variable
In the project's **Environment variables / 环境变量** section, add:

| Name | Value |
|---|---|
| `DOCS_BASE` | `/` |

This is what makes the site serve at `https://<project>.edgeone.app/` (root)
instead of `…/omem/`. (Optional second var: `DOCS_SITE` =
`https://<your-project>.edgeone.app` — only affects absolute sitemap URLs; safe
to skip for now.)

### 5. Deploy
Click **Deploy / 部署**. First build pulls deps + runs `astro build` (~1–2 min).
When it's done, EdgeOne shows your live URL, e.g.
`https://omem-docs.edgeone.app/`.

---

## Verify

Open the `*.edgeone.app` URL and check:
- Home renders with styling (not raw HTML).
- Click **Get started** → lands on `…/getting-started/01-install/` (no 404).
- `…/zh-cn/` shows the Chinese site.

If links 404 or CSS is missing, the `DOCS_BASE=/` env var almost certainly
didn't take — re-check step 4 and redeploy.

---

## After this

- **Auto-deploy**: every push to `main` that changes `docs-site/` triggers a new
  EdgeOne build automatically (just like the GitHub Pages workflow). You now have
  two live mirrors from one repo: GitHub Pages (global) + EdgeOne (China-fast).
- **Faster China (optional, later)**: the default `*.edgeone.app` domain is
  decent in China but not "instant". To get EdgeOne's mainland edge nodes
  (sub-100 ms), bind a **custom domain that has completed ICP filing** in the
  project's Domain settings — that's the only step that needs a filing. The free
  default domain works without one.
- **Custom domain (e.g. omem.co)**: bind it here and in DNS; with the env-driven
  base it already serves at root, no code change needed.

---

## Notes / risks

- EdgeOne Pages went GA in Dec 2025; the free tier is generous but Tencent may
  add build-count limits later. Our single source of truth is this git repo +
  standard Astro output, so if EdgeOne ever changes terms, the same `dist/`
  deploys to Vercel/Cloudflare/anywhere with no lock-in.
- Do **not** set `DOCS_BASE` on the GitHub Pages side — it must stay `/omem`
  there. The variable lives only in the EdgeOne project.
