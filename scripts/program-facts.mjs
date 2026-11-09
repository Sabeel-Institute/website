/**
 * Prints what a program's built page says, for checking against the flyer
 * and for the pull request's description (see AGENTS.md):
 *
 *   npm run build
 *   npm run facts -- <folder> [<folder> ...]
 *
 * It reads dist/programs/<folder>/index.html: the status line, the title,
 * the facts (Audience, Dates, Schedule, Location, Fee, Registration
 * deadline), and where Register leads.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const USAGE = 'Usage: npm run facts -- <folder> [<folder> ...], after npm run build';
/** Facts every current program's page should show; a missing one is named. */
const EXPECTED = ['Audience', 'Dates', 'Schedule', 'Location', 'Fee'];

function fail(message) {
  console.error(`facts: ${message}\n${USAGE}`);
  process.exit(1);
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
/** The text of an HTML fragment: tags removed, entities decoded, spaces collapsed. */
const textOf = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (m, e) =>
      e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (ENTITIES[e] ?? m),
    )
    .replace(/\s+/g, ' ')
    .trim();

/** The attributes of an opening tag, by name. */
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], textOf(m[2])]));

function facts(folder) {
  const file = join('dist/programs', folder, 'index.html');
  if (!existsSync(file)) {
    fail(
      `there is no page ${file}. Run npm run build first; a program with draft: true has no page, ` +
        'and one with page: is on its own page',
    );
  }
  const html = readFileSync(file, 'utf8');
  const h1 = html.indexOf('<h1');
  const title = textOf(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? '');
  const status = textOf([...html.slice(0, h1).matchAll(/<p class="eyebrow">([\s\S]*?)<\/p>/g)].at(-1)?.[1] ?? '');
  const lines = [`**${title}** (/programs/${folder}/)`, `- Status: ${status}`];

  // The facts block: each <dt> is a label; its <dd>s hold the value's lines and map links.
  const dl = /<dl[^>]*>([\s\S]*?)<\/dl>/.exec(html)?.[1] ?? '';
  const shown = [];
  for (const fact of dl.split('<dt').slice(1)) {
    const label = textOf(/^[^>]*>([\s\S]*?)<\/dt>/.exec(fact)?.[1] ?? '');
    const values = [...fact.matchAll(/<span class="block">([\s\S]*?)<\/span>/g)].map((m) => textOf(m[1]));
    const places = [...fact.matchAll(/<a [^>]*>([\s\S]*?)<\/a>/g)]
      .filter((m) => m[0].includes('google.com/maps'))
      .map((m) => textOf(m[1].replace(/<span class="sr-only">[\s\S]*?<\/span>/, '')));
    lines.push(`- ${label}: ${[...values, ...places].join(' · ')}`);
    shown.push(label);
  }
  // A completed program's page shows no fee.
  const completed = status.startsWith('Program completed');
  for (const label of EXPECTED.filter((l) => !shown.includes(l) && !(completed && l === 'Fee'))) {
    lines.push(`- ${label}: not on the page`);
  }

  // The first Register button, in the opening of the page.
  const register = /(<a [^>]*>)\s*Register\b/.exec(html.slice(h1));
  if (register) {
    const a = attrs(register[1]);
    lines.push(
      a['data-zeffy'] && a.href.includes('zeffy.com')
        ? `- Register: Zeffy form ${a.href}`
        : a['data-zeffy']
          ? '- Register: no form yet (the dialog says the registration form is a work in progress)'
          : `- Register: another site's form, ${a.href}`,
    );
  } else {
    lines.push('- Register: no Register button');
  }
  return lines.join('\n');
}

const folders = process.argv.slice(2);
if (!folders.length) fail('name at least one program folder');
console.log(folders.map(facts).join('\n\n'));
