/**
 * RetrievalFlow — an animated walk-through of qmd's multi-path retrieval for
 * concepts/08. A query "flows through five gates" and each gate makes its
 * abstract step concrete and visible:
 *
 *   1. Query expansion — the query sprouts related phrasings (sprouting chips).
 *   2. Two-path recall — side by side:
 *        BM25  : candidate pages + a keyword-hit grid (which query words land
 *                where) with a tally bar — "count the words you asked for".
 *        Vector: query + pages become little embedding heat-grids; an English
 *                query lights up a Chinese page — meaning, not tokens.
 *   3. RRF fusion — the two ranked lists slide together; reciprocal-rank
 *        weights (1/1, 1/2, 1/3 …) add up and re-sort the pool.
 *   4. Rerank — candidates are paired with the query into a cross-encoder
 *        and the list reshuffles to the final order.
 *   5. Hit — the top page lights up and returns from `omem query`.
 *
 * Autoplay + pause + click any gate to single-step. Monochrome, ink-on-paper
 * (BRAND §7.1) — motion + tone carry it, never color. Every explanation is
 * plain-language ("count how many of your words show up on each page"), not
 * jargon. FICTIONAL data only (Q3 budget / Atlas / Acme).
 *
 * Facts: plugin-bundle/skills/omem/references/query-syntax.md + _fact-map §2
 * (fts5 = BM25 over jieba tokens; qmd = query-expansion + BM25 + vector +
 * optional cross-encoder rerank; modes in plugins.qmd.query_mode).
 */
import { useState, useEffect, useRef } from 'react';

const GATES = ['Expand', 'Recall', 'Fuse', 'Rerank', 'Hit'] as const;
const GATES_ZH = ['扩展', '召回', '融合', '重排', '命中'] as const;

// ── fictional candidate pages used throughout ──
type Page = { id: string; title: string; zh?: boolean };
const PAGES: Page[] = [
  { id: 'a3f9', title: 'Atlas Q3 review deck' },
  { id: '7c10', title: '第三季度预算评审', zh: true },
  { id: 'bb21', title: 'Acme contract draft' },
  { id: 'd904', title: 'Weekly staff sync notes' },
];

const EXPANSIONS = ['third-quarter financials', '预算评审', 'capex plan', 'headcount'];

// keyword-hit matrix: which expanded term lands on which page (BM25 intuition)
const TERMS = ['Q3', 'budget', 'review'];
const HITS: Record<string, number[]> = {
  // page index -> hit count per term
  a3f9: [2, 1, 3],
  '7c10': [0, 0, 0], // Chinese page: no literal token hits
  bb21: [1, 1, 0],
  d904: [0, 0, 1],
};

// vector similarity 0..1 (meaning) — the Chinese page scores HIGHEST here:
// it's the closest in meaning to a budget query, even with zero keyword hits.
const VEC: Record<string, number> = { '7c10': 0.9, a3f9: 0.86, bb21: 0.42, d904: 0.3 };

// a tiny 5x4 heat grid per page (deterministic, no Math.random)
function heat(seed: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 20; i++) out.push(((seed * 7 + i * 13) % 11) / 10);
  return out;
}

export default function RetrievalFlow({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const zh = lang === 'zh';
  const gates = zh ? GATES_ZH : GATES;
  const explain = zh ? EXPLAIN_ZH : EXPLAIN;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setActive((p) => {
        if (p >= GATES.length - 1) {
          setPlaying(false);
          return p;
        }
        return p + 1;
      });
    }, 2200);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  const play = () => {
    setActive(0);
    setPlaying(true);
  };

  return (
    <div className="omem-rf">
      <style>{STYLES}</style>

      {/* gate rail */}
      <div className="rf-rail">
        <span className="rf-query">
          omem query <b>"Q3 budget review"</b>
        </span>
        {GATES.map((g, i) => (
          <button
            key={g}
            className="rf-gate"
            data-on={i === active ? 1 : 0}
            data-done={i < active ? 1 : 0}
            onClick={() => {
              setPlaying(false);
              setActive(i);
            }}
          >
            <span className="rf-gate-n">{i + 1}</span>
            <span className="rf-gate-l">{gates[i]}</span>
          </button>
        ))}
      </div>

      {/* stage canvas */}
      <div key={active} className="rf-stage">
        {active === 0 && <Expand zh={zh} />}
        {active === 1 && <Recall zh={zh} />}
        {active === 2 && <Fuse zh={zh} />}
        {active === 3 && <Rerank zh={zh} />}
        {active === 4 && <Hit zh={zh} />}
      </div>

      {/* plain-language explainer */}
      <div key={`x${active}`} className="rf-explain">
        <p className="rf-lead">{explain[active].lead}</p>
        <p className="rf-body">{explain[active].body}</p>
      </div>

      {/* controls */}
      <div className="rf-controls">
        <button className="rf-play" onClick={play}>
          {playing ? (zh ? '播放中…' : 'Playing…') : (zh ? '▶ 跑一遍查询' : '▶ Run the query')}
        </button>
        <span className="rf-hint">{zh ? '…或点上面任意一步' : '…or click a step above'}</span>
      </div>
    </div>
  );
}

/* ───────────────────────── Stage 1 · Query expansion ───────────────────────── */
function Expand({ zh }: { zh: boolean }) {
  void zh;
  return (
    <div className="rf-expand">
      <div className="rf-seed">"Q3 budget review"</div>
      <div className="rf-sprout">
        {EXPANSIONS.map((e, i) => (
          <div key={e} className="rf-chip" style={{ animationDelay: `${0.15 + i * 0.18}s` }}>
            {e}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Stage 2 · Two-path recall ───────────────────────── */
function Recall({ zh }: { zh: boolean }) {
  return (
    <div className="rf-recall">
      {/* BM25 keyword path */}
      <div className="rf-path">
        <div className="rf-path-h">
          {zh ? '关键词路径' : 'Keyword path'} · <span className="mono">BM25</span>
        </div>
        <table className="rf-bm25">
          <thead>
            <tr>
              <th></th>
              {TERMS.map((t) => (
                <th key={t} className="mono">
                  {t}
                </th>
              ))}
              <th className="rf-score-h">score</th>
            </tr>
          </thead>
          <tbody>
            {PAGES.map((p) => {
              const hits = HITS[p.id];
              const total = hits.reduce((a, b) => a + b, 0);
              return (
                <tr key={p.id} data-zero={total === 0 ? 1 : 0}>
                  <td className="rf-pg">{p.zh ? '中文页' : p.title.split(' ')[0]}</td>
                  {hits.map((h, i) => (
                    <td key={i}>
                      <span className="rf-cell" data-h={Math.min(h, 3)}>
                        {h > 0 ? h : ''}
                      </span>
                    </td>
                  ))}
                  <td>
                    <span className="rf-bar" style={{ width: `${total * 14 + (total ? 8 : 0)}px` }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* vector meaning path */}
      <div className="rf-path">
        <div className="rf-path-h">
          {zh ? '语义路径' : 'Meaning path'} · <span className="mono">vectors</span>
        </div>
        <div className="rf-vec">
          {PAGES.map((p, idx) => (
            <div key={p.id} className="rf-vrow">
              <span className="rf-pg">{p.zh ? '中文页' : p.title.split(' ')[0]}</span>
              <span className="rf-grid" aria-hidden>
                {heat(idx + 1).map((v, i) => (
                  <span key={i} className="rf-gc" style={{ opacity: 0.15 + v * 0.85 }} />
                ))}
              </span>
              <span className="rf-sim" data-hi={VEC[p.id] >= 0.8 ? 1 : 0}>
                {VEC[p.id].toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="rf-vnote">
          {zh ? (
            <>↑ 英文 query，中文页面——语义上的<b>最佳</b>匹配（<b>0.90</b>），尽管关键词零命中</>
          ) : (
            <>↑ English query, Chinese page — the <b>top</b> meaning match (<b>0.90</b>), despite zero keyword hits</>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Stage 3 · RRF fusion ───────────────────────── */
function Fuse({ zh }: { zh: boolean }) {
  // reciprocal rank: each list contributes 1/(rank) ; fuse and re-sort
  const bm25Rank = ['a3f9', 'bb21', 'd904']; // 中文页 absent from keyword list
  const vecRank = ['7c10', 'a3f9', 'bb21', 'd904']; // meaning path ranks 中文页 #1
  const rrf: Record<string, number> = {};
  bm25Rank.forEach((id, i) => (rrf[id] = (rrf[id] ?? 0) + 1 / (i + 1)));
  vecRank.forEach((id, i) => (rrf[id] = (rrf[id] ?? 0) + 1 / (i + 1)));
  const fused = Object.entries(rrf).sort((a, b) => b[1] - a[1]);
  const titleOf = (id: string) => PAGES.find((p) => p.id === id)!;

  return (
    <div className="rf-fuse">
      <div className="rf-lists">
        <div className="rf-list">
          <div className="rf-list-h">{zh ? '关键词排名' : 'Keyword ranks'}</div>
          {bm25Rank.map((id, i) => (
            <div key={id} className="rf-li">
              <span className="rf-rank mono">1/{i + 1}</span>
              <span>{titleOf(id).zh ? '中文页' : titleOf(id).title}</span>
            </div>
          ))}
        </div>
        <div className="rf-list">
          <div className="rf-list-h">{zh ? '语义排名' : 'Meaning ranks'}</div>
          {vecRank.map((id, i) => (
            <div key={id} className="rf-li">
              <span className="rf-rank mono">1/{i + 1}</span>
              <span>{titleOf(id).zh ? '中文页' : titleOf(id).title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rf-merge-arrow">{zh ? '＝ 把 1/rank 分数加起来 ＝' : '＝ add the 1/rank scores ＝'}</div>
      <div className="rf-list rf-fused">
        <div className="rf-list-h">{zh ? '融合候选池' : 'Fused pool'}</div>
        {fused.map(([id, score], i) => (
          <div key={id} className="rf-li" data-top={i === 0 ? 1 : 0} style={{ animationDelay: `${i * 0.12}s` }}>
            <span className="rf-rank mono">{score.toFixed(2)}</span>
            <span>{titleOf(id).zh ? '中文页 (第三季度预算评审)' : titleOf(id).title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Stage 4 · Rerank ───────────────────────── */
function Rerank({ zh }: { zh: boolean }) {
  const before = ['Atlas Q3 review deck', '中文页 (预算评审)', 'Acme contract draft'];
  const after = [
    { t: '中文页 (预算评审)', s: 0.94 },
    { t: 'Atlas Q3 review deck', s: 0.91 },
    { t: 'Acme contract draft', s: 0.38 },
  ];
  return (
    <div className="rf-rerank">
      <div className="rf-list">
        <div className="rf-list-h">{zh ? '融合后顺序' : 'Fused order'}</div>
        {before.map((t) => (
          <div key={t} className="rf-li">
            <span>{t}</span>
          </div>
        ))}
      </div>
      <div className="rf-encoder">
        <div className="rf-enc-box">cross-encoder</div>
        <div className="rf-enc-sub">{zh ? '把 query 和页面一起读' : 'reads query + page together'}</div>
      </div>
      <div className="rf-list rf-fused">
        <div className="rf-list-h">{zh ? '重排后' : 'Reranked'}</div>
        {after.map((r, i) => (
          <div key={r.t} className="rf-li" data-top={i === 0 ? 1 : 0} style={{ animationDelay: `${i * 0.14}s` }}>
            <span className="rf-rank mono">{r.s.toFixed(2)}</span>
            <span>{r.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Stage 5 · Hit ───────────────────────── */
function Hit({ zh }: { zh: boolean }) {
  return (
    <div className="rf-hit">
      <div className="rf-hit-row rf-hit-win">
        <span className="rf-medal mono">1</span>
        <span>中文页 — 第三季度预算评审</span>
        <span className="rf-hit-s mono">0.94</span>
      </div>
      <div className="rf-hit-row">
        <span className="rf-medal mono">2</span>
        <span>Atlas Q3 review deck</span>
        <span className="rf-hit-s mono">0.91</span>
      </div>
      <div className="rf-hit-ret mono">{zh ? '→ 作为排好序的命中返回给你的 agent' : '→ returned to your agent as ranked hits'}</div>
    </div>
  );
}

/* ───────────────────────── plain-language explainers ───────────────────────── */
const EXPLAIN = [
  {
    lead: 'First, qmd widens your question.',
    body: 'You typed three words, but the right page might use none of them. So qmd rewrites your query into related ways of saying the same thing — "Q3 budget review" also reaches "third-quarter financials" and "预算评审". Now the search looks for the idea, not just your exact wording. (The simpler default index, fts5, skips this and matches the words you typed.)',
  },
  {
    lead: 'Then it searches two ways at once.',
    body: 'Left — the keyword path counts how many of your words actually appear on each page; more hits, higher score. It nails exact names and codes, but a page written in Chinese scores zero because none of your English words literally appear. Right — the meaning path turns every page and your query into a grid of numbers (an "embedding") and compares them by similarity, so a Chinese page about budgets still matches an English budget query. Two nets, catching different fish.',
  },
  {
    lead: 'Next it merges the two result lists.',
    body: 'Each path produces a ranking. qmd gives every page a score of 1÷(its rank) on each list — 1st place is worth 1.0, 2nd is 0.5, 3rd 0.33 — then adds the two scores up. A page that did well on either path floats to the top of one combined pool. That Chinese page, invisible to keyword search, rides in on the meaning path.',
  },
  {
    lead: 'Then a reranker takes a closer look.',
    body: 'The merged list is good, but the scores so far judged the query and each page separately. The reranker (a "cross-encoder") reads your query and a page together, as one piece of text, and re-scores how well that page actually answers you. The list reshuffles into a sharper order. This step is the most accurate and the slowest — it\'s optional, and you can turn it off for speed.',
  },
  {
    lead: 'Finally, the best pages come back.',
    body: 'The top-ranked pages are returned to whoever asked — you at the terminal, or your AI agent. And the agent does one more pass you can\'t see here: it reads the short summaries and re-picks by real judgment, because a search score finds plausibly-related pages but only a reader knows which one truly answers the question.',
  },
];

const EXPLAIN_ZH = [
  {
    lead: '第一步，qmd 把你的问题"放宽"。',
    body: '你打了三个词，但真正对的那个页面可能一个都没用到。所以 qmd 把你的 query 改写成几种说同一件事的相关表述——"Q3 budget review" 也能触及 "third-quarter financials" 和 "预算评审"。这样搜索找的是这个意思，而不仅仅是你打的那几个字。（更简单的默认索引 fts5 跳过这一步，只匹配你打出来的词。）',
  },
  {
    lead: '然后它同时用两种方式来搜。',
    body: '左边——关键词路径数的是你的词在每个页面上实际出现了多少次；命中越多，分数越高。它擅长精确的名称和代号，但一个用中文写的页面会得零分，因为你的英文词一个都没字面出现。右边——语义路径把每个页面和你的 query 都变成一组数字（一个 "embedding"），再按相似度比对，于是一个讲预算的中文页面照样能匹配上英文的预算 query。两张网，捞的是不同的鱼。',
  },
  {
    lead: '接着它把两个结果列表合并。',
    body: '每条路径都产出一份排名。qmd 在每份列表上给每个页面打一个 1÷(它的名次) 的分——第 1 名值 1.0，第 2 名 0.5，第 3 名 0.33——然后把两个分加起来。任何一条路径上表现好的页面，都会浮到这个合并池的顶部。那个关键词搜索看不见的中文页面，就靠语义路径搭车上来了。',
  },
  {
    lead: '然后一个 reranker 凑近再看一眼。',
    body: '合并后的列表已经不错了，但到目前为止的打分都是把 query 和每个页面分开判的。reranker（一个 "cross-encoder"）把你的 query 和某个页面当成一整段文本一起读，重新评估这个页面到底有多对得上你的问题。列表随之重排成更精准的顺序。这一步最准也最慢——它是可选的，为了速度你可以把它关掉。',
  },
  {
    lead: '最后，最好的那些页面被返回。',
    body: '排名最高的几个页面被返回给发问的人——终端前的你，或是你的 AI agent。而 agent 还会再做一遍你在这里看不到的处理：它读那些简短摘要、用真正的判断重新挑选，因为搜索分数找出的是看起来相关的页面，但只有读过的人才知道哪一个真正回答了问题。',
  },
];

/* ───────────────────────── styles ───────────────────────── */
const STYLES = `
.omem-rf { width: 100%; border: 1px solid var(--sl-color-gray-5); border-radius: 0.5rem; overflow: hidden; margin: 1.5rem 0; background: var(--sl-color-black); }
.omem-rf .mono { font-family: var(--sl-font-mono); }

/* rail */
.rf-rail { display: flex; align-items: stretch; background: var(--sl-color-gray-7); border-bottom: 1px solid var(--sl-color-gray-5); overflow-x: auto; }
.rf-query { display: flex; align-items: center; gap: 0.3rem; padding: 0.6rem 0.85rem; font-family: var(--sl-font-mono); font-size: 0.74rem; color: var(--sl-color-gray-3); border-right: 1px solid var(--sl-color-gray-5); white-space: nowrap; flex-shrink: 0; }
.rf-query b { color: var(--sl-color-text-accent); font-weight: 600; }
.rf-gate { flex: 1 1 0; min-width: 5rem; border: none; border-right: 1px solid var(--sl-color-gray-5); background: transparent; cursor: pointer; padding: 0.85rem 0.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; transition: background 0.2s; }
.rf-gate:last-child { border-right: none; }
.rf-gate[data-on="1"] { background: var(--sl-color-black); box-shadow: inset 0 -2.5px 0 var(--sl-color-text-accent); }
.rf-gate-n { width: 1.25rem; height: 1.25rem; border-radius: 50%; display: grid; place-items: center; font-family: var(--sl-font-mono); font-size: 0.7rem; font-weight: 700; border: 1.5px solid var(--sl-color-gray-4); color: var(--sl-color-gray-3); transition: all 0.25s; }
.rf-gate[data-on="1"] .rf-gate-n { border-color: var(--sl-color-text-accent); color: var(--sl-color-black); background: var(--sl-color-text-accent); transform: scale(1.12); }
.rf-gate[data-done="1"] .rf-gate-n { border-color: var(--sl-color-text-accent); color: var(--sl-color-text-accent); }
.rf-gate-l { font-size: 0.74rem; font-weight: 600; color: var(--sl-color-gray-3); }
.rf-gate[data-on="1"] .rf-gate-l, .rf-gate[data-done="1"] .rf-gate-l { color: var(--sl-color-text-accent); }

/* stage canvas */
.rf-stage { padding: 1.3rem 1.1rem; min-height: 13rem; display: flex; align-items: center; justify-content: center; animation: rfFade 0.4s ease both; }
@keyframes rfFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rfPop { from { opacity: 0; transform: scale(0.85) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }

/* stage 1 expand */
.rf-expand { display: flex; flex-direction: column; align-items: center; gap: 1.1rem; }
.rf-seed { font-family: var(--sl-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--sl-color-text-accent); padding: 0.5rem 0.9rem; border: 1.5px solid var(--sl-color-text-accent); border-radius: 6px; }
.rf-sprout { display: flex; flex-wrap: wrap; gap: 0.55rem; justify-content: center; max-width: 32rem; }
.rf-chip { font-family: var(--sl-font-mono); font-size: 0.8rem; color: var(--sl-color-text); background: var(--sl-color-gray-6); border: 1px solid var(--sl-color-gray-5); border-radius: 5px; padding: 0.3rem 0.6rem; animation: rfPop 0.5s ease both; position: relative; }
.rf-chip::before { content: ''; position: absolute; top: -0.9rem; left: 50%; width: 1px; height: 0.9rem; background: var(--sl-color-gray-4); }

/* stage 2 recall */
.rf-recall { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; width: 100%; }
.rf-path-h { font-size: 0.82rem; font-weight: 700; color: var(--sl-color-text-accent); margin-bottom: 0.55rem; }
.rf-path-h .mono { font-weight: 500; color: var(--sl-color-gray-3); font-size: 0.76rem; }
.rf-bm25 { border-collapse: collapse; font-size: 0.74rem; width: 100%; }
.rf-bm25 th { font-family: var(--sl-font-mono); font-size: 0.66rem; font-weight: 500; color: var(--sl-color-gray-4); padding: 0.15rem 0.3rem; text-align: center; }
.rf-bm25 th.rf-score-h { text-align: left; }
.rf-bm25 td { padding: 0.18rem 0.3rem; text-align: center; }
.rf-pg { font-size: 0.74rem; color: var(--sl-color-text); text-align: left !important; white-space: nowrap; }
.rf-bm25 tr[data-zero="1"] .rf-pg { color: var(--sl-color-gray-4); }
.rf-cell { display: inline-grid; place-items: center; width: 1.35rem; height: 1.35rem; border-radius: 3px; font-family: var(--sl-font-mono); font-size: 0.7rem; background: var(--sl-color-gray-7); color: transparent; transition: all 0.3s; }
.rf-cell[data-h="1"] { background: color-mix(in srgb, var(--sl-color-text-accent) 30%, transparent); color: var(--sl-color-text-accent); }
.rf-cell[data-h="2"] { background: color-mix(in srgb, var(--sl-color-text-accent) 55%, transparent); color: var(--sl-color-text); }
.rf-cell[data-h="3"] { background: color-mix(in srgb, var(--sl-color-text-accent) 80%, transparent); color: var(--sl-color-black); }
.rf-bar { display: inline-block; height: 0.5rem; background: var(--sl-color-text-accent); border-radius: 3px; transition: width 0.5s ease; min-width: 0; }
.rf-vec { display: flex; flex-direction: column; gap: 0.4rem; }
.rf-vrow { display: flex; align-items: center; gap: 0.55rem; }
.rf-vrow .rf-pg { flex: 0 0 4rem; }
.rf-grid { display: grid; grid-template-columns: repeat(5, 0.55rem); grid-auto-rows: 0.55rem; gap: 1px; flex-shrink: 0; }
.rf-gc { background: var(--sl-color-text-accent); border-radius: 1px; }
.rf-sim { font-family: var(--sl-font-mono); font-size: 0.74rem; color: var(--sl-color-gray-3); margin-left: auto; }
.rf-sim[data-hi="1"] { color: var(--sl-color-text-accent); font-weight: 700; }
.rf-vnote { margin-top: 0.5rem; font-size: 0.72rem; color: var(--sl-color-gray-3); }
.rf-vnote b { color: var(--sl-color-text-accent); }

/* stage 3 fuse + 4 rerank shared list look */
.rf-fuse, .rf-rerank { display: flex; align-items: center; gap: 0.9rem; width: 100%; flex-wrap: wrap; justify-content: center; }
.rf-lists { display: flex; gap: 0.9rem; }
.rf-list { background: var(--sl-color-gray-7); border: 1px solid var(--sl-color-gray-5); border-radius: 6px; padding: 0.5rem 0.6rem; min-width: 9rem; }
.rf-list-h { font-size: 0.68rem; font-family: var(--sl-font-mono); color: var(--sl-color-gray-4); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.04em; }
.rf-li { display: flex; align-items: baseline; gap: 0.45rem; font-size: 0.76rem; color: var(--sl-color-text); padding: 0.18rem 0; animation: rfPop 0.45s ease both; }
.rf-rank { font-size: 0.7rem; color: var(--sl-color-gray-3); flex-shrink: 0; }
.rf-fused { background: var(--sl-color-black); border-color: var(--sl-color-text-accent); }
.rf-li[data-top="1"] { color: var(--sl-color-text-accent); font-weight: 700; }
.rf-li[data-top="1"] .rf-rank { color: var(--sl-color-text-accent); }
.rf-merge-arrow { font-family: var(--sl-font-mono); font-size: 0.7rem; color: var(--sl-color-gray-4); white-space: nowrap; }
.rf-encoder { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.rf-enc-box { font-family: var(--sl-font-mono); font-size: 0.78rem; font-weight: 700; color: var(--sl-color-text-accent); border: 1.5px dashed var(--sl-color-text-accent); border-radius: 6px; padding: 0.5rem 0.7rem; }
.rf-enc-sub { font-size: 0.66rem; color: var(--sl-color-gray-4); max-width: 7rem; text-align: center; }

/* stage 5 hit */
.rf-hit { display: flex; flex-direction: column; gap: 0.45rem; width: 100%; max-width: 26rem; }
.rf-hit-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--sl-color-text); padding: 0.5rem 0.7rem; border: 1px solid var(--sl-color-gray-5); border-radius: 6px; background: var(--sl-color-gray-7); animation: rfPop 0.5s ease both; }
.rf-hit-win { border-color: var(--sl-color-text-accent); background: var(--sl-color-black); color: var(--sl-color-text-accent); font-weight: 700; }
.rf-medal { width: 1.3rem; height: 1.3rem; border-radius: 50%; display: grid; place-items: center; font-size: 0.72rem; font-weight: 700; border: 1.5px solid currentColor; flex-shrink: 0; }
.rf-hit-s { margin-left: auto; font-size: 0.78rem; }
.rf-hit-ret { font-size: 0.72rem; color: var(--sl-color-gray-3); margin-top: 0.35rem; }

/* explainer */
.rf-explain { padding: 0 1.2rem 0.4rem; }
.rf-lead { margin: 0 0 0.45rem; font-size: 0.98rem; font-weight: 700; color: var(--sl-color-text-accent); }
.rf-body { margin: 0; font-size: 0.9rem; line-height: 1.65; color: var(--sl-color-gray-2); }

/* controls */
.rf-controls { display: flex; align-items: center; gap: 0.8rem; padding: 0.85rem 1.2rem; border-top: 1px solid var(--sl-color-gray-5); }
.rf-play { padding: 0.4rem 0.9rem; border-radius: 5px; border: 1px solid var(--sl-color-text-accent); background: transparent; color: var(--sl-color-text-accent); cursor: pointer; font-weight: 600; font-size: 0.85rem; }
.rf-hint { font-size: 0.78rem; color: var(--sl-color-gray-4); }

@media (max-width: 640px) {
  .rf-recall { grid-template-columns: 1fr; }
  .rf-query b { display: none; }
  .rf-lists { flex-direction: column; }
}
`;
