create or replace function public.submit_job (
  p_posting_title   text,
  p_title           text,
  p_company         text,
  p_state           text,
  p_salary_min      numeric,
  p_salary_max      numeric,
  p_salary_unit     text,
  p_description     text,
  p_apply_url       text    default null::text,
  p_employment_type text    default null::text,
  p_company_website text    default null::text,
  p_contact_email   text    default null::text
)
  returns text
  language plpgsql
  security definer
  set search_path to 'pg_catalog', 'public'
  AS $function$
declare
  new_job_id public.job_listings.id%type;
begin
  p_posting_title := nullif(btrim(p_posting_title), '');
  p_title := nullif(btrim(p_title), '');
  p_company := nullif(btrim(p_company), '');
  p_state := nullif(btrim(p_state), '');
  p_salary_unit := nullif(btrim(p_salary_unit), '');
  p_description := nullif(btrim(p_description), '');
  p_apply_url := nullif(btrim(p_apply_url), '');
  p_employment_type := nullif(btrim(p_employment_type), '');
  p_company_website := nullif(btrim(p_company_website), '');
  p_contact_email := nullif(btrim(p_contact_email), '');

  if p_posting_title is null or p_title is null or p_company is null
     or p_state is null or p_description is null
     or p_employment_type is null or p_contact_email is null then
    raise exception using errcode = '22023', message = 'Required job submission fields cannot be blank.';
  end if;

  if (p_salary_min is not null and p_salary_min < 0)
     or (p_salary_max is not null and p_salary_max < 0)
     or (p_salary_min is not null and p_salary_max is not null and p_salary_min > p_salary_max) then
    raise exception using errcode = '22023', message = 'Salary range is invalid.';
  end if;

  if p_contact_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'Contact email is invalid.';
  end if;

  if (p_apply_url is not null and p_apply_url !~* '^https?://')
     or (p_company_website is not null and p_company_website !~* '^https?://') then
    raise exception using errcode = '22023', message = 'URLs must use http or https.';
  end if;

  insert into public.job_listings (
    posting_title,
    title,
    company,
    state,
    salary_min,
    salary_max,
    salary_unit,
    description,
    apply_url,
    posted_date,
    status,
    employment_type,
    company_website,
    is_direct_post
  ) values (
    p_posting_title,
    p_title,
    p_company,
    p_state,
    p_salary_min,
    p_salary_max,
    p_salary_unit,
    p_description,
    p_apply_url,
    current_date,
    'pending',
    p_employment_type,
    p_company_website,
    true
  )
  returning id into new_job_id;

  insert into public.job_contacts (job_listing_id, contact_email)
  values (new_job_id, p_contact_email);

  insert into public.submission_email_events (
    submission_type,
    submission_id,
    display_name,
    contact_email,
    notification_data
  ) values (
    'job',
    new_job_id,
    p_posting_title,
    lower(p_contact_email),
    jsonb_build_object(
      'job_titles', p_title,
      'company', p_company,
      'state', p_state,
      'employment_type', p_employment_type,
      'salary_min', p_salary_min,
      'salary_max', p_salary_max,
      'salary_unit', p_salary_unit,
      'company_website', p_company_website,
      'apply_url', p_apply_url,
      'description', p_description
    )
  );

  return new_job_id::text;
end;
$function$;

grant execute on function "public"."submit_job"(text, text, text, text, numeric, numeric, text, text, text, text, text, text) to "anon", "authenticated", "postgres";

revoke all on function "public"."submit_job"(text, text, text, text, numeric, numeric, text, text, text, text, text, text) from public;
