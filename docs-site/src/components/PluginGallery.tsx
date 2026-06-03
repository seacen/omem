/**
 * PluginGallery — editorial scroll narrative for concepts/05.
 *
 * Same scroll-driven, magazine feel as IngestScrollStory, but the job here is
 * to make the plugin architecture legible: each extension-point TYPE gets its
 * own scene (an editorial display title + what the type is for, on the left),
 * and the right side lists the concrete plugins OMem actually offers under that
 * type — each as its own breathing row (name · one line · a v1.0 / optional /
 * deferred tag), so "this type → these plugins" reads at a glance.
 *
 * Reveal driven by CSS `animation-timeline: view()` (compositor-thread, never
 * hijacks scroll, degrades to static where unsupported). Pure monochrome
 * (BRAND §7.1). No emoji, no autoplay.
 *
 * Plugin lists verified against src/omem/{sources,parsers,index,wiki}/ via
 * docs/user-docs/_fact-map.md §4.
 */
import { useRef } from 'react';

type Tag = 'v1.0' | 'optional' | 'default' | 'deferred' | 'reserved';
type Plugin = { name: string; desc: string; desc_zh: string; tag: Tag };
type Scene = {
  key: string;
  eyebrow: string;
  eyebrow_zh: string;
  title: string;
  title_zh: string;
  lead: string;
  lead_zh: string;
  plugins: Plugin[];
};

const SCENES: Scene[] = [
  {
    key: 'source',
    eyebrow: 'extension point · source',
    eyebrow_zh: '扩展点 · source',
    title: 'Sources decide where your work comes from.',
    title_zh: 'Source 决定你的工作从哪里来。',
    lead: 'A Source reads the items to ingest. Each kind of work has one — and adding a new origin later (Slack, Jira, …) is just one more Source, leaving the rest of OMem untouched.',
    lead_zh: 'Source 负责读取要摄入的条目。每一类工作都有一个对应的 Source——日后想接入新的来源（Slack、Jira……），无非再加一个 Source，OMem 的其余部分原封不动。',
    plugins: [
      { name: 'local-files', desc: 'Any folder you point it at — OneDrive, Box, Dropbox, iCloud, Downloads.', desc_zh: '你指给它的任何文件夹——OneDrive、Box、Dropbox、iCloud、Downloads。', tag: 'v1.0' },
      { name: 'mail-app', desc: 'Apple Mail’s local store; threads aggregated into one page each.', desc_zh: 'Apple Mail 的本地存储；每条会话聚合成一个页面。', tag: 'v1.0' },
      { name: 'calendar-app', desc: 'Apple Calendar — Exchange, iCloud, CalDAV all flow through it.', desc_zh: 'Apple Calendar——Exchange、iCloud、CalDAV 都从这里汇入。', tag: 'v1.0' },
      { name: 'loop-resolver', desc: 'Microsoft Loop / Fluid meeting notes, fetched from SharePoint.', desc_zh: 'Microsoft Loop / Fluid 会议笔记，从 SharePoint 取回。', tag: 'v1.0' },
      { name: 'ics-file', desc: 'Standalone .ics calendar files.', desc_zh: '独立的 .ics 日历文件。', tag: 'v1.0' },
      { name: 'outlook-classic / -web / -applescript', desc: 'Other ways into Outlook mail & calendar.', desc_zh: '接入 Outlook 邮件与日历的其他几条路径。', tag: 'deferred' },
    ],
  },
  {
    key: 'parser',
    eyebrow: 'extension point · parser',
    eyebrow_zh: '扩展点 · parser',
    title: 'A parser per format — so nothing your office uses is left out.',
    title_zh: '一种格式一个 parser——办公里用到的格式一个都不落下。',
    lead: 'Each format gets a dedicated parser that turns it into clean Markdown, keeping the parts generic converters drop. This breadth is the quiet thing that sets OMem apart.',
    lead_zh: '每种格式都有专属的 parser，把它转成干净的 Markdown，留住通用转换器会丢掉的那些部分。这份覆盖广度，正是 OMem 那个不张扬却拉开差距的地方。',
    plugins: [
      { name: 'docx', desc: 'Word — headings, lists, tables, embedded images, plus tracked changes and reviewer comments.', desc_zh: 'Word——标题、列表、表格、内嵌图片，还有修订痕迹和审阅批注。', tag: 'v1.0' },
      { name: 'pptx', desc: 'PowerPoint — slide-by-slide, speaker notes, embedded charts.', desc_zh: 'PowerPoint——逐张幻灯片、演讲者备注、内嵌图表。', tag: 'v1.0' },
      { name: 'xlsx', desc: 'Excel — sheets as Markdown tables, embedded images kept.', desc_zh: 'Excel——工作表转成 Markdown 表格，内嵌图片也保留。', tag: 'v1.0' },
      { name: 'pdf', desc: 'PDF — layout-aware for digital, OCR for scanned.', desc_zh: 'PDF——数字版按版面解析，扫描版走 OCR。', tag: 'v1.0' },
      { name: 'eml / msg', desc: 'Email files, headers and body and attachments.', desc_zh: '邮件文件，邮件头、正文、附件都在内。', tag: 'v1.0' },
      { name: 'html', desc: 'Web/email HTML → clean Markdown.', desc_zh: '网页 / 邮件 HTML → 干净的 Markdown。', tag: 'v1.0' },
      { name: 'ics', desc: 'Calendar event data.', desc_zh: '日历事件数据。', tag: 'v1.0' },
      { name: 'image', desc: 'PNG/JPEG/HEIC/… described via OCR + a vision model.', desc_zh: 'PNG/JPEG/HEIC/……通过 OCR 加视觉模型来描述。', tag: 'v1.0' },
      { name: 'plain-text / markdown', desc: 'Passed through, structure preserved.', desc_zh: '直接透传，结构保留。', tag: 'v1.0' },
      { name: 'parser-llm', desc: 'Whole-file LLM parsing, for layout over reproducibility.', desc_zh: '整文件交给 LLM 解析，在版面与可复现之间偏向版面。', tag: 'deferred' },
    ],
  },
  {
    key: 'index',
    eyebrow: 'extension point · index',
    eyebrow_zh: '扩展点 · index',
    title: 'The index is how a query finds a page — and it’s swappable.',
    title_zh: '索引是查询找到页面的方式——而且可以替换。',
    lead: 'The retrieval layer is an opinion laid over the wiki, never the source of truth. Switch it with one command; only the index rebuilds, your wiki is untouched.',
    lead_zh: '检索层只是覆在 wiki 之上的一种看法，从来不是真相本身。一条命令就能换；只有索引会重建，你的 wiki 原封不动。',
    plugins: [
      { name: 'fts5', desc: 'SQLite full-text search + jieba Chinese segmentation. Fast, zero setup.', desc_zh: 'SQLite 全文搜索 + jieba 中文分词。快，零配置。', tag: 'default' },
      { name: 'qmd', desc: 'Hybrid BM25 + local vector embeddings + reranker, for semantic & cross-language search.', desc_zh: 'BM25 + 本地向量 embedding + reranker 的混合方案，支持语义与跨语言搜索。', tag: 'optional' },
    ],
  },
  {
    key: 'wikistore',
    eyebrow: 'extension point · wikistore',
    eyebrow_zh: '扩展点 · wikistore',
    title: 'Where the pages live — defined as a seam, reserved for later.',
    title_zh: '页面存放在哪里——这一层留好了接缝，给以后用。',
    lead: 'Be precise: the interface exists and is clean, but v1.0 ships a single implementation with no swap mechanism. It’s an extension point on paper — three of the four are things you can act on today.',
    lead_zh: '把话说准：接口已经存在、也很干净，但 v1.0 只发布一个实现，没有切换机制。它目前还只是纸面上的扩展点——四个扩展点里，另外三个才是你今天就能动手用的。',
    plugins: [
      { name: 'DiskWikiStore', desc: 'Markdown files on disk + SQLite metadata. The one v1.0 implementation.', desc_zh: '磁盘上的 Markdown 文件 + SQLite 元数据。v1.0 唯一的那个实现。', tag: 'reserved' },
    ],
  },
];

const TAG_LABEL: Record<Tag, string> = {
  'v1.0': 'v1.0',
  'optional': 'optional',
  'default': 'default',
  'deferred': 'v1.5+',
  'reserved': 'reserved',
};
const TAG_LABEL_ZH: Record<Tag, string> = {
  'v1.0': 'v1.0',
  'optional': '可选',
  'default': '默认',
  'deferred': 'v1.5+',
  'reserved': '预留',
};

export default function PluginGallery({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const ref = useRef<HTMLDivElement>(null);
  const zh = lang === 'zh';
  const tagLabel = zh ? TAG_LABEL_ZH : TAG_LABEL;
  return (
    <div ref={ref} className="omem-pg" style={{ width: '100%', margin: '2rem 0' }}>
      <style>{`
        .omem-pg { position: relative; }
        .omem-pg-rail { position: absolute; left: 0; top: 0; bottom: 0; width: 1px; background: var(--sl-color-hairline); }
        .omem-pg-rail-fill { position: absolute; left: 0; top: 0; width: 1px; height: 100%; background: var(--sl-color-text-accent); transform-origin: top; transform: scaleY(0); animation: omemPgRail linear both; animation-timeline: scroll(nearest); }
        @keyframes omemPgRail { to { transform: scaleY(1); } }

        .omem-pg-scene {
          display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
          gap: 2.5rem; align-items: start; padding: 3rem 0 3rem 2.2rem; min-height: 60vh;
        }
        @media (max-width: 720px) { .omem-pg-scene { grid-template-columns: 1fr; gap: 1.2rem; min-height: 0; padding: 2rem 0 2rem 1.6rem; } }

        .omem-pg-left { position: sticky; top: 18vh; }
        @media (max-width: 720px) { .omem-pg-left { position: static; top: auto; } }

        .omem-pg-reveal { animation: omemPgReveal linear both; animation-timeline: view(); animation-range: entry 6% cover 30%; }
        @keyframes omemPgReveal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @supports not (animation-timeline: view()) { .omem-pg-reveal { animation: none; opacity: 1; transform: none; } .omem-pg-rail-fill { animation: none; transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) { .omem-pg-reveal { animation: none; opacity: 1; transform: none; } }

        .omem-pg-eyebrow { font-family: var(--sl-font-mono); font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--sl-color-gray-4); margin-bottom: 0.7rem; }
        .omem-pg-title { font-family: var(--omem-serif, 'EB Garamond', serif); font-weight: 500; font-size: clamp(1.4rem, 2.4vw, 1.95rem); line-height: 1.2; letter-spacing: -0.01em; color: var(--sl-color-text-accent); margin: 0 0 0.8rem; }
        .omem-pg-lead { font-size: 0.95rem; line-height: 1.65; color: var(--sl-color-gray-2); margin: 0; }

        /* row: a name+tag "head" block (does NOT grow, so the tag sits right
           beside the name) + a description that fills the rest. No floating-
           to-the-far-right tag. */
        .omem-pg-plugin { display: flex; align-items: baseline; gap: 0.9rem; padding: 0.7rem 0; border-top: 0.5px solid var(--sl-color-hairline); }
        .omem-pg-plugin:first-child { border-top: none; }
        .omem-pg-phead { display: flex; align-items: baseline; gap: 0.5rem; flex: 0 0 auto; width: 12rem; }
        .omem-pg-pname { font-family: var(--sl-font-mono); font-weight: 600; font-size: 0.88rem; color: var(--sl-color-text-accent); word-break: break-word; }
        .omem-pg-pdesc { font-size: 0.88rem; line-height: 1.5; color: var(--sl-color-gray-2); flex: 1; min-width: 0; }
        .omem-pg-tag { font-family: var(--sl-font-mono); font-size: 0.6rem; letter-spacing: 0.04em; padding: 0.1rem 0.4rem; border-radius: 3px; border: 1px solid var(--sl-color-gray-5); color: var(--sl-color-gray-3); white-space: nowrap; align-self: center; }
        .omem-pg-tag[data-strong="1"] { color: var(--sl-color-text-accent); border-color: var(--sl-color-text-accent); }
        .omem-pg-tag[data-dash="1"] { border-style: dashed; }
        /* mobile: stack head above description, tag stays next to the name */
        @media (max-width: 640px) {
          .omem-pg-plugin { flex-direction: column; gap: 0.25rem; }
          .omem-pg-phead { width: auto; }
        }
      `}</style>

      <div className="omem-pg-rail"><div className="omem-pg-rail-fill" /></div>

      {SCENES.map((s) => (
        <section key={s.key} className="omem-pg-scene">
          <div className="omem-pg-left omem-pg-reveal">
            <div className="omem-pg-eyebrow">{zh ? s.eyebrow_zh : s.eyebrow}</div>
            <h3 className="omem-pg-title">{zh ? s.title_zh : s.title}</h3>
            <p className="omem-pg-lead">{zh ? s.lead_zh : s.lead}</p>
          </div>
          <div className="omem-pg-reveal">
            {s.plugins.map((p) => (
              <div key={p.name} className="omem-pg-plugin">
                <span className="omem-pg-phead">
                  <span className="omem-pg-pname">{p.name}</span>
                  <span
                    className="omem-pg-tag"
                    data-strong={p.tag === 'v1.0' || p.tag === 'default' || p.tag === 'optional' ? '1' : '0'}
                    data-dash={p.tag === 'deferred' || p.tag === 'reserved' ? '1' : '0'}
                  >
                    {tagLabel[p.tag]}
                  </span>
                </span>
                <span className="omem-pg-pdesc">{zh ? p.desc_zh : p.desc}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
