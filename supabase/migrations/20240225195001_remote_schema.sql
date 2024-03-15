drop policy "Allow individuals to update their own rounds" on "public"."rounds";

drop policy "allow individuals to create rounds" on "public"."rounds";

drop policy "allow individuals to delete their own rounds" on "public"."rounds";

drop policy "allow individuals to view their own rounds" on "public"."rounds";

revoke delete on table "public"."rounds" from "anon";

revoke insert on table "public"."rounds" from "anon";

revoke references on table "public"."rounds" from "anon";

revoke select on table "public"."rounds" from "anon";

revoke trigger on table "public"."rounds" from "anon";

revoke truncate on table "public"."rounds" from "anon";

revoke update on table "public"."rounds" from "anon";

revoke delete on table "public"."rounds" from "authenticated";

revoke insert on table "public"."rounds" from "authenticated";

revoke references on table "public"."rounds" from "authenticated";

revoke select on table "public"."rounds" from "authenticated";

revoke trigger on table "public"."rounds" from "authenticated";

revoke truncate on table "public"."rounds" from "authenticated";

revoke update on table "public"."rounds" from "authenticated";

revoke delete on table "public"."rounds" from "service_role";

revoke insert on table "public"."rounds" from "service_role";

revoke references on table "public"."rounds" from "service_role";

revoke select on table "public"."rounds" from "service_role";

revoke trigger on table "public"."rounds" from "service_role";

revoke truncate on table "public"."rounds" from "service_role";

revoke update on table "public"."rounds" from "service_role";

alter table "public"."matches" drop constraint "matches_round_fkey";

alter table "public"."rounds" drop constraint "rounds_owner_user_id_fkey";

alter table "public"."rounds" drop constraint "rounds_tournament_fkey";

alter table "public"."rounds" drop constraint "rounds_pkey";

drop index if exists "public"."rounds_pkey";

drop table "public"."rounds";

CREATE UNIQUE INDEX matches_id_key ON public.matches USING btree (id);

alter table "public"."matches" add constraint "matches_id_key" UNIQUE using index "matches_id_key";


