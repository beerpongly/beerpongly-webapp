alter table "public"."matches" add column "tournament" bigint not null;

alter table "public"."matches" alter column "owner_user_id" drop not null;

alter table "public"."matches" add constraint "matches_tournament_fkey" FOREIGN KEY (tournament) REFERENCES tournaments(id) not valid;

alter table "public"."matches" validate constraint "matches_tournament_fkey";


