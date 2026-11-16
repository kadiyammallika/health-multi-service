-- ==============================================================================
-- OneConnect - Booking System Upgrade Migration
-- Adds payment/cancellation columns to bookings, creates booking_status_history
-- and payments tables for full booking lifecycle management.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Add new columns to the existing bookings table
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
        ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_transaction_id') THEN
        ALTER TABLE bookings ADD COLUMN payment_transaction_id VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cancellation_reason') THEN
        ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'provider_notes') THEN
        ALTER TABLE bookings ADD COLUMN provider_notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'check_in_date') THEN
        ALTER TABLE bookings ADD COLUMN check_in_date VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'check_out_date') THEN
        ALTER TABLE bookings ADD COLUMN check_out_date VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_details') THEN
        ALTER TABLE bookings ADD COLUMN guest_details JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'passenger_details') THEN
        ALTER TABLE bookings ADD COLUMN passenger_details JSONB DEFAULT '{}'::jsonb;
    END IF;
END
$$;

-- ==============================================================================
-- 2. Booking Status History Table
-- Tracks every status transition for audit and timeline display.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);

-- RLS
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_status_history' AND policyname = 'backend_full_access_booking_status_history') THEN
        CREATE POLICY backend_full_access_booking_status_history ON booking_status_history FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- ==============================================================================
-- 3. Payments Table
-- Records every payment attempt and its gateway response.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    gateway_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'backend_full_access_payments') THEN
        CREATE POLICY backend_full_access_payments ON payments FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Auto-update trigger for payments.updated_at
DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
