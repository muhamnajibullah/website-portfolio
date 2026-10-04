-- Read-only verification of the additive case-study migration on a linked project.
do $check$
begin
  if (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'projects'
        and column_name in ('engineering_approach', 'key_features', 'technical_challenges', 'outcome')
        and is_nullable = 'NO' and column_default is not null) <> 4
  then raise exception 'Case-study columns/defaults are missing'; end if;

  if not (select relrowsecurity from pg_class where oid = 'public.projects'::regclass)
  then raise exception 'Project RLS must remain enabled'; end if;

  if has_table_privilege('anon', 'public.projects', 'INSERT')
    or has_table_privilege('anon', 'public.projects', 'UPDATE')
    or has_table_privilege('anon', 'public.projects', 'DELETE')
  then raise exception 'Anonymous project mutations must remain denied'; end if;

  if (select count(*) from pg_constraint
      where conrelid = 'public.projects'::regclass and contype = 'c'
        and conname in ('projects_engineering_approach_check', 'projects_key_features_check',
          'projects_technical_challenges_check', 'projects_outcome_check')) <> 4
  then raise exception 'Case-study bounds are missing'; end if;
end;
$check$;
select 'passed: optional case-study columns, defaults, bounds, RLS and anon mutation denial' as verification;
