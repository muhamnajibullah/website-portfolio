begin;

create or replace function public.safe_url(value text) returns boolean
language sql immutable set search_path = '' as $$
  select value = '' or (length(value) <= 2048 and value ~ '^https?://[^[:space:]]+$');
$$;
create or replace function public.safe_lines(value text[]) returns boolean
language sql immutable set search_path = '' as $$
  select cardinality(value) <= 40 and not exists (select 1 from unnest(value) item where length(item) > 1000 or item is null);
$$;
create or replace function public.safe_date(value text) returns boolean
language plpgsql immutable set search_path = '' as $$
begin
  if value = '' then return true; end if;
  if value !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
  perform value::date;
  return true;
exception when others then return false;
end;
$$;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_profiles enable row level security;
revoke all on public.admin_profiles from anon, authenticated;
grant select on public.admin_profiles to authenticated;
create policy own_admin_membership on public.admin_profiles for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_profiles where user_id = (select auth.uid()))
    and (coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
      or not exists (select 1 from auth.mfa_factors where user_id = (select auth.uid()) and status = 'verified'));
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table public.profiles (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000),
  name text not null check(length(name) between 1 and 100), title text not null default 'Software Engineer' check(title = 'Software Engineer'),
  intro text not null default '' check(length(intro) <= 1000), about text not null default '' check(length(about) <= 5000),
  location text not null default '' check(length(location) <= 150), email text not null default '' check(email = '' or email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  availability text not null default '' check(length(availability) <= 150),
  image_url text not null default '' check(public.safe_url(image_url)), image_alt text not null default '' check(length(image_alt) <= 300),
  image_width integer not null default 1200 check(image_width between 1 and 10000), image_height integer not null default 800 check(image_height between 1 and 10000)
);
create unique index single_profile on public.profiles ((true));
alter table public.profiles add constraint profile_image_description check(image_url = '' or length(trim(image_alt)) > 0);

create table public.projects (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000),
  title text not null check(length(title) between 1 and 160), slug text not null unique check(length(slug) <= 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text not null default '' check(length(summary) <= 500), description text not null default '' check(length(description) <= 20000),
  role text not null default '' check(length(role) <= 200), responsibilities text[] not null default '{}' check(public.safe_lines(responsibilities)),
  challenges text[] not null default '{}' check(public.safe_lines(challenges)), solutions text[] not null default '{}' check(public.safe_lines(solutions)),
  start_date text not null default '' check(public.safe_date(start_date)), end_date text not null default '' check(public.safe_date(end_date)),
  live_url text not null default '' check(public.safe_url(live_url)), repository_url text not null default '' check(public.safe_url(repository_url)),
  featured boolean not null default false,
  image_url text not null default '' check(public.safe_url(image_url)), image_alt text not null default '' check(length(image_alt) <= 300),
  image_width integer not null default 1200 check(image_width between 1 and 10000), image_height integer not null default 800 check(image_height between 1 and 10000)
);
create table public.work_experiences (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000),
  organization text not null check(length(organization) between 1 and 160), position text not null check(length(position) between 1 and 160),
  start_date text not null default '' check(public.safe_date(start_date)), end_date text not null default '' check(public.safe_date(end_date)),
  description text not null default '' check(length(description) <= 5000), responsibilities text[] not null default '{}' check(public.safe_lines(responsibilities)),
  related_project_ids uuid[] not null default '{}' check(cardinality(related_project_ids) <= 30),
  image_url text not null default '' check(public.safe_url(image_url)), image_alt text not null default '' check(length(image_alt) <= 300),
  image_width integer not null default 1200 check(image_width between 1 and 10000), image_height integer not null default 800 check(image_height between 1 and 10000)
);
alter table public.projects add constraint project_image_description check(image_url = '' or length(trim(image_alt)) > 0);
alter table public.work_experiences add constraint experience_image_description check(image_url = '' or length(trim(image_alt)) > 0);
create table public.technology_categories (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000), name text not null check(length(name) between 1 and 100)
);
create table public.technologies (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000), name text not null check(length(name) between 1 and 100),
  category_id uuid not null references public.technology_categories(id)
);
create table public.social_links (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000), label text not null check(length(label) between 1 and 100),
  url text not null check(url <> '' and public.safe_url(url))
);
create table public.site_settings (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000), site_name text not null check(length(site_name) between 1 and 150),
  description text not null default '' check(length(description) <= 500), site_url text not null default '' check(public.safe_url(site_url)),
  og_image_url text not null default '' check(public.safe_url(og_image_url)), contact_heading text not null default 'Let’s build something thoughtful.' check(length(contact_heading) <= 200),
  contact_text text not null default '' check(length(contact_text) <= 1000)
);
create unique index single_site_settings on public.site_settings ((true));
create table public.media_metadata (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000),
  path text not null unique check(path ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(png|jpg|webp)$'),
  url text not null check(url <> '' and public.safe_url(url)), alt text not null check(length(alt) between 1 and 300),
  width integer not null check(width between 1 and 10000), height integer not null check(height between 1 and 10000),
  mime_type text not null check(mime_type in ('image/png','image/jpeg','image/webp')),
  size_bytes integer not null check(size_bytes between 1 and 5242880)
);
create table public.project_media (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_id uuid not null references public.media_metadata(id), unique(project_id, media_id)
);
create table public.project_technologies (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000),
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id), unique(project_id, technology_id)
);
create table public.experience_technologies (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000),
  experience_id uuid not null references public.work_experiences(id) on delete cascade,
  technology_id uuid not null references public.technologies(id), unique(experience_id, technology_id)
);
create table public.interactive_points (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0 check(sort_order between 0 and 10000),
  project_id uuid references public.projects(id) on delete cascade, experience_id uuid references public.work_experiences(id) on delete cascade,
  x double precision not null check(x between -38 and 38), y double precision not null default 3 check(y between 1 and 10),
  z double precision not null check(z between -38 and 38), rotation double precision not null default 0 check(rotation between -pi() and pi()),
  marker_type text not null default 'project' check(marker_type in ('project','experience')),
  discovery_radius double precision not null default 20 check(discovery_radius between 2 and 40),
  focus_radius double precision not null default 12 check(focus_radius between 1 and 30),
  interaction_radius double precision not null default 7 check(interaction_radius between 1 and 15), enabled boolean not null default true,
  check((project_id is not null)::int + (experience_id is not null)::int = 1),
  check(interaction_radius <= focus_radius and focus_radius <= discovery_radius),
  check(marker_type = case when project_id is not null then 'project' else 'experience' end)
);

-- The names are a fixed migration allowlist, never supplied by a browser or API request.
do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','projects','work_experiences','technology_categories','technologies','social_links','site_settings','media_metadata','project_media','project_technologies','experience_technologies','interactive_points'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to anon', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('create policy admin_management on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', table_name);
    execute format('create index %I on public.%I (status, sort_order)', table_name || '_publication_order', table_name);
  end loop;
end;
$$;

create policy published_read on public.profiles for select to anon, authenticated using (status = 'published');
create policy published_read on public.projects for select to anon, authenticated using (status = 'published');
create policy published_read on public.work_experiences for select to anon, authenticated using (status = 'published');
create policy published_read on public.technology_categories for select to anon, authenticated using (status = 'published');
create policy published_read on public.social_links for select to anon, authenticated using (status = 'published');
create policy published_read on public.site_settings for select to anon, authenticated using (status = 'published');
create policy published_read on public.media_metadata for select to anon, authenticated using (status = 'published');
create policy published_read on public.technologies for select to anon, authenticated using (
  status = 'published' and exists (select 1 from public.technology_categories category where category.id = category_id and category.status = 'published')
);
create policy published_read on public.project_media for select to anon, authenticated using (
  status = 'published' and exists (select 1 from public.projects p where p.id = project_id and p.status = 'published')
  and exists (select 1 from public.media_metadata m where m.id = media_id and m.status = 'published')
);
create policy published_read on public.project_technologies for select to anon, authenticated using (
  status = 'published' and exists (select 1 from public.projects p where p.id = project_id and p.status = 'published')
  and exists (select 1 from public.technologies t where t.id = technology_id and t.status = 'published')
);
create policy published_read on public.experience_technologies for select to anon, authenticated using (
  status = 'published' and exists (select 1 from public.work_experiences e where e.id = experience_id and e.status = 'published')
  and exists (select 1 from public.technologies t where t.id = technology_id and t.status = 'published')
);
create policy published_read on public.interactive_points for select to anon, authenticated using (
  status = 'published' and enabled and (
    exists (select 1 from public.projects p where p.id = project_id and p.status = 'published')
    or exists (select 1 from public.work_experiences e where e.id = experience_id and e.status = 'published')
  )
);

-- Only genuinely public assets belong here. Draft metadata does not privatize a public bucket.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('public-media', 'public-media', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict(id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy admin_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'public-media' and (select public.is_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(png|jpg|webp)$'
);
create policy admin_storage_read on storage.objects for select to authenticated using (
  bucket_id = 'public-media' and (select public.is_admin())
);
create policy admin_storage_delete on storage.objects for delete to authenticated using (
  bucket_id = 'public-media' and (select public.is_admin()) and (storage.foldername(name))[1] = (select auth.uid())::text
);

commit;
