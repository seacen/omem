# `omem query` syntax & edge cases

Read this when `omem query` returned unexpected results — 0 hits where
you expected some, or wrong rank order — and you suspect the query
string itself is the problem.

## Tokenization

OMem normalises queries before passing them to the active index backend
(`fts5` or `qmd`). The default backend is the user's choice; agents
should NOT assume which one is active.

- **English / ASCII**: split on whitespace and punctuation. Lower-cased.
- **Chinese (中文)**: `fts5` runs `jieba` to segment into words before
  matching. `qmd` runs its own segmenter. Either way, you do NOT need to
  pre-tokenise — pass the natural-language sentence as-is.
- **Mixed CN/EN**: works. "上周 Alice 一对一" gets segmented into
  `上周` + `Alice` + `一对一`. No special syntax needed.

## Date filters

`--since` accepts ISO-8601 dates: `--since 2026-04-01`. The filter
applies to `source_modified_at` (file mtime / mail Date / calendar
dtstamp / loop lastModifiedDateTime), with `COALESCE` fallback to
`updated_at` for older rows.

- Relative dates ("last week") are NOT supported. If the user asks
  "what did I get last week", convert it to an absolute date yourself
  before calling: `--since 2026-05-23` (today minus 7 days).
- Time component is ignored — `--since 2026-04-01T14:00:00Z` is
  treated the same as `--since 2026-04-01`.

## Kind filter

`--kind file|mail|calendar|loop` narrows to one kind. Use it when:

- User explicitly says "find a document about…" → `--kind file`
- User asks about meetings/events → `--kind calendar`
- User asks about emails specifically → `--kind mail`
- User asks about Teams Loop notes → `--kind loop`

If unsure, omit `--kind` — cross-kind search is the default.

## Source / account / include-deleted filters (F12, 2026-05-31)

`omem query` also accepts:

- `--source NAME` — restrict to one `source_plugin` (e.g. `mail-app` to
  search only the macOS Mail.app inbox, not Outlook web)
- `--account ACCT` — restrict to one account (when user has multiple
  mail accounts, e.g. personal vs work)
- `--include-deleted` — surface tombstoned pages too (default off; only
  use when auditing what was removed or recovering a moved file)

All combine AND with each other and with `--kind` / `--since`.

`--include-deleted` does NOT add a "is_deleted" field to the output —
schema stays at 6 fields. To tell which returned hit is tombstoned,
fetch its page (`omem page get <id>`) and look at the frontmatter's
`tombstoned_at` field.

## Special characters

- **Quotes inside the query**: escape with backslash for the shell, or
  use single-quote outer wrapping:
  - `omem query 'Alice said "we should pivot"' --format json`
- **Hyphens in product names**: passed through verbatim. `Q3-budget`
  matches `Q3-budget` exactly; tokenization may also match `Q3` +
  `budget` separately.
- **Full-width punctuation (，。）**: tokenizers handle these
  automatically. No special escape needed.

## Backend differences

The active backend affects rank quality and latency, not output shape.

| | `fts5` (default) | `qmd` (optional plugin) |
| --- | --- | --- |
| Approach | BM25 over jieba tokens | Hybrid BM25 + vector embeddings (+ optional rerank) |
| Cold start | ~50ms always | First query 60–600s (loads embeddinggemma + reranker) |
| Warm latency | ~50–200ms | ~3–10s |
| Best for | Keyword-heavy queries, names, acronyms | Semantic / paraphrased queries ("the doc about pricing strategy") |

If a query times out (>30s) and you suspect cold-start qmd, wait — do
NOT retry. Retrying spawns another cold start and makes it worse.

## Understanding `score`

`score` (higher=better, sorted) is the backend's relevance estimate:

- **fts5** — BM25 over jieba tokens. Scores are token-overlap math.
  A page can score 0.9 because it mentions every query word once
  while being completely off-topic.
- **qmd** — hybrid BM25 + vector embedding + optional cross-encoder
  rerank. Closer to semantic relevance but still not the final word
  — qmd has no access to the user's actual intent or which version
  of a doc they care about.

Use `score` to **bound the candidate pool** (always read the top N
abstracts the backend gives you). Use **the abstract text** to decide
which page actually answers the question. The two can disagree —
when they do, trust the abstract.

This is why `omem query --limit 20` + reading all 20 abstracts is the
default workflow (see SKILL.md "Rerank the abstracts yourself"). The
backend gives you 20 candidates cheap; you reorder them by reading.

Cross-backend score values are NOT comparable. A 0.9 from fts5 means
something different from a 0.9 from qmd. Rank order within one query
is the only stable signal.

## When a query returns 0 hits or all-weak hits

"0 hits" includes both literal empty result and "20 hits but every
score is <0.4 with off-topic abstracts". Try ONE round of broadening
before giving up:

1. Reword with synonyms / different framing — the tokenizer may have
   missed a paraphrase. ("API rate limit" → "throttling 429 too many
   requests")
2. Drop `--kind` or `--since` filters if you set any.
3. Bump `--limit` to 50 — the right hit may be further down.
4. Split a long compound query into 2–3 narrower queries by topic
   keyword, then merge results.

If still nothing relevant after one retry round, accept 0 hits.
Report "OMem didn't surface anything specific about this" and answer
from general knowledge if appropriate. Don't run 5 retry rounds — at
that point either the content isn't indexed or you'd need to ask the
user for more context.

## What you can NOT do via `omem query`

- Boolean operators (`AND` / `OR` / `NOT`): not supported. Pass a single
  natural-language string.
- Wildcards (`*` / `?`): not supported.
- Field-scoped search (`title:` / `body:`): not supported. The index
  decides which fields to match.
- Regex: not supported.

If the user needs structured filtering, use `omem wiki ls` instead
(which filters by `kind` / `source` / `account` / `since` / `search`
deterministically; F11 adds `--search` for SQL LIKE substring match on
title or abstract).
