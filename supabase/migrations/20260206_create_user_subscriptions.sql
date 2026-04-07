-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Subscription details
    tier TEXT NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE', 'FAMILIA')),
    status TEXT NOT NULL DEFAULT 'NONE' CHECK (status IN ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIAL', 'NONE')),
    
    -- Stripe references
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    
    -- Billing period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    
    -- Trial
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    
    -- Usage tracking
    usage JSONB DEFAULT '{
        "transactions": 0,
        "budgets": 0,
        "accounts": 0,
        "recipes": 0,
        "aiGenerations": 0,
        "backups": 0,
        "familyMembers": 1
    }'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id),
    UNIQUE(stripe_customer_id),
    UNIQUE(stripe_subscription_id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription"
    ON user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription usage"
    ON user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Only service role can insert/delete (via Edge Functions)
CREATE POLICY "Service role can manage subscriptions"
    ON user_subscriptions
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id UUID,
    p_metric TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_subscriptions
    SET usage = jsonb_set(
        usage,
        ARRAY[p_metric],
        to_jsonb(COALESCE((usage->>p_metric)::INTEGER, 0) + p_increment)
    )
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage (for cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
    UPDATE user_subscriptions
    SET usage = jsonb_set(
        usage,
        '{aiGenerations}',
        '0'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_subscriptions (user_id, tier, status)
    VALUES (NEW.id, 'FREE', 'ACTIVE')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default subscription on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_subscription();

-- Grant permissions
GRANT SELECT, UPDATE ON user_subscriptions TO authenticated;
GRANT ALL ON user_subscriptions TO service_role;

-- Comments for documentation
COMMENT ON TABLE user_subscriptions IS 'Stores user subscription information and usage metrics';
COMMENT ON COLUMN user_subscriptions.tier IS 'Subscription tier: FREE or FAMILIA';
COMMENT ON COLUMN user_subscriptions.status IS 'Current subscription status';
COMMENT ON COLUMN user_subscriptions.usage IS 'JSON object tracking usage metrics';
COMMENT ON FUNCTION increment_usage IS 'Increments a specific usage metric for a user';
COMMENT ON FUNCTION reset_monthly_usage IS 'Resets monthly usage counters (run via cron)';
