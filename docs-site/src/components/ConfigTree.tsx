/**
 * ConfigTree — a collapsible config.yaml tree for reference/02.
 *
 * The left pane is the dotted-path tree (sections expand/collapse); click a
 * leaf field and the right pane shows its type, default, and what it does —
 * with a clear rail on the two HIGH-risk fields (data.root / data.wiki_path).
 * A screenshot-free way to browse a 60-field schema without a wall of tables.
 * Monochrome, ink-on-paper (BRAND §7.1); risk is carried by a label + rail,
 * not by red text.
 *
 * Facts: src/omem/config/schema.py (verbatim defaults) surveyed in
 * docs/user-docs/_fact-map.md §2. Curated subset — the full field list lives
 * in the prose table below the component.
 */
import { useState } from 'react';

type Field = {
  path: string;
  type: string;
  def: string;
  what: string;
  what_zh: string;
  risk?: 'high';
};

type Section = { name: string; fields: Field[] };

const TREE: Section[] = [
  {
    name: 'top level',
    fields: [
      { path: 'active_index', type: '"fts5" | "qmd"', def: '"fts5"', what: 'Which index backend is live. A typo here is rejected at load time, not silently ignored.', what_zh: '当前生效的索引后端。这里写错会在加载时被拒绝，而不是悄悄忽略。' },
      { path: 'output.language', type: '"auto" | "zh" | "en"', def: '"auto"', what: 'Language the curator writes pages in. auto follows the source document; zh/en force it. Drives cross-language auto-promote.', what_zh: 'curator 写页面用的语言。auto 跟随源文档；zh/en 则强制指定。它也驱动跨语言自动升级（auto-promote）。' },
    ],
  },
  {
    name: 'llm',
    fields: [
      { path: 'llm.curator.provider', type: 'enum', def: '"anthropic-oauth"', what: 'Curator LLM provider: openai-compat | anthropic-api | anthropic-oauth | openai-chatgpt-oauth.', what_zh: 'curator 用的 LLM 提供商：openai-compat | anthropic-api | anthropic-oauth | openai-chatgpt-oauth。' },
      { path: 'llm.curator.model', type: 'str', def: '"" (empty)', what: 'Curator model name. Empty by design — forces you through the wizard rather than guessing a default.', what_zh: 'curator 的模型名。有意留空——逼你走一遍向导，而不是替你猜一个默认值。' },
      { path: 'llm.curator.api_key_keychain', type: 'str | null', def: 'null', what: 'macOS Keychain account holding the API key (service "omem-llm"). Takes precedence over api_key_env. The key never sits in yaml.', what_zh: '存放 API key 的 macOS Keychain 账户（service 为 "omem-llm"）。优先级高于 api_key_env。密钥绝不落在 yaml 里。' },
      { path: 'llm.vlm.*', type: '(same shape)', def: '—', what: 'The vision model used to describe images. Same fields as curator; can be a different provider entirely.', what_zh: '用来描述图片的 vision model。字段结构和 curator 一样；可以是完全不同的另一个提供商。' },
      { path: 'llm.global_concurrency', type: 'int 1–64', def: '8', what: 'Cross-process cap on simultaneous LLM calls. 8 is safe for Pro/Max OAuth and common compat endpoints; set 1 to serialize.', what_zh: '跨进程的并发 LLM 调用上限。8 对 Pro/Max OAuth 和常见 compat 端点都很稳；设成 1 则串行执行。' },
    ],
  },
  {
    name: 'parser',
    fields: [
      { path: 'parser.images.pdf', type: 'ocr | vlm | off', def: '"ocr"', what: 'How PDF images are handled. PDFs are mostly text, so OCR is the cheap default; vlm describes each image, off extracts only.', what_zh: 'PDF 里的图片怎么处理。PDF 多半是文字，所以 OCR 是便宜的默认项；vlm 会逐张描述图片，off 则只做提取。' },
      { path: 'parser.images.pptx', type: 'ocr | vlm | off', def: '"vlm"', what: 'PowerPoint images are usually content, so they default to vlm. Same field exists for docx / xlsx / standalone / mail / calendar.', what_zh: 'PowerPoint 里的图片通常本身就是内容，所以默认走 vlm。docx / xlsx / standalone / mail / calendar 也都有同样的字段。' },
      { path: 'parser.vlm_global_concurrency', type: 'int 1–64', def: '8', what: 'Cross-thread cap on simultaneous vision-model calls, so parallel ingest workers don’t overwhelm the provider.', what_zh: '跨线程的并发 vision-model 调用上限，免得并行的 ingest worker 把提供商压垮。' },
    ],
  },
  {
    name: 'ingest',
    fields: [
      { path: 'ingest.formats.*', type: 'bool', def: 'true', what: 'Per-format master switch (pdf/docx/pptx/xlsx/md/txt/html/image). Set false to never ingest that format from ANY source — mail attachments included.', what_zh: '按格式的总开关（pdf/docx/pptx/xlsx/md/txt/html/image）。设为 false 就永不从任何 source 摄入该格式——包括邮件附件。' },
      { path: 'ingest.curate_concurrency', type: 'int 1–32', def: '4', what: 'Items-per-kind worker pool. Set 1 for strictly serial ingest when debugging.', what_zh: '每个 kind 内部处理条目的 worker 池大小。调试时设成 1 可让 ingest 严格串行。' },
      { path: 'ingest.kind_concurrency', type: 'int 1–32', def: '4', what: 'Kinds-in-parallel worker pool (file + mail + calendar at once).', what_zh: '多个 kind 并行的 worker 池大小（file + mail + calendar 同时跑）。' },
    ],
  },
  {
    name: 'schedule',
    fields: [
      { path: 'schedule.interval_minutes', type: 'int', def: '0 (disabled)', what: 'Minutes between scheduled runs. 0 means no auto-ingest — you opt in via the wizard or omem install --schedule N.', what_zh: '两次定时运行之间的分钟数。0 表示不自动 ingest——你通过向导或 omem install --schedule N 主动开启。' },
    ],
  },
  {
    name: 'curator',
    fields: [
      { path: 'curator.mode.md', type: 'frontmatter-only | llm-full', def: '"frontmatter-only"', what: 'How Markdown is curated. frontmatter-only copies the body verbatim and only writes an abstract+tags (cheap, exact). md/txt default to this; pdf/docx/pptx/xlsx/html default to llm-full.', what_zh: 'Markdown 如何被精修。frontmatter-only 会原样复制正文，只写一段摘要+标签（便宜、精确）。md/txt 默认走这个；pdf/docx/pptx/xlsx/html 默认走 llm-full。' },
      { path: 'curator.cross_language_auto_promote', type: 'bool', def: 'true', what: 'Safety net: if a source’s language differs from output.language, force llm-full so the page isn’t left in a mismatched language.', what_zh: '一道安全网：如果某个 source 的语言和 output.language 不一致，就强制走 llm-full，免得页面停留在不匹配的语言上。' },
    ],
  },
  {
    name: 'data',
    fields: [
      { path: 'data.root', type: 'str', def: '"~/.local/share/omem"', risk: 'high', what: 'Internal cache: the content-addressed raw/ archive + the SQLite db. You never browse this by hand. Changing it orphans every cached item — re-ingest would start from scratch.', what_zh: '内部缓存：按内容寻址的 raw/ 归档 + SQLite 数据库。你从不需要手动浏览它。改动它会让每一个缓存条目变成孤儿——重新 ingest 等于从零开始。' },
      { path: 'data.wiki_path', type: 'str', def: '"~/omem/wiki"', risk: 'high', what: 'The user-visible vault of Markdown pages. To move it, use omem wiki move (which re-points everything) — editing this field by hand leaves the old wiki stranded and unread.', what_zh: '用户可见的 Markdown 页面 vault。要搬动它请用 omem wiki move（它会把一切重新指向）——手动改这个字段会让旧 wiki 被弃在原地、再也读不到。' },
    ],
  },
  {
    name: 'kinds.*',
    fields: [
      { path: 'kinds.{file,mail,calendar,loop}.enabled', type: 'bool', def: 'false', what: 'Every kind ships disabled. A clean install watches nothing until the wizard turns a kind on — no silent scanning of your disk or inbox.', what_zh: '每个 kind 出厂都是关闭的。全新安装在向导打开某个 kind 之前什么都不监视——绝不会悄悄扫描你的硬盘或收件箱。' },
      { path: 'kinds.mail.scope.time_window.since', type: 'time-str', def: '"3m_ago"', what: 'How far back mail ingest reaches. Grammar: Nd_ago / Nw_ago / Nm_ago / Ny_ago, or an ISO date. until defaults to null (no upper bound).', what_zh: '邮件 ingest 往回追多远。语法：Nd_ago / Nw_ago / Nm_ago / Ny_ago，或一个 ISO 日期。until 默认为 null（不设上界）。' },
      { path: 'kinds.calendar.source', type: 'str', def: '"calendar-app"', what: 'Calendar reads the local Apple Calendar store by default (Exchange/iCloud/CalDAV all flow through it) — not a browser-scraped Outlook Web.', what_zh: '日历默认读取本地 Apple Calendar 存储（Exchange/iCloud/CalDAV 都从这里汇流）——而不是靠浏览器抓取 Outlook Web。' },
      { path: 'kinds.calendar.scope.time_window', type: 'time-str', def: 'since "3m_ago" · until "3m_from_now"', what: 'Calendar uses a symmetric window — recent past plus near future around now.', what_zh: '日历用一个对称的时间窗——以当下为中心，覆盖最近的过去加临近的未来。' },
      { path: 'kinds.mail.source', type: 'str', def: '"mail-app"', what: 'Mail reads Apple Mail’s local store. Outlook sources are designed but deferred to v1.5+.', what_zh: '邮件读取 Apple Mail 的本地存储。Outlook source 已有设计，但推迟到 v1.5+。' },
    ],
  },
];

export default function ConfigTree({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const zh = lang === 'zh';
  const [open, setOpen] = useState<Record<string, boolean>>({ data: true });
  const [sel, setSel] = useState<Field>(TREE.find((s) => s.name === 'data')!.fields[0]);

  const toggle = (name: string) => setOpen((o) => ({ ...o, [name]: !o[name] }));

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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)', gap: 0 }}>
        {/* LEFT: the tree */}
        <div style={{ borderRight: '1px solid var(--sl-color-gray-5)', padding: '0.5rem 0', maxHeight: '24rem', overflowY: 'auto' }}>
          {TREE.map((section) => (
            <div key={section.name}>
              <button
                onClick={() => toggle(section.name)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '0.3rem 0.8rem',
                  fontFamily: 'var(--sl-font-mono)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--sl-color-text-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span style={{ display: 'inline-block', width: '0.7rem', transition: 'transform 0.2s', transform: open[section.name] ? 'rotate(90deg)' : 'none' }}>▸</span>
                {zh && section.name === 'top level' ? '顶层' : section.name}
              </button>
              {open[section.name] &&
                section.fields.map((f) => {
                  const isSel = sel.path === f.path;
                  return (
                    <button
                      key={f.path}
                      onClick={() => setSel(f)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: 'none',
                        background: isSel ? 'var(--sl-color-accent-low)' : 'transparent',
                        boxShadow: isSel ? 'inset 3px 0 0 var(--sl-color-text-accent)' : 'none',
                        cursor: 'pointer',
                        padding: '0.25rem 0.8rem 0.25rem 1.9rem',
                        fontFamily: 'var(--sl-font-mono)',
                        fontSize: '0.76rem',
                        color: isSel ? 'var(--sl-color-text)' : 'var(--sl-color-gray-2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span style={{ wordBreak: 'break-word' }}>{f.path.replace(section.name === 'top level' ? '' : '', '')}</span>
                      {f.risk === 'high' && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--sl-color-text-accent)', border: '1px solid var(--sl-color-gray-4)', borderRadius: '3px', padding: '0 0.2rem', flexShrink: 0 }}>
                          {zh ? '高风险' : 'HIGH RISK'}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        {/* RIGHT: the selected field's detail */}
        <div style={{ padding: '0.95rem 1.05rem', background: 'var(--sl-color-gray-7)', minHeight: '14rem' }}>
          <div key={sel.path} style={{ animation: 'omemCfgFade 0.3s ease both' }}>
            <code
              style={{
                fontFamily: 'var(--sl-font-mono)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--sl-color-text-accent)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                wordBreak: 'break-word',
              }}
            >
              {sel.path}
            </code>

            {sel.risk === 'high' && (
              <div
                style={{
                  marginTop: '0.6rem',
                  borderLeft: '3px solid var(--sl-color-text-accent)',
                  background: 'var(--sl-color-accent-low)',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.74rem',
                  color: 'var(--sl-color-text)',
                  fontWeight: 600,
                }}
              >
                {zh ? '高风险——改动它会让现有数据被弃置。编辑前请先读下面的说明。' : 'HIGH RISK — changing this strands existing data. Read the note before editing.'}
              </div>
            )}

            <dl style={{ margin: '0.8rem 0 0', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.3rem 0.8rem', fontSize: '0.8rem', alignItems: 'baseline' }}>
              <dt style={{ color: 'var(--sl-color-gray-4)', fontFamily: 'var(--sl-font-mono)', fontSize: '0.72rem' }}>{zh ? '类型' : 'type'}</dt>
              <dd style={{ margin: 0, fontFamily: 'var(--sl-font-mono)', fontSize: '0.76rem', color: 'var(--sl-color-text)' }}>{sel.type}</dd>
              <dt style={{ color: 'var(--sl-color-gray-4)', fontFamily: 'var(--sl-font-mono)', fontSize: '0.72rem' }}>{zh ? '默认值' : 'default'}</dt>
              <dd style={{ margin: 0, fontFamily: 'var(--sl-font-mono)', fontSize: '0.76rem', color: 'var(--sl-color-text)' }}>{sel.def}</dd>
            </dl>

            <p style={{ margin: '0.85rem 0 0', fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--sl-color-gray-2)' }}>{zh ? sel.what_zh : sel.what}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes omemCfgFade {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
