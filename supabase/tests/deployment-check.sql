-- Run with a trusted management connection. Verification rows never commit.
begin;

do $check$
declare
  draft_id uuid := gen_random_uuid();
  published_id uuid := gen_random_uuid();
begin
  if (select count(*) from pg_tables where schemaname = 'public'
    and tablename in ('admin_profiles', 'profiles', 'projects', 'work_experiences',
      'technology_categories', 'technologies', 'social_links', 'site_settings',
      'media_metadata', 'project_media', 'project_technologies',
      'experience_technologies', 'interactive_points')) <> 13
  then raise exception 'An expected portfolio table is missing'; end if;
  if exists (
    select 1 from pg_tables
    where schemaname = 'public'
      and tablename in ('admin_profiles', 'profiles', 'projects', 'work_experiences',
        'technology_categories', 'technologies', 'social_links', 'site_settings',
        'media_metadata', 'project_media', 'project_technologies',
        'experience_technologies', 'interactive_points')
      and not rowsecurity
  ) then
    raise exception 'An exposed portfolio table has RLS disabled';
  end if;
  if not exists (
    select 1 from storage.buckets where id = 'public-media' and public
      and file_size_limit = 5242880
      and allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
  ) then
    raise exception 'Media bucket restrictions do not match the security baseline';
  end if;
  perform set_config('portfolio.check_draft', draft_id::text, true);
  perform set_config('portfolio.check_published', published_id::text, true);
  insert into public.projects (id, title, slug, status) values
    (draft_id, 'Transaction-only verification', 'verification-' || draft_id, 'draft'),
    (published_id, 'Transaction-only verification', 'verification-' || published_id, 'published');
end;
$check$;

set local role anon;
do $check$
begin
  if exists (select 1 from public.projects where id = current_setting('portfolio.check_draft')::uuid)
    or not exists (select 1 from public.projects where id = current_setting('portfolio.check_published')::uuid)
  then raise exception 'Anonymous publication filtering failed'; end if;
  begin
    insert into public.projects (title, slug) values ('Denied verification', 'denied-' || gen_random_uuid());
    raise exception 'Anonymous insert unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.projects set title = 'Denied verification' where id = current_setting('portfolio.check_published')::uuid;
    raise exception 'Anonymous update unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.projects where id = current_setting('portfolio.check_published')::uuid;
    raise exception 'Anonymous delete unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.admin_profiles;
    raise exception 'Anonymous admin membership read unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$check$;

reset role;
select set_config('request.jwt.claims', jsonb_build_object('sub', gen_random_uuid(), 'role', 'authenticated', 'aal', 'aal1')::text, true);
set local role authenticated;
do $check$
declare affected integer;
begin
  if public.is_admin() then raise exception 'Non-admin authorization unexpectedly succeeded'; end if;
  if exists (select 1 from public.projects where id = current_setting('portfolio.check_draft')::uuid)
  then raise exception 'Non-admin draft read unexpectedly succeeded'; end if;
  begin
    insert into public.projects (title, slug) values ('Denied verification', 'denied-' || gen_random_uuid());
    raise exception 'Non-admin insert unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  update public.projects set title = 'Denied verification' where id = current_setting('portfolio.check_published')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Non-admin update unexpectedly succeeded'; end if;
  delete from public.projects where id = current_setting('portfolio.check_published')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Non-admin delete unexpectedly succeeded'; end if;
  begin
    insert into public.admin_profiles (user_id) values (auth.uid());
    raise exception 'Non-admin self-promotion unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$check$;

reset role;
rollback;
select 'passed: RLS, published filtering, anon/non-admin mutation denial, self-promotion denial, bucket restrictions' as verification;
