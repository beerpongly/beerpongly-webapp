alter table "public"."tournaments" alter column "teams" set default '{}'::text[];

alter table "public"."tournaments" alter column "tournament_name" set default ''::text;


