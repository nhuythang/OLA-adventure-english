-- G4 — per-item attempt logging: item_id was defined (task 17) but never
-- populated. The app now sets it on every attempt (vocab word or grammar item
-- id), but grammar items are not rows in english_items (they're generated
-- content, not seeded), so the original FK would reject grammar attempts.
-- Drop it: item_id becomes a plain identifying tag, not a referentially
-- enforced link. Vocab item ids still follow english_items.id's
-- `${themeId}-${word}` convention for a future dashboard join; grammar ids
-- don't, and that's fine — the column no longer requires it.
alter table learning_attempts drop constraint if exists learning_attempts_item_id_fkey;
