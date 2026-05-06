-- Helper function to find a user ID by email securely.
-- This allows the Client (Manager) to say "Promote user@email.com" and getting the ID to insert into module_leaders.
-- SECURITY DEFINER means it runs with the privileges of the creator (postgres/admin), bypassing default restrictions on auth.users.
-- We restrict calling it to authenticated users.

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_id uuid;
BEGIN
  SELECT id INTO found_id FROM auth.users WHERE email = email_input;
  RETURN found_id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email TO authenticated;
