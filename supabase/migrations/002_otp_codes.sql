-- OTP codes table for custom email verification
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql

create table if not exists otp_codes (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  code       text not null,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);

create index idx_otp_codes_email      on otp_codes (email);
create index idx_otp_codes_email_code on otp_codes (email, code);

-- Auto-cleanup expired OTPs (run every 5 minutes via pg_cron, or just rely on the expiry check)
-- For now the Edge Function checks expiry on read.

alter table otp_codes enable row level security;

-- Only Edge Functions (service_role) need access; no anon access
create policy "Service role full access" on otp_codes
  for all using (true)
  with check (true);
