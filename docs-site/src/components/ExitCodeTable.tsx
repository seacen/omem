/**
 * ExitCodeTable — interactive exit-code ↔ command map for reference/04.
 *
 * Click a code (left) to highlight which commands return it (right), with the
 * concrete trigger for each. The point is to make `if [ $? -eq 4 ]` legible:
 * pick the code your script saw, see exactly what produced it. Monochrome,
 * ink-on-paper (BRAND §7.1) — selection is carried by tone + an accent rail,
 * never color.
 *
 * Facts: src/omem/cli_commands/exit_codes.py (verbatim 0–6) + the per-command
 * raises surveyed in docs/user-docs/_fact-map.md §1/§5. `install status` has
 * its OWN 0/1/2/3 plist-state semantics — called out separately, not folded in.
 */
import { useState } from 'react';

type Code = {
  code: number;
  name: string;
  gist: string;
  gist_zh: string;
  triggers: { cmd: string; when: string; when_zh: string }[];
};

const CODES: Code[] = [
  {
    code: 0,
    name: 'OK',
    gist: 'Success — including an empty result. A query that finds nothing still exits 0; "no hits" is an answer, not an error.',
    gist_zh: '成功——包括结果为空的情形。什么都没查到的 query 仍然 exit 0；"没命中"是一种答案，不是错误。',
    triggers: [
      { cmd: 'every command', when: 'the operation completed', when_zh: '操作顺利完成' },
      { cmd: 'omem query', when: 'ran fine — even with zero hits', when_zh: '正常跑完——哪怕零命中' },
      { cmd: 'omem ingest', when: 'every item succeeded (or nothing was due)', when_zh: '每个条目都成功（或本就没有该处理的）' },
    ],
  },
  {
    code: 1,
    name: 'GENERIC_ERROR',
    gist: 'An unhandled error, or an operation that ran but had failures. The catch-all when nothing more specific fits.',
    gist_zh: '一个未处理的错误，或是跑完了但有失败的操作。当没有更具体的码能套上时，就用这个兜底。',
    triggers: [
      { cmd: 'omem ingest', when: 'at least one item failed to ingest', when_zh: '至少有一个条目 ingest 失败' },
      { cmd: 'omem setup', when: 'the wizard could not complete', when_zh: '向导没能走完' },
      { cmd: 'omem wiki move', when: 'the move failed', when_zh: '搬动失败' },
      { cmd: 'omem index rebuild', when: 'no SQLite index, or the rebuild errored', when_zh: '没有 SQLite 索引，或重建出错' },
      { cmd: 'omem lint', when: 'a maintenance pass errored', when_zh: '某次维护扫描出错' },
      { cmd: 'omem plugin install', when: 'the install (e.g. npm) failed', when_zh: '安装（如 npm）失败' },
    ],
  },
  {
    code: 2,
    name: 'INDEX_NOT_READY',
    gist: 'The active index could not be built or reached — most often a plugin was enabled but the index was never rebuilt.',
    gist_zh: '当前索引无法构建或访问——最常见的情况是启用了插件却从没重建索引。',
    triggers: [
      { cmd: 'omem query', when: 'building the index failed (enable without rebuild)', when_zh: '构建索引失败（启用了却没重建）' },
      { cmd: 'omem index status', when: 'active_index unknown, or qmd not installed', when_zh: 'active_index 未知，或 qmd 未安装' },
      { cmd: 'omem plugin enable', when: 'unknown plugin, or qmd not installed', when_zh: '未知插件，或 qmd 未安装' },
    ],
  },
  {
    code: 3,
    name: 'PAGE_ID_AMBIGUOUS',
    gist: 'The page-id prefix you gave (≥8 chars) matched more than one page. Add more characters to disambiguate.',
    gist_zh: '你给的 page-id 前缀（≥8 字符）匹配到了不止一个页面。多给几个字符来消除歧义。',
    triggers: [
      { cmd: 'omem page get', when: 'the prefix matched > 1 page', when_zh: '前缀匹配到 > 1 个页面' },
      { cmd: 'omem raw get', when: 'the prefix matched > 1 page', when_zh: '前缀匹配到 > 1 个页面' },
    ],
  },
  {
    code: 4,
    name: 'PAGE_NOT_FOUND',
    gist: 'The page-id (or prefix) matched zero pages. Check the id, or whether the page was tombstoned.',
    gist_zh: 'page-id（或前缀）匹配到零个页面。检查一下 id，或者页面是不是已被打了墓碑标记。',
    triggers: [
      { cmd: 'omem page get', when: 'no page matched the id / prefix', when_zh: '没有页面匹配该 id / 前缀' },
      { cmd: 'omem raw get', when: 'no page matched the id / prefix', when_zh: '没有页面匹配该 id / 前缀' },
      { cmd: 'omem source info', when: 'the source is unavailable', when_zh: 'source 不可用' },
    ],
  },
  {
    code: 5,
    name: 'PARSED_VERSION_OUT_OF_RANGE',
    gist: 'You asked for a parsed-source version that does not exist — N is past the end of the page’s version history.',
    gist_zh: '你要的解析源文版本不存在——N 超出了该页面版本历史的末尾。',
    triggers: [
      { cmd: 'omem raw get --parsed --version N', when: 'N ≥ the number of parsed versions kept', when_zh: 'N ≥ 保留的解析版本数量' },
    ],
  },
  {
    code: 6,
    name: 'INVALID_ARGUMENT',
    gist: 'An argument did not parse — an unknown --format, a --since the grammar rejected, a prefix shorter than 8 chars.',
    gist_zh: '某个参数没能解析——未知的 --format、语法不接受的 --since，或短于 8 字符的前缀。',
    triggers: [
      { cmd: 'omem query', when: '--since unparseable, or --format unknown', when_zh: '--since 无法解析，或 --format 未知' },
      { cmd: 'omem wiki ls', when: '--since unparseable, or --format unknown', when_zh: '--since 无法解析，或 --format 未知' },
      { cmd: 'omem page get / raw get', when: '--format unknown, or prefix < 8 chars', when_zh: '--format 未知，或前缀 < 8 字符' },
      { cmd: 'omem wiki move', when: 'the new path was invalid', when_zh: '新路径无效' },
    ],
  },
];

export default function ExitCodeTable({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const zh = lang === 'zh';
  const [active, setActive] = useState(0);
  const cur = CODES[active];

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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 0 }}>
        {/* LEFT: the code ladder */}
        <div style={{ borderRight: '1px solid var(--sl-color-gray-5)' }}>
          {CODES.map((c, i) => {
            const isActive = i === active;
            return (
              <button
                key={c.code}
                onClick={() => setActive(i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderTop: i === 0 ? 'none' : '1px solid var(--sl-color-gray-5)',
                  background: isActive ? 'var(--sl-color-accent-low)' : 'transparent',
                  boxShadow: isActive ? 'inset 3px 0 0 var(--sl-color-text-accent)' : 'none',
                  cursor: 'pointer',
                  padding: '0.6rem 0.85rem',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.6rem',
                  transition: 'background 0.2s ease, box-shadow 0.2s ease',
                  fontFamily: 'var(--sl-font)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--sl-font-mono)',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: 'var(--sl-color-text-accent)',
                    minWidth: '1.2rem',
                  }}
                >
                  {c.code}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--sl-font-mono)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    color: isActive ? 'var(--sl-color-text)' : 'var(--sl-color-gray-2)',
                  }}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT: what it means + who returns it */}
        <div style={{ padding: '0.9rem 1.05rem', minHeight: '13rem', background: 'var(--sl-color-gray-7)' }}>
          <div
            key={cur.code}
            style={{ animation: 'omemExitFade 0.35s ease both' }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <code
                style={{
                  fontFamily: 'var(--sl-font-mono)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--sl-color-text-accent)',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                }}
              >
                exit {cur.code} · {cur.name}
              </code>
            </div>
            <p style={{ margin: '0 0 0.85rem', fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--sl-color-gray-2)' }}>
              {zh ? cur.gist_zh : cur.gist}
            </p>
            <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.7rem', color: 'var(--sl-color-gray-4)', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
              {zh ? '由谁返回' : 'RETURNED BY'}
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {cur.triggers.map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline' }}>
                  <code
                    style={{
                      fontFamily: 'var(--sl-font-mono)',
                      fontSize: '0.74rem',
                      color: 'var(--sl-color-text)',
                      background: 'var(--sl-color-gray-6)',
                      borderRadius: '3px',
                      padding: '0.08rem 0.35rem',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {zh && t.cmd === 'every command' ? '任何命令' : t.cmd}
                  </code>
                  <span style={{ fontSize: '0.82rem', color: 'var(--sl-color-gray-2)', lineHeight: 1.4 }}>{zh ? t.when_zh : t.when}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes omemExitFade {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
