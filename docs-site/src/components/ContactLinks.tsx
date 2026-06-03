/**
 * ContactLinks — Email + GitHub contact rows, each with its own mark, on-brand.
 *
 * Starlight's <LinkCard> can't carry a custom icon, so the author page renders
 * its Email / GitHub entries through this instead — an inline SVG glyph (ink,
 * monochrome per BRAND §7.1) + label + value. LinkedIn is handled separately by
 * LinkedInCard, so it's not repeated here. Bilingual via `lang`.
 */

const EMAIL = 'xichangzhao@outlook.com';
const GITHUB_URL = 'https://github.com/seacen/omem';

const STRINGS = {
  en: {
    emailLabel: 'Email',
    emailHint: 'The most direct way to reach me.',
    githubLabel: 'GitHub',
    githubHint: 'The OMem repository — for technical evaluation.',
  },
  zh: {
    emailLabel: '邮箱',
    emailHint: '找我最直接的方式。',
    githubLabel: 'GitHub',
    githubHint: 'OMem 仓库——供技术方评估。',
  },
};

function Row({
  href,
  glyph,
  label,
  value,
  hint,
}: {
  href: string;
  glyph: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.8rem 1rem',
        border: '1px solid var(--sl-color-gray-5)',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        color: 'var(--sl-color-text)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--sl-color-text-accent)';
        e.currentTarget.style.boxShadow = 'inset 3px 0 0 var(--sl-color-text-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--sl-color-gray-5)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span style={{ flexShrink: 0, display: 'inline-flex', color: 'var(--sl-color-text-accent)' }}>
        {glyph}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--sl-color-gray-3)' }}>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--sl-color-text-accent)', wordBreak: 'break-all' }}>
          {value}
        </span>
        <span style={{ fontSize: '0.82rem', color: 'var(--sl-color-gray-3)' }}>{hint}</span>
      </span>
    </a>
  );
}

const mailGlyph = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
    <path d="M3 6l9 7 9-7" />
  </svg>
);

const githubGlyph = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
  </svg>
);

export default function ContactLinks({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const t = lang === 'zh' ? STRINGS.zh : STRINGS.en;
  return (
    <div style={{ display: 'grid', gap: '0.7rem', margin: '1.5rem 0', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}>
      <Row href={`mailto:${EMAIL}`} glyph={mailGlyph} label={t.emailLabel} value={EMAIL} hint={t.emailHint} />
      <Row href={GITHUB_URL} glyph={githubGlyph} label={t.githubLabel} value="github.com/seacen/omem" hint={t.githubHint} />
    </div>
  );
}
