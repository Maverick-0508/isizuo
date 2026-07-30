alter table profiles drop constraint if exists profiles_kyc_level_check;
alter table profiles add constraint profiles_kyc_level_check
  check (kyc_level in ('none', 'phone', 'id', 'full', 'pending'));
