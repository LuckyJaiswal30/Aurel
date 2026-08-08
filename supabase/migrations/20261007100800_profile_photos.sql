alter table public.profiles
  add column avatar_path text
    check (avatar_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(webp|jpg)$');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/webp', 'image/jpeg']);
