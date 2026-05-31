# OMem CLI output schemas

Read this when you need to robustly parse `omem` output — every field,
every type, every "what if missing" case.

These schemas are pinned to the v1.0 CLI contract (main design doc
§13.1.1 / §13.1.2). They will not change shape within v1.0.

## `omem query "<q>" --format json`

Returns a JSON array, one entry per hit, sorted by `score` descending.
Already-sorted output — do not re-sort.

```json
[
  {
    "page_id": "a1b2c3d4...",
    "score": 0.92,
    "kind": "file",
    "title": "Q3 budget review",
    "abstract": "Finance team Q3 sync; agreed on headcount freeze and capex reallocation…",
    "source_uri": "file:///Users/alice/Documents/Q3-budget.pptx"
  }
]
```

| Field | Type | Meaning | Null-able |
| --- | --- | --- | --- |
| `page_id` | string | wiki page primary key; pass to `page get` / `raw get` | never |
| `score` | float | relevance, higher=better, already sorted | never |
| `kind` | string | `file` / `mail` / `calendar` / `loop` | never |
| `title` | string \| null | wiki page title | null if wiki page is broken (rare) |
| `abstract` | string \| null | ~100 token summary | null if curator failed on this page (rare) |
| `source_uri` | string \| null | original source URI (e.g. `file:///…`, `outlook-mail://…`) | null in rare cases |

**Score polarity**: `higher = better`. Already-normalised within a
backend. Do NOT compare scores across different backends (fts5 vs qmd)
— absolute values are not commensurable. Use ranks only.

**Empty result**: empty array `[]`, exit code 0. NOT an error.

**Filters** (F12, 2026-05-31 — aligned with `omem wiki ls`):

- `--kind file|mail|calendar|loop` — restrict by kind
- `--since DATE` — ISO date or `Nd_ago` / `Nw_ago` / `Nm_ago` / `Ny_ago`
- `--source NAME` — restrict by `source_plugin` (`local-files` / `mail-app` / `outlook-web` / …)
- `--account ACCT` — restrict by mail/calendar/loop account (file kind has NULL account → excluded)
- `--include-deleted` — surface tombstoned pages too (default false). Schema unchanged; check page's `tombstoned_at` frontmatter to identify which were removed.
- `--limit N` (default 10) — top-N by score

All combine AND. Backend-side filters (`--kind`, `--include-deleted`) flow through to IndexPlugin; post-filters (`--source`, `--account`, `--since`) trim after backend returns.

## `omem query` — text format (no `--format json`)

Each hit is two lines: header + indented abstract.

```
[0.92] a1b2c3d4  Q3 budget review
  Finance team Q3 sync; agreed on headcount freeze and capex reallocation…

[0.85] e5f6g7h8  FY26 Q3 Budget Review
  Annual budget review for Q3, focusing on regional allocation.
```

Header columns: `[score] page_id_prefix(8)  title`.

Text format has the same information as JSON; agents should prefer
`--format json` for parsing.

## `omem page get <page_id>`

Prints the wiki page verbatim to stdout: YAML frontmatter + markdown body.

```yaml
---
page_id: a1b2c3d4...
title: "Q3 budget review"
abstract: "Finance team Q3 sync; agreed on headcount freeze and capex reallocation…"
source_uri: file:///Users/alice/Documents/Q3-budget.pptx
source_path: /Users/alice/Documents/Q3-budget.pptx
parsed_path: raw/abc123…/parsed/parsed.md
kind: file
source: local-files
account: alice-local
created_at: 2026-02-04T10:30:00+08:00
updated_at: 2026-02-04T11:45:12+08:00
source_modified_at: 2026-02-04T10:30:00+08:00
…
---

# Q3 budget review

## Meeting summary
…
```

Frontmatter fields you commonly cite:
- `title`, `abstract` — for short citations
- `source_path` — absolute path of the original file (cite this for
  raw-file references)
- `updated_at`, `source_modified_at` — for "when was this last touched"

## `omem raw get <page_id>`

Prints exactly one line: the absolute path of the original source file.

```
/Users/alice/Documents/Q3-budget.pptx
```

Exit code 0 on success, non-zero if the file is missing (e.g. user
moved it). Only works for `kind=file`; other kinds tell you to use
`--parsed`.

## `omem raw get <page_id> --parsed`

Prints exactly one line: the absolute path of `parsed.md`.

```
/Users/alice/.local/share/omem/raw/abc123…/parsed/parsed.md
```

Use `Read` on this path to get the parser's full text output.

## `omem wiki ls --format json`

Returns a JSON array of wiki page metadata, sorted by
`source_modified_at` desc by default.

```json
[
  {
    "page_id": "a1b2c3d4…",
    "title": "Q3 budget review",
    "abstract": "Finance team Q3 sync; agreed on headcount freeze and capex reallocation…",
    "kind": "file",
    "source": "local-files",
    "account": "alice-local",
    "source_modified_at": "2026-02-04T10:30:00+08:00",
    "wiki_path": "files/alice-local/2026/02/q3-budget-review.md"
  }
]
```

Filters: `--kind` / `--source` / `--account` / `--since` / `--limit` /
`--search` (F11) / `--include-deleted`.

`account` and `source` are available on M10+ ingested data; older
file-only rows may have null. Use `--since` to scope to "recent" slices.

`--search "<str>"` (F11, 2026-05-31): SQL LIKE substring on `title` OR
`abstract` columns, case-insensitive. No tokenization, no scoring —
deterministic match. Output schema unchanged.

## Error output

Errors go to stderr; exit code non-zero. Typical patterns:

```
Error: no OMem config found. Run `omem setup` first.
Error: index empty. Run `omem ingest` to populate.
Error: page_id 'a1b2c3d4' not found.
```

See `references/troubleshooting.md` for what to do for each.

## What NOT to assume

- Schema is **not** stable across `omem` major versions — but v1.0
  freezes it.
- `score` absolute value is NOT comparable across runs (qmd reranker
  may produce different absolute numbers run-to-run even with same
  query and corpus). Only rank order is stable.
- `wiki_path` is relative to `cfg.data.wiki_path`. If you need an
  absolute path, use `source_path` (raw file) or read frontmatter
  yourself.
