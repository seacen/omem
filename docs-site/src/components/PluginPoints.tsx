/**
 * PluginPoints — click-through extension-point explainer for concepts/05.
 *
 * Same interaction model the author liked: click an extension point → a rich
 * panel explains what it does, the interface a plugin implements, and what
 * ships built-in. NO emoji, NO autoplay. Left list of points (each marked
 * pluggable / reserved) + right rich panel. Source / Parser / Index are
 * pluggable today; WikiStore is reserved. Monochrome (BRAND §7.1).
 * Facts: docs/user-docs/_fact-map.md §4.
 */
import { useState } from 'react';

type Point = {
  key: string;
  label: string;
  sub: string;
  pluggable: boolean;
  lead: string;
  iface: string;
  ships: string;
  detail: string;
};

const POINTS: Point[] = [
  {
    key: 'source', label: 'Source', sub: 'where data comes from', pluggable: true,
    lead: 'Reads the items to ingest — your files, mail, calendar, Loop notes.',
    iface: 'preflight_check() · discover_*(since) → items',
    ships: 'local-files · mail-app · calendar-app · loop-resolver · ics-file',
    detail: 'Adding a new origin later — Slack, Jira, Linear — means writing one new Source against this interface. The parser, index, and wiki layers don’t change. That’s the point of the seam: new inputs don’t ripple through the rest of OMem.',
  },
  {
    key: 'parser', label: 'Parser', sub: 'one format → Markdown', pluggable: true,
    lead: 'Turns a single file format into clean Markdown. One parser per format.',
    iface: 'parse(item, out_dir, ctx) → ParsedDoc · name · supported_mime_types · version',
    ships: 'docx · pptx · xlsx · pdf · eml · msg · ics · html · image · plain-text',
    detail: 'The default chain is deterministic — no LLM — which is what makes the parsed archive reproducible. A future parser-llm (for people who want layout understanding over reproducibility) could plug in here for file kinds without changing the contract the rest of the pipeline relies on.',
  },
  {
    key: 'index', label: 'Index', sub: 'how pages are searched', pluggable: true,
    lead: 'The retrieval layer — turns a query into ranked pages.',
    iface: 'add(page_id, frontmatter, body) · delete(id) · query(text, limit, …) → [(id, score)] · rebuild(pages)',
    ships: 'fts5 (default — keyword + Chinese segmentation) · qmd (optional — hybrid vector + reranker)',
    detail: 'Switch the active index with one command (omem plugin enable qmd). It fully replaces the other — not a merge — and only the index rebuilds; your wiki is untouched. The index is an opinion layered on the wiki, never the source of truth.',
  },
  {
    key: 'wikistore', label: 'WikiStore', sub: 'where pages are stored', pluggable: false,
    lead: 'Holds the curated pages and their metadata.',
    iface: 'write_page(...) · read_page(...) · update_frontmatter(...)',
    ships: 'DiskWikiStore — Markdown files + SQLite metadata',
    detail: 'Be precise here: the interface exists and is clean, but v1.0 ships a single implementation with no swap mechanism. It is an extension point on paper, reserved for later — not something you can replace today. Calling the architecture “four extension points” is true; in practice three are things you can act on now.',
  },
];

export default function PluginPoints() {
  const [active, setActive] = useState(0);
  const p = POINTS[active];

  return (
    <div style={{ width: '100%', border: '1px solid var(--sl-color-gray-5)', borderRadius: '0.5rem', overflow: 'hidden', margin: '1.5rem 0', background: 'var(--sl-color-black)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)' }}>
        {/* LEFT: extension points */}
        <div style={{ borderRight: '1px solid var(--sl-color-gray-5)' }}>
          {POINTS.map((point, i) => {
            const isActive = i === active;
            return (
              <button
                key={point.key}
                onClick={() => setActive(i)}
                style={{
                  width: '100%', textAlign: 'left', border: 'none',
                  borderTop: i === 0 ? 'none' : '1px solid var(--sl-color-gray-5)',
                  background: isActive ? 'var(--sl-color-accent-low)' : 'transparent',
                  boxShadow: isActive ? 'inset 3px 0 0 var(--sl-color-text-accent)' : 'none',
                  cursor: 'pointer', padding: '0.8rem 0.9rem',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontWeight: isActive ? 700 : 600, fontSize: '0.98rem', color: 'var(--sl-color-text-accent)' }}>{point.label}</span>
                  <span style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.62rem', letterSpacing: '0.04em', padding: '0.1rem 0.4rem', borderRadius: '3px', border: `1px ${point.pluggable ? 'solid' : 'dashed'} var(--sl-color-gray-5)`, color: point.pluggable ? 'var(--sl-color-text-accent)' : 'var(--sl-color-gray-3)' }}>
                    {point.pluggable ? 'pluggable' : 'reserved'}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--sl-color-gray-3)', marginTop: '0.2rem' }}>{point.sub}</div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: rich panel */}
        <div key={p.key} style={{ padding: '1.1rem 1.2rem', background: 'var(--sl-color-gray-7)', animation: 'omemFadeUp 0.4s ease both' }}>
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.98rem', fontWeight: 600, color: 'var(--sl-color-text-accent)', lineHeight: 1.5 }}>{p.lead}</p>

          <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.66rem', letterSpacing: '0.06em', color: 'var(--sl-color-gray-4)', marginBottom: '0.3rem' }}>INTERFACE</div>
          <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.76rem', color: 'var(--sl-color-text)', lineHeight: 1.55, marginBottom: '0.9rem', wordBreak: 'break-word' }}>{p.iface}</div>

          <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.66rem', letterSpacing: '0.06em', color: 'var(--sl-color-gray-4)', marginBottom: '0.3rem' }}>SHIPS WITH</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--sl-color-text)', marginBottom: '0.9rem' }}>{p.ships}</div>

          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--sl-color-gray-2)', lineHeight: 1.6, borderTop: '0.5px solid var(--sl-color-gray-5)', paddingTop: '0.7rem' }}>{p.detail}</p>
        </div>
      </div>
      <style>{`@keyframes omemFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
