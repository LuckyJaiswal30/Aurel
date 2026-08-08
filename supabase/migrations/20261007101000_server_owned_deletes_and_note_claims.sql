drop policy "students delete their own subjects" on public.subjects;
drop policy "students delete their own documents" on public.documents;
revoke delete on public.subjects from authenticated;
revoke delete on public.documents from authenticated;

create function public.claim_note_job(
  note_id uuid,
  student_id uuid,
  from_statuses public.document_status[],
  to_status public.document_status,
  stuck_statuses public.document_status[],
  stuck_before timestamptz
)
returns boolean
language sql
set search_path = ''
as $$
  with claimed as (
    update public.documents as document
    set status = claim_note_job.to_status, status_detail = null
    where document.id = claim_note_job.note_id
      and document.user_id = claim_note_job.student_id
      and (
        document.status = any (claim_note_job.from_statuses)
        or (
          document.status = any (claim_note_job.stuck_statuses)
          and document.updated_at < claim_note_job.stuck_before
        )
      )
    returning document.id
  )
  select exists (select 1 from claimed);
$$;

revoke execute on function public.claim_note_job from public, anon, authenticated;
grant execute on function public.claim_note_job to service_role;
