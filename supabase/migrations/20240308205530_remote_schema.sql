alter table "public"."tournaments" add column "progress" bigint not null default '0'::bigint;

CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id);

alter table "public"."matches" add constraint "matches_pkey" PRIMARY KEY using index "matches_pkey";


