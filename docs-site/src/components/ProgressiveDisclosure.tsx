/**
 * ProgressiveDisclosure — animated L0→L3 drill-down for concepts/02.
 *
 * A tangible "zoom into the document" experience: click a layer (or press Play)
 * to drill down. Each layer reveals with a smooth slide+fade, an animated
 * token-cost bar grows to show the rising cost, and a mock document panel on
 * the right expands from a one-line abstract to the full file. Monochrome,
 * ink-on-paper (BRAND §7.1) — motion + tone carry the emphasis, never color.
 *
 * Facts: docs/user-docs/_design-intent.md §2 + _fact-map §1.
 */
import { useState, useEffect, useRef } from 'react';

type Layer = {
  id: string;
  label: string;
  label_zh: string;
  cmd: string;
  costLabel: string;
  costFrac: number; // 0..1 for the bar width
  what: string;
  what_zh: string;
  preview: string[]; // mock document lines revealed at this depth
  preview_zh: string[];
};

const LAYERS: Layer[] = [
  {
    id: 'L0',
    label: 'Abstract',
    label_zh: '摘要',
    cmd: 'omem query "Q3 budget decision"',
    costLabel: '~100 tokens',
    costFrac: 0.04,
    what: 'A one-sentence summary per hit. The agent skims this to judge relevance — without opening anything.',
    what_zh: '每条命中给一句话摘要。agent 扫一眼就能判断相不相关，什么都不用打开。',
    preview: ['Q3 budget signed off: 12% margin (revised from 9%); Bob agreed.'],
    preview_zh: ['Q3 预算已签署：利润率 12%（从 9% 上调）；Bob 同意。'],
  },
  {
    id: 'L1',
    label: 'Wiki page',
    label_zh: 'wiki 页',
    cmd: 'omem page get a3f9c2bd',
    costLabel: '500–2000 tokens',
    costFrac: 0.2,
    what: 'The curated, human-readable wiki page — the core product. Most questions are answered here.',
    what_zh: '经过梳理、给人读的 wiki 页——产品的核心。大部分问题在这一层就有答案。',
    preview: [
      '# Q3 Budget Review — sign-off',
      '',
      'Decision: 12% margin target approved (up from 9%).',
      'Owner: Alice · Agreed: Bob · Date: Tue.',
      'Open item from last quarter (scope 3) carried in.',
    ],
    preview_zh: [
      '# Q3 预算评审 — 签署',
      '',
      '决定：批准 12% 的利润率目标（从 9% 上调）。',
      '负责人：Alice · 同意：Bob · 日期：周二。',
      '上季度遗留事项（scope 3）顺延至本次。',
    ],
  },
  {
    id: 'L2',
    label: 'Parsed source',
    label_zh: '解析后的原文',
    cmd: 'omem raw get a3f9c2bd --parsed',
    costLabel: '2000–10000 tokens',
    costFrac: 0.6,
    what: 'The full parser output — every table row, every slide, each image already described by a vision model.',
    what_zh: 'parser 的完整输出——每一行表格、每一张幻灯片，每张图也已由视觉模型描述好了。',
    preview: [
      '# Q3 Budget Review — sign-off',
      '',
      '| Scenario | Margin | Owner |',
      '| A (base) | 9%     | Alice |',
      '| B (rev.) | 12%    | Alice |',
      '| C (high) | 15%    | Bob   |',
      '',
      '> [image] Slide 7 chart: margin trend Q1→Q3,',
      '>   inflection at the 12% revision.',
      '… (full thread / every row preserved)',
    ],
    preview_zh: [
      '# Q3 预算评审 — 签署',
      '',
      '| 方案 | 利润率 | 负责人 |',
      '| A（基准）| 9%  | Alice |',
      '| B（修订）| 12% | Alice |',
      '| C（高位）| 15% | Bob   |',
      '',
      '> [image] 第 7 张幻灯片图表：利润率 Q1→Q3 走势，',
      '>   在 12% 修订处出现拐点。',
      '… （完整线索 / 每一行都完整保留）',
    ],
  },
  {
    id: 'L3',
    label: 'Original file',
    label_zh: '原始文件',
    cmd: 'omem raw get a3f9c2bd',
    costLabel: 'the file itself',
    costFrac: 1,
    what: 'Prints the path to the original file. (Mail / calendar / loop have no file — they stop at L2.)',
    what_zh: '打印原始文件的路径。（mail / calendar / loop 没有文件——它们到 L2 就到头了。）',
    preview: ['→ ~/OneDrive/Acme/Q3-budget-review.pptx', '   (open it in its native app)'],
    preview_zh: ['→ ~/OneDrive/Acme/Q3-budget-review.pptx', '   （用它的原生应用打开）'],
  },
];

export default function ProgressiveDisclosure({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const zh = lang === 'zh';
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setActive((prev) => {
        if (prev >= LAYERS.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1300);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  const play = () => {
    setActive(0);
    setPlaying(true);
  };

  const cur = LAYERS[active];

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid var(--sl-color-gray-5)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        margin: '1.5rem 0',
        background: 'var(--sl-color-black)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: 0 }}>
        {/* LEFT: the ladder of layers */}
        <div style={{ borderRight: '1px solid var(--sl-color-gray-5)' }}>
          {LAYERS.map((layer, i) => {
            const isActive = i === active;
            const reached = i <= active;
            return (
              <button
                key={layer.id}
                onClick={() => { setPlaying(false); setActive(i); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderTop: i === 0 ? 'none' : '1px solid var(--sl-color-gray-5)',
                  background: isActive ? 'var(--sl-color-accent-low)' : 'transparent',
                  boxShadow: isActive ? 'inset 3px 0 0 var(--sl-color-text-accent)' : 'none',
                  cursor: 'pointer',
                  padding: '0.6rem 0.8rem',
                  paddingLeft: `${0.8 + i * 0.9}rem`,
                  display: 'block',
                  transition: 'background 0.25s ease, box-shadow 0.25s ease, padding-left 0.25s ease',
                  fontFamily: 'var(--sl-font)',
                  opacity: reached ? 1 : 0.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--sl-font-mono)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--sl-color-text-accent)' }}>
                    {layer.id}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--sl-color-text-accent)' }}>
                    {zh ? layer.label_zh : layer.label}
                  </span>
                </div>
                <code style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.72rem', color: 'var(--sl-color-gray-3)', background: 'transparent', border: 'none', padding: 0, display: 'block', marginTop: '0.15rem' }}>
                  {layer.cmd}
                </code>
                {/* animated token-cost bar */}
                <div style={{ marginTop: '0.4rem', height: '4px', background: 'var(--sl-color-gray-6)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: isActive ? `${Math.max(layer.costFrac * 100, 5)}%` : reached ? `${Math.max(layer.costFrac * 100, 5)}%` : '0%',
                      background: 'var(--sl-color-text-accent)',
                      borderRadius: '2px',
                      transition: 'width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      opacity: isActive ? 1 : 0.35,
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--sl-color-gray-3)' }}>{layer.costLabel}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT: mock document that expands as you drill down */}
        <div style={{ padding: '0.9rem 1rem', minHeight: '13rem', background: 'var(--sl-color-gray-7)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.72rem', color: 'var(--sl-color-gray-4)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
            {cur.id} {zh ? '视图' : 'VIEW'}
          </div>
          <pre
            key={cur.id} /* re-mount → re-trigger the fade/slide each layer */
            style={{
              margin: 0,
              fontFamily: 'var(--sl-font-mono)',
              fontSize: '0.78rem',
              lineHeight: 1.5,
              color: 'var(--sl-color-text)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              animation: 'omemFadeUp 0.45s ease both',
            }}
          >
            {(zh ? cur.preview_zh : cur.preview).join('\n')}
          </pre>
        </div>
      </div>

      {/* FOOTER: what + play */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderTop: '1px solid var(--sl-color-gray-5)', flexWrap: 'wrap' }}>
        <button
          onClick={play}
          style={{
            flexShrink: 0,
            padding: '0.4rem 0.9rem',
            borderRadius: '4px',
            border: '1px solid var(--sl-color-text-accent)',
            background: 'transparent',
            color: 'var(--sl-color-text-accent)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          {playing ? (zh ? '逐层钻取中…' : 'Drilling…') : zh ? '▶ 逐层钻取' : '▶ Drill down'}
        </button>
        <span style={{ fontSize: '0.88rem', color: 'var(--sl-color-gray-2)' }}>{zh ? cur.what_zh : cur.what}</span>
      </div>

      <style>{`
        @keyframes omemFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
