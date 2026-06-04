<div align="center">

<a href="https://seacen.github.io/omem/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs-site/src/assets/brand/logo-lockup-dark.svg">
    <img alt="OMem — the office your AI remembers." src="docs-site/src/assets/brand/logo-lockup-light.svg" width="360">
  </picture>
</a>

<br>

**The memory that auto-ingests your real work — local-first, for any AI agent**

<a href="https://seacen.github.io/omem/">Docs</a> ·
<a href="https://seacen.github.io/omem/zh-cn/">中文文档</a> ·
<a href="https://seacen.github.io/omem/concepts/01-what-is-omem/">What is OMem?</a> ·
<a href="https://github.com/seacen/omem/issues">Issues</a>

[![release](https://img.shields.io/badge/release-v1.0.0-E4DCC5?style=flat-square&labelColor=2B2A28)](https://github.com/seacen/omem/releases/latest)
[![license](https://img.shields.io/badge/license-PolyForm--NC-E4DCC5?style=flat-square&labelColor=2B2A28)](./LICENSE)
[![platform](https://img.shields.io/badge/platform-macOS%20%C2%B7%20Windows%20soon-E4DCC5?style=flat-square&labelColor=2B2A28)](https://seacen.github.io/omem/getting-started/01-install/)
[![docs](https://img.shields.io/badge/docs-seacen.github.io%2Fomem-E4DCC5?style=flat-square&labelColor=2B2A28)](https://seacen.github.io/omem/)

</div>

---

**OMem automatically ingests your real work — email, calendar, meeting notes, and
files (Office formats, PDFs, images, HTML, Markdown) — and turns it into a
plain-Markdown wiki that any AI agent can query.** It runs quietly on your own
machine, reading the work you already do from where it already lives — no copying,
no re-typing, no vendor cloud. Capable agents and your real work context, finally
connected.

> 📚 **Documentation: [seacen.github.io/omem](https://seacen.github.io/omem/)**
> — concepts, getting started, how-to guides, reference, FAQ (English + 简体中文).

**Available on macOS today; Windows is coming.** Free for personal use.

---

## Why OMem

Your AI agent is clever, but every session starts blank — it can't see the work
going on around you. The genuinely capable agents that arrived this year (Claude
Code, Codex, OpenClaw, Hermes) can do real work, but they can't see your inbox,
your decks, your meeting notes. OMem is the layer that connects the two.

What makes it different — no other tool sits at this intersection:

- **Auto-ingests your real work.** The part nothing else does: it reads the mail,
  calendar, notes, and files you already produce — automatically, from where they
  live. No feeding it documents, no re-typing.
- **Local-first, zero IT.** Reads what your OS already has access to — no vendor
  cloud, no Graph API consent, no IT ticket.
- **The wiki is yours.** Plain Markdown in a folder you choose. Read it, grep it,
  edit it, version it. Nothing locks you in.
- **Agent-agnostic.** One CLI; a thin skill / MCP wrapper over it. Switch agents
  next year — your memory persists.
- **Reads any format.** A purpose-built parser per format turns PowerPoint, Excel,
  Word, PDFs, scans, and mail into accurate Markdown — details kept, not a lossy
  summary.
- **Search that's actually good.** Keyword search by default; enable `qmd` for
  multi-path semantic + cross-language retrieval. Chinese is first-class.

---

## Get started

```bash
curl -fsSL https://github.com/seacen/omem/releases/latest/download/install.sh | sh
omem setup     # guided wizard, ~5 min
```

Then **follow the docs** — they walk you through setup, your first query, and
connecting your agent (Claude Code, Codex, Cursor, …), step by step:

**→ [Getting started](https://seacen.github.io/omem/getting-started/01-install/)**

This repo also carries the agent plugin bundle (the OMem skill + manifests) that
the docs install for you; the data layer is the `omem` CLI binary.

---

## License & contact

[PolyForm Noncommercial 1.0.0](./LICENSE) — free for personal / academic /
non-profit use; **commercial use requires a license**.

For commercial licensing, partnership, or any other conversation, get in touch —
see [About the author](https://seacen.github.io/omem/about-the-author/) or email
**xichangzhao@outlook.com**.

- **Documentation**: <https://seacen.github.io/omem/>
- **Issues**: <https://github.com/seacen/omem/issues>
