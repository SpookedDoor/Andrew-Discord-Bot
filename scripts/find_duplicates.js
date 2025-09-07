const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

// Regex to capture entries like: ((SELECT id FROM message_categories WHERE name = 'general'), 'content'),
// and also handle NULL content. This handles doubled single quotes as SQL escape.
const re = /\(\(SELECT id FROM message_categories WHERE name = '([^']+)'\)\s*,\s*(NULL|'((?:[^']|'')*)')\)/g;

const occurrences = [];

for (const f of files) {
  const full = path.join(migrationsDir, f);
  const text = fs.readFileSync(full, 'utf8');
  let m;
  while ((m = re.exec(text)) !== null) {
    const category = m[1];
    let content = null;
    if (m[2] === 'NULL') content = null;
    else content = (m[3] || '').replace(/''/g, "'");

    // compute line number
    const prefix = text.slice(0, m.index);
    const line = prefix.split('\n').length;

    occurrences.push({ file: f, line, category, content, pos: m.index });
  }
}

// Group by category + content key
const map = new Map();
for (const occ of occurrences) {
  const key = `${occ.category}|||${occ.content === null ? '<NULL>' : occ.content}`;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(occ);
}

const duplicates = [];
for (const [key, arr] of map.entries()) {
  if (arr.length > 1) duplicates.push({ key, arr });
}

if (duplicates.length === 0) {
  console.log('No duplicates found across migrations.');
  process.exit(0);
}

console.log(`Found ${duplicates.length} duplicate (category, content) groups across ${files.length} migration files:\n`);
for (const d of duplicates) {
  const [category, contentRaw] = d.key.split('|||');
  const content = contentRaw === '<NULL>' ? null : contentRaw;
  console.log('---');
  console.log(`Category: ${category}`);
  console.log(`Content: ${content === null ? '<NULL>' : content}`);
  console.log(`Occurrences: ${d.arr.length}`);
  for (const o of d.arr) {
    console.log(`  - ${o.file}:${o.line}`);
  }
  console.log();
}

console.log('Done.');