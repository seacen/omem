# Publishing OMem to 3 channels

This plugin bundle ships to three agent marketplaces from the same
`plugin-bundle/` source. Different channels read different manifests
but reuse the same `skills/omem/SKILL.md` + `references/`.

## 1. Claude Code (`/plugin install`)

**Manifest**: [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) +
[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).

**Publish path**: any public GitHub repo with these manifests. No
review queue.

**User install**:
```
/plugin marketplace add seacen/omem
/plugin install omem@seacen-marketplace
```

**Notes**:
- `plugin.json` declares the plugin (name, version, author, license)
- `marketplace.json` is what users add via `/plugin marketplace add` —
  it lists `omem` with `source: ./` so the same repo acts as both
  marketplace and plugin
- Optional: submit to community marketplace via
  <https://platform.claude.com/plugins/submit> for discoverability
  (automated validation + safety screening, no manual review)

Reference: <https://code.claude.com/docs/en/plugins.md>

---

## 2. Codex CLI

**Manifest**: [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) +
[`.mcp.json`](.mcp.json).

**Publish path**: official Codex plugin registry is "coming soon"
(2026-05). Until then ship as GitHub-marketplace-style — Codex CLI
0.121.0+ supports `codex /plugins` installing from any GitHub repo
with a `marketplace.json` at root.

**User install (registry-free)**:

Path A — MCP entry only (no plugin needed):
```toml
# ~/.codex/config.toml
[mcp_servers.omem]
command = "omem"
args = ["mcp"]
```

Path B — full plugin (when Codex 0.121+ marketplace flow is set up):
```
codex /plugins
> install seacen/omem
```

**Notes**:
- `.codex-plugin/plugin.json` declares the plugin
- `.mcp.json` registers `omem mcp` so Codex auto-wires the MCP server
- 90% of the manifest content is the same as the Claude Code
  manifest — we duplicate rather than abstract so each channel stays
  self-contained
- Official registry submission instructions: see
  <https://developers.openai.com/codex/plugins/build>

Reference:
- <https://developers.openai.com/codex/plugins>
- <https://developers.openai.com/codex/mcp>

---

## 3. Claw Hub (OpenClaw)

**Manifest**: none separate — Claw Hub reads `skills/omem/SKILL.md`
directly. No additional config file required for the skill path.

**Publish path** (skill, not code-plugin). Claw Hub takes the skill
**folder** and reads `SKILL.md` from it — the only required flag is
`--version` (semver). `slug` / `name` come from the SKILL.md
frontmatter `name`; there is no `--slug` / `--name` / `--changelog`
flag (verified against the Claw Hub CLI docs, 2026-06-02):

```bash
npm i -g clawhub                           # install Claw Hub CLI
clawhub login                              # GitHub OAuth
clawhub skill publish ./skills/omem --version 1.0.0
# optional: --owner <handle> to publish under an org/handle you control
```

**User install**:
```
openclaw skills install omem
```

**CI automation** (optional): Claw Hub ships an official reusable
workflow. Add `.github/workflows/skill-publish.yml` to the public repo
that calls it, so a tag push republishes the skill:

```yaml
jobs:
  publish:
    uses: openclaw/clawhub/.github/workflows/skill-publish.yml@v1
    with:
      path: ./skills/omem
      version: ${{ github.ref_name }}   # tag drives the semver
    secrets:
      clawhub-token: ${{ secrets.CLAWHUB_TOKEN }}
```

**Notes**:
- We ship the **skill path** (not code-plugin) because OMem is a Python
  binary, not Node TypeScript. The skill bundle = `SKILL.md` +
  `references/`; OMem CLI must already be installed (`brew install
  seacen/omem/omem`).
- All examples in `SKILL.md` use fictional names (Acme/Atlas/Alice/Bob)
  per project policy — Claw Hub is a public marketplace, no real corpus
  data allowed.
- Publishing tags the skill **descriptor** MIT-0 on Claw Hub (their
  registry policy: published skills are free to use/modify/redistribute
  without attribution). This applies only to the `SKILL.md` +
  `references/` text on Claw Hub — the `omem` CLI binary and its source
  stay under PolyForm Noncommercial 1.0.0. See
  [Claw Hub CLI docs](https://github.com/openclaw/clawhub/blob/main/docs/cli.md).

Reference:
- <https://clawhub.ai>
- <https://github.com/openclaw/clawhub>

---

## File layout for the 3 channels

```
plugin-bundle/
├── .claude-plugin/
│   ├── plugin.json              # Claude Code manifest
│   └── marketplace.json         # /plugin marketplace add seacen/omem
├── .codex-plugin/
│   └── plugin.json              # Codex CLI manifest
├── .mcp.json                    # Generic MCP server registration
│                                #   (Codex / Cursor / Cline / Continue / Zed)
├── skills/
│   └── omem/
│       ├── SKILL.md             # Shared by all 3 channels
│       └── references/
│           ├── query-syntax.md
│           ├── output-schemas.md
│           └── troubleshooting.md
├── LICENSE                      # PolyForm Noncommercial 1.0.0
├── README.md                    # User-facing install guide
└── PUBLISHING.md                # This file (author-facing)
```

## Pre-publish checklist (author)

Before publishing a new version:

1. Bump version in **all three** manifests:
   - `.claude-plugin/plugin.json` `version`
   - `.claude-plugin/marketplace.json` `plugins[0].version`
   - `.codex-plugin/plugin.json` `version`
2. Run unit test sanity (`uv run pytest tests/unit/ -q` in CLI repo)
3. Verify SKILL.md examples are 100% fictional (grep for known real
   corpus keywords per CLAUDE.md "no real corpus data" rule)
4. M17 GA path: copy `plugin-bundle/` to public repo `seacen/omem/`
   verbatim (this is M17 T13)
