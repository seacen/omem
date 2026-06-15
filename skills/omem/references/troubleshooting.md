# `omem` error / weirdness troubleshooting

Read this when the user reports an error, or when `omem` returns
something you don't recognise. The rule of thumb: **relay errors to
the user; do NOT try to fix them yourself**. Modifying the user's OMem
config / index / wiki is out of scope for this skill.

## `command not found: omem` (or `omem: No such file or directory`)

The `omem` CLI isn't installed — this skill is just a wrapper over it.
Tell the user (don't install it yourself):

> The OMem CLI isn't installed yet. Install it, then run `omem setup`:
> `curl -fsSL https://github.com/seacen/omem/releases/latest/download/install.sh | sh`
> Docs: https://seacen.github.io/omem/

Until the CLI is installed, none of this skill's commands will work, so
stop here after relaying — don't retry the query.

## `Error: no OMem config found. Run \`omem setup\` first.`

User hasn't onboarded yet. Tell them:

> Looks like OMem isn't set up yet. Run `omem setup` in your terminal
> — it's a ~5-minute interactive wizard.

Do NOT run `omem setup` yourself. The wizard needs interactive input
(API keys, mailbox choice, file folders).

## `Error: index empty. Run \`omem ingest\` to populate.`

OMem is configured but has never ingested. Tell them:

> OMem is configured but hasn't ingested anything yet. Run
> `omem ingest` once to backfill, then `omem install` to schedule
> automatic ingest going forward.

Do NOT run `omem ingest`. First ingest can take 30+ minutes and incurs
LLM cost — the user should kick that off themselves.

## `Error: page_id 'XXX' not found`

The page_id you passed to `page get` or `raw get` is wrong. Possible
causes:

- The page_id you got from `omem query` was truncated. Pass the full
  hash, not the 8-char prefix shown in `--format text`. Always parse
  `--format json` for tool-chain calls.
- You typed it from memory. Don't — copy verbatim from query output.
- The page was deleted between query and get (rare). Re-run the query.

## Query takes a very long time (>30s)

Likely qmd backend cold start. qmd loads two models on first query:
`embeddinggemma` (~333MB) and the reranker (~639MB). Cold-start can be
60–600 seconds depending on disk speed.

What to do: **wait**. Do NOT retry — retry spawns another cold start
and makes it worse. Once warm, queries are 3–10s.

If still slow after >10 min, tell the user "OMem's qmd backend seems
stuck — try `omem index status` in your terminal to see what's
happening; or `omem plugin disable qmd` to fall back to fts5".

## Unexpected 0 hits

If `omem query` returns `[]` for a query you expected to hit:

1. Try broadening: remove `--kind`, remove `--since`, shorten the query
   to 2–3 most distinctive words.
2. If still 0, the user may not have ingested that source yet, or it
   lives outside what OMem is configured to read.
3. Report "OMem didn't surface anything for this — I'll answer from
   general knowledge / my own context."

Don't synthesise a hit. Don't pretend the query matched something.

## Permission denied / TCC errors

Errors like:

```
Error: operation not permitted: /Users/.../Library/Mail
```

macOS Full Disk Access (FDA) / TCC permissions aren't granted to the
`omem` binary. Tell the user:

> OMem doesn't have permission to read your mail/calendar database.
> Open System Settings → Privacy & Security → Full Disk Access, find
> the `omem` binary, and toggle it on. If `omem` isn't listed, run
> `omem doctor` for guidance.

## `omem doctor` output

If the user runs `omem doctor` (or asks you to) and you see anything
non-green:

- `[FAIL]` or `[ERROR]` lines → relay to user with the suggested fix
- `[WARN]` lines → mention but don't block; usually optional
- Cursor / lag metrics → if "last ingest > 7 days ago", suggest
  `omem ingest`

Do NOT execute any fixes `omem doctor` suggests — those are user actions.

## Slow `page get` / `raw get`

These are local filesystem reads — they should be sub-second. If they
take long, the user's wiki may be on a slow / network-mounted disk
(iCloud Drive offload, network share). Tell them; don't retry.

## When you suspect a real bug

If `omem` is crashing, returning malformed JSON, or behaving
inconsistently across runs — that's a bug, not a config issue. Tell
the user:

> This looks like an OMem bug rather than a config problem. Save the
> error output and consider filing it as an issue, or share it with
> me and I can help isolate it.

Don't try to patch the binary or modify OMem state to work around it.
