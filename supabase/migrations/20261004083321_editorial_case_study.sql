begin;

-- Optional public case-study fields inherit the existing publication and admin RLS policies.
alter table public.projects
  add column engineering_approach text not null default '' check (length(engineering_approach) <= 5000),
  add column key_features text[] not null default '{}' check (public.safe_lines(key_features)),
  add column technical_challenges text[] not null default '{}' check (public.safe_lines(technical_challenges)),
  add column outcome text not null default '' check (length(outcome) <= 5000);

commit;
