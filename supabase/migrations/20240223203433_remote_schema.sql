alter table "public"."matches" drop constraint "matches_pkey";

drop index if exists "public"."matches_pkey";

alter table "public"."matches" add column "next_match" bigint;

alter table "public"."matches" add column "previous_match_1" bigint;

alter table "public"."matches" add column "previous_match_2" bigint;


