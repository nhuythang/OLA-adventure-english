-- OLA English Adventure — parent auth + RLS policies (Phase 2, task 18).
--
-- Adds the parent profile (one shared account owns both children), links children
-- to it, and turns on the per-child RLS policies that task 17 deliberately left
-- off. Child mode itself stays open (mock children + localStorage) — these
-- policies only matter once the app reads/writes child data via an authenticated
-- parent session (task 19). The parent PIN hash lives here, per parent.

-- ---- Parent profile (1:1 with auth.users) ----
create table parents (
  id         uuid        primary key references auth.users (id) on delete cascade,
  email      text,
  -- Salted scrypt hash of the parent's gate PIN; set on first /parent visit.
  pin_hash   text,
  pin_salt   text,
  created_at timestamptz not null default now()
);

-- Auto-create a parents row whenever an auth user is created (the standard
-- Supabase profile-trigger pattern). security definer so it bypasses RLS;
-- empty search_path to avoid hijacking (Supabase linter requirement).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.parents (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Link children to their parent. Cascade so deleting a parent account removes
-- the children (and, via their own cascades, the per-child rows) — privacy.
alter table children
  add constraint children_parent_id_fkey
  foreign key (parent_id) references parents (id) on delete cascade;

-- ---- RLS policies (task 17 enabled RLS; here we grant scoped access) ----

-- A parent sees and edits only their own profile row.
create policy "parents own row" on parents
  for all to authenticated
  using (auth.uid () = id)
  with check (auth.uid () = id);

-- A parent owns children whose parent_id is their uid.
create policy "parent owns children" on children
  for all to authenticated
  using (parent_id = auth.uid ())
  with check (parent_id = auth.uid ());

-- Per-skill levels: access flows through ownership of the child.
create policy "parent owns child skill levels" on child_skill_levels
  for all to authenticated
  using (exists (select 1 from children c where c.id = child_skill_levels.child_id and c.parent_id = auth.uid ()))
  with check (exists (select 1 from children c where c.id = child_skill_levels.child_id and c.parent_id = auth.uid ()));

-- Learning attempts: same ownership-through-child rule.
create policy "parent owns learning attempts" on learning_attempts
  for all to authenticated
  using (exists (select 1 from children c where c.id = learning_attempts.child_id and c.parent_id = auth.uid ()))
  with check (exists (select 1 from children c where c.id = learning_attempts.child_id and c.parent_id = auth.uid ()));
