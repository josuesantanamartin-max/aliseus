-- Beta Invitations Table
CREATE TABLE IF NOT EXISTS beta_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    max_uses INTEGER DEFAULT 1,
    uses_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    used_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_beta_invitations_code ON beta_invitations(code);
CREATE INDEX IF NOT EXISTS idx_beta_invitations_email ON beta_invitations(email);
CREATE INDEX IF NOT EXISTS idx_beta_invitations_active ON beta_invitations(is_active);

-- RLS Policies
ALTER TABLE beta_invitations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to validate invitation codes (for signup)
CREATE POLICY "Anyone can validate invitation codes"
    ON beta_invitations
    FOR SELECT
    USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()) AND uses_count < max_uses);

-- Only admins can insert/update/delete invitations
CREATE POLICY "Only admins can manage invitations"
    ON beta_invitations
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- Function to validate and use invitation code
CREATE OR REPLACE FUNCTION use_invitation_code(invitation_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Find and lock the invitation
    SELECT * INTO invitation_record
    FROM beta_invitations
    WHERE code = invitation_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND uses_count < max_uses
    FOR UPDATE;

    -- Check if invitation exists and is valid
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Increment usage count
    UPDATE beta_invitations
    SET 
        uses_count = uses_count + 1,
        used_at = NOW(),
        used_by = user_id
    WHERE id = invitation_record.id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate random invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding similar chars
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        IF i % 4 = 0 AND i < 12 THEN
            result := result || '-';
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE beta_invitations IS 'Stores beta invitation codes for controlled access';
COMMENT ON COLUMN beta_invitations.code IS 'Unique invitation code (e.g., ABCD-EFGH-IJKL)';
COMMENT ON COLUMN beta_invitations.max_uses IS 'Maximum number of times this code can be used';
COMMENT ON COLUMN beta_invitations.uses_count IS 'Number of times this code has been used';
COMMENT ON COLUMN beta_invitations.metadata IS 'Additional metadata (campaign, source, etc.)';
