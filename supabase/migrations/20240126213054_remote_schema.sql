alter table "public"."matches" alter column "owner_user_id" set not null;

alter table "public"."rounds" alter column "owner_user_id" drop default;

alter table "public"."matches" add constraint "matches_owner_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."matches" validate constraint "matches_owner_user_id_fkey";

alter table "public"."rounds" add constraint "rounds_owner_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."rounds" validate constraint "rounds_owner_user_id_fkey";


