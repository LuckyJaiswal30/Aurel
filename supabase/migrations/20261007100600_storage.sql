insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'study-files',
    'study-files',
    false,
    public.study_file_size_limit(),
    public.study_file_mime_types()
  ),
  (
    'page-images',
    'page-images',
    false,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp']
  );

create policy "students read their own study files and page images"
  on storage.objects for select to authenticated
  using (
    bucket_id in ('study-files', 'page-images')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
