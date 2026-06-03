/**
 * IngestScrollStory — editorial scroll-driven narrative for concepts/04.
 *
 * As you scroll, each of the four stages reveals: an editorial display title,
 * a paragraph, and an abstract monochrome figure that morphs the "object"
 * stage by stage (a file block → text lines → a tidy page → a page caught in a
 * search frame). A sticky figure stays in view on the left while the prose
 * scrolls past on the right. Reveal is driven by CSS `animation-timeline:
 * view()` — compositor-thread, 60fps, never hijacks scroll, and degrades to
 * plain static content where unsupported.
 *
 * Restraint + magazine feel: EB Garamond display titles, generous whitespace,
 * hairline progress, pure monochrome (BRAND §7.1). No emoji, no autoplay.
 *
 * Content per stage written to its own strongest angle (not a before/after
 * template). Facts: docs/user-docs/_design-intent.md §3.
 */
import { useRef } from 'react';

type Scene = {
  key: string;
  eyebrow: string;       // small internal name
  title: string;         // editorial display line
  title_zh: string;
  body: string;
  body_zh: string;
  figure: 'file' | 'text' | 'image' | 'page' | 'found';
};

const SCENES: Scene[] = [
  {
    key: 'parse',
    eyebrow: 'parse',
    title: 'It reads what other tools quietly give up on.',
    title_zh: '那些别的工具悄悄放弃的内容，它照样读得进来。',
    body: 'Your work hides inside PowerPoint, Excel, scanned PDFs — formats that don’t turn into clean text on their own. Most converters silently drop the hardest parts: the chart embedded in a spreadsheet, the merged cells, the scanned page. OMem gives each format its own parser, precisely to keep what others lose — and it’s deterministic, so the same file reads the same three years from now.',
    body_zh: '你的工作藏在 PowerPoint、Excel、扫描版 PDF 里——这些格式没法自己变成干净的文本。大多数转换器会悄悄丢掉最难啃的部分：嵌在表格里的图表、合并的单元格、扫描的页面。OMem 给每种格式配了专属的 parser，就是为了把别人弄丢的东西留住——而且它是确定性的，同一个文件三年后读出来还是一模一样。',
    figure: 'file',
  },
  {
    key: 'vlm',
    eyebrow: 'vlm + ocr',
    title: 'A picture can’t live in a text wiki. So OMem writes down what it sees.',
    title_zh: '图片没法待在纯文本的 wiki 里。于是 OMem 把它看到的写下来。',
    body: 'The wiki is plain text — that’s what lets you read it, grep it, version it. But a chart or a scanned page is pixels; it can’t sit inside plain text. So OMem reads every picture and turns it into words: OCR transcribes text-bearing images like scans and screenshots; a vision model describes charts and diagrams. What the picture held now lives in the wiki, and is searchable like everything else.',
    body_zh: 'wiki 是纯文本——正因如此你才能读它、grep 它、给它做版本管理。可图表或扫描页是一堆像素，塞不进纯文本里。于是 OMem 把每一张图都读一遍，再变成文字：OCR 把扫描件、截图这类含文字的图片转写出来；视觉模型则描述图表和示意图。图里原本承载的信息，如今活在了 wiki 里，和其他一切内容一样可被搜索。',
    figure: 'image',
  },
  {
    key: 'curate',
    eyebrow: 'curate',
    title: 'It tidies — but never rewrites your numbers.',
    title_zh: '它只做梳理——绝不改写你的数字。',
    body: 'Raw parsed text is still messy. An LLM shapes it into one clean page: a one-line summary, a readable body, tags — while keeping every number and proper noun exactly as written. It will never quietly “round” an 11.3% into 11%. The page is saved as Markdown you can open, edit, and version — and the work is cached, so unchanged items never pay for it twice.',
    body_zh: '刚解析出来的文本还是乱的。LLM 会把它整理成一个干净的页面：一句话摘要、一段好读的正文、若干标签——同时把每个数字和专有名词原封不动地保留。它绝不会偷偷把 11.3% “约”成 11%。页面以 Markdown 形式保存，你可以打开、编辑、做版本管理——而且这步成果会缓存，没变过的条目不会再花第二次成本。',
    figure: 'page',
  },
  {
    key: 'index',
    eyebrow: 'index',
    title: 'The moment it becomes findable.',
    title_zh: '它变得可被找到的那一刻。',
    body: 'Until now the page just sat on disk — written, but unreachable. This step adds it to the search index, and in that instant your agent’s query can find it. The index is only an opinion laid over the wiki: delete it and it rebuilds from the Markdown. The wiki is the truth.',
    body_zh: '在此之前，页面只是静静躺在磁盘上——写好了，却还够不着。这一步把它加进搜索索引，就在那一瞬间，你的 agent 一查询就能找到它。索引只是覆在 wiki 之上的一种看法：删掉它，它会从 Markdown 重建。wiki 才是真相。',
    figure: 'found',
  },
];

export default function IngestScrollStory({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const ref = useRef<HTMLDivElement>(null);
  const zh = lang === 'zh';

  return (
    <div ref={ref} className="omem-scrollstory" style={{ width: '100%', margin: '2rem 0' }}>
      <style>{`
        .omem-scrollstory { position: relative; }

        /* progress rail down the left edge */
        .omem-ss-rail {
          position: absolute; left: 0; top: 0; bottom: 0; width: 1px;
          background: var(--sl-color-hairline);
        }
        .omem-ss-rail-fill {
          position: absolute; left: 0; top: 0; width: 1px; height: 100%;
          background: var(--sl-color-text-accent); transform-origin: top;
          transform: scaleY(0);
          animation: omemRailGrow linear both;
          animation-timeline: scroll(nearest);
        }
        @keyframes omemRailGrow { to { transform: scaleY(1); } }

        .omem-ss-scene {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 2.5rem;
          align-items: center;
          min-height: 78vh;
          padding-left: 2.2rem;
        }
        @media (max-width: 720px) {
          .omem-ss-scene { grid-template-columns: 1fr; gap: 1.2rem; min-height: 0; padding: 2.5rem 0 2.5rem 1.6rem; }
        }

        /* the figure column is sticky so it lingers while prose scrolls */
        .omem-ss-figure {
          position: sticky; top: 22vh;
          aspect-ratio: 1 / 1; width: 100%; max-width: 17rem;
          display: flex; align-items: center; justify-content: center;
        }
        @media (max-width: 720px) { .omem-ss-figure { position: static; max-width: 11rem; top: auto; } }

        /* reveal-on-scroll for prose + figure */
        .omem-ss-reveal {
          animation: omemReveal linear both;
          animation-timeline: view();
          animation-range: entry 8% cover 32%;
        }
        @keyframes omemReveal {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* graceful fallback: no scroll-timeline support → just show it */
        @supports not (animation-timeline: view()) {
          .omem-ss-reveal { animation: none; opacity: 1; transform: none; }
          .omem-ss-rail-fill { animation: none; transform: scaleY(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .omem-ss-reveal { animation: none; opacity: 1; transform: none; }
        }

        .omem-ss-eyebrow {
          font-family: var(--sl-font-mono); font-size: 0.72rem; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--sl-color-gray-4); margin-bottom: 0.7rem;
        }
        .omem-ss-title {
          font-family: var(--omem-serif, 'EB Garamond', serif); font-weight: 500;
          font-size: clamp(1.5rem, 2.6vw, 2.1rem); line-height: 1.18; letter-spacing: -0.01em;
          color: var(--sl-color-text-accent); margin: 0 0 0.9rem;
        }
        .omem-ss-body { font-size: 0.98rem; line-height: 1.7; color: var(--sl-color-gray-2); margin: 0; }
      `}</style>

      <div className="omem-ss-rail"><div className="omem-ss-rail-fill" /></div>

      {SCENES.map((s) => (
        <section key={s.key} className="omem-ss-scene">
          <div className="omem-ss-figure omem-ss-reveal">
            <Figure kind={s.figure} />
          </div>
          <div className="omem-ss-reveal">
            <div className="omem-ss-eyebrow">{s.eyebrow}</div>
            <h3 className="omem-ss-title">{zh ? s.title_zh : s.title}</h3>
            <p className="omem-ss-body">{zh ? s.body_zh : s.body}</p>
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── Abstract monochrome figures — hairline geometry, no emoji ── */
function Figure({ kind }: { kind: Scene['figure'] }) {
  const ink = 'var(--sl-color-text-accent)';
  const soft = 'var(--sl-color-gray-4)';
  const common = { fill: 'none', stroke: ink, strokeWidth: 1.3, vectorEffect: 'non-scaling-stroke' as const };
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-hidden="true">
      {/* faint frame, gives the "plate" / bookplate feel */}
      <rect x="6" y="6" width="188" height="188" rx="4" fill="none" stroke={soft} strokeWidth="0.6" />

      {kind === 'file' && (
        <>
          {/* a document with a dog-eared corner; jagged interior = "hard to read raw" */}
          <path d="M64 40 H120 L140 60 V160 H64 Z" {...common} />
          <path d="M120 40 V60 H140" {...common} />
          {/* messy/embedded marks the parser preserves */}
          <path d="M76 84 h44 M76 100 h52 M76 116 h30" {...common} strokeWidth={1} />
          <rect x="92" y="128" width="40" height="22" {...common} strokeWidth={1} />
          <path d="M92 150 l14 -12 8 7 12 -10" {...common} strokeWidth={1} />
        </>
      )}

      {kind === 'image' && (
        <>
          {/* a picture frame dissolving into text lines on the right */}
          <rect x="44" y="64" width="58" height="58" {...common} />
          <circle cx="60" cy="82" r="6" {...common} strokeWidth={1} />
          <path d="M48 116 l18 -20 12 10 16 -16 8 8" {...common} strokeWidth={1} />
          {/* arrow */}
          <path d="M110 93 h24 M128 87 l8 6 -8 6" {...common} strokeWidth={1.1} />
          {/* text lines it became */}
          <path d="M142 78 h28 M142 90 h34 M142 102 h22" stroke={ink} strokeWidth={1} />
        </>
      )}

      {kind === 'page' && (
        <>
          {/* a tidy page: title rule + clean lines + tag pills, all aligned */}
          <rect x="58" y="38" width="84" height="124" rx="3" {...common} />
          <path d="M70 58 h60" {...common} strokeWidth={1.6} />
          <path d="M70 74 h60 M70 86 h60 M70 98 h44 M70 110 h54 M70 122 h36" stroke={ink} strokeWidth={0.9} />
          <rect x="70" y="136" width="22" height="10" rx="5" {...common} strokeWidth={1} />
          <rect x="98" y="136" width="28" height="10" rx="5" {...common} strokeWidth={1} />
        </>
      )}

      {kind === 'found' && (
        <>
          {/* the tidy page, now caught inside a magnifier ring */}
          <rect x="50" y="40" width="70" height="100" rx="3" {...common} strokeWidth={1} stroke={soft} />
          <path d="M62 58 h46 M62 72 h46 M62 84 h32" stroke={soft} strokeWidth={0.8} />
          <circle cx="112" cy="112" r="34" {...common} strokeWidth={1.6} />
          <path d="M136 136 l24 24" {...common} strokeWidth={2} />
        </>
      )}
    </svg>
  );
}
