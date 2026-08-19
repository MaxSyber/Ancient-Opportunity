create type "public"."job_status" as enum (
  'pending',
  'approved'
);

grant usage on type "public"."job_status" to "postgres";
