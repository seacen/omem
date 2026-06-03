/**
 * PositioningMatrix — interactive competitive positioning for concepts/01.
 *
 * Three properties define OMem's space: Local-first / Auto-ingest real work /
 * Agent-agnostic. No competitor satisfies all three. Click a competitor to see
 * which properties it has (✓) and which it lacks (✗) — OMem is the only row
 * that's all-green.
 *
 * Positioning language is grounded in docs/promo (A1/A2/A3). Facts in
 * docs/user-docs/_design-intent.md §0.5.
 */
import { useState } from 'react';

type Row = {
  name: string;
  local: boolean;
  autoIngest: boolean;
  agentAgnostic: boolean;
  note: string;
  note_zh: string;
};

const ROWS: Row[] = [
  {
    name: 'OMem',
    local: true,
    autoIngest: true,
    agentAgnostic: true,
    note: 'The only tool at the intersection of all three: your data stays on your machine, it auto-ingests the real work where it already lives, and the same memory feeds any agent.',
    note_zh: '唯一同时占住这三点的工具：数据留在你电脑上，自动摄入工作本来所在的地方，而且同一份记忆能喂给任何 agent。',
  },
  {
    name: 'mem0 / Letta / Zep',
    local: false,
    autoIngest: false,
    agentAgnostic: false,
    note: 'Chat-memory SDKs for app builders. They remember what was said in conversations with an agent — they don\'t read your inbox or open your PDFs. Infrastructure for developers building chat products, not a product for a knowledge worker handing context to an agent.',
    note_zh: '面向应用开发者的对话记忆 SDK。它们记住的是你跟 agent 聊过什么，并不会去读你的邮箱、打开你的 PDF。那是给开发者做对话产品用的基础设施，不是给职场用户把上下文交给 agent 的成品。',
  },
  {
    name: 'OpenViking',
    local: true,
    autoIngest: false,
    agentAgnostic: true,
    note: 'The closest neighbor on the technical axes — ByteDance\'s open-source context database. It IS local-first (self-host via Docker / pip / Ollama) and IS agent-agnostic (any MCP client). OMem even borrowed its L0–L3 progressive-disclosure idea from OpenViking\'s tiered loading. The one column it misses is the decisive one: you feed content in programmatically (ov add-resource …). It doesn\'t auto-ingest the real work — the inbox, the OneDrive folder, the PDFs — already sitting on your machine. OMem is the product that fills that structure automatically, from your actual office work.',
    note_zh: '技术维度上最接近的邻居——字节跳动开源的 context database。它确实本地优先（可用 Docker / pip / Ollama 自托管），也确实 agent 中立（任何 MCP 客户端）；OMem 的 L0–L3 渐进式披露甚至借鉴了它的分层加载。但它缺的那一列恰恰是决定性的：内容要你用程序喂进去（ov add-resource …），它不会自动摄入你电脑上本就存在的真实工作——收件箱、OneDrive 文件夹、那些 PDF。OMem 正是那个能从你真实办公工作中自动把这套结构填满的成品。',
  },
  {
    name: 'Glean / Copilot',
    local: false,
    autoIngest: true,
    agentAgnostic: false,
    note: 'Enterprise search SaaS. They do ingest real work — but into a vendor cloud, behind IT onboarding and admin consent, and the index only feeds their own assistant (Glean\'s index doesn\'t feed your Claude Code). Their ceiling is "assist".',
    note_zh: '企业搜索 SaaS。它们确实摄入真实工作，但是摄入到厂商云里，要走 IT 部署和管理员授权，而且索引只喂它们自己的助手（Glean 的索引喂不到你的 Claude Code）。它们的上限是"辅助"。',
  },
  {
    name: 'Obsidian / Notion',
    local: true,
    autoIngest: false,
    agentAgnostic: false,
    note: 'Local PKM tools — wonderful, but they only remember what you manually type in. They don\'t auto-ingest the inbox you live in or the PDFs in your Downloads folder.',
    note_zh: '本地 PKM 工具——很好用，但它们只记得你手动录进去的东西，不会自动摄入你天天用的收件箱，或是 Downloads 里的 PDF。',
  },
  {
    name: 'GBrain',
    local: true,
    autoIngest: false,
    agentAgnostic: true,
    note: 'Closest in philosophy (markdown-as-memory, agent-agnostic). But it\'s bring-your-own-markdown — you write the notes yourself. It doesn\'t auto-ingest your real office data.',
    note_zh: '理念上最接近（markdown 即记忆、agent 中立）。但它是自带 markdown——笔记得你自己写，它不会自动摄入你真实的办公数据。',
  },
];

const PROPS_EN: { key: keyof Row; label: string }[] = [
  { key: 'local', label: 'Local-first' },
  { key: 'autoIngest', label: 'Auto-ingest real work' },
  { key: 'agentAgnostic', label: 'Agent-agnostic' },
];
const PROPS_ZH: { key: keyof Row; label: string }[] = [
  { key: 'local', label: '本地优先' },
  { key: 'autoIngest', label: '自动摄入真实工作' },
  { key: 'agentAgnostic', label: 'agent 中立' },
];

export default function PositioningMatrix({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const [active, setActive] = useState(0);
  const row = ROWS[active];
  const zh = lang === 'zh';
  const PROPS = zh ? PROPS_ZH : PROPS_EN;
  const toolLabel = zh ? '工具' : 'Tool';

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
      {/* auto layout: the Tool column flexes to absorb all slack (width:100%),
          the property columns shrink to hug their header + check — so there is
          no dead space on the right and the checks aren't stranded in wide cols. */}
      <table style={{ width: '100%', tableLayout: 'auto', borderCollapse: 'collapse', margin: 0 }}>
        <thead>
          <tr style={{ background: 'var(--sl-color-gray-6)' }}>
            <th style={{ textAlign: 'left', padding: '0.6rem 0.9rem', width: '100%' }}>{toolLabel}</th>
            {PROPS.map((p) => (
              <th key={p.key} style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {p.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => {
            const isOmem = r.name === 'OMem';
            const isActive = i === active;
            return (
              <tr
                key={r.name}
                onClick={() => setActive(i)}
                style={{
                  cursor: 'pointer',
                  background: isActive
                    ? 'var(--sl-color-accent-low)'
                    : isOmem
                      ? 'var(--sl-color-gray-6)'
                      : 'transparent',
                  borderTop: '1px solid var(--sl-color-gray-5)',
                  boxShadow: isActive ? 'inset 3px 0 0 var(--sl-color-text-accent)' : 'none',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                <td style={{ padding: '0.55rem 0.9rem', fontWeight: isOmem ? 700 : 400 }}>
                  {r.name}
                </td>
                {PROPS.map((p) => (
                  <td key={p.key} style={{ textAlign: 'center', padding: '0.55rem 0.4rem' }}>
                    {r[p.key] ? (
                      <span style={{ color: 'var(--sl-color-text-accent)', fontSize: '1.25rem', fontWeight: 700 }}>✓</span>
                    ) : (
                      <span style={{ color: 'var(--sl-color-gray-4)', fontSize: '1.15rem', fontWeight: 300 }}>✗</span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: '0.9rem 1rem', background: 'var(--sl-color-black)', fontSize: '0.92rem', borderTop: '1px solid var(--sl-color-gray-5)' }}>
        <strong style={{ color: row.name === 'OMem' ? 'var(--sl-color-accent-high)' : 'var(--sl-color-white)' }}>
          {row.name}
        </strong>
        {' — '}
        <span style={{ color: 'var(--sl-color-gray-2)' }}>{zh ? row.note_zh : row.note}</span>
      </div>
    </div>
  );
}
