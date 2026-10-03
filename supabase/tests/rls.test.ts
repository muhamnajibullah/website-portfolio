import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
const db = new PGlite();
const admin = '00000000-0000-4000-8000-000000000010';
const nonAdmin = '00000000-0000-4000-8000-000000000011';
const published = '00000000-0000-4000-8000-000000000020';
const draft = '00000000-0000-4000-8000-000000000021';
beforeAll(async () => {
  // Minimal Supabase contracts let the actual migration run in PostgreSQL WASM.
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key);
    create table auth.mfa_factors (user_id uuid, status text);
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function auth.jwt() returns jsonb language sql as $$ select jsonb_build_object('aal', coalesce(nullif(current_setting('request.jwt.claim.aal', true), ''), 'aal1')) $$;
    grant usage on schema auth, storage, public to anon, authenticated;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant select,insert,delete on storage.objects to authenticated;
    create function storage.foldername(value text) returns text[] language sql immutable as $$ select string_to_array(value, '/') $$;
    insert into auth.users values ('${admin}'), ('${nonAdmin}');
  `);
  await db.exec(
    await readFile(new URL('../migrations/202610030001_portfolio.sql', import.meta.url), 'utf8'),
  );
  await db.exec(`insert into public.admin_profiles(user_id) values ('${admin}');
    insert into public.projects(id,title,slug,status) values ('${published}','Published test','published-test','published'), ('${draft}','Private draft','private-draft','draft');
    insert into public.interactive_points(project_id,x,z,status) values ('${published}',0,0,'published'), ('${draft}',10,10,'published');`);
});
afterAll(async () => {
  await db.close();
});
async function role(name: 'anon' | 'authenticated', user = '') {
  await db.exec('reset role');
  await db.query(
    "select set_config('request.jwt.claim.sub', $1, false), set_config('request.jwt.claim.aal','aal1',false)",
    [user],
  );
  await db.exec(`set role ${name}`);
}
describe('actual migration RLS allow and deny cases', () => {
  it('anonymous visitors only read published records and linked points', async () => {
    await role('anon');
    expect((await db.query('select id from public.projects')).rows).toEqual([{ id: published }]);
    expect((await db.query('select project_id from public.interactive_points')).rows).toEqual([
      { project_id: published },
    ]);
    await expect(
      db.exec("insert into public.projects(title,slug) values ('Attack','attack')"),
    ).rejects.toThrow();
    await expect(db.exec("update public.projects set title='Attack'")).rejects.toThrow();
    await expect(db.exec('delete from public.projects')).rejects.toThrow();
    await expect(db.exec('select * from public.admin_profiles')).rejects.toThrow();
  });
  it('authenticated non-admin cannot mutate, self-promote or read drafts', async () => {
    await role('authenticated', nonAdmin);
    expect((await db.query('select public.is_admin() as admin')).rows).toEqual([{ admin: false }]);
    expect((await db.query('select id from public.projects')).rows).toEqual([{ id: published }]);
    await expect(
      db.exec("insert into public.projects(title,slug) values ('Attack','attack')"),
    ).rejects.toThrow();
    await db.exec("update public.projects set title='Attack'; delete from public.projects;");
    await expect(
      db.exec(`insert into public.admin_profiles(user_id) values ('${nonAdmin}')`),
    ).rejects.toThrow();
    await expect(
      db.exec(
        `insert into storage.objects(bucket_id,name) values ('public-media','${nonAdmin}/${published}.png')`,
      ),
    ).rejects.toThrow();
  });
  it('administrator can read drafts and manage content without bypassing validation', async () => {
    await role('authenticated', admin);
    expect((await db.query('select public.is_admin() as admin')).rows).toEqual([{ admin: true }]);
    expect((await db.query('select id from public.projects order by id')).rows).toEqual([
      { id: published },
      { id: draft },
    ]);
    await db.exec(
      "insert into public.projects(title,slug) values ('Admin test','admin-test'); update public.projects set title='Updated' where slug='admin-test'; delete from public.projects where slug='admin-test';",
    );
    await expect(
      db.exec("insert into public.social_links(label,url) values ('XSS','javascript:alert(1)')"),
    ).rejects.toThrow();
    await expect(
      db.exec(
        `insert into public.interactive_points(project_id,x,z,interaction_radius,focus_radius) values ('${published}',0,0,14,3)`,
      ),
    ).rejects.toThrow();
    await db.exec(
      `insert into storage.objects(bucket_id,name) values ('public-media','${admin}/${published}.png')`,
    );
    await expect(
      db.exec(
        `insert into storage.objects(bucket_id,name) values ('public-media','${nonAdmin}/${published}.png')`,
      ),
    ).rejects.toThrow();
    await expect(
      db.exec(
        `insert into storage.objects(bucket_id,name) values ('public-media','${admin}/${published}.svg')`,
      ),
    ).rejects.toThrow();
  });
  it('enrolled MFA administrators cannot access drafts or mutate with an aal1 token', async () => {
    await db.exec('reset role');
    await db.exec(`insert into auth.mfa_factors values ('${admin}','verified')`);
    await role('authenticated', admin);
    expect((await db.query('select public.is_admin() as admin')).rows).toEqual([{ admin: false }]);
    await expect(
      db.exec("insert into public.projects(title,slug) values ('MFA bypass','mfa-bypass')"),
    ).rejects.toThrow();
    await db.query("select set_config('request.jwt.claim.aal','aal2',false)");
    expect((await db.query('select public.is_admin() as admin')).rows).toEqual([{ admin: true }]);
  });
});
