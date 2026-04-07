-- Fix RLS Policies and missing permissions
-- Date: 2026-04-07

-- 1. Fix recursion in household_members
-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view members of their households" ON public.household_members;

-- Create a non-recursive policy using the SECURITY DEFINER function
CREATE POLICY "Users can view members of their households"
    ON public.household_members FOR SELECT
    USING (is_household_member(household_id));

-- 2. Finance Tables: Add missing SELECT/INSERT/UPDATE policies
-- finance_accounts
DROP POLICY IF EXISTS "finance_accounts_select" ON public.finance_accounts;
CREATE POLICY "finance_accounts_select" ON public.finance_accounts FOR SELECT
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_accounts_insert" ON public.finance_accounts;
CREATE POLICY "finance_accounts_insert" ON public.finance_accounts FOR INSERT
    WITH CHECK ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_accounts_update" ON public.finance_accounts;
CREATE POLICY "finance_accounts_update" ON public.finance_accounts FOR UPDATE
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

-- finance_transactions
DROP POLICY IF EXISTS "finance_transactions_select" ON public.finance_transactions;
CREATE POLICY "finance_transactions_select" ON public.finance_transactions FOR SELECT
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_transactions_insert" ON public.finance_transactions;
CREATE POLICY "finance_transactions_insert" ON public.finance_transactions FOR INSERT
    WITH CHECK ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_transactions_update" ON public.finance_transactions;
CREATE POLICY "finance_transactions_update" ON public.finance_transactions FOR UPDATE
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

-- finance_budgets
DROP POLICY IF EXISTS "finance_budgets_select" ON public.finance_budgets;
CREATE POLICY "finance_budgets_select" ON public.finance_budgets FOR SELECT
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_budgets_insert" ON public.finance_budgets;
CREATE POLICY "finance_budgets_insert" ON public.finance_budgets FOR INSERT
    WITH CHECK ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_budgets_update" ON public.finance_budgets;
CREATE POLICY "finance_budgets_update" ON public.finance_budgets FOR UPDATE
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

-- finance_goals
DROP POLICY IF EXISTS "finance_goals_select" ON public.finance_goals;
CREATE POLICY "finance_goals_select" ON public.finance_goals FOR SELECT
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_goals_insert" ON public.finance_goals;
CREATE POLICY "finance_goals_insert" ON public.finance_goals FOR INSERT
    WITH CHECK ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_goals_update" ON public.finance_goals;
CREATE POLICY "finance_goals_update" ON public.finance_goals FOR UPDATE
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

-- finance_debts
DROP POLICY IF EXISTS "finance_debts_select" ON public.finance_debts;
CREATE POLICY "finance_debts_select" ON public.finance_debts FOR SELECT
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_debts_insert" ON public.finance_debts;
CREATE POLICY "finance_debts_insert" ON public.finance_debts FOR INSERT
    WITH CHECK ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "finance_debts_update" ON public.finance_debts;
CREATE POLICY "finance_debts_update" ON public.finance_debts FOR UPDATE
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

-- 3. Life Tables: Add/Fix policies
-- life_pantry
DROP POLICY IF EXISTS "life_pantry_select" ON public.life_pantry;
CREATE POLICY "life_pantry_select" ON public.life_pantry FOR SELECT
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "life_pantry_insert" ON public.life_pantry;
CREATE POLICY "life_pantry_insert" ON public.life_pantry FOR INSERT
    WITH CHECK ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "life_pantry_update" ON public.life_pantry;
CREATE POLICY "life_pantry_update" ON public.life_pantry FOR UPDATE
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

-- life_recipes
DROP POLICY IF EXISTS "life_recipes_select" ON public.life_recipes;
CREATE POLICY "life_recipes_select" ON public.life_recipes FOR SELECT
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

-- life_shopping_list
DROP POLICY IF EXISTS "life_shopping_list_select" ON public.life_shopping_list;
CREATE POLICY "life_shopping_list_select" ON public.life_shopping_list FOR SELECT
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "life_shopping_list_insert" ON public.life_shopping_list;
CREATE POLICY "life_shopping_list_insert" ON public.life_shopping_list FOR INSERT
    WITH CHECK ((user_id = auth.uid()) OR is_household_member(household_id));

DROP POLICY IF EXISTS "life_shopping_list_update" ON public.life_shopping_list;
CREATE POLICY "life_shopping_list_update" ON public.life_shopping_list FOR UPDATE
    USING ((user_id = auth.uid()) OR is_household_member(household_id));

-- life_weekly_plan
-- Ensure weekly plan allows household-wide access if needed, but keep user_id as primary fallback
DROP POLICY IF EXISTS "Users can manage their own weekly plans" ON public.life_weekly_plan;
CREATE POLICY "life_weekly_plan_manage" ON public.life_weekly_plan FOR ALL
    USING ((user_id = auth.uid()) OR is_household_member(household_id))
    WITH CHECK ((user_id = auth.uid()) OR is_household_member(household_id));

-- 4. Final fix for 500 on households (just in case they have owner_id null or similar)
-- The current policy is: Users can view their households: is_household_member(id)
-- This is fine if is_household_member is correctly defined (it is SECURITY DEFINER).
-- But the recursion in household_members SELECT policy was the real issue.
