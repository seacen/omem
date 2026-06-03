/**
 * IngestPipeline — click-through step explainer for concepts/04.
 *
 * Same interaction model as ProgressiveDisclosure (which the author liked):
 * click a step → a rich panel explains what happens there. NOT an autoplay
 * marquee, NO emoji. A horizontal step-tab strip on top (distinct from the
 * vertical ladder elsewhere), a rich before→after + explanation panel below.
 *
 * Steps (plain-language title, internal name as subtitle): raw is folded into
 * the start; user-facing chain is parse → vlm → curate(+wiki) → index.
 * VLM framed correctly: the wiki is plain text, an image can't live in plain
 * text, so OMem turns each picture into words — OCR for text-bearing images,
 * a vision model for charts/diagrams. Monochrome (BRAND §7.1).
 */
import { useState } from 'react';

type Step = {
  key: string;
  title: string;
  sub: string;
  lead: string;
  before: string;
  after: string;
  detail: string;
  title_zh: string;
  lead_zh: string;
  before_zh: string;
  after_zh: string;
  detail_zh: string;
};

const STEPS: Step[] = [
  {
    key: 'parse',
    title: 'Read any format',
    sub: 'parse',
    lead: 'Your work lives in formats that don’t become clean text on their own — and most tools quietly drop the hard parts.',
    before: 'a .pptx: slides, speaker notes, an embedded chart, a merged-cell table',
    after: 'clean Markdown — notes kept, the chart extracted, the table intact',
    detail: 'A dedicated parser per format (PowerPoint, Excel, Word, PDF, scans, …) turns the file into Markdown reliably. It deliberately keeps what generic converters lose: embedded images, merged cells, speaker notes. This is deterministic — the same file produces the same Markdown years later.',
    title_zh: '读懂任何格式',
    lead_zh: '你的工作存在各种没法自动变成干净文本的格式里——而大多数工具会悄悄把那些难啃的部分丢掉。',
    before_zh: '一个 .pptx：幻灯片、演讲者备注、一张嵌入的图表、一个带合并单元格的表格',
    after_zh: '干净的 Markdown——备注保住了、图表提取出来了、表格完好无损',
    detail_zh: '每种格式都有专属 parser（PowerPoint、Excel、Word、PDF、扫描件等），可靠地把文件转成 Markdown。它有意保留通用转换器会丢掉的东西：嵌入的图片、合并单元格、演讲者备注。这是确定性的——多年以后，同一个文件产出同样的 Markdown。',
  },
  {
    key: 'vlm',
    title: 'Turn pictures into words',
    sub: 'vlm + ocr',
    lead: 'The wiki is plain text — and an image can’t live inside plain text. So OMem turns each picture into words.',
    before: 'a chart, a scanned page, a screenshot — pixels, invisible to search',
    after: 'the content of the image, written out as text inside the page',
    detail: 'Two paths, picked per image: OCR transcribes text-bearing images (scanned contracts, screenshots); a vision model describes charts and diagrams in words. Either way, what the picture contained now lives in the wiki as text — and becomes searchable like everything else.',
    title_zh: '把图片变成文字',
    lead_zh: 'wiki 是纯文本——而图片没法待在纯文本里。所以 OMem 把每一张图都变成文字。',
    before_zh: '一张图表、一页扫描件、一张截图——只是像素，搜索看不见',
    after_zh: '图片的内容，作为文字写进页面里',
    detail_zh: '两条路径，按图片逐张选用：OCR 转录带文字的图片（扫描的合同、截图）；vision model 用文字描述图表和示意图。无论走哪条，图片里曾经的内容现在都作为文字活在 wiki 里——也就和其他一切一样可被搜索了。',
  },
  {
    key: 'curate',
    title: 'Tidy it into one clean page',
    sub: 'curate + save',
    lead: 'Raw parsed text is still messy. An LLM shapes it into one clean page — then saves it to your vault.',
    before: 'long, raw parsed text',
    after: 'a tidy wiki page: one-line summary, clean body, tags — saved as Markdown',
    detail: 'The LLM writes a one-sentence abstract, a readable body, and tags — keeping every number and proper noun exactly as written (no quiet “11.3% → 11%”). The result is saved to your vault as plain Markdown you can open, grep, edit, and version. This step is cached by input hash, so unchanged items never pay for it twice.',
    title_zh: '整理成一个干净页面',
    lead_zh: '刚解析出来的原始文本还很乱。LLM 把它塑造成一个干净页面——然后存进你的 vault。',
    before_zh: '又长又乱的原始解析文本',
    after_zh: '一个清爽的 wiki 页面：一行摘要、干净的正文、标签——存成 Markdown',
    detail_zh: 'LLM 写出一句话摘要、一段可读的正文，以及标签——每个数字和专有名词都原样保留（不会悄悄把 "11.3% → 11%"）。结果存进你的 vault，是你能打开、grep、编辑、做版本管理的纯 Markdown。这一步按输入哈希做缓存，所以没变过的条目绝不会为它付两次费。',
  },
  {
    key: 'index',
    title: 'Make it findable',
    sub: 'index',
    lead: 'A page on disk isn’t searchable yet. This step is what lets your agent actually find it.',
    before: 'a wiki page sitting quietly on disk',
    after: 'indexed — omem query "Q3 budget" returns it instantly',
    detail: 'The page is added to the search index (FTS5 by default, or qmd). Until this runs, the page exists but no query would surface it. After it, your agent can retrieve it. The index is just an opinion layered on the wiki — delete it and it rebuilds from the Markdown.',
    title_zh: '让它可被找到',
    lead_zh: '一个躺在磁盘上的页面还搜不到。这一步才是让你的 agent 真正找得到它的关键。',
    before_zh: '一个静静躺在磁盘上的 wiki 页面',
    after_zh: '已建索引——omem query "Q3 budget" 立刻就能返回它',
    detail_zh: '页面被加进搜索索引（默认 FTS5，或 qmd）。在这一步跑完之前，页面虽然存在，但没有任何 query 能把它捞出来；跑完之后，你的 agent 就能检索到它。索引只是叠在 wiki 之上的一种意见——删掉它，它会从 Markdown 重建。',
  },
];

export default function IngestPipeline({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const zh = lang === 'zh';
  const [active, setActive] = useState(0);
  const s = STEPS[active];

  return (
    <div style={{ width: '100%', border: '1px solid var(--sl-color-gray-5)', borderRadius: '0.5rem', overflow: 'hidden', margin: '1.5rem 0', background: 'var(--sl-color-black)' }}>
      {/* ── horizontal step strip (click a step) ── */}
      <div style={{ display: 'flex', background: 'var(--sl-color-gray-6)', flexWrap: 'wrap' }}>
        {STEPS.map((step, i) => {
          const isActive = i === active;
          return (
            <button
              key={step.key}
              onClick={() => setActive(i)}
              style={{
                flex: '1 1 0', minWidth: '8rem', border: 'none',
                borderRight: i < STEPS.length - 1 ? '1px solid var(--sl-color-gray-5)' : 'none',
                background: isActive ? 'var(--sl-color-black)' : 'transparent',
                boxShadow: isActive ? 'inset 0 -2.5px 0 var(--sl-color-text-accent)' : 'none',
                cursor: 'pointer', padding: '0.7rem 0.8rem', textAlign: 'left',
                transition: 'background 0.18s, box-shadow 0.18s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.72rem', color: 'var(--sl-color-gray-3)' }}>{i + 1}</span>
                <span style={{ fontWeight: isActive ? 700 : 600, fontSize: '0.9rem', color: 'var(--sl-color-text-accent)', lineHeight: 1.2 }}>{zh ? step.title_zh : step.title}</span>
              </div>
              <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.66rem', color: 'var(--sl-color-gray-3)', marginTop: '0.2rem' }}>{step.sub}</div>
            </button>
          );
        })}
      </div>

      {/* ── rich panel for the active step ── */}
      <div key={s.key} style={{ padding: '1.1rem 1.2rem', animation: 'omemFadeUp 0.4s ease both' }}>
        <p style={{ margin: '0 0 0.9rem', fontSize: '1rem', color: 'var(--sl-color-text-accent)', fontWeight: 600, lineHeight: 1.5 }}>{zh ? s.lead_zh : s.lead}</p>

        {/* before → after */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.7rem', alignItems: 'stretch', marginBottom: '0.9rem' }}>
          <div style={{ border: '0.5px solid var(--sl-color-gray-5)', borderRadius: '5px', padding: '0.6rem 0.7rem', background: 'var(--sl-color-gray-6)' }}>
            <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.6rem', letterSpacing: '0.07em', color: 'var(--sl-color-gray-4)', marginBottom: '0.3rem' }}>{zh ? '处理前' : 'BEFORE'}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--sl-color-gray-2)', lineHeight: 1.45 }}>{zh ? s.before_zh : s.before}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--sl-color-text-accent)', fontSize: '1.2rem' }}>→</div>
          <div style={{ border: '1px solid var(--sl-color-text-accent)', borderRadius: '5px', padding: '0.6rem 0.7rem', background: 'var(--sl-color-gray-7)' }}>
            <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.6rem', letterSpacing: '0.07em', color: 'var(--sl-color-gray-4)', marginBottom: '0.3rem' }}>{zh ? '处理后' : 'AFTER'}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--sl-color-text-accent)', lineHeight: 1.45, fontWeight: 600 }}>{zh ? s.after_zh : s.after}</div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--sl-color-gray-2)', lineHeight: 1.6 }}>{zh ? s.detail_zh : s.detail}</p>
      </div>

      <style>{`@keyframes omemFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
