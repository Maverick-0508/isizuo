insert into storage.buckets (id, name, public) values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

create policy "Users can upload own KYC docs"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
