create or replace function public.submit_field_school (
  p_program_name         text,
  p_location             text,
  p_website_url          text,
  p_start_date           date,
  p_end_date             date,
  p_application_deadline date,
  p_cost                 numeric,
  p_season_year          text,
  p_organization         text,
  p_format               text,
  p_methods_taught       text,
  p_program_description  text,
  p_contact_email        text
)
  returns bigint
  language plpgsql
  security definer
  set search_path to 'public', 'pg_temp'
  AS $function$
declare
  new_listing_id bigint;
  clean_email text := lower(trim(p_contact_email));
  clean_website_url text := nullif(trim(p_website_url), '');
begin
  if nullif(trim(p_program_name), '') is null then
    raise exception using errcode = '22023', message = 'Program name is required.';
  end if;

  if nullif(trim(p_organization), '') is null then
    raise exception using errcode = '22023', message = 'Organization is required.';
  end if;

  if nullif(trim(p_location), '') is null then
    raise exception using errcode = '22023', message = 'Location is required.';
  end if;

  if p_start_date is null or p_end_date is null then
    raise exception using errcode = '22023', message = 'Start and end dates are required.';
  end if;

  if p_end_date < p_start_date then
    raise exception using errcode = '22023', message = 'End date cannot be earlier than start date.';
  end if;

  if p_cost is not null and p_cost < 0 then
    raise exception using errcode = '22023', message = 'Cost cannot be negative.';
  end if;

  if clean_website_url is null or clean_website_url !~* '^https?://' then
    raise exception using errcode = '22023', message = 'A valid HTTP or HTTPS program website is required.';
  end if;

  if clean_email is null or clean_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'A valid contact email is required.';
  end if;

  if nullif(trim(p_season_year), '') is null then
    raise exception using errcode = '22023', message = 'At least one season and year is required.';
  end if;

  if nullif(trim(p_program_description), '') is null then
    raise exception using errcode = '22023', message = 'Program description is required.';
  end if;

  insert into public.field_schools (
    program_name,
    location,
    website_url,
    start_date,
    end_date,
    application_deadline,
    cost,
    season_year,
    organization,
    format,
    methods_taught,
    program_description,
    is_active
  ) values (
    trim(p_program_name),
    trim(p_location),
    clean_website_url,
    p_start_date,
    p_end_date,
    p_application_deadline,
    p_cost,
    trim(p_season_year),
    trim(p_organization),
    nullif(trim(p_format), ''),
    nullif(trim(p_methods_taught), ''),
    trim(p_program_description),
    false
  )
  returning id into new_listing_id;

  insert into public.field_school_contacts (
    field_school_listing_id,
    contact_email
  ) values (
    new_listing_id,
    clean_email
  );

  insert into public.submission_email_events (
    submission_type,
    submission_id,
    display_name,
    contact_email,
    notification_data
  ) values (
    'field_school',
    new_listing_id,
    trim(p_program_name),
    clean_email,
    jsonb_build_object(
      'organization', trim(p_organization),
      'location', trim(p_location),
      'website_url', clean_website_url,
      'start_date', p_start_date,
      'end_date', p_end_date,
      'application_deadline', p_application_deadline,
      'cost', p_cost,
      'season_year', trim(p_season_year),
      'format', nullif(trim(p_format), ''),
      'methods_taught', nullif(trim(p_methods_taught), ''),
      'program_description', trim(p_program_description)
    )
  );

  return new_listing_id;
end;
$function$;

grant execute on function "public"."submit_field_school"(text, text, text, date, date, date, numeric, text, text, text, text, text, text) to "anon", "authenticated", "postgres";

revoke all on function "public"."submit_field_school"(text, text, text, date, date, date, numeric, text, text, text, text, text, text) from public;
