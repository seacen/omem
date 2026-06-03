/**
 * KindSourceMatrix — interactive 4-kind × source map for concepts/03.
 *
 * Click a kind to see its v1.0 source, what's deferred to v1.5+, the data it
 * reads, and the one thing worth knowing. Encodes the real drift corrections:
 * Outlook sources are v1.5+ (v1.0 mail = mail-app only); calendar defaults to
 * calendar-app (not outlook-web). Monochrome (BRAND §7.1).
 *
 * Facts: docs/user-docs/_fact-map.md §2/§4 + _design-intent.md §3.
 */
import { useState } from 'react';

type Kind = {
  key: string;
  label: string;
  source: string;
  reads: string;
  reads_zh: string;
  deferred: string | null;
  note: string;
  note_zh: string;
};

const KINDS: Kind[] = [
  {
    key: 'file',
    label: 'file',
    source: 'local-files',
    reads: 'Any directory you point it at — including OneDrive / Box / Dropbox / iCloud sync folders. Office formats, PDFs, images, HTML, Markdown.',
    reads_zh: '你指给它的任何目录——包括 OneDrive / Box / Dropbox / iCloud 同步文件夹。Office 格式、PDF、图片、HTML、Markdown 都能读。',
    deferred: null,
    note: 'The one universal kind. It also discovers .loop pointers and hands them to the loop kind.',
    note_zh: '唯一的通用 kind。它还会发现 .loop 指针，并把它们交给 loop kind 处理。',
  },
  {
    key: 'mail',
    label: 'mail',
    source: 'mail-app',
    reads: "Apple Mail's local store. Threads are aggregated — a 20-reply chain becomes one wiki page with a timeline, not 20 fragments.",
    reads_zh: 'Apple Mail 的本地存储。会话会被聚合——一条 20 封回复的邮件链汇成一个带时间线的 wiki 页，而不是 20 个碎片。',
    deferred: 'outlook-classic / outlook-web / outlook-applescript',
    note: 'v1.0 ships mail-app only. The Outlook sources are designed but deferred to v1.5+ — on macOS, Mail.app already covers the same local data.',
    note_zh: 'v1.0 只发布 mail-app。Outlook 几个 source 已经设计好，但推迟到 v1.5+——在 macOS 上，Mail.app 已经覆盖了同一份本地数据。',
  },
  {
    key: 'calendar',
    label: 'calendar',
    source: 'calendar-app',
    reads: "Apple Calendar's local store — Exchange, iCloud, and CalDAV accounts all flow through it. Recurring events keep their master + instances.",
    reads_zh: 'Apple Calendar 的本地存储——Exchange、iCloud、CalDAV 账户都从这里汇入。重复事件会保留它的主事件加各个实例。',
    deferred: 'outlook-classic / outlook-web / ics-file',
    note: 'The default is calendar-app (reading the local SQLite store directly), not a browser-scraped Outlook Web — more reliable, and symmetric with mail-app.',
    note_zh: '默认是 calendar-app（直接读本地 SQLite 存储），而不是靠浏览器抓取的 Outlook Web——更可靠，也和 mail-app 对称。',
  },
  {
    key: 'loop',
    label: 'loop',
    source: 'loop-resolver',
    reads: 'Microsoft Loop / Fluid meeting notes. A .loop file is a binary pointer; the resolver finds the SharePoint URL and fetches the rendered content.',
    reads_zh: 'Microsoft Loop / Fluid 会议笔记。.loop 文件是个二进制指针；resolver 会找到对应的 SharePoint URL，再把渲染好的内容取回来。',
    deferred: null,
    note: "What's ingested is the SharePoint content the pointer resolves to — not the .loop file itself (which is an unreadable binary snapshot).",
    note_zh: '真正被摄入的是指针解析出来的那份 SharePoint 内容——不是 .loop 文件本身（它是一份读不了的二进制快照）。',
  },
];

export default function KindSourceMatrix({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const [active, setActive] = useState(0);
  const k = KINDS[active];
  const zh = lang === 'zh';

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid var(--sl-color-gray-5)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        margin: '1.5rem 0',
      }}
    >
      {/* kind tabs — uniform muted strip; the ACTIVE tab pops to the panel
          surface color with a strong bottom edge so it reads as "connected"
          to the detail below. (No half-filled look.) */}
      <div style={{ display: 'flex', alignItems: 'stretch', background: 'var(--sl-color-gray-6)' }}>
        {KINDS.map((kind, i) => {
          const isActive = i === active;
          return (
            <button
              key={kind.key}
              onClick={() => setActive(i)}
              style={{
                flex: '1 1 0',
                minWidth: '6rem',
                margin: 0,
                /* stretch (from the flex container) makes every tab the same
                   full height; the selected tab's white background then fills
                   it top-to-bottom with NO dark gap. Accent bottom border drawn
                   as a real border so it sits flush at the very bottom edge. */
                alignSelf: 'stretch',
                border: 'none',
                borderRight: i < KINDS.length - 1 ? '1px solid var(--sl-color-gray-5)' : 'none',
                borderBottom: isActive ? '2.5px solid var(--sl-color-text-accent)' : '2.5px solid transparent',
                background: isActive ? 'var(--sl-color-black)' : 'transparent',
                cursor: 'pointer',
                padding: '0.85rem 0.5rem',
                fontFamily: 'var(--sl-font-mono)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.95rem',
                color: isActive ? 'var(--sl-color-text-accent)' : 'var(--sl-color-gray-3)',
                transition: 'background 0.18s, border-color 0.18s, color 0.18s',
              }}
            >
              {kind.label}
            </button>
          );
        })}
      </div>
      {/* detail */}
      <div style={{ padding: '1rem 1.1rem', background: 'var(--sl-color-black)', fontSize: '0.92rem' }}>
        <div style={{ marginBottom: '0.55rem' }}>
          <span style={{ color: 'var(--sl-color-gray-3)' }}>{zh ? 'v1.0 source（v1.0 数据源）' : 'v1.0 source'}&nbsp;&nbsp;</span>
          <code style={{ fontFamily: 'var(--sl-font-mono)', fontWeight: 600, color: 'var(--sl-color-text-accent)', background: 'transparent', border: 'none', padding: 0 }}>
            {k.source}
          </code>
        </div>
        <div style={{ marginBottom: '0.55rem', color: 'var(--sl-color-gray-2)' }}>
          <strong style={{ color: 'var(--sl-color-text-accent)' }}>{zh ? '读取：' : 'Reads:'}</strong> {zh ? k.reads_zh : k.reads}
        </div>
        {k.deferred && (
          <div style={{ marginBottom: '0.55rem', color: 'var(--sl-color-gray-3)' }}>
            <strong style={{ color: 'var(--sl-color-text-accent)' }}>{zh ? '推迟到 v1.5+：' : 'Deferred to v1.5+:'}</strong>{' '}
            <code style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.82rem', background: 'transparent', border: 'none', padding: 0 }}>{k.deferred}</code>
          </div>
        )}
        <div style={{ color: 'var(--sl-color-gray-2)', fontStyle: 'italic' }}>{zh ? k.note_zh : k.note}</div>
      </div>
    </div>
  );
}
