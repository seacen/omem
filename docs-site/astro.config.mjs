// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkGfm from 'remark-gfm';

import react from '@astrojs/react';

// Deploy target is environment-driven so ONE source serves multiple hosts:
//   - GitHub Pages → https://seacen.github.io/omem/  (default; base = /omem)
//   - Tencent EdgeOne Pages → https://<project>.edgeone.app/  (root; base = /)
//   - a custom root domain later → also root (base = /)
// Set DOCS_BASE / DOCS_SITE in the build environment to override. On GitHub
// Pages we leave them unset and fall back to the /omem defaults; on EdgeOne set
// `DOCS_BASE=/` (and optionally `DOCS_SITE=https://<project>.edgeone.app`).
//
// Starlight's own routing (sidebar, LinkCard, hero, nav) honours `base`
// automatically. The ~340 absolute internal links hand-written in MDX body text
// do NOT — so the rehype plugin below prefixes every root-relative internal
// <a href> with the base at build time. When base is '/', it is a no-op.
const RAW_BASE = process.env.DOCS_BASE ?? '/omem';
// Normalise: no trailing slash, leading slash. '/' becomes '' so prefixing is a no-op.
const BASE = RAW_BASE === '/' ? '' : RAW_BASE.replace(/\/$/, '');
const SITE = process.env.DOCS_SITE ?? 'https://seacen.github.io';

function rehypeBasePrefixLinks() {
    return (tree) => {
        if (!BASE) return; // root deployment: nothing to prefix
        const visit = (node) => {
            if (node.type === 'element' && node.tagName === 'a' && node.properties) {
                const href = node.properties.href;
                if (
                    typeof href === 'string' &&
                    href.startsWith('/') &&
                    !href.startsWith('//') &&
                    !href.startsWith(BASE + '/') &&
                    href !== BASE
                ) {
                    node.properties.href = BASE + href;
                }
            }
            if (Array.isArray(node.children)) node.children.forEach(visit);
        };
        visit(tree);
    };
}

// https://astro.build/config
export default defineConfig({
    site: SITE,
    base: RAW_BASE,
    // GFM (pipe tables, strikethrough, autolinks) is on for plain Markdown by
    // default, but the .mdx pipeline used by our concept/reference pages does
    // NOT reliably inherit it under Astro 6 + Starlight's injected MDX
    // integration — pipe tables fell through to literal text. Declaring the
    // plugin explicitly here forces GFM into the .mdx remark pipeline too.
    markdown: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeBasePrefixLinks],
    },
    integrations: [starlight({
        title: 'OMem',
        customCss: ['./src/styles/brand.css'],
        // i18n: English at the root (no /en/ prefix, existing URLs unchanged);
        // Simplified Chinese under /zh-cn/. Language picker is auto-generated;
        // untranslated pages fall back to English with a notice.
        defaultLocale: 'root',
        locales: {
            root: { label: 'English', lang: 'en' },
            'zh-cn': { label: '简体中文', lang: 'zh-CN' },
        },
        logo: {
            // Original full lockup (seal + OMem wordmark + tagline). Two
            // hardcoded-color variants so the theme toggle controls ink/paper.
            light: './src/assets/brand/logo-lockup-light.svg',
            dark: './src/assets/brand/logo-lockup-dark.svg',
            replacesTitle: true,
        },
        social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/seacen/omem' }],
        // Sidebar group labels are translated per-locale (the page entries
        // themselves come from each page's frontmatter title, already in
        // Chinese under zh-cn/). autogenerate picks the matching-locale
        // directory automatically; explicit `link`s get the locale prefix.
        sidebar: [
            {
                label: 'Getting started',
                translations: { 'zh-CN': '快速上手' },
                items: [{ autogenerate: { directory: 'getting-started' } }],
            },
            {
                label: 'Concepts',
                translations: { 'zh-CN': '概念' },
                items: [{ autogenerate: { directory: 'concepts' } }],
            },
            {
                label: 'How-to guides',
                translations: { 'zh-CN': '操作指南' },
                items: [{ autogenerate: { directory: 'how-to' } }],
            },
            {
                label: 'Troubleshooting',
                translations: { 'zh-CN': '排查问题' },
                items: [{ autogenerate: { directory: 'troubleshooting' } }],
            },
            {
                label: 'Reference',
                translations: { 'zh-CN': '参考' },
                items: [{ autogenerate: { directory: 'reference' } }],
            },
            {
                label: 'FAQ',
                translations: { 'zh-CN': '常见问题' },
                link: '/faq/',
            },
            {
                label: 'Changelog',
                translations: { 'zh-CN': '更新日志' },
                link: '/changelog/',
            },
            {
                label: 'About the author',
                translations: { 'zh-CN': '关于作者' },
                link: '/about-the-author/',
            },
        ],
		}), react()],
});