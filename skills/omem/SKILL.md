---
name: omem
description: |
  Search the user's local work memory (Office Memory / OMem) — a unified,
  locally-indexed wiki built from the user's emails, calendar events,
  documents, and collaboration notes. OMem ingests from whatever sources
  the user has configured: mail kind (e.g. macOS Mail.app, Outlook
  Classic, Outlook on the Web, AppleScript-driven mailboxes), calendar
  kind (Calendar.app, Outlook calendars, .ics files), file kind (any
  local folder — OneDrive, Dropbox, iCloud Drive, ~/Documents, plain
  directories), and loop kind (Microsoft Teams Loop notes). Future
  versions add Slack / Jira / Notion. The wiki abstracts over all of
  these — you don't need to know which source a hit came from.

  USE THIS SKILL whenever the user's question touches their work
  context, even implicitly — past meetings, colleagues' names, project
  codenames, vendor/contract details, "that document I saw last week",
  "what did X say about Y", upcoming/past calendar items, internal
  acronyms, RFPs, performance reviews, OKRs, anything that sounds like
  it could live in their work history (any inbox, calendar, local
  folder, or collaboration tool they use for work). When in doubt,
  CALL omem query FIRST and decide afterward whether the results help.

  DO NOT use this skill for: weather, general programming questions,
  translation, math, public-knowledge lookups, or anything where the
  user clearly is NOT asking about their own work history.

  Primary tool: `omem query "<question>" --format json --limit 20`
  Then progressively drill down via `omem page get <page_id>`,
  `omem raw get <page_id> --parsed`, `omem raw get <page_id>`.
  Usually one query and one page answers the question — read it, cite,
  done. Only when a page's answer hinges on a specific term, person, or
  document you haven't resolved, query again for that one thing — follow
  the thread, don't crawl the graph.
  Never call `omem setup / install / ingest / lint / index rebuild` —
  those are user actions; tell the user in natural language instead.
allowed-tools:
  - Bash
  - Read
---

# OMem — your local work memory

**Prerequisite**: this skill calls the local `omem` CLI. If `omem` isn't
installed (you'll see `command not found: omem`), the user must install
it first — see `references/troubleshooting.md`. Don't install it yourself.

The user has an OMem index of their work artifacts — emails, calendar
events, documents, and collaboration notes — abstracted into a unified
local wiki. The specific sources depend on the user's setup (any mail
app, any calendar source, any local folder, Teams Loop, etc.), but you
query the wiki, not the individual sources.

## When to call this skill

Call `omem query` first if the question references ANY of:

- People they work with (names, roles, "my manager", "the vendor")
- Projects, products, deliverables (real names, codenames, acronyms)
- Past or future events: meetings, calls, deadlines, reviews
- Documents: contracts, RFPs, decks, spreadsheets, "that doc about X"
- Conversations: "did Y say…", "what did we decide about Z"
- Time-anchored work memory: "last week", "in Q3", "this morning's email"

Don't call it for: weather, general coding, translation, math,
public-knowledge facts, or anything explicitly unrelated to the user's
own work history.

When in doubt, call it. A 0-result query is cheap; missing a hit the
user needed is expensive.

## Four-level progressive disclosure

OMem returns work memory at four cost tiers. Stop as soon as you have
enough to answer.

| Level | Command | Token cost | Use when |
| --- | --- | --- | --- |
| L0 abstracts | `omem query "<q>" --format json --limit 20` | ~2k total | Always first |
| L1 wiki page | `omem page get <page_id>` | ~500–2000 | After reranking abstracts, fetch the few you judge most relevant |
| L2 parsed.md | `omem raw get <page_id> --parsed` → `Read <path>` | ~2k–10k | L1 wiki missing a specific detail (table row, slide quote, contract clause) |
| L3 original file | `omem raw get <page_id>` → `Read <path>` | varies | Only when binary format matters; usually unnecessary |

**Default path**: L0 (limit 20) → read all abstracts → rerank → fetch
the 1–3 you judge relevant at L1 → stop, unless the body lacks a needed
detail (drop to L2) or references something you must resolve first
(recurse — see "Follow threads depth-first" below).

## Rerank the abstracts yourself — `score` is a coarse signal, not the answer

`omem query` orders hits by a backend score (BM25, or qmd's hybrid
embedding+BM25). That score is good at **finding plausibly-related
pages** — it is NOT a final relevance judgment. It doesn't know what
the user means by "the document", who they care about, or which of
several similar pages is the right version. You do.

Treat the score as **candidate generation** and the abstracts as the
**actual signal**. The default workflow:

1. Run `omem query --limit 20` — a wide candidate pool, not a narrow one.
2. Read **every abstract** in the response. Each is ~100 tokens; 20
   abstracts ≈ 2k tokens total — cheap relative to the cost of missing
   the right page and having to re-query.
3. Pick the 1–3 pages whose abstracts genuinely match what the user is
   asking. This often means picking page #5 over #1, or skipping the
   top hit entirely because its abstract is on the wrong topic — the
   score got it into the pool, your judgment decides if it stays.
4. Only then `omem page get <id>` for the ones you chose.

**Shortcut allowed**: if the top 2–3 scores are all >0.7 AND their
abstracts cleanly match the question's intent, fetch them directly
without reading all 20. Don't force-read 20 abstracts when 3 are
obviously right — but when in doubt, read more, not fewer.

**If the first 20 look thin** — top scores all <0.5, OR all abstracts
clearly off-topic — don't give up after one shot. Do one round of
broadening first:

- Reword with synonyms or different framing ("Q3 budget" → "third
  quarter financial review")
- Drop any `--kind` / `--since` filters you set
- Bump to `--limit 50` and read further down

A second round costs ~2k tokens and often surfaces what the first
round's tokenizer missed. Give up only after one honest retry.

If still nothing relevant after a retry: 0 hits is a valid answer.
Say "OMem didn't surface anything specific about this" and answer from
general knowledge if appropriate.

## Follow threads depth-first — but only when the answer needs it

Most questions are answered by the first page you open — read it, cite
it, done. That's the common case, and you should not go looking for
reasons to query again.

But sometimes a page doesn't *contain* the answer so much as *point* at
it: its body references a project, person, document, or decision that
you'd have to understand to actually answer, and that thing lives on
another page. When — and only when — that happens, treat memory as a
graph you can **recurse through**: query for the missing piece, read
it, and come back up to assemble the answer. It's how a colleague who
knew the history would work — recall the meeting, realize it hinged on
an earlier contract, go pull that contract — each step prompted by a
real gap, not by habit.

So after reading a page, ask one question: *can I now answer what the
user actually asked, with specifics?*

- **Yes** → answer and cite. Stop. One query, one page is a complete
  and good outcome — don't second-guess it.
- **No, because a specific term / name / reference here is load-bearing
  and I haven't resolved it** → query for that one thing, then re-ask
  the same question. This is the only trigger for another round.

What counts as a load-bearing gap worth one more query:

- An **unfamiliar codename / acronym** the answer depends on ("the
  Atlas migration", "per the Q2 risk review")
- A **referenced artifact** you must read to answer ("the penalty is in
  the signed MSA") — fetch that page
- A **prior decision / event** the answer hinges on ("we reversed this
  after the March incident")

A passing mention you don't need to resolve is **not** a gap — if the
user's question is answered without it, ignore it and stop. Depth-first
means following the one thread that leads to the answer, not crawling
the graph. Most chains are zero or one extra hop; if you're several
hops deep and still digging, you've likely drifted — summarize what you
found and tell the user where the trail went cold. (Flow F shows a case
that genuinely needed two hops.)

## Tools

### `omem query "<question>" --format json --limit 20`

Returns ranked hits as JSON:

```json
[
  {"page_id": "a1b2c3d4...", "score": 0.92, "kind": "file",
   "title": "Q3 budget review", "abstract": "Finance team weekly sync on Q3 budget; decisions on headcount and capex…",
   "source_uri": "file:///Users/.../Q3-budget.pptx"}
]
```

`score` is the backend's coarse relevance estimate (higher=better,
already sorted). Use it to **bound the candidate pool**, not to pick
the answer — see the "Rerank the abstracts yourself" section above.
Do NOT compare scores across backends; rank order within one query
is what's meaningful.

Optional filters:

- `--kind file|mail|calendar|loop` — narrow to one kind
- `--since 2026-04-01` (or `7d_ago` / `2w_ago`) — only items modified after that date
- `--source NAME` — narrow to one source plugin (`local-files`, `mail-app`, `outlook-web`, …)
- `--account ACCT` — narrow to one mail/calendar account
- `--include-deleted` — surface tombstoned pages too (audit / recovery; default off)
- `--limit N` — default 20; bump to 50 on a retry round if 20 looks thin

If query syntax surprises you (mixed Chinese/English, special
characters, dates that don't match), read `references/query-syntax.md`.

### `omem page get <page_id>`

Prints the full wiki page (frontmatter + LLM-curated body). This is the
canonical answer source — written by OMem's curator from the parsed
artifact. Most queries end here.

### `omem raw get <page_id> --parsed`

Prints the absolute path to `parsed.md` — the parser's full output
(every table row, every slide, every email body, OCR / VLM image
descriptions). Use `Read` on this path when the wiki body lacks a
specific detail.

### `omem raw get <page_id>`

Prints the absolute path to the original file. Only useful when the
binary format matters (e.g. you need to preserve a `.pptx` for the
user). Most agents never need this.

### `omem wiki ls [filters] --format json`

Deterministic metadata-only list — no scoring, no tokenization. Use
for "a slice" or "every row matching X" (as opposed to "the pages
most relevant to X" — that's `omem query`).

Filters combine AND:

- `--kind file|mail|calendar|loop`
- `--source NAME` (`local-files` / `mail-app` / `outlook-web` / …)
- `--account ACCT`
- `--since 7d_ago` (or ISO date)
- `--search "<str>"` — SQL LIKE substring on title OR abstract, case-insensitive
- `--limit N` — default 50; `--limit 0` = unlimited (use sparingly)
- `--include-deleted` — surface tombstoned rows (audit / recovery)

**`omem query` vs `omem wiki ls --search`**: query is fuzzy / semantic
and returns top-N by relevance; wiki ls --search is literal substring
and returns every matching row by recency. Question → query; listing
→ wiki ls.

## Typical flows

All example queries below use fictional names — substitute the real
context the user actually mentions.

Flow A — *"What did Alice and I decide about the vendor renewal?"* (rerank in action)

1. `omem query "Alice vendor renewal decision" --format json --limit 20`
2. Read all 20 abstracts. The top score (0.94) is a calendar invite
   for a meeting whose abstract just says "discuss vendor renewal" —
   no decision content. Hits #4 (score 0.71) and #7 (score 0.58)
   have abstracts that explicitly say "decided to extend by 12 months
   at unchanged rate" and "Alice agreed to revisit terms in Q4".
   Those are the real matches.
3. `omem page get <#4>` and `omem page get <#7>`.
4. The wiki bodies give the full decision context. Cite both
   `[source: …]` paths. Stop at L1.

Why this matters: the top-score hit was a *plausible* match (right
people, right topic word) but not a *useful* one — only an abstract
read revealed which pages actually carry decision content.

Flow B — *"What's the exact SLA penalty in the Acme service agreement?"* (drill to L2)

1. `omem query "Acme service agreement SLA penalty" --format json --limit 20`
2. Read abstracts. Top 3 are all contract revisions (initial draft,
   V2 markup, V5 final). Their abstracts mention a penalty exists
   but don't quote the number.
3. Pick the V5 final (most recent canonical signed copy).
   `omem page get <id>`.
4. Wiki body summarises ("penalty per delay day, capped at N days")
   but doesn't quote the verbatim number.
5. `omem raw get <id> --parsed` → `Read` the parsed.md → grep for
   "penalty / SLA / per day / %".
6. parsed.md has the clause text verbatim. Quote and cite. Stop at L2.

Flow C — *"List my meetings from last week"* (metadata slice)

1. `omem wiki ls --kind calendar --since 7d_ago --limit 50 --format json`
2. Group by date or attendee as needed. Return titles + times.
3. `omem page get <id>` only if user asks about a specific meeting's
   details.

Flow C2 — *"List every meeting whose title mentions Atlas"* (literal slice)

`omem wiki ls --kind calendar --search "Atlas" --limit 0 --format json` —
unlimited rows, title/abstract LIKE match. Use this instead of
`omem query` when you want **every** matching row, not BM25 top-N.

Flow D — *"Tell me about Python list comprehensions"*

Don't call this skill. Answer from general knowledge.

Flow E — *"Did we ever talk about the API rate-limit issue?"* (retry round)

1. `omem query "API rate limit" --format json --limit 20`
2. Top scores all <0.4 and the abstracts are off-topic — a vendor's
   public API rate card, a generic throttling reference. No real match.
3. Retry with synonyms and related symptoms instead of the literal
   phrasing: `omem query "throttling 429 too many requests" --limit 20`.
4. Still nothing relevant. Accept the miss — 0 hits is a valid answer.
5. Answer from general knowledge, noting "OMem didn't surface anything
   specific about this — could be a recent discussion not yet ingested,
   or it lived in a source OMem isn't configured to read."

Flow F — *"Why did we end up switching the Atlas project to the new vendor?"* (recurse only because the answer needs it)

1. `omem query "Atlas project vendor switch" --format json --limit 20`
2. Best abstract is a decision-log page. `omem page get <id>`.
3. The body says the switch was made "following the SLA breach
   covered in the Q2 incident review, and per Bob's recommendation" —
   two unknowns that the answer hinges on. Don't answer yet; recurse.
4. `omem query "Q2 incident review SLA breach" --limit 20` →
   `omem page get <id>`: the incident review quantifies the breach
   (repeated downtime past the contractual cap). That's the *why*.
5. `omem query "Bob vendor recommendation Atlas" --limit 20` →
   the abstract confirms Bob proposed the specific replacement vendor
   and the rationale. Enough.
6. Climb back up and assemble the full picture: the switch was driven
   by the SLA breach (from the incident review) plus Bob's replacement
   proposal (from his recommendation), formalized in the decision log.
   Cite all three `[source: …]` pages.

Why this needed the hops: the first page *mentioned* the decision but
didn't *explain* it, and the explanation was exactly what the user
asked for — so the two references were load-bearing, not incidental.
Note the contrast with Flow A, where the first page fully answered the
question and stopping there was correct. The test is always the same:
*does answering require this?* — not *is there something else I could
go read?*

## Citing sources

When OMem provided the answer, always cite:

- For wiki: `[source: <wiki_path from frontmatter>]`
- For raw: `[source: <source_path from omem raw get>]`

This lets the user verify and rebuilds trust each turn.

## What NOT to do

- `omem setup`, `omem install`, `omem ingest`, `omem lint`, `omem index
  rebuild`, `omem plugin enable/disable`, `omem config set`. These modify
  the user's environment. If the user clearly needs them, tell them in
  plain text: "Looks like OMem isn't set up — run `omem setup` in your
  terminal."
- Read `parsed.md` or original files **before** trying `omem page get`.
  L1 wiki is almost always enough; L2/L3 are last-resort.
- Compare scores across different backends (fts5 vs qmd). Use rank order
  only; the absolute number isn't normalized.
- Hallucinate page_ids. If a query returned no hits, don't invent one.
  Just answer from general knowledge.
- Trigger on clearly non-work queries (weather, translation, public
  facts). Bad precision degrades user trust in the skill.

## When OMem returns errors

Relay errors to the user — don't try to fix them yourself. Common
cases (`no config found` → user runs `omem setup`; `index empty` → user
runs `omem ingest`; slow query → qmd cold-loading models, wait).
See `references/troubleshooting.md` for the full table.

## References

- `references/query-syntax.md` — tokenization, date filters, score semantics, retry strategy
- `references/output-schemas.md` — full JSON schemas for `omem query` and `omem wiki ls`
- `references/troubleshooting.md` — error messages and what to relay to the user
