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
