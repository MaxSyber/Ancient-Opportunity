create or replace function public.get_ranked_jobs()
  returns SETOF public.job_listings
  language sql
  stable
  set search_path to 'pg_catalog', 'public'
  AS $function$
  select job.*
  from public.job_listings as job
  where job.status = 'approved'
  order by
    case
      when job.is_direct_post = true
        and job.posted_date >= current_date - interval '30 days'
      then job.posted_date + interval '14 days'
      else job.posted_date
    end desc nulls last,
    job.posted_date desc nulls last,
    job.id desc;
$function$;

drop policy if exists "Allow public read access" on public.job_listings;

create policy "Allow public read access" on public.job_listings
  for select
  to anon
  using (status = 'approved'::public.job_status);
