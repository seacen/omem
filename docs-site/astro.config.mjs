// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkGfm from 'remark-gfm';

import react from '@astrojs/react';

// Deploy target: this docs site lives at https://seacen.github.io/omem/.
// The site therefore runs under a `/omem` base path. Starlight's own routing
// (sidebar, LinkCard, hero actions, nav) honours `base` automatically — but the
// ~340 absolute internal links we hand-wrote in MDX body text (e.g.
// `[…](/zh-cn/concepts/…)`) do NOT, and would 404 under the base path. Rather
// than rewrite all of them, this tiny rehype plugin prefixes every root-relative
// internal <a href> with the base at build time. Idempotent (skips hrefs that
// already start with the base) and only touches site-internal links (leaves
// http(s)://, mailto:, #anchors, and data: URIs alone).
const BASE = '/omem';

function rehypeBasePrefixLinks() {
    return (tree) => {
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
    site: 'https://seacen.github.io',
    base: '/omem',
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