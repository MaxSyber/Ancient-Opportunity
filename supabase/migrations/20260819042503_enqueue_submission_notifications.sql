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

create or replace function public.submit_social_listing (
  p_name                text,
  p_instagram_url       text,
  p_tiktok_url          text,
  p_youtube_url         text,
  p_x_url               text,
  p_podcast_url         text,
  p_website_url         text,
  p_primary_profile_url text,
  p_content_focus       text,
  p_channel_bio         text,
  p_contact_email       text
)
  returns bigint
  language plpgsql
  security definer
  set search_path to ''
  AS $function$
declare
  v_listing_id bigint;
  v_url text;
begin
  if nullif(pg_catalog.btrim(p_name), '') is null then
    raise exception using errcode = '22023', message = 'A creator name is required.';
  end if;
  if pg_catalog.char_length(pg_catalog.btrim(p_name)) > 200 then
    raise exception using errcode = '22023', message = 'The creator name is too long.';
  end if;
  if nullif(pg_catalog.btrim(p_content_focus), '') is null then
    raise exception using errcode = '22023', message = 'A content focus is required.';
  end if;
  if pg_catalog.char_length(pg_catalog.btrim(p_content_focus)) > 500 then
    raise exception using errcode = '22023', message = 'The content focus is too long.';
  end if;
  if nullif(pg_catalog.btrim(p_channel_bio), '') is null then
    raise exception using errcode = '22023', message = 'A channel bio is required.';
  end if;
  if pg_catalog.char_length(pg_catalog.btrim(p_channel_bio)) > 5000 then
    raise exception using errcode = '22023', message = 'The channel bio is too long.';
  end if;
  if nullif(pg_catalog.btrim(p_primary_profile_url), '') is null then
    raise exception using errcode = '22023', message = 'A primary profile URL is required.';
  end if;
  if pg_catalog.num_nonnulls(
    nullif(pg_catalog.btrim(p_instagram_url), ''),
    nullif(pg_catalog.btrim(p_tiktok_url), ''),
    nullif(pg_catalog.btrim(p_youtube_url), ''),
    nullif(pg_catalog.btrim(p_x_url), ''),
    nullif(pg_catalog.btrim(p_podcast_url), ''),
    nullif(pg_catalog.btrim(p_website_url), '')
  ) = 0 then
    raise exception using errcode = '22023', message = 'At least one platform URL is required.';
  end if;

  foreach v_url in array array[
    p_instagram_url,
    p_tiktok_url,
    p_youtube_url,
    p_x_url,
    p_podcast_url,
    p_website_url,
    p_primary_profile_url
  ] loop
    if nullif(pg_catalog.btrim(v_url), '') is not null
      and (
        pg_catalog.char_length(pg_catalog.btrim(v_url)) > 2048
        or pg_catalog.btrim(v_url) !~* '^https?://[^[:space:]]+$'
      ) then
      raise exception using errcode = '22023', message = 'Profile URLs must be valid http or https URLs.';
    end if;
  end loop;

  if nullif(pg_catalog.btrim(p_contact_email), '') is null
    or pg_catalog.char_length(pg_catalog.btrim(p_contact_email)) > 320
    or pg_catalog.btrim(p_contact_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'A valid contact email is required.';
  end if;

  insert into public.social_listings (
    name,
    instagram_url,
    tiktok_url,
    youtube_url,
    x_url,
    podcast_url,
    website_url,
    primary_profile_url,
    content_focus,
    channel_bio,
    status
  ) values (
    pg_catalog.btrim(p_name),
    nullif(pg_catalog.btrim(p_instagram_url), ''),
    nullif(pg_catalog.btrim(p_tiktok_url), ''),
    nullif(pg_catalog.btrim(p_youtube_url), ''),
    nullif(pg_catalog.btrim(p_x_url), ''),
    nullif(pg_catalog.btrim(p_podcast_url), ''),
    nullif(pg_catalog.btrim(p_website_url), ''),
    pg_catalog.btrim(p_primary_profile_url),
    pg_catalog.btrim(p_content_focus),
    pg_catalog.btrim(p_channel_bio),
    'pending'
  )
  returning id into v_listing_id;

  insert into public.social_contacts (social_listing_id, contact_email)
  values (v_listing_id, pg_catalog.lower(pg_catalog.btrim(p_contact_email)));

  insert into public.submission_email_events (
    submission_type,
    submission_id,
    display_name,
    contact_email,
    notification_data
  ) values (
    'social_listing',
    v_listing_id,
    pg_catalog.btrim(p_name),
    pg_catalog.lower(pg_catalog.btrim(p_contact_email)),
    pg_catalog.jsonb_build_object(
      'content_focus', pg_catalog.btrim(p_content_focus),
      'primary_profile_url', pg_catalog.btrim(p_primary_profile_url),
      'instagram_url', nullif(pg_catalog.btrim(p_instagram_url), ''),
      'tiktok_url', nullif(pg_catalog.btrim(p_tiktok_url), ''),
      'youtube_url', nullif(pg_catalog.btrim(p_youtube_url), ''),
      'x_url', nullif(pg_catalog.btrim(p_x_url), ''),
      'podcast_url', nullif(pg_catalog.btrim(p_podcast_url), ''),
      'website_url', nullif(pg_catalog.btrim(p_website_url), ''),
      'channel_bio', pg_catalog.btrim(p_channel_bio)
    )
  );

  return v_listing_id;
end;
$function$;

grant execute on function "public"."submit_social_listing"(text, text, text, text, text, text, text, text, text, text, text) to "anon", "authenticated", "postgres";

comment on function "public"."submit_social_listing"(text, text, text, text, text, text, text, text, text, text, text) is 'Atomically submits a pending creator listing and its private contact email.';

revoke all on function "public"."submit_social_listing"(text, text, text, text, text, text, text, text, text, text, text) from public;

