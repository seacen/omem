/**
 * TombstoneTimeline — animated soft-delete lifecycle for concepts/04.
 *
 * Four states on a horizontal timeline: present → deleted (tombstoned, page
 * KEPT) → still tombstoned → restored (revived). Shows OMem never hard-deletes
 * on a source deletion — the wiki page is tombstoned and comes back if the
 * source returns. Monochrome (BRAND §7.1).
 *
 * Facts: docs/user-docs/_design-intent.md §2 (tombstone + revival) + _fact-map §3.
 */
import { useState, useEffect, useRef } from 'react';

type Step = {
  label: string;
  label_zh: string;
  sourceState: string;
  sourceState_zh: string;
  wikiState: string;
  wikiState_zh: string;
  tombstoned: boolean;
  gone: boolean;
  note: string;
  note_zh: string;
};

const STEPS: Step[] = [
  {
    label: 'Present',
    label_zh: '存在',
    sourceState: 'Q3-budget-review.pptx ✓ on disk',
    sourceState_zh: 'Q3-budget-review.pptx ✓ 在磁盘上',
    wikiState: 'wiki page · live',
    wikiState_zh: 'wiki 页 · 在线',
    tombstoned: false,
    gone: false,
    note: 'The file is on disk; its wiki page is live and queryable.',
    note_zh: '文件在磁盘上；它的 wiki 页处于在线状态，可被查询。',
  },
  {
    label: 'Deleted',
    label_zh: '已删除',
    sourceState: 'file deleted from disk',
    sourceState_zh: '文件已从磁盘删除',
    wikiState: 'wiki page · tombstoned (kept)',
    wikiState_zh: 'wiki 页 · 已立碑（保留）',
    tombstoned: true,
    gone: false,
    note: 'You delete the file. OMem does NOT delete the wiki page — it sets tombstoned_at and keeps the page for the audit trail.',
    note_zh: '你删掉了文件。OMem 不会删掉对应的 wiki 页——它会设置 tombstoned_at，把页面留下来作为审计留痕。',
  },
  {
    label: 'Tombstoned',
    label_zh: '已立碑',
    sourceState: 'still gone',
    sourceState_zh: '仍然不在',
    wikiState: 'hidden from query · still on disk',
    wikiState_zh: '不出现在查询里 · 仍在磁盘上',
    tombstoned: true,
    gone: false,
    note: 'A tombstoned page drops out of normal query results but stays on disk. Only `omem lint --orphans --purge` ever removes it — your decision, not an automatic one.',
    note_zh: '立了碑的页面会从正常查询结果里消失，但仍留在磁盘上。只有 `omem lint --orphans --purge` 才会真正删除它——这是你来决定的，不是自动发生的。',
  },
  {
    label: 'Restored',
    label_zh: '已恢复',
    sourceState: 'file is back on disk',
    sourceState_zh: '文件回到磁盘上',
    wikiState: 'wiki page · revived',
    wikiState_zh: 'wiki 页 · 已复活',
    tombstoned: false,
    gone: false,
    note: 'Restore the file (undo, re-sync) and OMem clears the tombstone — the page is live again. Nothing was lost.',
    note_zh: '把文件恢复回来（撤销删除、重新同步），OMem 就会清掉墓碑——页面重新上线。什么都没丢。',
  },
];

export default function TombstoneTimeline({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const zh = lang === 'zh';
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setActive((prev) => {
        if (prev >= STEPS.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1400);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing]);

  const play = () => { setActive(0); setPlaying(true); };
  const cur = STEPS[active];

  return (
    <div style={{ width: '100%', border: '1px solid var(--sl-color-gray-5)', borderRadius: '0.5rem', overflow: 'hidden', margin: '1.5rem 0', background: 'var(--sl-color-black)' }}>
      {/* timeline */}
      <div style={{ display: 'flex', padding: '1.1rem 1rem 0.8rem', gap: 0 }}>
        {STEPS.map((step, i) => {
          const isActive = i === active;
          const reached = i <= active;
          return (
            <div key={step.label} style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* connector */}
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', top: '0.55rem', left: '50%', width: '100%', height: '2px', background: i < active ? 'var(--sl-color-text-accent)' : 'var(--sl-color-gray-5)', transition: 'background 0.4s' }} />
              )}
              <button
                onClick={() => { setPlaying(false); setActive(i); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 1, padding: 0 }}
              >
                {/* node: filled = present, hollow-dashed = tombstoned */}
                <span style={{
                  width: '1.15rem', height: '1.15rem', borderRadius: '50%',
                  border: step.tombstoned ? '2px dashed var(--sl-color-text-accent)' : '2px solid var(--sl-color-text-accent)',
                  background: reached && !step.tombstoned ? 'var(--sl-color-text-accent)' : 'var(--sl-color-gray-7)',
                  transform: isActive ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform 0.25s, background 0.25s',
                }} />
                <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: reached ? 'var(--sl-color-text-accent)' : 'var(--sl-color-gray-4)' }}>
                  {zh ? step.label_zh : step.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* state panel */}
      <div key={active} style={{ padding: '0.5rem 1rem 0.9rem', animation: 'omemFadeUp 0.4s ease both' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.8rem', padding: '0.25rem 0.55rem', borderRadius: '4px', background: 'var(--sl-color-gray-6)', color: 'var(--sl-color-text)' }}>
            {zh ? '源' : 'source'}: {zh ? cur.sourceState_zh : cur.sourceState}
          </span>
          <span style={{ fontFamily: 'var(--sl-font-mono)', fontSize: '0.8rem', padding: '0.25rem 0.55rem', borderRadius: '4px', border: cur.tombstoned ? '1px dashed var(--sl-color-text-accent)' : '1px solid var(--sl-color-gray-5)', background: 'var(--sl-color-gray-7)', color: 'var(--sl-color-text-accent)' }}>
            wiki: {zh ? cur.wikiState_zh : cur.wikiState}
          </span>
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--sl-color-gray-2)' }}>{zh ? cur.note_zh : cur.note}</div>
      </div>

      <div style={{ padding: '0.7rem 1rem', borderTop: '1px solid var(--sl-color-gray-5)' }}>
        <button onClick={play} style={{ padding: '0.4rem 0.9rem', borderRadius: '4px', border: '1px solid var(--sl-color-text-accent)', background: 'transparent', color: 'var(--sl-color-text-accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
          {playing ? (zh ? '播放中…' : 'Playing…') : zh ? '▶ 删除再恢复' : '▶ Delete & restore'}
        </button>
      </div>

      <style>{`@keyframes omemFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
