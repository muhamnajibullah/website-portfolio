import { writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
import {
  contentSchema,
  emptyContent,
  validatePublicKey,
  tableSchemas,
} from '../../../packages/validation/src/index.ts';
const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
let content = emptyContent;
if (env.VITE_SUPABASE_URL || env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY)
    throw new Error('Both public Supabase environment variables are required.');
  validatePublicKey(env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const entries = await Promise.all(
    Object.keys(tableSchemas).map(async (table) => {
      const response = await fetch(
        `${env.VITE_SUPABASE_URL}/rest/v1/${table}?select=*&status=eq.published&order=sort_order.asc,id.asc`,
        {
          headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY },
          signal: AbortSignal.timeout(20000),
        },
      );
      if (!response.ok) throw new Error(`Published content snapshot failed for ${table}.`);
      return [table, await response.json()];
    }),
  );
  content = contentSchema.parse(Object.fromEntries(entries));
}
await writeFile('public/content.json', `${JSON.stringify(content)}\n`);
console.log(
  `Published snapshot: ${content.projects.length} projects, ${content.work_experiences.length} experiences.`,
);
