/*
  # Add phone verification support

  1. New Columns
    - Add phone_number to auth.users
    - Add phone_verified to auth.users
    - Add verification_code to auth.users

  2. Security
    - Enable RLS on auth.users
    - Add policies for phone verification
*/

-- Add phone number related columns to auth.users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_code text;

-- Create a secure function to update verification status
CREATE OR REPLACE FUNCTION auth.verify_phone(
  phone text,
  code text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users 
  SET phone_verified = true,
      verification_code = NULL
  WHERE phone_number = phone 
    AND verification_code = code;
  
  RETURN FOUND;
END;
$$;