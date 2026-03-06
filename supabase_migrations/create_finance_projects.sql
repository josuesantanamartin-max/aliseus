-- Migration to create project budgets table and update transactions
-- This should be run in the Supabase SQL Editor

-- Create finance_project_budgets table
CREATE TABLE IF NOT EXISTS public.finance_project_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    limit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    spent_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'COMPLETED')),
    color TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add index for efficient querying by user
CREATE INDEX IF NOT EXISTS idx_finance_project_budgets_user_id ON public.finance_project_budgets(user_id);

-- Add RLS Policies for project budgets
ALTER TABLE public.finance_project_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own project budgets"
    ON public.finance_project_budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project budgets"
    ON public.finance_project_budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project budgets"
    ON public.finance_project_budgets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project budgets"
    ON public.finance_project_budgets FOR DELETE
    USING (auth.uid() = user_id);

-- Update finance_transactions to add project_id
ALTER TABLE public.finance_transactions
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.finance_project_budgets(id) ON DELETE SET NULL;
