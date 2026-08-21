ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS device_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS device_token_issued_at timestamptz;