create or replace function public.get_approved_social_listings()
  returns SETOF public.social_listings
  language sql
  stable
  security definer
  set search_path to ''
  AS $function$
  select listing.*
  from public.social_listings as listing
  where listing.status = 'approved'
  order by listing.id desc;
$function$;

grant execute on function "public"."get_approved_social_listings"() to "anon", "authenticated", "postgres";

comment on function "public"."get_approved_social_listings"() is 'Returns only approved public creator listings to the frontend.';

revoke all on function "public"."get_approved_social_listings"() from public;
