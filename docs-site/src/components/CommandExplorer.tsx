/**
 * CommandExplorer — a mock terminal that "types out" a command and plays back
 * its output line by line. A screenshot substitute: no real binary needed, the
 * output is controllable and deterministic, and it animates.
 *
 * Reusable across reference/01, getting-started, and how-to pages. Pass one or
 * more `sessions`; if more than one, a row of tabs lets the reader switch.
 * Press ▶ (or click a tab) to replay. Monochrome, ink-on-paper (BRAND §7.1).
 *
 * RED LINE: every prompt + output line here is FICTIONAL (Acme / Atlas / Alice /
 * Q3-budget-review.pptx). Never paste real corpus output into a session.
 */
import { useState, useEffect, useRef } from 'react';

export type TermSession = {
  /** Short tab label when multiple sessions are shown. */
  label?: string;
  /** The command typed at the prompt (without the leading `$`). */
  command: string;
  /** Output lines, played back after the command "finishes typing". */
  output: string[];
};

type Props = {
  sessions: TermSession[];
  /** ms between output lines (default 90). */
  lineDelay?: number;
  /** UI language for the (non-session) chrome strings. Sessions stay as passed. */
  lang?: 'en' | 'zh';
};

export default function CommandExplorer({ sessions, lineDelay = 90, lang = 'en' }: Props) {
  const zh = lang === 'zh';
  const [tab, setTab] = useState(0);
  const [shownLines, setShownLines] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'idle' | 'typing' | 'output' | 'done'>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const session = sessions[tab];

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  const run = (s: TermSession) => {
    clearTimers();
    setTyped('');
    setShownLines(0);
    setPhase('typing');

    // type the command char by char
    const chars = s.command.split('');
    chars.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => setTyped(s.command.slice(0, i + 1)), 22 * (i + 1)),
      );
    });
    const typeDone = 22 * chars.length + 250;

    // then reveal output lines
    setTimeout(() => setPhase('output'), typeDone);
    s.output.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => setShownLines(i + 1), typeDone + lineDelay * (i + 1)),
      );
    });
    timers.current.push(
      setTimeout(() => setPhase('done'), typeDone + lineDelay * (s.output.length + 1)),
    );
  };

  // play on mount + whenever the tab changes
  useEffect(() => {
    run(sessions[tab]);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid var(--sl-color-gray-5)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        margin: '1.5rem 0',
        background: 'var(--sl-color-black)',
        fontFamily: 'var(--sl-font-mono)',
      }}
    >
      {/* title bar: traffic lights + tabs + replay */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.45rem 0.75rem',
          borderBottom: '1px solid var(--sl-color-gray-5)',
          background: 'var(--sl-color-gray-7)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: '0.6rem',
                height: '0.6rem',
                borderRadius: '50%',
                border: '1px solid var(--sl-color-gray-4)',
                display: 'inline-block',
              }}
            />
          ))}
        </div>

        {sessions.length > 1 && (
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'nowrap', marginLeft: '0.3rem', alignItems: 'stretch', minWidth: 0 }}>
            {sessions.map((s, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                style={{
                  margin: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.2,
                  border: '1px solid var(--sl-color-gray-5)',
                  borderRadius: '4px',
                  background: i === tab ? 'var(--sl-color-accent-low)' : 'transparent',
                  color: i === tab ? 'var(--sl-color-text-accent)' : 'var(--sl-color-gray-2)',
                  cursor: 'pointer',
                  padding: '0.4rem 0.7rem',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--sl-font-mono)',
                }}
              >
                {s.label ?? (zh ? `命令 ${i + 1}` : `cmd ${i + 1}`)}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => run(session)}
          title={zh ? '重放' : 'Replay'}
          style={{
            marginLeft: 'auto',
            border: '1px solid var(--sl-color-gray-5)',
            borderRadius: '4px',
            background: 'transparent',
            color: 'var(--sl-color-gray-2)',
            cursor: 'pointer',
            padding: '0.1rem 0.55rem',
            fontSize: '0.72rem',
            flexShrink: 0,
          }}
        >
          {zh ? '↻ 重放' : '↻ replay'}
        </button>
      </div>

      {/* terminal body */}
      <div style={{ padding: '0.8rem 0.95rem', fontSize: '0.8rem', lineHeight: 1.55, minHeight: '6rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--sl-color-text)' }}>
          <span style={{ color: 'var(--sl-color-text-accent)', flexShrink: 0 }}>$</span>
          <span style={{ wordBreak: 'break-word' }}>
            {typed}
            {phase === 'typing' && (
              <span style={{ animation: 'omemBlink 1s step-end infinite' }}>▋</span>
            )}
          </span>
        </div>

        {(phase === 'output' || phase === 'done') && (
          <pre
            style={{
              margin: '0.4rem 0 0',
              fontFamily: 'var(--sl-font-mono)',
              fontSize: '0.78rem',
              lineHeight: 1.5,
              color: 'var(--sl-color-gray-2)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {session.output.slice(0, shownLines).join('\n')}
          </pre>
        )}
      </div>

      <style>{`
        @keyframes omemBlink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
