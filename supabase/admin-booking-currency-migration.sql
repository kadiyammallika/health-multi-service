-- Admin Booking and Currency Migration
-- Adds admin approval, email notification, and currency management to bookings

-- Add admin approval columns to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'admin_approval_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN admin_approval_status TEXT DEFAULT 'AWAITING_ADMIN_APPROVAL';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE bookings ADD COLUMN approved_by UUID REFERENCES users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'approval_timestamp'
  ) THEN
    ALTER TABLE bookings ADD COLUMN approval_timestamp TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE bookings ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- Add email notification columns to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'email_notification_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN email_notification_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Add currency management columns to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'display_currency'
  ) THEN
    ALTER TABLE bookings ADD COLUMN display_currency TEXT DEFAULT 'INR';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'exchange_rate'
  ) THEN
    ALTER TABLE bookings ADD COLUMN exchange_rate DECIMAL DEFAULT 1.0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'original_currency'
  ) THEN
    ALTER TABLE bookings ADD COLUMN original_currency TEXT DEFAULT 'INR';
  END IF;
END $$;

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- Update existing bookings based on status
UPDATE bookings
SET admin_approval_status = 'APPROVED', approval_timestamp = NOW()
WHERE status = 'Confirmed' AND admin_approval_status = 'AWAITING_ADMIN_APPROVAL';

UPDATE bookings
SET admin_approval_status = 'AWAITING_ADMIN_APPROVAL'
WHERE status = 'Pending' AND admin_approval_status = 'AWAITING_ADMIN_APPROVAL';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON email_logs TO authenticated;
