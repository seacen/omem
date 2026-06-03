# OMem — Office Memory plugin

Local-first, agent-agnostic work-context memory layer for AI agents.
This plugin ships an **OMem skill** that lets Claude Code (and other
agents via MCP) answer questions about your emails, calendar, documents,
and team notes by querying a unified local wiki built from your
Microsoft 365 / Mail.app / Calendar / local folders.

> **The plugin only carries the agent-facing skill + manifest.**  
> The actual data layer is the `omem` CLI binary — install it separately
> with `brew install seacen/omem/omem` (macOS) before installing this
> plugin.

---

## What this plugin does

When installed in Claude Code, OMem makes the agent:

- **Auto-trigger** on work-context questions ("what did Alice say about
  the Q3 review?", "did we ship the Atlas design last week?", "上次开会
  Project Polaris 讨论了什么")
- **Query the local wiki** via `omem query --format json` (no network,
  no LLM call from the agent — the OMem CLI handles all retrieval)
- **Progressively disclose** results — short hit list → full page →
  parsed source — so the agent can drill in only when needed
- **Refuse destructive actions** — the skill never runs `omem ingest` /
  `omem setup` / `omem install`; management stays a human action

Full skill spec, reference docs, and trigger semantics live in
[skills/omem/SKILL.md](skills/omem/SKILL.md) and
[skills/omem/references/](skills/omem/references/).

---

## Install (Claude Code)

**Prerequisite**: `omem` CLI on PATH.

```bash
brew install seacen/omem/omem
omem setup    # 7-step wizard, ~5 min
omem ingest   # first time ~30 min
```

Then in Claude Code:

```
/plugin marketplace add seacen/omem
/plugin install omem@omem-marketplace
```

The agent now auto-invokes OMem when your question touches work context.

### Alternative: clone and install local

```bash
git clone https://github.com/seacen/omem-plugin /tmp/omem-plugin
ln -s /tmp/omem-plugin ~/.claude/plugins/omem
```

### Verify

In Claude Code, ask: *"check my OMem health"* — the agent should run
`omem doctor --format json` via the skill and report.

---

## Install (other agents)

OMem's CLI also runs a stdio **MCP server** (`omem mcp`). Any agent that
speaks MCP can use OMem with one config entry:

### Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.omem]
command = "omem"
args = ["mcp"]
```

### Cursor

`.cursor/mcp.json` (workspace) or Cursor Settings → MCP Servers:

```json
{
  "mcpServers": {
    "omem": { "command": "omem", "args": ["mcp"] }
  }
}
```

### Cline (VS Code), Continue, Zed AI

Same shape — `command: "omem"`, `args: ["mcp"]`. See agent-specific docs
for the config file path.

---

## Capability (skill + MCP, identical surface)

| Tool | What it does |
|---|---|
| `query` | Ranked search across all indexed work content |
| `page_get` | Full wiki page markdown (frontmatter + body) |
| `raw_get_path` | Absolute path to original source file (file kind only) |
| `raw_get_parsed_path` | Path to parsed.md (`--version N` for thread message history) |
| `wiki_ls` | Metadata slice (filter by kind/source/account/date/keyword) |
| `doctor` | OMem health check — config, kinds, launchd cron status |

**Blacklist** — these are NOT exposed to the agent (management = human
action): `setup`, `install`, `ingest`, `lint`, `index rebuild`, `plugin
enable/disable`, `config set`, `wiki move`, all `_debug` / `_eval` /
`_soak` / `_evidence` commands.

---

## Privacy

- **All retrieval is local.** OMem reads your wiki SQLite + raw parsed
  files on disk; no network call.
- **No data leaves your machine** unless your `omem query` configuration
  has `--rerank` enabled (off by default).
- **Agent only sees query results**, not your raw mailbox. The agent
  pipes the answer back via the skill / MCP tool response.

---

## License

[PolyForm Noncommercial 1.0.0](./LICENSE) —

- ✅ **Free** for personal / academic / non-profit / open-source contribution
- ❌ **Commercial use requires a license** — for-profit company internal use,
  embedded in commercial product, etc. Contact xichangzhao@gmail.com.

The `omem` CLI binary itself is closed-source and under the same license.
Public release at [github.com/seacen/omem](https://github.com/seacen/omem)
(read-only marketplace — source lives in a private repo).

---

## Links

- **CLI repo (public release)**: <https://github.com/seacen/omem>
- **Issues**: <https://github.com/seacen/omem/issues>
- **Landing**: <https://omem.app>
- **Design / architecture**: see CLI repo's `docs/`
