/**
 * QueryFlow — a stepped agent↔OMem transcript for concepts/07.
 *
 * Distinct form from the other concept components: a simulated trace of how a
 * well-behaved agent actually uses OMem to answer a question — skim L0, read
 * L1, drill only if needed, and answer (or, on a miss, fall back gracefully).
 * Step through it; each step adds a turn and a one-line note on what the agent
 * is doing and why. Monochrome (BRAND §7.1), no emoji, terminal-flavored mono.
 *
 * Facts: docs/user-docs/_design-intent.md §3 (read-only; score is coarse rank,
 * the agent re-ranks; 0 hits = answer normally; L0–L3 disclosure).
 */
import { useState } from 'react';

type Turn = {
  who: 'user' | 'agent' | 'omem';
  text: string;
  note: string;
  text_zh: string;
  note_zh: string;
};

const TURNS: Turn[] = [
  {
    who: 'user',
    text: 'What were the open items we promised to revisit from the Acme Q3 review?',
    note: 'A question about your real work — the kind an agent normally has no context for.',
    text_zh: 'Acme 第三季度评审里我们答应要再过一遍的待办项有哪些？',
    note_zh: '一个关于你真实工作的问题——这种问题 agent 平时是没有上下文可答的。',
  },
  {
    who: 'agent',
    text: 'omem query "Acme Q3 review open items" --format json --limit 20',
    note: 'The agent casts a wide net at L0 first — up to 20 hits, each a one-line abstract (~100 tokens). It does not open any document yet; it just wants to see what exists.',
    text_zh: 'omem query "Acme Q3 review open items" --format json --limit 20',
    note_zh: 'agent 先在 L0 撒一张大网——最多 20 条命中，每条是一行摘要（约 100 token）。它此刻还没打开任何文档，只是想看看都有什么。',
  },
  {
    who: 'omem',
    text:
      'score 0.94 · cal  c0d2e518 · "Q3 review · Acme"\n   abstract: 60-min review meeting with Acme; agenda covered budget, scope, timeline.\n\n' +
      'score 0.71 · mail a3f9c2bd · "Re: Acme Q3 — open items"\n   abstract: Thread closing the review — Bob proposed dropping scope item 3, Carol\n   pushed back, agreed to revisit next quarter; pricing tier parked pending legal.\n\n' +
      'score 0.55 · file 7e4b1d08 · "acme-q3-review.pptx"\n   abstract: Deck presented at the review; slides on budget scenarios and roadmap.',
    note: 'The hits come back ranked by a backend score — and notice the trap: the TOP hit (0.94, the calendar invite) is only plausibly related; its abstract is just "we met and discussed". The real answer is hit #2 (0.71), whose abstract literally states the decisions. The score finds candidates; the abstract is the actual signal.',
    text_zh:
      'score 0.94 · cal  c0d2e518 · "Q3 review · Acme"\n   abstract: 与 Acme 的 60 分钟评审会；议程涵盖预算、范围、时间线。\n\n' +
      'score 0.71 · mail a3f9c2bd · "Re: Acme Q3 — open items"\n   abstract: 收尾这次评审的邮件线程——Bob 提议砍掉范围项 3，Carol\n   反对，同意下季度再议；定价档位因法务待定而搁置。\n\n' +
      'score 0.55 · file 7e4b1d08 · "acme-q3-review.pptx"\n   abstract: 评审上展示的 deck；幻灯片讲预算情景和路线图。',
    note_zh: '命中按后端的 score 排序回来——注意这里的陷阱：排第一的命中（0.94，那条日历邀请）只是看起来相关，它的摘要不过是"我们开会讨论过"。真正的答案是第 2 条（0.71），它的摘要白纸黑字写明了那些决定。score 找出候选，摘要才是真正的信号。',
  },
  {
    who: 'agent',
    text: 'omem page get a3f9c2bd          # not the 0.94 hit — the one whose abstract matched',
    note: 'So the agent re-ranks by reading the abstracts itself and opens hit #2 at L1 — the curated wiki page (~500–2000 tokens) — not the higher-scored but less useful calendar invite. This self-rerank is the heart of using OMem well.',
    text_zh: 'omem page get a3f9c2bd          # 不是 0.94 那条——是摘要真正对上的那条',
    note_zh: '于是 agent 自己读摘要、重新排序，打开第 2 条命中的 L1——精修过的 wiki 页面（约 500–2000 token）——而不是分数更高却没那么有用的日历邀请。这种自我重排正是用好 OMem 的核心。',
  },
  {
    who: 'omem',
    text: '# Acme Q3 — open items\n• Scope item 3: Bob proposed dropping it; Carol pushed back.\n  Agreed to revisit next quarter.\n• Pricing tier: parked pending legal.',
    note: 'The L1 page has the answer in clean prose. No need to drill to L2 (full parsed source) or L3 (the original file) — those exist for when a question demands an exact table row or the native file.',
    text_zh: '# Acme Q3 — open items\n• 范围项 3：Bob 提议砍掉；Carol 反对。\n  同意下季度再议。\n• 定价档位：因法务待定而搁置。',
    note_zh: 'L1 页面用清爽的文字把答案写明白了。不需要再往 L2（完整解析源文）或 L3（原始文件）钻——那两层是留给那种非要精确的某一行表格数据、或非要原生文件的问题的。',
  },
  {
    who: 'agent',
    text: 'Two items were carried over: (1) scope item 3 — Bob wanted it dropped, Carol disagreed, you agreed to revisit this quarter; (2) the pricing tier, parked pending legal.   [source: …/acme-q3-open-items.md]',
    note: 'The agent answers from your actual history — grounded, specific, names and decisions, with a citation back to the page so you can verify. This is the whole point: context it never had before.',
    text_zh: '有两项被延续了下来：(1) 范围项 3——Bob 想砍掉，Carol 不同意，你们同意本季度再议；(2) 定价档位，因法务待定而搁置。   [source: …/acme-q3-open-items.md]',
    note_zh: 'agent 是基于你真实的历史来回答的——有依据、具体、带人名和决定，还附上了回指页面的引用，方便你核对。这正是关键所在：它拥有了从前没有过的上下文。',
  },
];

const FALLBACK: Turn = {
  who: 'omem',
  text: '(no results)',
  note: 'And when nothing matches? OMem returns empty, and a well-behaved agent simply answers from its own knowledge instead of inventing a citation. A miss is normal — never a reason to fabricate.',
  text_zh: '(no results)',
  note_zh: '那要是什么都没匹配上呢？OMem 返回空，行为良好的 agent 就直接用它自己的知识来回答，而不是凭空编一个引用出来。没命中是常态——绝不是编造的理由。',
};

const LABEL: Record<Turn['who'], string> = { user: 'You', agent: 'Agent', omem: 'omem' };
const LABEL_ZH: Record<Turn['who'], string> = { user: '你', agent: 'Agent', omem: 'omem' };

export default function QueryFlow({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const zh = lang === 'zh';
  const labels = zh ? LABEL_ZH : LABEL;
  const [step, setStep] = useState(1); // how many turns are revealed
  const [showFallback, setShowFallback] = useState(false);
  const shown = TURNS.slice(0, step);
  const atEnd = step >= TURNS.length;

  return (
    <div style={{ width: '100%', border: '1px solid var(--sl-color-gray-5)', borderRadius: '0.5rem', overflow: 'hidden', margin: '1.5rem 0', background: 'var(--sl-color-black)' }}>
      <style>{`
        .omem-qf-turn { display: grid; grid-template-columns: 4.5rem 1fr; gap: 0.9rem; padding: 0.8rem 1.1rem; border-top: 0.5px solid var(--sl-color-hairline); animation: omemQfIn 0.35s ease both; }
        .omem-qf-turn:first-child { border-top: none; }
        @media (max-width: 600px) { .omem-qf-turn { grid-template-columns: 1fr; gap: 0.3rem; } }
        .omem-qf-who { font-family: var(--sl-font-mono); font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--sl-color-gray-4); padding-top: 0.15rem; }
        .omem-qf-who[data-w="omem"] { color: var(--sl-color-text-accent); font-weight: 700; }
        .omem-qf-text { font-family: var(--sl-font-mono); font-size: 0.82rem; line-height: 1.55; color: var(--sl-color-text); white-space: pre-wrap; word-break: break-word; }
        .omem-qf-text[data-w="user"] { font-family: var(--omem-serif, serif); font-size: 1rem; font-style: italic; color: var(--sl-color-text-accent); }
        .omem-qf-note { margin: 0.4rem 0 0; font-size: 0.8rem; line-height: 1.5; color: var(--sl-color-gray-3); font-family: var(--sl-font); }
        @keyframes omemQfIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .omem-qf-bar { display: flex; gap: 0.6rem; align-items: center; padding: 0.75rem 1.1rem; border-top: 0.5px solid var(--sl-color-gray-5); flex-wrap: wrap; }
        .omem-qf-btn { padding: 0.4rem 0.9rem; border-radius: 4px; border: 1px solid var(--sl-color-text-accent); background: transparent; color: var(--sl-color-text-accent); cursor: pointer; font-weight: 600; font-size: 0.82rem; }
        .omem-qf-btn[disabled] { opacity: 0.4; cursor: default; }
      `}</style>

      {shown.map((t, i) => (
        <div key={i} className="omem-qf-turn">
          <div className="omem-qf-who" data-w={t.who}>{labels[t.who]}</div>
          <div>
            <div className="omem-qf-text" data-w={t.who}>{zh ? t.text_zh : t.text}</div>
            <p className="omem-qf-note">{zh ? t.note_zh : t.note}</p>
          </div>
        </div>
      ))}

      {showFallback && (
        <div className="omem-qf-turn">
          <div className="omem-qf-who" data-w={FALLBACK.who}>{labels[FALLBACK.who]}</div>
          <div>
            <div className="omem-qf-text" data-w={FALLBACK.who}>{zh ? FALLBACK.text_zh : FALLBACK.text}</div>
            <p className="omem-qf-note">{zh ? FALLBACK.note_zh : FALLBACK.note}</p>
          </div>
        </div>
      )}

      <div className="omem-qf-bar">
        {!atEnd && (
          <button className="omem-qf-btn" onClick={() => setStep((s) => s + 1)}>{zh ? '下一步' : 'Next step'}</button>
        )}
        {atEnd && !showFallback && (
          <button className="omem-qf-btn" onClick={() => setShowFallback(true)}>{zh ? '要是什么都没匹配上呢？' : 'What if nothing matches?'}</button>
        )}
        {(atEnd || step > 1) && (
          <button className="omem-qf-btn" style={{ borderColor: 'var(--sl-color-gray-5)', color: 'var(--sl-color-gray-3)' }} onClick={() => { setStep(1); setShowFallback(false); }}>{zh ? '重新开始' : 'Restart'}</button>
        )}
        <span style={{ fontSize: '0.78rem', color: 'var(--sl-color-gray-4)', fontFamily: 'var(--sl-font-mono)' }}>
          {showFallback ? (zh ? '没命中的情形' : 'the miss case') : (zh ? `第 ${step} / ${TURNS.length} 轮` : `turn ${step} / ${TURNS.length}`)}
        </span>
      </div>
    </div>
  );
}
