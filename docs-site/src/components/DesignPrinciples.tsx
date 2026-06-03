/**
 * DesignPrinciples — a browsable set of the eight principles for concepts/06.
 *
 * Eight are parallel tenets, not a linear story — so this is a scannable grid
 * of editorial principle cards. Click a card to expand its deeper rationale
 * inline (P3 wiki-as-truth, P7 Stable-A vs Stable-B). Numbered like a manifesto,
 * EB Garamond display titles, pure monochrome (BRAND §7.1), no emoji.
 *
 * Content from docs/user-docs/_design-intent.md §1 (P1–P8).
 */
import { useState } from 'react';

type Principle = {
  n: string;
  short: string;     // the tenet, one editorial line
  what: string;      // what it is
  means: string;     // what it means for you / the deeper why
  short_zh: string;
  what_zh: string;
  means_zh: string;
};

const PRINCIPLES: Principle[] = [
  {
    n: '01',
    short: 'The whole office, every format — captured completely.',
    what: 'OMem ingests your real work context: mail, calendar, meeting notes, and files in every format office work lives in — Word, PowerPoint, Excel, PDF (digital and scanned), images, HTML, Markdown, .eml/.msg, .ics.',
    means: 'Coverage is the point. Each format gets a dedicated parser tuned to keep what generic tools drop — embedded charts in a spreadsheet, merged cells, speaker notes, images inside documents, tracked changes and comments. Pictures matter as much as text, so they’re described, not discarded. M365 is the most-mature entry point, not the whole story.',
    short_zh: '整个办公世界，每一种格式——完整收录。',
    what_zh: 'OMem 摄入你真实的工作上下文：邮件、日历、会议记录，以及办公工作所在的每一种文件格式——Word、PowerPoint、Excel、PDF（电子版和扫描件）、图片、HTML、Markdown、.eml/.msg、.ics。',
    means_zh: '覆盖面就是关键。每种格式都有专属 parser，专门保留通用工具会丢掉的东西——表格里嵌入的图表、合并单元格、演讲者备注、文档里的图片、修订记录和批注。图片和文字一样重要，所以会被描述出来，而不是丢弃。M365 是最成熟的入口，而不是故事的全部。',
  },
  {
    n: '02',
    short: 'The wiki is the truth; the index is just an opinion.',
    what: 'Three layers, in order of authority: an immutable raw/ archive, the curated wiki on top of it, and indexes on top of that. Delete the indexes — they rebuild from the wiki. Delete the wiki — it rebuilds from raw/. raw/ is never deleted.',
    means: 'OMem doesn’t hide your memory inside a vector blob you can’t read. The truth is plain Markdown on your disk — read it, grep it, edit it, version it, open it in Obsidian. This is Karpathy’s “LLM wiki” idea made into a product: the human-readable wiki is also the retrieval corpus. Indexes are accelerators, never the source.',
    short_zh: 'wiki 才是真相，索引只是一种意见。',
    what_zh: '三层结构，按权威性排序：不可变的 raw/ 归档，在它之上是精修的 wiki，再往上才是索引。删掉索引——它会从 wiki 重建；删掉 wiki——它会从 raw/ 重建；raw/ 永不删除。',
    means_zh: 'OMem 不会把你的记忆藏进一个你读不懂的向量 blob 里。真相是你硬盘上的纯 Markdown——你可以读它、grep 它、改它、做版本管理、用 Obsidian 打开它。这正是 Karpathy 那个"LLM wiki"想法落地成的产品：人类可读的 wiki 同时也是检索语料。索引只是加速器，永远不是源头。',
  },
  {
    n: '03',
    short: 'Deterministic parsing — an archive you can trust in three years.',
    what: 'The default parser chain uses real libraries (python-docx, pymupdf, …), not an LLM. The same file produces byte-identical Markdown years from now; numbers and proper nouns survive verbatim.',
    means: 'The key distinction is Stable-A (content-immutable — the same input rebuilds byte-identical, which only a deterministic function gives) vs. Stable-B (frozen on disk — anything written down has this). An LLM parser only gives Stable-B: model retirement or sampling drift means you can’t rebuild the same parsed.md later, and it smooths unusual text (an oddly specific 11.3% can quietly become a rounder 11%). Because raw/<sha>/parsed.md is OMem’s archival truth, the default stays deterministic; an optional parser-llm is reserved for those who want layout understanding over archival fidelity.',
    short_zh: '确定性解析——三年后依然可信的归档。',
    what_zh: '默认的 parser 链用的是真实的库（python-docx、pymupdf 等），不是 LLM。同一个文件多年以后产出的 Markdown 逐字节一致；数字和专有名词原样保留。',
    means_zh: '关键区分在于 Stable-A（内容不可变——同样的输入能重建出逐字节一致的结果，只有确定性函数才给得了）和 Stable-B（落盘冻结——任何写下来的东西都有这个性质）。LLM parser 只给得了 Stable-B：模型退役或采样漂移意味着你日后没法重建出同一份 parsed.md，而且它会把不寻常的文本"抹平"（一个怪具体的 11.3% 可能悄悄变成更圆整的 11%）。因为 raw/<sha>/parsed.md 是 OMem 的归档真相，默认就保持确定性；可选的 parser-llm 留给那些宁要版面理解、不那么在意归档保真度的人。',
  },
  {
    n: '04',
    short: 'Hands-off, and always fresh.',
    what: 'After setup, OMem runs itself as a short batch fired by the OS scheduler every few minutes — no daemon, no PID, no memory leak. It manages the full lifecycle: incremental sync, email threads merged into one page, attachments handled, deletions soft-tombstoned and revived if the source returns.',
    means: 'You don’t feed it and you don’t babysit it — it keeps your context current on its own, and every run is legible (per-phase progress, a queryable history). “Zero ops” rests on this: short-lived processes recover cleanly from disk state, and setup-to-first-query is a guided few minutes, not a project.',
    short_zh: '免打理，永远是最新的。',
    what_zh: '装好之后，OMem 由操作系统调度器每隔几分钟拉起一次，跑一个短小的批处理——没有常驻进程、没有 PID、没有内存泄漏。它管好整个生命周期：增量同步、把邮件线程合并成一个页面、处理附件、删除项做软墓碑标记、源头若恢复则自动复活。',
    means_zh: '你不用喂它，也不用看着它——它自己把你的上下文保持在最新状态，而且每一次运行都清清楚楚（分阶段进度、可查询的历史）。"零运维"就建立在这之上：短命进程能干净地从磁盘状态恢复，从装好到第一次查询是有引导的几分钟，而不是一个项目。',
  },
  {
    n: '05',
    short: 'Token-thrifty by design.',
    what: 'Agents read at four progressive-disclosure levels — a one-line abstract (L0), the curated page (L1), the full parsed source (L2), the original file (L3) — and stop as soon as they have enough. Curation is cached by content hash.',
    means: 'An agent skims cheap abstracts first and drills only on demand, so most questions cost ~2k tokens, not 80k. And because every LLM curation call is cached, adding a hundred new documents touches the LLM a hundred times — not the whole corpus. For a large inbox that’s the difference between $10 and $5,000.',
    short_zh: '从设计上就省 token。',
    what_zh: 'agent 按四个渐进披露层级来读——一行摘要（L0）、精修页面（L1）、完整解析源文（L2）、原始文件（L3）——一旦够用就停。精修过程按内容哈希做缓存。',
    means_zh: 'agent 先扫便宜的摘要，只在需要时才往下钻，所以多数问题只花约 2k token，而不是 80k。而且因为每一次 LLM 精修调用都被缓存，新增一百份文档只会触碰 LLM 一百次——不是整个语料库。对一个很大的收件箱来说，这就是 $10 和 $5,000 的差别。',
  },
  {
    n: '06',
    short: 'Retrieval that’s actually good — and pluggable.',
    what: 'v1.0 ships fts5 (BM25 over jieba-segmented tokens) as a genuinely strong default. The optional qmd plugin swaps in multi-path retrieval: BM25 + vector embeddings + query expansion + a reranker, fully local.',
    means: 'The default isn’t a placeholder you must upgrade away from — plugins offer different trade-offs (speed vs. recall, keyword vs. semantic), not a fix for a weak baseline. Chinese is a first-class citizen, not an afterthought. The Retrieval concept page covers how the multi-path stack works.',
    short_zh: '检索是真的好用——而且可插拔。',
    what_zh: 'v1.0 自带 fts5（在 jieba 分词后的 token 上跑 BM25）作为一个真正强的默认项。可选的 qmd 插件换上多路检索：BM25 + 向量 embedding + query expansion + 一个 reranker，全部本地运行。',
    means_zh: '默认项不是那种你必须尽快升级掉的占位货——插件提供的是不同取舍（速度 vs. 召回、关键词 vs. 语义），而不是给一个孱弱基线打补丁。中文是一等公民，不是事后补的。多路检索栈如何运作，「检索」那一章讲了。',
  },
  {
    n: '07',
    short: 'The CLI is the only interface; everything else is a thin wrapper.',
    what: 'omem is the authoritative API. A Skill and an MCP server are thin wrappers that shell out to it; any agent that can shell out can use OMem. It works with whatever LLM provider you configure.',
    means: 'The agent layer is volatile — this year’s favorite isn’t next year’s — so the memory layer underneath is deliberately not bound to any one agent. Because sources read what your OS already has access to, there’s no Graph API, no admin consent, no IT ticket in the loop.',
    short_zh: 'CLI 是唯一的接口，其余都是薄封装。',
    what_zh: 'omem 是权威 API。skill 和 MCP server 都是调用它的薄封装；任何能 shell out 的 agent 都能用 OMem。无论你配什么 LLM 提供商，它都能用。',
    means_zh: 'agent 这一层是易变的——今年的宠儿不是明年的宠儿——所以底下的记忆层有意不绑定到任何单一 agent。因为 source 读的是你操作系统本就有权限访问的东西，整条链路里没有 Graph API、没有管理员授权、没有 IT 工单。',
  },
  {
    n: '08',
    short: 'It’s yours, and it’s portable.',
    what: 'The wiki is a folder of open-format Markdown files in a location you choose — the default, an Obsidian vault, a git repo.',
    means: 'Your work context belongs to you, not to a vendor cloud or a SaaS tenant. Back it up, version-control it, hand-edit a page, carry it to a new machine. Nothing locks you into OMem — which is exactly why you can trust it with years of work.',
    short_zh: '它是你的，而且可带走。',
    what_zh: 'wiki 就是一个由开放格式 Markdown 文件组成的文件夹，放在你选的位置——默认位置、一个 Obsidian vault，或一个 git 仓库。',
    means_zh: '你的工作上下文属于你，不属于哪个厂商云或 SaaS 租户。备份它、做版本管理、手改某一页、把它带到新机器上。没有任何东西把你锁死在 OMem 里——而这恰恰是你能放心把多年工作交给它的原因。',
  },
];

export default function DesignPrinciples({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const zh = lang === 'zh';
  const [open, setOpen] = useState<number | null>(1); // wiki-is-truth open by default — the soul

  return (
    <div style={{ width: '100%', margin: '1.5rem 0' }}>
      <style>{`
        .omem-dp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.9rem; }
        @media (max-width: 640px) { .omem-dp-grid { grid-template-columns: 1fr; } }

        .omem-dp-card {
          text-align: left; width: 100%; cursor: pointer;
          border: 0.5px solid var(--sl-color-gray-5); border-radius: 7px;
          background: var(--sl-color-black); padding: 1rem 1.1rem;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          display: block;
        }
        .omem-dp-card[data-open="1"] { border-color: var(--sl-color-text-accent); box-shadow: inset 3px 0 0 var(--sl-color-text-accent); background: var(--sl-color-accent-low); }
        .omem-dp-card:hover { border-color: var(--sl-color-gray-4); }

        .omem-dp-head { display: flex; align-items: baseline; gap: 0.7rem; }
        .omem-dp-n { font-family: var(--sl-font-mono); font-size: 0.78rem; font-weight: 700; color: var(--sl-color-gray-3); flex-shrink: 0; }
        .omem-dp-short { font-family: var(--omem-serif, 'EB Garamond', serif); font-weight: 500; font-size: 1.12rem; line-height: 1.25; color: var(--sl-color-text-accent); }

        .omem-dp-what { margin: 0.6rem 0 0; font-size: 0.86rem; line-height: 1.55; color: var(--sl-color-gray-2); }
        .omem-dp-body { margin: 0.7rem 0 0; padding-top: 0.7rem; border-top: 0.5px solid var(--sl-color-gray-5); font-size: 0.86rem; line-height: 1.6; color: var(--sl-color-gray-2); animation: omemDpReveal 0.3s ease both; }
        .omem-dp-hint { margin: 0.55rem 0 0; font-family: var(--sl-font-mono); font-size: 0.68rem; letter-spacing: 0.04em; color: var(--sl-color-gray-4); }
        @keyframes omemDpReveal { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="omem-dp-grid">
        {PRINCIPLES.map((p, i) => {
          const isOpen = open === i;
          return (
            <button
              key={p.n}
              className="omem-dp-card"
              data-open={isOpen ? '1' : '0'}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <div className="omem-dp-head">
                <span className="omem-dp-n">{p.n}</span>
                <span className="omem-dp-short">{zh ? p.short_zh : p.short}</span>
              </div>
              <p className="omem-dp-what">{zh ? p.what_zh : p.what}</p>
              {isOpen ? (
                <p className="omem-dp-body">{zh ? p.means_zh : p.means}</p>
              ) : (
                <p className="omem-dp-hint">{zh ? '点击展开 →' : 'click to expand →'}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
